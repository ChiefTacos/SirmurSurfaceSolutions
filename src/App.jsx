import { Scroll, ScrollControls, CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { MotionConfig } from "framer-motion";
import { Leva } from "leva";
import { useEffect, useRef, useState } from "react";
import { Cursor } from "./components/Cursor";
import { Experience } from "./components/Experience";
import { Interface } from "./components/Interface";
import { Menu } from "./components/Menu";
import { ScrollManager } from "./components/ScrollManager";
import { framerMotionConfig } from "./config";
import { LoadingScreen } from "./components/LoadingScreen";
import { BackgroundTexture } from "./components/CustomBackground";


function App() {
  const [section, setSection] = useState(0);
    const [started, setStarted] = useState(false);

  const [menuOpened, setMenuOpened] = useState(false);
  const cameraControlsRef = useRef();

  useEffect(() => {
    setMenuOpened(false);
      // ✅ Ensure camera controls are fully enabled at all times
    const controls = cameraControlsRef.current;
    if (controls) {
      controls.enabled = true;
   controls.mouseButtons.left = CameraControls.ACTION.PAN;
      controls.mouseButtons.right = CameraControls.ACTION.ROTATE;
      controls.mouseButtons.middle = CameraControls.ACTION.ZOOM;
      controls.touches.one = CameraControls.ACTION.ROTATE;
      controls.touches.two = CameraControls.ACTION.DOLLY_TRUCK;
    }
  }, [section]);

  return (
    <>
          <LoadingScreen started={started} setStarted={setStarted} />

      <MotionConfig
        transition={{
          ...framerMotionConfig,
        }}
      >
        {/* fov 37 og */}
        <Canvas shadows camera={{ position: [0, 3, 10],  fov: 59}}>
          {/* <color attach="background" args={["#cfe2f3"]} />  */}
           {/* night mode STARS */}
          <BackgroundTexture />


  {/* 👇 Full camera control always active ONLY FOR DEV TESTING */}
          {/* <CameraControls ref={cameraControlsRef} makeDefault /> */}

          {/* 👇 Disable scroll ONLY on first page ONLY FOR DEV TESTING */}
          {/* <ScrollControls pages={4} damping={0.1} enabled={section !== 0}>
            <ScrollManager section={section} onSectionChange={setSection} />
            <Scroll>
              <Experience section={section} menuOpened={menuOpened} />
            </Scroll> */}

          <ScrollControls pages={4} damping={0.1}>
            <ScrollManager section={section} onSectionChange={setSection} />
             <Experience section={section} menuOpened={menuOpened} />
            {/* <Scroll>
              <Experience section={section} menuOpened={menuOpened} />
            </Scroll> */}

            <Scroll html>
              <Interface setSection={setSection} />
            </Scroll>
          </ScrollControls>-
        </Canvas>

        <Menu
          onSectionChange={setSection}
          menuOpened={menuOpened}
          setMenuOpened={setMenuOpened}
        />
        <Cursor />
      </MotionConfig>
      <Leva hidden />
    </>
  );
}

export default App;
