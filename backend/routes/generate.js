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

router.post('/', upload.fields([
  { name: 'resume', maxCount: 1 }, 
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'workFiles', maxCount: 10 }
]), async (req, res) => {
  let lastRawOutput = "No response received";
  try {
    const { username, name, email, theme } = req.body;
    const resumeFile = req.files['resume'] ? req.files['resume'][0] : null;
    const profilePhotoFile = req.files['profilePhoto'] ? req.files['profilePhoto'][0] : null;
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

    // 2. Extract Data using Bytez (or fallback)
    console.log('Step 2: Calling AI Engine...');
    // ... (rest of Bytez logic remains same, but we will override output with user data)
    // [I'll keep the existing logic but ensure the final save uses the user data]

    const prompt = `
    You are a professional resume parser for a top-tier creative agency. 
    Strict Task: Convert the following resume text into a single, valid JSON object.
    
    Style Guide (CRITICAL):
    1. Bio/About: Make it punchy, concise, and visionary (max 15 words). Start with an em-dash (—).
    2. Professional Title: Short, impactful, and ALL CAPS (e.g. "CREATIVE DEVELOPER & DESIGNER").
    3. Experience Roles: ALL CAPS and concise.
    4. Descriptions: Focus on high-level impact (max 20 words).
    
    Rules:
    1. ONLY return the JSON object.
    2. Ensure all fields in the schema below are present.
    
    JSON Schema:
    {
      "title": "IMPACTFUL TITLE (ALL CAPS)",
      "about": "— A concise, punchy professional summary",
      "skills": ["Skill1", "Skill2"],
      "projects": [{"title": "Project Name", "description": "High-level impact description", "link": "https://..."}],
      "experience": [{"role": "JOB TITLE (ALL CAPS)", "company": "Company Name", "duration": "e.g., 2020 - 2023", "description": "High-level summary of responsibilities"}],
      "education": [{"degree": "Degree Name", "institution": "University Name", "year": "Graduation Year"}],
      "contact": {"email": "...", "linkedin": "...", "github": "...", "website": "..."}
    }
    
    Resume Content:
    ${resumeText}
    `;

    const bytez = getBytez();
    if (!bytez) throw new Error('Bytez SDK failed to initialize.');

    let extractedData = null;
    const models = [
      { id: "google/gemini-1.5-pro", type: "chat" },
      { id: "google/gemini-1.5-flash", type: "chat" },
      { id: "Qwen/Qwen2.5-72B-Instruct", type: "chat" }
    ];

    for (const modelInfo of models) {
      if (extractedData) break;
      try {
        const model = bytez.model(modelInfo.id);
        const payload = modelInfo.type === "chat" ? [{ role: 'user', content: prompt }] : prompt;
        const resp = await model.run(payload);
        if (resp.error) continue;

        const output = resp.output;
        let text = "";
        if (Array.isArray(output)) {
           text = output.find(m => m.role === 'assistant')?.content || output[output.length-1]?.content || output[0] || "";
        } else if (typeof output === 'string') {
           text = output;
        } else if (typeof output === 'object' && output !== null) {
           text = output.content || output.text || JSON.stringify(output);
        }

        if (text) {
          lastRawOutput = text;
          extractedData = extractJSON(text);
        }
      } catch (err) {
        console.warn(`Model ${modelInfo.id} crashed: ${err.message}`);
      }
    }

    if (!extractedData) {
      throw new Error(`AI failed to generate profile. Check logs.`);
    }

    // 3. Upload Files
    const isCloudinaryConfigured = process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME);
    if (!isCloudinaryConfigured) {
      throw new Error('Cloudinary is not configured on the server.');
    }

    // A. Upload Profile Photo
    let profileImageUrl = "";
    if (profilePhotoFile) {
      console.log(`- Uploading Profile Photo: ${profilePhotoFile.originalname}`);
      const profileRes = await cloudinary.uploader.upload(profilePhotoFile.path, {
        folder: `portfolio_${username}`,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true
      });
      profileImageUrl = profileRes.secure_url;
      if (fs.existsSync(profilePhotoFile.path)) fs.unlinkSync(profilePhotoFile.path);
    }

    // B. Upload Work Files
    const uploadedWorkFiles = [];
    for (const file of workFiles) {
      try {
        const uploadRes = await cloudinary.uploader.upload(file.path, { 
          resource_type: 'auto',
          folder: `portfolio_${username}`
        });
        
        let finalFileType = file.mimetype;
        if (uploadRes.resource_type === 'video') {
          finalFileType = `video/${uploadRes.format === 'mov' ? 'quicktime' : (uploadRes.format || 'mp4')}`;
        } else if (uploadRes.resource_type === 'image') {
          finalFileType = `image/${uploadRes.format || 'png'}`;
        }
        
        uploadedWorkFiles.push({ url: uploadRes.secure_url, fileType: finalFileType, name: file.originalname });
      } catch (err) {
        console.error(`- CLOUDINARY ERROR [${file.originalname}]:`, err.message);
      } finally {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    // 4. Save to Database (Merge User Data)
    const finalData = {
      ...extractedData,
      contact: {
        ...extractedData.contact,
        email: email || extractedData.contact?.email // User input email takes precedence
      },
      profileImageUrl: profileImageUrl || extractedData.profileImageUrl
    };

    const portfolio = await Portfolio.findOneAndUpdate(
      { username },
      { 
        username, 
        name, 
        theme: theme || 'premium', 
        ...finalData, 
        workFiles: uploadedWorkFiles 
      },
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
