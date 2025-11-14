
// old components/DayNightToggle.jsx
// export const DayNightToggle = ({ isDay, setIsDay }) => {
//   return (
//     <label className="relative inline-flex items-center cursor-pointer select-none">
//       {/* Hidden Checkbox (controls the toggle) */}
//       <input
//         type="checkbox"
//         className="sr-only peer"
//         checked={!isDay}              // night = checked
//         onChange={() => setIsDay(!isDay)}
//       />

//       {/* Track */}
//       <div
//         className="
//           w-[72px] h-[72px] rounded-full
//           bg-gradient-to-r 
//           from-yellow-300 to-orange-400
//           peer-checked:from-blue-400 peer-checked:to-indigo-500
//           transition-all duration-500
//           relative
//         "
//       >
//         {/* Thumb */}
//         <div
//           className="
//             absolute top-2 left-2
//             h-14 w-14 rounded-full bg-white shadow-md
//             flex items-center justify-center text-lg
//             transition-all duration-500
//             peer-checked:translate-x-10
//           "
//         >
//           {/* Sun & Moon icons handled by opacity */}
//           <span
//             className={`
//               absolute transition-opacity duration-500 
//               ${isDay ? "opacity-100" : "opacity-0"}
//             `}
//           >
//             ☀️
//           </span>

//           <span
//             className={`
//               absolute transition-opacity duration-500 
//               ${!isDay ? "opacity-100" : "opacity-0"}
//             `}
//           >
//             🌙
//           </span>
//         </div>
//       </div>

//       {/* Optional text label */}
//       {/* <span className="ml-3 text-sm font-medium text-gray-100">
//         Change<hr />Theme/ <hr />
//         Sky
//       </span> */}
//     </label>
//   );
// };

// components/DayNightToggle.jsx
export const DayNightToggle = ({ isDay, setIsDay }) => {
  return (
    <div
      className={`
        w-48 aspect-video rounded-xl border-4 border-[#121331]
        transition-all duration-500 z-10000
        ${!isDay ? "bg-[#3a3347]" : "bg-[#ebe6ef]"}
      `}
    >
      <div className="flex h-full w-full px-2 items-center gap-x-2">
        {/* Left Circle */}
        <div className="w-6 h-6 flex-shrink-0 rounded-full border-4 border-[#121331]" />

        {/* SWITCH (clickable area) */}
        <label
          className={`
            w-full h-10 border-4 border-[#121331] rounded cursor-pointer
            transition-transform duration-500
            ${!isDay ? "scale-x-[-1]" : "scale-x-[1]"}
          `}
        >
          <input
            type="checkbox"
            className="hidden"
            checked={!isDay}        // night = checked
            onChange={() => setIsDay(!isDay)}
          />

          {/* Inside switch */}
          <div className="w-full h-full bg-[#f24c00] relative overflow-hidden">

            {/* Triangle top */}
            <div
              className="
                w-0 h-0 z-10000
                border-l-[24px] border-l-transparent
                border-r-[24px] border-r-transparent
                border-t-[20px] border-t-[#121331]
                relative
              "
            >
              <div
                className="
                  w-0 h-0 absolute
                  border-l-[18px] border-l-transparent
                  border-r-[18px] border-r-transparent
                  border-t-[15px] border-t-[#e44901]
                  -top-5 -left-[18px]
                "
              />
            </div>

            {/* Orange slanted box left */}
            <div
              className="
                w-[24px] h-9 z-10000 absolute top-[9px] left-0 bg-[#f24c00]
                border-r-2 border-b-4 border-[#121331]
                transform skew-y-[39deg]
              "
            />

            {/* Orange slanted box right */}
            <div
              className="
                w-[25px] h-9 z-10000 absolute top-[9px] left-[24px] bg-[#c44002]
                border-r-4 border-l-2 border-b-4 border-[#121331]
                transform skew-y-[-39deg]
              "
            />
          </div>
        </label>

        {/* Right bar */}
        <div className="w-6 h-1 flex-shrink-0 bg-[#121331] rounded-full"></div>
      </div>
    </div>
  );
};

