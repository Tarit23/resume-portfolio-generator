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
  // Look for JSON block or raw object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      // Clean up potential markdown code block markers
      let jsonStr = jsonMatch[0].trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("Found {} but it's not valid JSON:", e.message);
      return null;
    }
  }
  return null;
};

router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'workFiles', maxCount: 10 }]), async (req, res) => {
  let lastRawOutput = "No response received";
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
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text || '';
    
    if (resumeText.length < 50) {
      throw new Error("The uploaded resume seems empty or could not be read. Please try a different PDF.");
    }
    console.log('PDF parsed successfully. Text length:', resumeText.length);

    // 2. Extract Data using Bytez
    console.log('Step 2: Calling Bytez AI...');
    if (!process.env.BYTEZ_API_KEY) {
      throw new Error('BYTEZ_API_KEY is missing from server configuration.');
    }

    const prompt = `
    Task: Extract resume data into strictly valid JSON.
    Structure:
    {
      "title": "Title",
      "about": "Summary",
      "skills": ["Skill1"],
      "projects": [{"title": "P1", "description": "D1", "link": ""}],
      "experience": [{"role": "R1", "company": "C1", "duration": "T1", "description": "D1"}],
      "education": [{"degree": "Deg1", "institution": "School1", "year": "2023"}],
      "contact": {"email": "", "linkedin": "", "github": "", "website": ""}
    }
    
    Resume Content:
    ${resumeText}
    `;

    const bytez = getBytez();
    if (!bytez) throw new Error('Bytez SDK failed to initialize.');

    let extractedData = null;
    
    // MODEL FALLBACK SEQUENCE
    const models = [
      { id: "google/gemini-2.5-pro", type: "chat" }, // Best free model
      { id: "AmineOueslati/longt5-tglobal-base-portfolio-lead-finetuned", type: "text" }, // User requested
      { id: "Qwen/Qwen2.5-72B-Instruct", type: "chat" } // High capacity backup
    ];

    for (const modelInfo of models) {
      if (extractedData) break;
      
      console.log(`[Attempt] Trying model: ${modelInfo.id}...`);
      try {
        const model = bytez.model(modelInfo.id);
        const payload = modelInfo.type === "chat" ? [{ role: 'user', content: prompt }] : prompt;
        
        const resp = await model.run(payload);
        
        if (resp.error) {
           console.warn(`Model ${modelInfo.id} returned error: ${resp.error}`);
           continue;
        }

        const output = resp.output;
        let text = "";
        if (Array.isArray(output)) {
           text = output.find(m => m.role === 'assistant')?.content || output[output.length-1]?.content || "";
        } else if (typeof output === 'string') {
           text = output;
        }

        if (text) {
          lastRawOutput = text;
          extractedData = extractJSON(text);
          if (extractedData) console.log(`SUCCESS with model: ${modelInfo.id}`);
        }
      } catch (err) {
        console.warn(`Model ${modelInfo.id} crashed: ${err.message}`);
      }
    }

    if (!extractedData) {
      console.error("ALL MODELS FAILED. Last output:", lastRawOutput);
      throw new Error(`AI failed to generate profile. 
      Balance: $0.99 remaining (OK).
      Last AI response: "${lastRawOutput.substring(0, 100)}..."
      Check if your resume text is too long or contains unsupported characters.`);
    }

    // 3. Upload Work Files
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
    const portfolio = await Portfolio.findOneAndUpdate(
      { username },
      { username, name, theme, ...extractedData, workFiles: uploadedWorkFiles },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, portfolio, redirectUrl: `/${username}` });

  } catch (error) {
    console.error('FULL GENERATION ERROR:', error);
    res.status(500).json({ error: 'Generation Failed', details: error.message });
  } finally {
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
  }
});

module.exports = router;
