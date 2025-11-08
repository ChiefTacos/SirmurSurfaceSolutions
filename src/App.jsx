import { ScrollControls, Scroll } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MotionConfig } from "framer-motion";
import { Leva } from "leva";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setMenuOpened(false);
  }, [section]);

  return (
    <>
      <LoadingScreen started={started} setStarted={setStarted} />
      <MotionConfig transition={{ ...framerMotionConfig }}>
        <Canvas
          shadows
          camera={{ position: [0, 3, 10], fov: 59 }}
          gl={{ preserveDrawingBuffer: true }}
          clear={false} // Ensures sky renders first
        >
          <MobileFOV />
          <DayNightSky debugForceDay={isDay} />
          <ScrollControls pages={4} damping={0.1}>
            <ScrollManager section={section} onSectionChange={setSection} />
            <Experience section={section} menuOpened={menuOpened} />
            <Scroll html>
              <Interface setSection={setSection} />
            </Scroll>
          </ScrollControls>
        </Canvas>
        <Menu
          onSectionChange={setSection}
          menuOpened={menuOpened}
          setMenuOpened={setMenuOpened}
          isDay={isDay}
          setIsDay={setIsDay}
        />
        <Cursor />
      </MotionConfig>
      <Leva hidden />
    </>
  );
}

export default App;