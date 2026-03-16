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
    You are a professional resume parser. 
    Strict Task: Convert the following resume text into a single, valid JSON object.
    
    Style Guide:
    1. Bio/About: Make it punchy, concise, and professional (15-20 words max).
    2. Professional Title: Short and impactful (e.g. "Creative Designer & Dev").
    3. Experience Descriptions: Focus on high-level impact rather than bullet points.
    
    Rules:
    1. ONLY return the JSON object.
    2. Ensure all fields in the schema below are present.
    
    JSON Schema:
    {
      "title": "Impactful Title (e.g. Video Editor & Visual Artist)",
      "about": "A concise, punchy professional summary (max 20 words)",
      "skills": ["Skill1", "Skill2"],
      "projects": [{"title": "Project Name", "description": "Short description", "link": "https://..."}],
      "experience": [{"role": "Job Title", "company": "Company Name", "duration": "e.g., 2020 - 2023", "description": "High-level summary of responsibilities"}],
      "education": [{"degree": "Degree Name", "institution": "University Name", "year": "Graduation Year"}],
      "contact": {"email": "...", "linkedin": "...", "github": "...", "website": "..."}
    }
    
    Resume Content:
    ${resumeText}
    `;

    const bytez = getBytez();
    if (!bytez) throw new Error('Bytez SDK failed to initialize.');

    let extractedData = null;
    
    // MODEL FALLBACK SEQUENCE
    const models = [
      { id: "google/gemini-1.5-pro", type: "chat" }, // Current stable pro model
      { id: "google/gemini-1.5-flash", type: "chat" }, // Faster, lightweight model
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
        
        // Handle various Bytez output formats
        if (Array.isArray(output)) {
           // Check for chat-like array output
           text = output.find(m => m.role === 'assistant')?.content || output[output.length-1]?.content || output[0] || "";
        } else if (typeof output === 'string') {
           text = output;
        } else if (typeof output === 'object' && output !== null) {
           text = output.content || output.text || JSON.stringify(output);
        }

        if (text) {
          lastRawOutput = text;
          extractedData = extractJSON(text);
          if (extractedData) {
            console.log(`SUCCESS with model: ${modelInfo.id}`);
          } else {
            console.warn(`Model ${modelInfo.id} produced output, but no JSON found:`, text.substring(0, 100));
          }
        }
      } catch (err) {
        console.warn(`Model ${modelInfo.id} crashed: ${err.message}`);
      }
    }

    if (!extractedData) {
      console.error("ALL MODELS FAILED. Last output:", lastRawOutput);
      throw new Error(`AI failed to generate profile. 
      Please ensure your BYTEZ_API_KEY is valid and has sufficient credits.
      Last AI response attempt: "${lastRawOutput.substring(0, 100)}..."`);
    }

    // 3. Upload Work Files
    const uploadedWorkFiles = [];
    const isCloudinaryConfigured = process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME);
    
    console.log(`Step 3: Uploading ${workFiles.length} files... (Cloudinary: ${isCloudinaryConfigured ? 'YES' : 'NO'})`);

    for (const file of workFiles) {
      try {
        console.log(`- Uploading ${file.originalname} (${file.mimetype})`);
        if (isCloudinaryConfigured) {
          // Use 'auto' and keep original filename for better SEO/tracking if possible
          const uploadRes = await cloudinary.uploader.upload(file.path, { 
            resource_type: 'auto',
            folder: `portfolio_${username}`,
            use_filename: true,
            unique_filename: true
          });
          
          console.log(`- CLOUDINARY SUCCESS: ${file.originalname} -> ${uploadRes.secure_url} (${uploadRes.resource_type}/${uploadRes.format})`);
          
          // Construct precise mime-type from Cloudinary metadata
          let finalFileType = file.mimetype;
          if (uploadRes.resource_type === 'video') {
            finalFileType = `video/${uploadRes.format === 'mov' ? 'quicktime' : (uploadRes.format || 'mp4')}`;
          } else if (uploadRes.resource_type === 'image') {
            finalFileType = `image/${uploadRes.format || 'png'}`;
          } else if (uploadRes.format === 'pdf') {
            finalFileType = 'application/pdf';
          }
          
          // Store the raw URL from Cloudinary - it's already encoded
          uploadedWorkFiles.push({ 
            url: uploadRes.secure_url, 
            fileType: finalFileType, 
            name: file.originalname 
          });
        } else {
          console.warn(`WARNING: Cloudinary not configured. Using placeholder for ${file.originalname}`);
          uploadedWorkFiles.push({ 
            url: 'https://via.placeholder.com/150', 
            fileType: file.mimetype, 
            name: file.originalname 
          });
        }
      } catch (err) {
        console.error(`- CLOUDINARY ERROR [${file.originalname}]:`, err.message);
      } finally {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    // 4. Save to Database
    const portfolio = await Portfolio.findOneAndUpdate(
      { username },
      { username, name, theme: theme || 'premium', ...extractedData, workFiles: uploadedWorkFiles },
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
