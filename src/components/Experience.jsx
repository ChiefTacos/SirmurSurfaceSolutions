import {

  useScroll,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";
import { motion } from "framer-motion-3d";
import { useEffect, useRef, useState } from "react";
import { framerMotionConfig } from "../config";
import { Avatar } from "./Avatar";
import { Office } from "./Office";
import { Projects } from "./Projects";
import { MuscleCar } from "./MuscleCar";
// import { RVmodel } from "./Rv";

export const Experience = (props) => {
  const { menuOpened, isDay, isAnimating, setIsAnimating, onResetCamera, onResetOverlays} = props;
  const { viewport, camera } = useThree();
  const data = useScroll();

  const [section, setSection] = useState(0);
  const [cameraTarget, setCameraTarget] = useState(null); // Store OverlayItem camera target


  const cameraPositionX = useMotionValue(0); // Initialize with 0
  const cameraLookAtX = useMotionValue(0); // Initialize with 0
const [activeOverlay, setActiveOverlay] = useState(null); 




  
  // Pass down a way for OverlayItem to register its reset function
  const registerOverlayReset = (resetFn) => {
    overlayResetFns.current.push(resetFn);
  };


  
  const characterContainerAboutRef = useRef();

  const [characterAnimation, setCharacterAnimation] = useState("Typing");
  useEffect(() => {
    setCharacterAnimation("Falling");
    setTimeout(() => {
      setCharacterAnimation(section === 2 ? "Typing" : "Standing");
    }, 600);
  }, [section]);

  useFrame((state) => {
    let curSection = Math.floor(data.scroll.current * data.pages);

    if (curSection > 3) {
      curSection = 3;
    }

    if (curSection !== section) {
      setSection(curSection);
    }

   
  });

  return (
    <>
      <ambientLight intensity={isDay ? 1.1: 1.8} />

      <motion.group
        position={[1.9072935059634513, 0.14400000000000002, 2.681801948466054]}
        rotation={[-3.141592653589793, 1.2053981633974482, 3.141592653589793]}
        animate={"" + section}
        transition={{
          duration: 0.6,
        }}
        variants={{
          0: {
            scaleX: 0.99,
            scaleZ: 0.99,
            scaleY: 0.99,
            y: 0.65,
            x: -4,
            z:-10
          },
          1: {
           scaleX: 1,
            scaleZ: 1,
            scaleY: 1,
            y: 0.65,
            x: -4,
            z:-10
          },
          2: {
            x: -2,
            y: -viewport.height * 2 + 0.5,
            z: 0,
            rotateX: 0,
            rotateY: Math.PI / 2,
            rotateZ: 0,
          },
          3: {
            y: -viewport.height * 3 + 1,
            x: 0.3,
            z: 8.5,
            rotateX: 0,
            rotateY: -Math.PI / 4,
            rotateZ: 0,
          },
        }}
      >
        <Avatar animation={characterAnimation} />
      </motion.group>
      <motion.group
        position={[8, 1, -2]}
        scale={[1, 1, 1]}
        
        
         animate={{
            // rotateY: section === 3 ? Math.PI / 5 : 0,
            // rotateX: section === 3 ? Math.PI / -9 : 0,
            rotateY: section === 3 ? 0 : 0,
            rotateX: section === 3 ? 0 : 0,

         }}


      >
        <Office section={section} menuOpened={menuOpened} isDay={isDay} setIsAnimating={setIsAnimating} setCameraTarget={setCameraTarget}
          registerOverlayReset={registerOverlayReset}
          activeOverlay={activeOverlay}
  setActiveOverlay={setActiveOverlay}
   />
        <MuscleCar />
         {/* <RVmodel />  */}
         
        {/* <group
          ref={characterContainerAboutRef}
          name="CharacterSpot"
          position={[0.07, 0.16, -0.57]}
          rotation={[-Math.PI, 0.42, -Math.PI]}
        ></group> */}
        
      </motion.group>


      <Projects />
      
    </>
  );
};
