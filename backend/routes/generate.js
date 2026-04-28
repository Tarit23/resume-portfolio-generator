const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Bytez = require('bytez.js');
const Portfolio = require('../models/Portfolio');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const getBytez = () => {
  const key = process.env.BYTEZ_API_KEY?.trim();
  if (!key) return null;
  return new Bytez(key);
};

const extractJSON = (text) => {
  if (!text) return null;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0].trim());
    } catch (e) {
      console.error("JSON parse error:", e.message);
      return null;
    }
  }
  return null;
};

const generateUsername = (name) => {
  const base = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'user';
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomStr}`;
};

router.post('/', upload.fields([{ name: 'resume', maxCount: 1 }]), async (req, res) => {
  try {
    const { theme } = req.body;
    const resumeFile = req.files['resume'] ? req.files['resume'][0] : null;

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // 1. Parse PDF
    const dataBuffer = fs.readFileSync(resumeFile.path);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text || '';
    
    if (resumeText.length < 50) {
      throw new Error("The uploaded resume seems empty or could not be read.");
    }

    // 2. Extract Data using AI
    const prompt = `
    You are an expert ATS parser and profile builder.
    Task: Extract the person's name, email, and generate a valid JSON profile from this resume.
    
    Rules:
    1. ONLY return the JSON object. No markdown formatting or extra text.
    2. Make 'title' punchy and ALL CAPS.
    3. Make 'about' a brief summary starting with an em-dash (—).
    
    JSON Schema MUST MATCH EXACTLY:
    {
      "name": "Full Name",
      "contact": { "email": "email@example.com", "linkedin": "...", "github": "...", "website": "..." },
      "title": "IMPACTFUL TITLE (ALL CAPS)",
      "about": "— A concise, punchy professional summary",
      "skills": ["Skill1", "Skill2"],
      "projects": [{"title": "Project Name", "description": "High-level impact", "link": "https://..."}],
      "experience": [{"role": "JOB TITLE (ALL CAPS)", "company": "Company", "duration": "e.g., 2020 - 2023", "description": "Summary of responsibilities"}],
      "education": [{"degree": "Degree", "institution": "University", "year": "Year"}]
    }
    
    Resume Content:
    ${resumeText}
    `;

    const bytez = getBytez();
    if (!bytez) throw new Error('Bytez SDK failed to initialize.');

    let extractedData = null;
    const models = [
      { id: "google/gemini-1.5-pro", type: "chat" },
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
          extractedData = extractJSON(text);
        }
      } catch (err) {
        console.warn(`Model ${modelInfo.id} crashed: ${err.message}`);
      }
    }

    if (!extractedData) {
      throw new Error(`AI failed to generate profile from the resume.`);
    }

    // 3. Generate Username and Save
    const finalName = extractedData.name || "Anonymous Professional";
    const username = generateUsername(finalName);
    
    // We do not require cloudinary anymore since no profile/work files are uploaded in this flow
    // If we wanted to, we could extract images from the PDF but for now we skip.

    const portfolio = await Portfolio.findOneAndUpdate(
      { username },
      { 
        username, 
        name: finalName, 
        theme: theme || 'premium', 
        ...extractedData 
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, portfolio, redirectUrl: `/${username}` });

  } catch (error) {
    console.error('GENERATION ERROR:', error);
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
