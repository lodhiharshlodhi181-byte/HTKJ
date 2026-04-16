const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String }
});

const quizSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    topic: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    questions: [questionSchema],
    isAiGenerated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
