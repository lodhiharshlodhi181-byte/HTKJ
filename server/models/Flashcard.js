const mongoose = require('mongoose');

const flashcardSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    questionText: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    options: [{ type: String }],
    explanation: { type: String },
    nextReviewDate: { type: Date, default: Date.now },
    interval: { type: Number, default: 1 }, // in days
    easeFactor: { type: Number, default: 2.5 } // SuperMemo-2 default ease factor
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flashcard', flashcardSchema);
