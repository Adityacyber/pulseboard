import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import API from "../services/api";
import AnalyticsChart from "../components/AnalyticsChart";
import socket from "../socket";
import toast from "react-hot-toast";

const PublicPoll = () => {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Fetch Poll
  const fetchPoll = async () => {
    try {
      setError("");

      const res = await API.get(`/polls/${id}`);

      setPoll(res.data);

      // Fetch results if published
      if (res.data.isPublished) {
        const resultsRes = await API.get(`/polls/results/${id}`);

        setResults(resultsRes.data);
      }
    } catch (error) {
      console.log(error.response?.data || error.message);

      setError(error.response?.data?.message || "Failed to load poll");
    } finally {
      setLoading(false);
    }
  };

  // Countdown
  const calculateTimeLeft = (expiresAt) => {
    const difference = new Date(expiresAt) - new Date();

    if (difference <= 0) {
      return "Expired";
    }

    const seconds = Math.floor(difference / 1000);

    const minutes = Math.floor(seconds / 60);

    const hours = Math.floor(minutes / 60);

    const days = Math.floor(hours / 24);

    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  };

  // Fetch + Socket Events
  useEffect(() => {
    fetchPoll();

    socket.emit("joinPollRoom", id);

    socket.on("pollPublished", async () => {
      toast("Poll expired. Final results are now available.", {
        icon: "📊",
      });

      await fetchPoll();
    });

    socket.on("pollClosed", async () => {
      await fetchPoll();
    });

    return () => {
      socket.off("pollPublished");
      socket.off("pollClosed");
    };
  }, [id]);

  // Live Timer
  useEffect(() => {
    if (!poll) return;

    setTimeLeft(calculateTimeLeft(poll.expiresAt));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(poll.expiresAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [poll]);

  const isExpired = timeLeft === "Expired";

  // Handle Answers
  const handleOptionChange = (questionId, optionText) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== questionId);

      return [
        ...filtered,
        {
          questionId,
          selectedOption: optionText,
        },
      ];
    });
  };

  // Submit Response
  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const answeredPolls =
        JSON.parse(localStorage.getItem("answeredPolls")) || [];

      if (poll.allowAnonymous && answeredPolls.includes(id)) {
        toast.error("You already answered this poll");
        setSubmitting(false);
        return;
      }

      const res = await API.post(
        `/responses/${id}`,
        { answers },
        {
          headers: storedUser?.token
            ? {
                Authorization: `Bearer ${storedUser.token}`,
              }
            : {},
        },
      );

      if (poll.allowAnonymous) {
        const updated = [...answeredPolls, id];

        localStorage.setItem("answeredPolls", JSON.stringify(updated));
      }

      toast.success(res.data.message);
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error(error.response?.data?.message || "Something went wrong");

      await fetchPoll();
    } finally {
      setSubmitting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center px-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-5 rounded-2xl">
          {error}
        </div>
      </div>
    );
  }

  // Login Required
  if (!poll.allowAnonymous && !storedUser) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-violet-600/20 blur-3xl rounded-full" />

        <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-purple-600/20 blur-3xl rounded-full" />

        <div className="relative z-10 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-10 text-center max-w-md w-full">
          <h1 className="text-4xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Login Required
          </h1>

          <p className="text-gray-400 mb-8">
            You must login to participate in this poll.
          </p>

          <Link
            to="/login"
            className="inline-flex bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-violet-500/20"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Published Results
  if (poll.isPublished && results) {
    return (
      <div className="min-h-screen bg-[#0B0B14] px-6 py-10 relative overflow-hidden">
        <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-violet-600/20 blur-3xl rounded-full" />

        <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-purple-600/20 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
              {results.title}
            </h1>

            <p className="text-gray-400 text-lg">Final Poll Results</p>
          </div>

          <div className="space-y-8">
            {results.questions.map((question, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8"
              >
                <div className="mb-8">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold mb-4">
                    {index + 1}
                  </span>

                  <h3 className="text-3xl font-bold text-white">
                    {question.question}
                  </h3>
                </div>

                <div className="grid lg:grid-cols-2 gap-10 items-center">
                  <div className="space-y-5">
                    {question.options.map((option) => (
                      <div
                        key={option.option}
                        className="bg-white/5 border border-white/5 rounded-2xl p-5"
                      >
                        <div className="flex justify-between mb-3">
                          <span className="text-white font-medium">
                            {option.option}
                          </span>

                          <span className="text-violet-300 font-semibold">
                            {option.votes} votes
                          </span>
                        </div>

                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                            style={{
                              width: `${option.percentage}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 text-right">
                          <span className="text-sm text-gray-400">
                            {option.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-3xl p-4 overflow-x-auto">
                    <AnalyticsChart options={question.options} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Voting Page
  return (
    <div className="min-h-screen bg-[#0B0B14] px-6 py-10 relative overflow-hidden">
      <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-violet-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div
                className={`px-5 py-2 rounded-full text-sm font-semibold ${
                  isExpired
                    ? "bg-red-500/20 text-red-400 border border-red-500/20"
                    : "bg-violet-500/20 text-violet-300 border border-violet-500/20"
                }`}
              >
                {isExpired ? "Poll Expired" : `Ends in: ${timeLeft}`}
              </div>

              {poll.allowAnonymous ? (
                <div className="px-5 py-2 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  Anonymous Allowed
                </div>
              ) : (
                <div className="px-5 py-2 rounded-full text-sm font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/20">
                  Login Required
                </div>
              )}
            </div>

            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
              {poll.title}
            </h1>

            <p className="text-gray-400 text-lg">{poll.description}</p>
          </div>

          {/* Questions */}
          {!poll.isPublished && !isExpired && (
            <div className="space-y-8">
              {poll.questions.map((question, index) => (
                <div
                  key={question._id}
                  className="bg-white/5 border border-white/5 rounded-3xl p-7"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shrink-0">
                      {index + 1}
                    </span>

                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {question.question}
                      </h3>

                      {question.required && (
                        <p className="text-red-400 text-sm mt-2">* Required</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {question.options.map((option) => (
                      <label
                        key={option._id}
                        className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-violet-500/30 rounded-2xl px-5 py-4 cursor-pointer transition-all duration-300"
                      >
                        <input
                          type="radio"
                          name={question._id}
                          className="w-5 h-5 accent-violet-600"
                          onChange={() =>
                            handleOptionChange(question._id, option.text)
                          }
                        />

                        <span className="text-white">{option.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmit}
                disabled={isExpired || submitting}
                className={`w-full py-5 rounded-3xl text-lg font-bold text-white transition-all duration-300 ${
                  submitting
                    ? "bg-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 hover:scale-[1.01] hover:shadow-2xl hover:shadow-violet-500/20"
                }`}
              >
                {submitting ? "Submitting..." : "Submit Response"}
              </button>
            </div>
          )}

          {/* Auto Publishing */}
          {isExpired && !poll.isPublished && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 text-center">
              <div className="text-6xl mb-5">📊</div>

              <h2 className="text-3xl font-black text-white mb-4">
                Poll Expired
              </h2>

              <p className="text-gray-400 text-lg mb-8">
                Final results are being published...
              </p>

              <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicPoll;
