const Flashcard = require('../models/Flashcard');

// Fetch cards due for review today or earlier
const getDueCards = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    
    const dueCards = await Flashcard.find({
      user: userId,
      nextReviewDate: { $lte: now }
    }).sort({ nextReviewDate: 1 });

    res.json(dueCards);
  } catch (error) {
    console.error('Error fetching due cards:', error);
    res.status(500).json({ message: 'Failed to fetch due flashcards' });
  }
};

// SuperMemo-2 logic for updating flashcard
const reviewCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { quality } = req.body; // 0 (blank out) to 5 (perfect response)
    const userId = req.user._id;

    const card = await Flashcard.findOne({ _id: cardId, user: userId });
    if (!card) return res.status(404).json({ message: 'Flashcard not found' });

    let { interval, easeFactor } = card;

    if (quality < 3) {
      // Failed to remember
      interval = 1;
    } else {
      // Remembered
      if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    // Update Ease Factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    card.interval = interval;
    card.easeFactor = easeFactor;
    
    // Set next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    card.nextReviewDate = nextReview;

    await card.save();

    res.json({ message: 'Card reviewed successfully', nextReviewDate: nextReview });
  } catch (error) {
    console.error('Error reviewing card:', error);
    res.status(500).json({ message: 'Failed to review flashcard' });
  }
};

module.exports = { getDueCards, reviewCard };
