const Paper = require('../models/Paper');

const savePaper = async (req, res) => {
  try {
    const { title, subject, year, filePath, extractedTopics } = req.body;
    const userId = req.user._id;

    const newPaper = await Paper.create({
      title,
      subject,
      year: year || new Date().getFullYear(),
      filePath: filePath || 'uploaded_to_ai_engine.pdf',
      uploader: userId,
      extractedTopics: extractedTopics || [],
      isAnalyzed: true
    });

    res.status(201).json({ message: 'Paper saved successfully', paper: newPaper });
  } catch (error) {
    console.error('Error saving paper:', error);
    res.status(500).json({ message: 'Failed to save paper' });
  }
};

module.exports = { savePaper };
