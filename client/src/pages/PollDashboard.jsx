import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import API from "../services/api";
import AnalyticsChart from "../components/AnalyticsChart";
import socket from "../socket";

const PollDashboard = () => {
  const { id } = useParams();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  // Fetch Analytics
  const fetchAnalytics = async () => {
    try {
      setError("");

      const res = await API.get(`/polls/analytics/${id}`, {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });

      setAnalytics(res.data);
    } catch (error) {
      console.log(error.response?.data);

      setError(
        error.response?.data?.message || "Failed to load poll dashboard",
      );
    } finally {
      setLoading(false);
    }
  };

  // Publish Results
  const handlePublish = async () => {
    try {
      setPublishing(true);

      await API.put(
        `/polls/publish/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${storedUser.token}`,
          },
        },
      );

      toast.success("Results published");

      fetchAnalytics();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish results");
    } finally {
      setPublishing(false);
    }
  };

  // Delete Poll
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this poll?",
    );

    if (!confirmDelete) return;

    try {
      setDeleting(true);

      await API.delete(`/polls/${id}`, {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });

      toast.success("Poll deleted");

      window.location.href = "/";
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete poll");
    } finally {
      setDeleting(false);
    }
  };

  // Copy Link
  const handleCopy = async () => {
    await navigator.clipboard.writeText(`http://localhost:5173/poll/${id}`);

    toast.success("Link copied");
  };

  // Socket
  useEffect(() => {
    fetchAnalytics();

    socket.emit("joinPollRoom", id);

    socket.on("newResponse", () => {
      fetchAnalytics();
    });

    socket.on("pollPublished", () => {
      fetchAnalytics();
    });

    return () => {
      socket.off("newResponse");

      socket.off("pollPublished");
    };
  }, [id]);

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

  return (
    <div className="min-h-screen bg-[#0B0B14] px-6 py-10 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-violet-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
              {analytics.title}
            </h1>

            <p className="text-gray-400 text-lg">{analytics.description}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCopy}
              className="bg-white/5 border border-white/10 text-white px-5 py-3 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              Copy Link
            </button>

            {!analytics.isPublished && (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-300"
              >
                {publishing ? "Publishing..." : "Publish Results"}
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-3 rounded-2xl hover:bg-red-500/20 transition-all duration-300"
            >
              {deleting ? "Deleting..." : "Delete Poll"}
            </button>
          </div>
        </div>

        {/* Overview */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-gray-400 mb-3">Total Responses</p>

            <h2 className="text-5xl font-black text-white">
              {analytics.totalResponses}
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-gray-400 mb-3">Questions</p>

            <h2 className="text-5xl font-black text-white">
              {analytics.questions.length}
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-gray-400 mb-3">Anonymous</p>

            <h2 className="text-2xl font-bold text-white">
              {analytics.allowAnonymous ? "Allowed" : "Login Required"}
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <p className="text-gray-400 mb-3">Status</p>

            <h2 className="text-2xl font-bold text-white">
              {analytics.isPublished
                ? "Published"
                : new Date() > new Date(analytics.expiresAt)
                  ? "Expired"
                  : "Active"}
            </h2>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {analytics.questions.map((question, index) => (
            <div
              key={question.questionId}
              className="bg-white/5 border border-white/10 rounded-3xl p-8"
            >
              {/* Header */}
              <div className="mb-8">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold mb-4">
                  {index + 1}
                </span>

                <h3 className="text-3xl font-bold text-white">
                  {question.question}
                </h3>
              </div>

              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Options */}
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

                {/* Chart */}
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
};

export default PollDashboard;
