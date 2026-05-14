import Poll from "../models/Poll.js";
import Response from "../models/Response.js";
import { getIO } from "../socket.js";

// Submit Response
export const submitResponse = async (req, res) => {
  try {
    const { answers } = req.body;

    const poll = await Poll.findById(req.params.pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (!poll.allowAnonymous && !req.user) {
      return res
        .status(401)
        .json({ message: "Login required to participate in this poll" });
    }

    // Prevent duplicate authenticated responses
    if (!poll.allowAnonymous) {
      const existingResponse = await Response.findOne({
        pollId: poll._id,

        userId: req.user._id,
      });

      if (existingResponse) {
        return res.status(400).json({
          message: "You already submitted this poll",
        });
      }
    }

    if (new Date() > new Date(poll.expiresAt)) {
      if (!poll.isPublished) {
        poll.isPublished = true;
        await poll.save();

        req.io.to(pollId).emit("pollPublished");

        req.io.to(pollId).emit("pollClosed");
      }
      return res
        .status(400)
        .json({
          message: "Poll has expired and is now published",
          expired: true,
          published: true,
        });
    }

    // Required question validation
    for (const question of poll.questions) {
      if (question.required) {
        const hasAnswer = answers.find(
          (a) => a.questionId === question._id.toString(),
        );

        if (!hasAnswer) {
          return res
            .status(400)
            .json({ message: "All required questions must be answered" });
        }
      }
    }

    const response = await Response.create({
      pollId: poll._id,
      answers,
      userId: poll.allowAnonymous ? null : req.user?._id,
    });

    const io = getIO();

    io.to(req.params.pollId).emit("newResponse", {
      pollId: req.params.pollId,
    });

    res
      .status(201)
      .json({ message: "Response submitted successfully", response });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
