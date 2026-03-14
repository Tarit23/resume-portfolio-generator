const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Bytez = require('bytez.js');
const cloudinary = require('../config/cloudinary');
const Portfolio = require('../models/Portfolio');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize Bytez (guarded)
const getBytez = () => {
  const key = process.env.BYTEZ_API_KEY?.trim();
  if (!key) {
    console.warn("WARNING: BYTEZ_API_KEY is missing from environment variables.");
    return null;
  }
  return new Bytez(key);
};

router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'workFiles', maxCount: 10 }]), async (req, res) => {
  try {
    const { username, name, theme } = req.body;
    const resumeFile = req.files['resume'] ? req.files['resume'][0] : null;
    const workFiles = req.files['workFiles'] || [];

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // 1. Parse PDF
    console.log('Step 1: Parsing PDF...');
    const dataBuffer = fs.readFileSync(resumeFile.path);
    if (typeof pdfParse !== 'function') {
      console.error('CRITICAL: pdf-parse is not a function.');
      throw new Error('PDF parsing library misconfigured');
    }
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text || '';
    console.log('PDF parsed successfully. Text length:', resumeText.length);

    // 2. Extract Data using Bytez (Gemini 2.0 Flash)
    console.log('Step 2: Calling Bytez AI (Gemini 2.0 Flash)...');
    if (!process.env.BYTEZ_API_KEY) {
      console.error('CRITICAL: BYTEZ_API_KEY is missing!');
      throw new Error('AI Service key missing');
    }

    const prompt = `
    Extract the following information from the provided resume text and return it strictly as a JSON object matching this structure. Do not return any markdown formatting or code blocks, just raw JSON:
    {
      "title": "",
      "about": "",
      "skills": ["skill1", "skill2"],
      "projects": [{"title": "", "description": "", "link": ""}],
      "experience": [{"role": "", "company": "", "duration": "", "description": ""}],
      "education": [{"degree": "", "institution": "", "year": ""}],
      "contact": {"email": "", "linkedin": "", "github": "", "website": ""}
    }
    
    Resume Text:
    ${resumeText}
    `;

    try {
      const bytez = getBytez();
      if (!bytez) throw new Error('AI Service not initialized - check API Key');

      // Attempt with the most likely correct model IDs found in research
      const modelId = "google/gemini-2.5-flash"; 
      console.log(`Attempting generation with Bytez model: ${modelId}`);
      const model = bytez.model(modelId); 
      const input = [
        { "role": "user", "content": prompt }
      ];

      console.log('Sending request to Bytez...');
      const response = await model.run(input);
      console.log('Raw Bytez response object:', JSON.stringify(response, null, 2));

      const { error, output } = response;

      if (error) {
        console.error('Bytez Error:', error);
        throw new Error(error);
      }

      let aiResponse = "";
      if (Array.isArray(output) && output.length > 0) {
        // Try to find the assistant response first
        const assistantMsg = output.find(msg => msg.role === "assistant");
        if (assistantMsg) {
          aiResponse = assistantMsg.content.trim();
        } else {
          // Fallback: Use the content of the very last message in the list
          aiResponse = output[output.length - 1].content.trim();
        }
      } else if (typeof output === 'string') {
        aiResponse = output.trim();
      }

      console.log('Extracted AI Text:', aiResponse);

      if (!aiResponse) {
        throw new Error('AI returned an empty response. Please check your Bytez account balance or quotas.');
      }
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = jsonMatch[0];
      }
      
      let extractedData;
      try {
        extractedData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', aiResponse);
        throw new Error(`AI response was not valid JSON: ${aiResponse.substring(0, 50)}...`);
      }
      console.log('AI response parsed into JSON successfully.');

      // 3. Upload Work Files to Cloudinary
      console.log('Step 3: Handling file uploads...');
      const uploadedWorkFiles = [];
      for (const file of workFiles) {
        try {
          if (process.env.CLOUDINARY_API_KEY) {
            const uploadRes = await cloudinary.uploader.upload(file.path, { resource_type: 'auto' });
            uploadedWorkFiles.push({ url: uploadRes.secure_url, fileType: file.mimetype, name: file.originalname });
          } else {
            uploadedWorkFiles.push({ url: 'https://via.placeholder.com/150', fileType: file.mimetype, name: file.originalname });
          }
        } catch (err) {
          console.error("Cloudinary upload failed", err.message);
        } finally {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      }

      // 4. Save to Database
      console.log('Step 4: Saving to Database for:', username);
      const portfolio = await Portfolio.findOneAndUpdate(
        { username },
        {
          username,
          name,
          theme,
          ...extractedData,
          workFiles: uploadedWorkFiles
        },
        { new: true, upsert: true }
      );

      res.status(200).json({ success: true, portfolio, redirectUrl: `/${username}` });

    } catch (aiError) {
      console.error('AI Processing Error:', aiError.message);
      throw aiError;
    }

  } catch (error) {
    console.error('FULL GENERATION ERROR:', error);
    res.status(500).json({ 
      error: 'Failed to generate portfolio', 
      details: error.message
    });
  } finally {
    if (req.files) {
      if (req.files['resume']) {
        const resumePath = req.files['resume'][0].path;
        if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);
      }
      if (req.files['workFiles']) {
        req.files['workFiles'].forEach(file => {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        });
      }
    }
  }
});

module.exports = router;
