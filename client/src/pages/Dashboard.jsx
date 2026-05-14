import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API from "../services/api";

const Dashboard = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Fetch Polls
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        setLoading(true);

        const res = await API.get("/polls/my", {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        });

        setPolls(res.data);
      } catch (error) {
        console.log(error.response?.data);

        setError(error.response?.data?.message || "Failed to load polls");
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  // Publish Results
  const handlePublish = async (pollId) => {
    try {
      setPublishingId(pollId);

      await API.put(
        `/polls/publish/${pollId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        },
      );

      setPolls((prev) =>
        prev.map((poll) =>
          poll._id === pollId ? { ...poll, isPublished: true } : poll,
        ),
      );
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setPublishingId(null);
    }
  };

  // Copy Link
  const handleCopy = async (pollId) => {
    await navigator.clipboard.writeText(`http://localhost:5173/poll/${pollId}`);

    setCopiedId(pollId);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B14] px-6 py-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-violet-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
              My Polls
            </h1>

            <p className="text-gray-400 mt-3">
              Manage, analyze and publish your polls
            </p>
          </div>

          <Link
            to="/create"
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-violet-500/20 w-fit"
          >
            + Create Poll
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* Empty State */}
        {polls.length === 0 ? (
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-12 text-center">
            <div className="text-7xl mb-5">📊</div>

            <h2 className="text-3xl font-bold text-white mb-3">No Polls Yet</h2>

            <p className="text-gray-400 mb-8">
              Create your first poll and start collecting responses
            </p>

            <Link
              to="/create"
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-violet-500/20"
            >
              Create Poll
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
            {polls.map((poll) => {
              const isExpired = new Date() > new Date(poll.expiresAt);

              return (
                <div
                  key={poll._id}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-7 hover:border-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 group"
                >
                  {/* Status */}
                  <div className="flex items-center justify-between mb-5">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                        isExpired
                          ? "bg-red-500/20 text-red-400 border border-red-500/20"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {isExpired ? "Expired" : "Active"}
                    </span>

                    {poll.isPublished && (
                      <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/20">
                        Published
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white mb-3 line-clamp-2">
                    {poll.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-400 mb-6 line-clamp-3 min-h-[72px]">
                    {poll.description || "No description provided"}
                  </p>

                  {/* Info */}
                  <div className="space-y-3 mb-7">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Questions</span>

                      <span className="text-white font-medium">
                        {poll.questions.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Expires</span>

                      <span className="text-gray-300 text-right">
                        {new Date(poll.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(poll._id)}
                      className="flex-1 bg-white/5 border border-white/10 text-white px-4 py-3 rounded-2xl hover:bg-white/10 transition-all duration-300 text-sm font-medium"
                    >
                      {copiedId === poll._id ? "Copied!" : "Copy Link"}
                    </button>

                    {/* Analytics */}
                    <Link
                      to={`/poll-dashboard/${poll._id}`}
                      className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 rounded-2xl text-center hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-violet-500/20 text-sm font-semibold"
                    >
                      Poll Dashboard
                    </Link>

                    {/* Publish */}
                    {!poll.isPublished && (
                      <button
                        onClick={() => handlePublish(poll._id)}
                        disabled={publishingId === poll._id}
                        className={`w-full px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                          publishingId === poll._id
                            ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20"
                        }`}
                      >
                        {publishingId === poll._id
                          ? "Publishing..."
                          : "Publish Results"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
