const mongoose = require('mongoose');

const resultSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    weakTopics: [{ type: String }] // Derived from incorrectly answered questions
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
