const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const cloudinary = require('../config/cloudinary');
const Portfolio = require('../models/Portfolio');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'workFiles', maxCount: 10 }]), async (req, res) => {
  try {
    const { username, name, theme } = req.body;
    const resumeFile = req.files['resume'] ? req.files['resume'][0] : null;
    const workFiles = req.files['workFiles'] || [];

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // 1. Parse PDF
    const dataBuffer = fs.readFileSync(resumeFile.path);
    if (typeof pdfParse !== 'function') {
      console.error('pdf-parse is not a function. Checking exports:', pdfParse);
      throw new Error('PDF parsing library misconfigured');
    }
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;

    // 2. Extract Data using OpenAI
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0].message.content;
    const extractedData = JSON.parse(aiResponse);

    // 3. Upload Work Files to Cloudinary
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
        console.error("Cloudinary upload failed", err);
      } finally {
        fs.unlinkSync(file.path);
      }
    }
    // 4. Save to Database (Upsert)
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
    console.error('Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate portfolio' });
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
