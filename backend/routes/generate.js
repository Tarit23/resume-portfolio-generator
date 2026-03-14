const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cloudinary = require('../config/cloudinary');
const Portfolio = require('../models/Portfolio');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim());
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Debug: List available models (will log to Render logs)
async function debugModels() {
  try {
    console.log("Listing available Gemini models...");
    // Note: listModels is not always available in all SDK versions, but let's try
    // If it fails, it will just log the error and we proceed
  } catch (err) {
    console.warn("Could not list models:", err.message);
  }
}
debugModels();

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
      console.error('CRITICAL: pdf-parse is not a function. Value:', pdfParse);
      throw new Error('PDF parsing library misconfigured');
    }
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text || '';
    console.log('PDF parsed successfully. Text length:', resumeText.length);

    if (resumeText.trim().length === 0) {
      console.warn('WARNING: Parsed resume text is empty!');
    }

    // 2. Extract Data using Gemini
    console.log('Step 2: Calling Gemini AI...');
    if (!process.env.GEMINI_API_KEY) {
      console.error('CRITICAL: GEMINI_API_KEY is missing from environment variables!');
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
      const result = await model.generateContent(prompt);
      let aiResponse = result.response.text().trim();
      console.log('Gemini raw response length:', aiResponse.length);
      
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = jsonMatch[0];
      }
      
      const extractedData = JSON.parse(aiResponse);
      console.log('Gemini response parsed into JSON successfully.');

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
          console.error("Cloudinary upload failed for file:", file.originalname, err.message);
        } finally {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      }

      // 4. Save to Database
      console.log('Step 4: Saving to Database for username:', username);
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
      console.log('Portfolio saved/updated successfully in MongoDB.');

      res.status(200).json({ success: true, portfolio, redirectUrl: `/${username}` });

    } catch (aiError) {
      console.error('AI Processing Error:', aiError);
      throw aiError;
    }

  } catch (error) {
    console.error('FULL GENERATION ERROR:', error);
    res.status(500).json({ 
      error: 'Failed to generate portfolio', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Ensure cleanup of local files
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
