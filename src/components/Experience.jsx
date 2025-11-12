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
  const { menuOpened, isDay, isAnimating, setIsAnimating } = props;
  const { viewport, camera } = useThree();
  const data = useScroll();

  const [section, setSection] = useState(0);
  const [cameraTarget, setCameraTarget] = useState(null); // Store OverlayItem camera target


  const cameraPositionX = useMotionValue(0); // Initialize with 0
  const cameraLookAtX = useMotionValue(0); // Initialize with 0



  //old logic for moving menu 5 units back and forth but buggy with 3d text signs
  // useEffect(() => {
  //   animate(cameraPositionX, menuOpened ? -5 : 0, {
  //     ...framerMotionConfig,
  //   });
  //   animate(cameraLookAtX, menuOpened ? 5 : 0, {
  //     ...framerMotionConfig,
  //   });
  // }, [menuOpened]);


  
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

    // Only update camera if not animating
    // if (!isAnimating) {
    //   state.camera.position.x = cameraPositionX.get();
    //   state.camera.lookAt(cameraLookAtX.get(), 0, 0);
    // }

    if (!isAnimating && cameraTarget) {
      // Maintain OverlayItem's camera position and lookAt
      console.log("Applying cameraTarget:", cameraTarget);
      camera.position.set(...cameraTarget.position);
      camera.lookAt(...cameraTarget.lookAt);
      camera.updateProjectionMatrix();
    } else if (!isAnimating) {
      // Default behavior when no OverlayItem is active
      camera.position.x = cameraPositionX.get();
      camera.lookAt(cameraLookAtX.get(), 0, 0);
      camera.updateProjectionMatrix();
    }

    // const position = new THREE.Vector3();
    // characterContainerAboutRef.current.getWorldPosition(position);
    // console.log([position.x, position.y, position.z]);

    // const quaternion = new THREE.Quaternion();
    // characterContainerAboutRef.current.getWorldQuaternion(quaternion);
    // const euler = new THREE.Euler();
    // euler.setFromQuaternion(quaternion, "XYZ");

    // console.log([euler.x, euler.y, euler.z]);
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
      {/* <ambientLight intensity={1.4} /> */}
      <motion.group
        position={[8, 1, -2]}
        scale={[1, 1, 1]}
        
        
         animate={{
            rotateY: section === 2 ? 0 : Math.PI / 7,

         }}


      >
        <Office section={section} menuOpened={menuOpened} isDay={isDay} setIsAnimating={setIsAnimating} setCameraTarget={setCameraTarget}  />
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
