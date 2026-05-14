import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import API from "../services/api";
import AnalyticsChart from "../components/AnalyticsChart";
import socket from "../socket";

const Analytics = () => {
  const { id } = useParams();

  const [analytics, setAnalytics] = useState(null);

  const [loading, setLoading] = useState(true);

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

      setError(error.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Socket Events
  useEffect(() => {
    fetchAnalytics();

    socket.emit("joinPollRoom", id);

    socket.on("newResponse", () => {
      fetchAnalytics();
    });

    return () => {
      socket.off("newResponse");
    };
  }, [id]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0B14] flex items-center justify-center px-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-5 rounded-2xl max-w-md w-full text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B14] px-6 py-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-violet-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Poll Analytics
          </h1>

          <p className="text-gray-400 mt-3">
            Real-time insights and live poll performance
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {/* Total Responses */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-7">
            <p className="text-gray-400 mb-3">Total Responses</p>

            <h2 className="text-5xl font-black text-white">
              {analytics.totalResponses}
            </h2>
          </div>

          {/* Questions */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-7">
            <p className="text-gray-400 mb-3">Total Questions</p>

            <h2 className="text-5xl font-black text-white">
              {analytics.questions.length}
            </h2>
          </div>

          {/* Live Status */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-7">
            <p className="text-gray-400 mb-3">Live Status</p>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />

              <span className="text-2xl font-bold text-emerald-400">Live</span>
            </div>
          </div>
        </div>

        {/* Questions Analytics */}
        <div className="space-y-8">
          {analytics.questions.map((question, index) => (
            <div
              key={question.questionId}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:border-violet-500/30 transition-all duration-300 h-full"
            >
              {/* Question Header */}
              <div className="mb-8">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold mb-4">
                  {index + 1}
                </span>

                <h3 className="text-3xl font-bold text-white">
                  {question.question}
                </h3>
              </div>

              {/* Content */}
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                {/* Vote Stats */}
                <div className="space-y-5">
                  {question.options.map((option) => (
                    <div
                      key={option.option}
                      className="bg-white/5 border border-white/5 rounded-2xl p-5"
                    >
                      {/* Top */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white font-medium">
                          {option.option}
                        </span>

                        <span className="text-violet-300 font-semibold">
                          {option.votes} votes
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
                          style={{
                            width: `${option.percentage}%`,
                          }}
                        />
                      </div>

                      {/* Percentage */}
                      <div className="mt-3 flex justify-end">
                        <span className="text-sm text-gray-400">
                          {option.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-4 flex items-center justify-center">
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

export default Analytics;
