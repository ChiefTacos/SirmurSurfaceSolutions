// components/DayNightToggle.jsx
export const DayNightToggle = ({ isDay, setIsDay }) => {
  return (
    <button
      onClick={() => setIsDay((prev) => !prev)}
      className={`
        w-28 h-28 rounded-full
        flex items-center justify-center
        shadow-lg
        transition-all duration-500 ease-in-out
        transform hover:scale-110 active:scale-95
        border-2 border-white/30
        ${isDay
          ? "bg-gradient-to-br from-yellow-300 via-orange-400 to-amber-500 text-yellow-900"
          : "bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-indigo-200"
        }
      `}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <span className={`absolute text-2xl font-bold transition-all duration-500
          ${isDay ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 rotate-180"}`}>
          Sun
        </span>
        <span className={`absolute text-2xl transition-all duration-500
          ${!isDay ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-180"}`}>
          Moon
        </span>
      </div>
    </button>
  );
};