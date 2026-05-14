import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import API from "../services/api";
import QuestionField from "../components/QuestionField";

const CreatePoll = () => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      allowAnonymous: true,
      expiresAt: "",
      questions: [
        {
          question: "",
          required: false,
          options: [{ text: "" }, { text: "" }],
        },
      ],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  // Submit Form
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");
      setSuccessMessage("");

      const res = await API.post("/polls", data, {
        headers: {
          Authorization: `Bearer ${storedUser.token}`,
        },
      });

      toast.success("Poll created successfully!");

      navigate(`/poll-dashboard/${res.data._id}`);

      reset();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to create poll");

      setServerError(error.response?.data?.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B14] px-6 py-10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[320px] h-[320px] bg-violet-600/20 blur-3xl rounded-full" />

      <div className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-purple-600/20 blur-3xl rounded-full" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-black bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
            Create Poll
          </h1>

          <p className="text-gray-400 mt-3">
            Build interactive polls and collect live feedback
          </p>
        </div>

        {/* Error */}
        {serverError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl">
            {serverError}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-4 rounded-2xl">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Poll Details */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Poll Details</h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Poll Title
                </label>

                <input
                  type="text"
                  placeholder="Enter poll title"
                  {...register("title", {
                    required: "Poll title is required",
                  })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-500 outline-none focus:border-violet-500 transition-all"
                />

                {errors.title && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Description
                </label>

                <textarea
                  rows={4}
                  placeholder="Describe your poll"
                  {...register("description")}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-500 outline-none focus:border-violet-500 transition-all resize-none"
                />

                {errors.description && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Poll Settings */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Expiry */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Expiry Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    {...register("expiresAt", {
                      required: "Expiry date is required",
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-violet-500 transition-all"
                  />

                  {errors.expiresAt && (
                    <p className="text-red-400 text-sm mt-2">
                      {errors.expiresAt.message}
                    </p>
                  )}
                </div>

                {/* Anonymous */}
                <div className="flex items-end">
                  <label className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 w-full cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("allowAnonymous")}
                      className="w-5 h-5 accent-violet-600"
                    />

                    <span className="text-gray-300">
                      Allow Anonymous Responses
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questionFields.map((question, questionIndex) => (
              <QuestionField
                key={question.id}
                question={question}
                questionIndex={questionIndex}
                register={register}
                control={control}
                removeQuestion={removeQuestion}
              />
            ))}
          </div>

          {/* Add Question */}
          <button
            type="button"
            onClick={() =>
              appendQuestion({
                question: "",
                required: false,
                options: [{ text: "" }, { text: "" }],
              })
            }
            className="w-full border border-dashed border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 py-5 rounded-3xl transition-all duration-300 font-semibold text-lg"
          >
            + Add New Question
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-3xl text-lg font-bold text-white transition-all duration-300 ${
              loading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:scale-[1.01] hover:shadow-2xl hover:shadow-violet-500/20"
            }`}
          >
            {loading ? "Creating Poll..." : "Create Poll"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
