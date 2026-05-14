import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const AnalyticsChart = ({ options }) => {
  const data = options.map((option) => ({
    name: option.option,
    value: option.votes,
  }));

  const COLORS = [
    "#7C3AED",
    "#8B5CF6",
    "#A855F7",
    "#C084FC",
    "#6D28D9",
    "#9333EA",
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#141422] border border-white/10 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-2xl">
          <p className="text-white font-semibold mb-1">{payload[0].name}</p>

          <p className="text-violet-300 text-sm">Votes: {payload[0].value}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-[520px]">
      {/* Chart */}
      <ResponsiveContainer width="100%" height="60%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={110}
            paddingAngle={4}
            dataKey="value"
            stroke="transparent"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 w-full">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 min-w-0 overflow-hidden"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />

            <div className="flex-1">
              <p className="text-white text-sm font-medium truncate w-full">
                {item.name}
              </p>

              <p className="text-gray-400 text-xs">{item.value} votes</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsChart;
