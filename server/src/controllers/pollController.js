import Poll from "../models/Poll.js";
import Response from "../models/Response.js";
import { getIO } from "../socket.js";
import { schedulePollExpiry } from "../pollExpiryScheduler.js";

// Create a new poll
export const createPoll = async (req, res) => {
  try {
    const { title, description, questions, allowAnonymous, expiresAt } =
      req.body;

    if (!title || !questions || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Title and questions are required" });
    }

    const poll = await Poll.create({
      title,
      description,
      questions,
      allowAnonymous,
      expiresAt,
      creator: req.user._id,
    });

    schedulePollExpiry(poll);

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Polls
export const getMyPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ creator: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Poll by ID
export const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET POLL ANALYTICS
export const getPollAnalytics = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        message: "Poll not found",
      });
    }

    // Ownership check
    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    // Fetch responses
    const responses = await Response.find({
      pollId: poll._id,
    });

    const analytics = {
      title: poll.title,
      description: poll.description,
      totalResponses: responses.length,
      questions: [],
      isPublished: poll.isPublished,
      expiresAt: poll.expiresAt,
      allowAnonymous: poll.allowAnonymous,
    };

    // Process each question
    for (const question of poll.questions) {
      const questionStats = {
        questionId: question._id,
        question: question.question,
        options: [],
      };

      // Process each option
      for (const option of question.options) {
        let count = 0;

        // Count votes
        responses.forEach((response) => {
          response.answers.forEach((answer) => {
            if (
              answer.questionId === question._id.toString() &&
              answer.selectedOption === option.text
            ) {
              count++;
            }
          });
        });

        // Percentage
        const percentage =
          responses.length === 0
            ? 0
            : ((count / responses.length) * 100).toFixed(1);

        questionStats.options.push({
          option: option.text,

          votes: count,

          percentage,
        });
      }

      analytics.questions.push(questionStats);
    }

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Publish Poll Results
export const publishResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        message: "Poll not found",
      });
    }

    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    poll.isPublished = true;
    poll.resultsPublishedAt = new Date();

    await poll.save();

    const io = getIO();
    io.to(req.params.id).emit("pollPublished", { pollId: req.params.id });

    res.status(200).json({
      message: "Results published successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Get Public Results
export const getPublicResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        message: "Poll not found",
      });
    }

    if (!poll.isPublished) {
      return res.status(403).json({
        message: "Results not published yet",
      });
    }

    const responses = await Response.find({
      pollId: poll._id,
    });

    const analytics = {
      title: poll.title,
      totalResponses: responses.length,
      questions: [],
    };

    // Process questions
    for (const question of poll.questions) {
      const questionStats = {
        question: question.question,
        options: [],
      };

      for (const option of question.options) {
        let count = 0;

        responses.forEach((response) => {
          response.answers.forEach((answer) => {
            if (
              answer.questionId === question._id.toString() &&
              answer.selectedOption == option.text
            ) {
              count++;
            }
          });
        });

        const percentage =
          responses.length === 0
            ? 0
            : ((count / responses.length) * 100).toFixed(1);

        questionStats.options.push({
          option: option.text,
          votes: count,
          percentage,
        });
      }

      analytics.questions.push(questionStats);
    }

    res.status(200).json(analytics);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Poll
export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({
        message: "Poll not found",
      });
    }

    if (poll.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await poll.deleteOne();

    res.json({
      message: "Poll deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
