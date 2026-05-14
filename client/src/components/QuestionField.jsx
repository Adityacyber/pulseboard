import { useFieldArray } from "react-hook-form";

const QuestionField = ({
  questionIndex,
  register,
  control,
  removeQuestion,
}) => {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:border-violet-500/30 transition-all duration-300">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Question {questionIndex + 1}
        </h2>

        <button
          type="button"
          onClick={() => removeQuestion(questionIndex)}
          className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/20 transition-all duration-300 text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {/* Question Input */}
      <div className="mb-6">
        <label className="block text-sm text-gray-300 mb-2">Question</label>

        <input
          type="text"
          placeholder="Enter your question"
          {...register(`questions.${questionIndex}.question`, {
            required: "Question is required",
          })}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-500 outline-none focus:border-violet-500 transition-all"
        />
      </div>

      {/* Required Toggle */}
      <div className="mb-8">
        <label className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 cursor-pointer">
          <input
            type="checkbox"
            {...register(`questions.${questionIndex}.required`)}
            className="w-5 h-5 accent-violet-600"
          />

          <span className="text-gray-300">Mark as required</span>
        </label>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {optionFields.map((option, optionIndex) => (
          <div key={option.id} className="flex gap-3 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Option ${optionIndex + 1}`}
                {...register(
                  `questions.${questionIndex}.options.${optionIndex}.text`,
                  {
                    required: "Option text is required",
                  },
                )}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-500 outline-none focus:border-violet-500 transition-all"
              />
            </div>

            {optionFields.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(optionIndex)}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-4 rounded-2xl hover:bg-red-500/20 transition-all duration-300 font-medium"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Option */}
      <button
        type="button"
        onClick={() => appendOption({ text: "" })}
        className="mt-6 w-full border border-dashed border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 text-violet-300 py-4 rounded-2xl transition-all duration-300 font-semibold"
      >
        + Add Option
      </button>
    </div>
  );
};

export default QuestionField;
