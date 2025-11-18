import { ScrollControls, Scroll } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MotionConfig } from "framer-motion";
import { Leva } from "leva";
import { useEffect, useState, useRef } from "react";
import { Cursor } from "./components/Cursor";
import { Experience } from "./components/Experience";
import { Interface } from "./components/Interface";
import { Menu } from "./components/Menu";
import { ScrollManager } from "./components/ScrollManager";
import { framerMotionConfig } from "./config";
import { LoadingScreen } from "./components/LoadingScreen";
import { DayNightSky } from "./components/DayNightSky";
import { MobileFOV } from "./components/MobileFOV";

function App() {
  const [section, setSection] = useState(0);
  const [started, setStarted] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const [isDay, setIsDay] = useState(true); // true = day, false = night
  const [isAnimating, setIsAnimating] = useState(false); // New state
  const [canvasKey, setCanvasKey] = useState(0);
   const reset3D = () => setCanvasKey(k => k + 1);


const resetCameraRef =  useRef(() => {});//home button camera reset
const resetOverlaysRef = useRef(() => {});   // ← NEW with other one

      useEffect(() => {
        setMenuOpened(false);
      }, [section]);
      
      useEffect(() => {
        const isMobile = window.innerWidth < 1024;

        if (isMobile && section === 0) {
          // Lock all scroll + touchmove
          document.body.style.overflow = "hidden";
          document.body.style.touchAction = "none"; // disable pan, pinch, swipe
        } else {
          // Restore
          document.body.style.overflow = "";
          document.body.style.touchAction = "";
        }

        return () => {
          document.body.style.overflow = "";
          document.body.style.touchAction = "";
        };
      }, [section]);

  return (
    <>
      <LoadingScreen started={started} setStarted={setStarted} />
<div 
  id="overlay-portals-root" 
  style={{ 
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    pointerEvents: "none",
    
  }}
></div>    <MotionConfig transition={{ ...framerMotionConfig }}>
        <Canvas
          key={canvasKey}
          shadows
          camera={{ position: [0, 3, 10], fov: 59 }}
          gl={{ preserveDrawingBuffer: true }}
          clear={false} // Ensures sky renders first

          className="fixed inset-0" // cleaner than inline styles for positioning
  style={{
    touchAction: "none",
    WebkitTapHighlightColor: "transparent",
  }}
          onContextMenu={(e) => e.preventDefault()}        // blocks right-click menu
  onSelectStart={(e) => e.preventDefault()}        // blocks selection
  onPointerDown={(e) => e.stopPropagation()}       // helps with event conflicts
  tabIndex={-1}
        >
          <MobileFOV />
          <DayNightSky debugForceDay={isDay} />
          <ScrollControls pages={4} damping={0.1}>
            <ScrollManager section={section} onSectionChange={setSection} />
            <Experience section={section} menuOpened={menuOpened} isDay={isDay} setIsAnimating={setIsAnimating} 
             // This lets Experience give us the reset function
              onResetCamera={(fn) => { resetCameraRef.current = fn }}
              onResetOverlays={(fn) => { resetOverlaysRef.current = fn }} 
              />
            <Scroll html>
              <Interface setSection={setSection} />
            </Scroll>
          </ScrollControls>
        </Canvas>
         <a
        href="tel:+12622305182"
        aria-label="Call us"
        className="fixed bottom-20 right-20 z-[10002]"
      >

        {/* always there phone button */}
<button
  className="absolute bg-green-500 text-white w-14 h-14 rounded-full flex justify-center items-center shadow-lg hover:bg-green-600 transition-all duration-300 ease-out group z-50 hover:scale-105 active:scale-95"
  aria-label="Call us or leave a message."
>
  <div className="absolute -right-1 -top-1 z-10">
    <div className="flex h-6 w-6 items-center justify-center">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"
      ></span>
      <span
        className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
      >
        1
      </span>
    </div>
  </div>

  <svg
    viewBox="0 0 16 16"
    className="w-7 h-7"
    fill="currentColor"
    height="24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"
    ></path>
  </svg>

  <span
    className="absolute inset-0 rounded-full border-4 border-white/30 scale-100 animate-pulse"
  ></span>

  <div
    className="absolute right-full mr-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 whitespace-nowrap"
  >
    <div className="bg-gray-800 text-white text-sm px-3 py-1 rounded shadow-lg">
Call or Message us!   </div>
    <div
      className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"
    ></div>
  </div>
</button>

        </a>
        <Menu
          onSectionChange={setSection}
          menuOpened={menuOpened}
          setMenuOpened={setMenuOpened}
          isDay={isDay}
          setIsDay={setIsDay}
          reset3D={reset3D}
          section={section}
          resetCamera={resetCameraRef.current}   
          resetOverlays={resetOverlaysRef.current}   
        />
        <Cursor />
      </MotionConfig>
      <Leva hidden />
    </>
  );
}

export default App;