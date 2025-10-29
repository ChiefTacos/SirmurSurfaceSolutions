import { useProgress } from "@react-three/drei";
import { useEffect } from "react";

export const LoadingScreen = (props) => {
const {started, setStarted} = props;
    const {progress, total, loaded, item} = useProgress();

    useEffect(() => {
        console.log(progress, total, loaded, item)
        if(progress === 100) {
            setTimeout(() => {
                setStarted(true);
            }, 500);
        }
    }, [progress, total, loaded, item]);

return (
    <div className={`fixed top-0 left-0 w-full h-full z-50 transition-opacity duration-1000 pointer-events-none flex items-center justify-center
    ${started ? "opacity-0" : "opacity-100"}`}
            style={{

          backgroundColor: "#FFDEE9",
          backgroundImage: "linear-gradient(0deg, #FFDEE9 0%, #c3dbff 100%)",
          
        }}
    >
        <div className="text-6xl md:text-9xl font-bold text-indigo-900 relative">
            <div className="absolute left-0 top-0 overflow-hidden truncate text-clip transition-all duration-500"
            style={{
                width:`${progress}%`,
            }}>
                    still cookin
            </div>
            <div className="opacity-40">still cookin</div>
        </div>
    </div>
);
}







// import { useProgress } from "@react-three/drei";
// import { useEffect } from "react";

// export const LoadingScreen = ({ started, setStarted }) => {
//   const { progress, total, loaded, item } = useProgress();

//   useEffect(() => {
//     console.log(progress, total, loaded, item);
//     if (progress === 100) {
//       setTimeout(() => {
//         setStarted(true);
//       }, 500);
//     }
//   }, [progress, total, loaded, item]);

//   return (
//     <div
//       className={`fixed top-0 left-0 w-full h-full z-50 transition-opacity duration-900 pointer-events-none flex items-center justify-center
//     ${started ? "opacity-0" : "opacity-100"}`}
//       style={{
//         backgroundColor: "#000000",
//       }}
//     >
//       {/* Logo Container */}
//       <div className="absolute w-48 h-48 md:w-72 md:h-72 flex items-center justify-center">
//         <img
//           src="/logo.png" // <-- replace with your actual image path
//           alt="SIRMUR Logo"
//           className="w-full h-full  object-contain transition-opacity duration-800 mb-10 "
//           style={{
//             opacity: progress / 100, // fades in smoothly
//           }}
//         />
              
//       </div>
//       <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 translate-y-[120px]"> 
       
//              {/* 💬 Dot-dot-dot loading text */}
//             <div className=" text-white md:text-4xl text-3xl font-medium tracking-wider">
//                loading
//               <span className="text-4xl inline-block animate-dots">.</span>
//             </div>
            
//         </div>
//         <div 
//             className="
//               text-white md:text-2xl text-xl font-medium tracking-wider 
//               pointer-events-auto absolute bottom-0 left-0 right-0 
//               flex justify-center mb-4
//             "
//             >
//                     <span className="pr-6">                Hours of Operation = 8am - 6pm  </span>
//               <a href="tel:1-262-230-5182">
//                 Reach us @ +1 262-230-5182
//               </a>
              
//         </div>
//            {/* Dot animation styles */}
//       <style>{`
//         @keyframes dots {
//           0%, 20% { content: ".."; }
//           40% { content: "..."; }
//           60% { content: "..."; }
//           80%, 100% { content: "...."; }
//         }
//         .animate-dots::after {
//           content: ".....";
//           animation: dots 3s steps(1, end) 2;
//         }
//       `}</style>
//     </div>
//   );
// };
