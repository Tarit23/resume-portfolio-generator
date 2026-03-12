require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Connect to database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const generateRoutes = require('./routes/generate');
const portfolioRoutes = require('./routes/portfolio');

app.use('/api/generate', generateRoutes);
app.use('/api/portfolios', portfolioRoutes);

app.get("/", (req, res) => {
  res.send("PromptFolio Backend API is running.");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
