const mongoose = require('mongoose');

const paperSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    year: { type: Number },
    filePath: { type: String, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    extractedTopics: [{ type: String }],
    isAnalyzed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Paper', paperSchema);
