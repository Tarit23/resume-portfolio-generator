const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const cloudinary = require('../config/cloudinary');
const Portfolio = require('../models/Portfolio');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize OpenRouter (OpenAI-compatible)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY?.trim(),
  defaultHeaders: {
    "HTTP-Referer": "https://resumeportfoliogenerator.vercel.app/",
    "X-Title": "PromptFolio",
  }
});

// Robust model fallback list
const FREE_MODELS = [
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "meta-llama/llama-3.1-8b-instruct:free",
  "meta-llama/llama-3-8b-instruct:free",
  "openrouter/auto" // Final fallback
];

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

    // 2. Extract Data using OpenRouter (with Fallbacks)
    console.log('Step 2: Calling OpenRouter AI with fallbacks...');
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('CRITICAL: OPENROUTER_API_KEY is missing!');
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

    let extractedData = null;
    let lastError = null;

    for (const modelId of FREE_MODELS) {
      try {
        console.log(`Attempting generation with model: ${modelId}`);
        const completion = await openai.chat.completions.create({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
        });

        let aiResponse = completion.choices[0].message.content.trim();
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = jsonMatch[0];
        }
        
        extractedData = JSON.parse(aiResponse);
        console.log(`Success with model: ${modelId}`);
        break; // Stop loop on success
      } catch (err) {
        console.error(`Model ${modelId} failed:`, err.message);
        lastError = err;
        continue; // Try next model
      }
    }

    if (!extractedData) {
      throw new Error(`AI Generation failed after trying all free models. Last error: ${lastError?.message}`);
    }

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
