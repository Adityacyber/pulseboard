import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import API from "../services/api";
import AnalyticsChart from "../components/AnalyticsChart";

const PublicResults = () => {
  const { id } = useParams();

  const [results, setResults] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setError("");

        const res = await API.get(`/polls/results/${id}`);

        setResults(res.data);
      } catch (error) {
        console.log(error.response?.data || error.message);

        setError(error.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
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
      {/* Glow Effects */}
      <div className="absolute top-[-150px] left-[-150px] w-[350px] h-[350px] bg-violet-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 px-5 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Public Results
          </div>

          <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent mb-4">
            {results.title}
          </h1>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
              <p className="text-sm text-gray-400 mb-1">Total Responses</p>

              <h2 className="text-3xl font-bold text-white">
                {results.totalResponses}
              </h2>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
              <p className="text-sm text-gray-400 mb-1">Questions</p>

              <h2 className="text-3xl font-bold text-white">
                {results.questions.length}
              </h2>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {results.questions.map((question, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8"
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
              <div className="grid lg:grid-cols-2 gap-10 items-center">
                {/* Vote Progress */}
                <div className="space-y-5">
                  {question.options.map((option) => (
                    <div
                      key={option.option}
                      className="bg-white/5 border border-white/5 rounded-2xl p-5"
                    >
                      <div className="flex justify-between items-center mb-3">
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

                      <div className="mt-3 text-right">
                        <span className="text-sm text-gray-400">
                          {option.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-4">
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

export default PublicResults;
