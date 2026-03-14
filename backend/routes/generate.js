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

// Helper to extract JSON from text
const extractJSON = (text) => {
  if (!text) return null;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("Found {} but it's not valid JSON", e.message);
      return null;
    }
  }
  return null;
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

    // 2. Extract Data using Bytez
    console.log('Step 2: Calling Bytez AI...');
    if (!process.env.BYTEZ_API_KEY) {
      console.error('CRITICAL: BYTEZ_API_KEY is missing!');
      throw new Error('AI Service key missing');
    }

    const prompt = `
    Extract information from this resume and return it strictly as a JSON object with this structure:
    {
      "title": "Job Title",
      "about": "Brief professional summary",
      "skills": ["Skill 1", "Skill 2"],
      "projects": [{"title": "Project Name", "description": "Details", "link": "url"}],
      "experience": [{"role": "Role", "company": "Company", "duration": "Dates", "description": "Details"}],
      "education": [{"degree": "Degree", "institution": "School", "year": "Year"}],
      "contact": {"email": "", "linkedin": "", "github": "", "website": ""}
    }
    
    Resume Text:
    ${resumeText}
    `;

    const bytez = getBytez();
    if (!bytez) throw new Error('AI Service not initialized - check API Key');

    let extractedData = null;
    
    // Attempt 1: User's requested model
    const primaryModelId = "AmineOueslati/longt5-tglobal-base-portfolio-lead-finetuned";
    console.log(`[Attempt 1] Trying ${primaryModelId}...`);
    try {
      const model = bytez.model(primaryModelId);
      const resp = await model.run(prompt);
      const output = resp.output;
      let text = (typeof output === 'string') ? output : (Array.isArray(output) && output[0]?.content) ? output[0].content : "";
      
      console.log('Primary Model raw output snippet:', text.substring(0, 100));
      extractedData = extractJSON(text);
    } catch (err) {
      console.warn(`Primary model failed: ${err.message}`);
    }

    // Attempt 2: Fallback to a highly capable model if primary failed to produce JSON
    if (!extractedData) {
      const fallbackModelId = "google/gemini-2.5-flash"; 
      console.log(`[Attempt 2] Primary failed, falling back to ${fallbackModelId}...`);
      try {
        const model = bytez.model(fallbackModelId);
        // Gemini models like chat format
        const resp = await model.run([{ role: 'user', content: prompt }]);
        const output = resp.output;
        let text = "";
        if (Array.isArray(output)) {
           text = output.find(m => m.role === 'assistant')?.content || output[output.length-1]?.content || "";
        } else if (typeof output === 'string') {
           text = output;
        }
        
        console.log('Fallback Model raw output snippet:', text.substring(0, 100));
        extractedData = extractJSON(text);
      } catch (err) {
        console.error(`Fallback model failed: ${err.message}`);
      }
    }

    if (!extractedData) {
      throw new Error('AI failed to generate a valid portfolio structure. Try with a different resume or check your Bytez balance.');
    }

    console.log('Data extracted successfully.');

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
