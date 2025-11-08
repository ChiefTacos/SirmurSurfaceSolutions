// components/DayNightToggle.jsx
export const DayNightToggle = ({ isDay, setIsDay }) => {
  return (
    <button
      // onClick={() => setIsDay((prev) => !prev)}
      onClick={() => setIsDay(!isDay)}
      className={`
        w-24 h-24 lg:w-36 lg:h-36 rounded-full
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
        <span
  className={`
    absolute text-lg transition-all duration-500
    ${isDay 
      ? "opacity-100 scale-100" 
      : "opacity-0 scale-0"
    }`}
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <line x1="4.1" y1="4.1" x2="5.5" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <line x1="18.5" y1="18.5" x2="19.9" y2="19.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <line x1="4.1" y1="19.9" x2="5.5" y2="18.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    <line x1="18.5" y1="5.5" x2="19.9" y2="4.1" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
</span>

        <span className={`absolute text-2xl transition-all duration-500
          ${!isDay ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-0 -rotate-180"}`}>
          
        </span>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="3em" height="3em" fill="currentColor">
  <path d="M21 12.5a8.5 8.5 0 0 1-14.85 5.65 7 7 0 1 0 0-11.3A8.5 8.5 0 0 1 21 12.5z"/>
</svg>
      </div>



    </button>
  );
};