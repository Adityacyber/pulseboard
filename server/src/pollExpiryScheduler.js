import Poll from "./models/Poll.js";

import { getIO } from "./socket.js";

// Store active timers
const activeTimers = new Map();

// Schedule poll expiry
export const schedulePollExpiry = (poll) => {
  const pollId = poll._id.toString();

  // Remove old timer
  if (activeTimers.has(pollId)) {
    clearTimeout(activeTimers.get(pollId));
  }

  const expiryTime = new Date(poll.expiresAt).getTime();

  const currentTime = Date.now();

  const delay = expiryTime - currentTime;

  // Already expired
  if (delay <= 0) {
    return;
  }

  // Schedule timeout
  const timeout = setTimeout(async () => {
    try {
      const io = getIO();

      // Emit live close event
      io.to(pollId).emit("pollClosed", {
        pollId,
      });

      console.log(`Poll expired: ${pollId}`);

      activeTimers.delete(pollId);
    } catch (error) {
      console.log(error);
    }
  }, delay);

  activeTimers.set(pollId, timeout);

  console.log(`Expiry scheduled for poll ${pollId}`);
};
