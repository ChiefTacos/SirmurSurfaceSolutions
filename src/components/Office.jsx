// import { useGLTF, useTexture, useVideoTexture, useAnimations, Html } from "@react-three/drei";
import { useGLTF, useTexture, useVideoTexture, useAnimations, MeshTransmissionMaterial, Html  } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const OverlayItem = ({
  className = "",
  title,
  description,
  price,
  bgColor,
  positionX = 0,
  positionY = 0,
  positionZ = 0,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  parentGroupRef, 
  setIsAnimating,
  setCameraTarget, // New prop to store camera target
  ...props
}) => {
  const { camera } = useThree();
  // const htmlRef = useRef();
const groupRef = useRef(); // Ref for the THREE.Group
const initialCameraState = useRef({ position: null, quaternion: null });


  // // Use useFrame to check for parent until found
  // useFrame(() => {
  //   if (!parentSet && htmlRef.current && htmlRef.current.parent) {
  //     parentGroupRef.current = htmlRef.current.parent;
  //     console.log("Parent Group Set:", parentGroupRef.current);
  //     parentGroupRef.current.updateWorldMatrix(true, false);
  //     const worldPos = new THREE.Vector3().setFromMatrixPosition(parentGroupRef.current.matrixWorld);
  //     console.log("Parent World Position:", worldPos.toArray());
  //     setParentSet(true);
  //   }
  // });

const handleButtonClick = (e) => {
    e.stopPropagation();
    console.log("Button Clicked!");
    if (typeof setIsAnimating !== "function") {
      console.error("setIsAnimating is not a function:", setIsAnimating);
      return;
    }
    if (typeof setCameraTarget !== "function") {
      console.error("setCameraTarget is not a function:", setCameraTarget);
      return;
    }
    setIsAnimating(true);

    // Store initial camera position and quaternion
    initialCameraState.current = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
    };
    console.log("Stored Initial Camera State:", {
      position: initialCameraState.current.position.toArray(),
      quaternion: initialCameraState.current.quaternion.toArray(),
    });

    if (!parentGroupRef.current) {
      console.warn("Parent group not found, using fallback position");
      const fallbackPos = new THREE.Vector3(-11, -1, -2);
      animate(0, 1, {
        duration: 1,
        onUpdate: (t) => {
          camera.position.lerpVectors(camera.position, fallbackPos, t);
          camera.updateProjectionMatrix();
        },
      });
      camera.lookAt(-11, -4, -2);
      camera.updateProjectionMatrix();
      setTimeout(() => {
        console.log("Fallback Final Camera Pos:", camera.position.toArray());
        setIsAnimating(false);
      }, 2000);
      return;
    }

    // Get parent group's world matrix
    parentGroupRef.current.updateWorldMatrix(true, false);
    const parentWorldMatrix = new THREE.Matrix4().copy(parentGroupRef.current.matrixWorld);
    console.log("Parent World Matrix:", parentWorldMatrix.elements);

    // Calculate parent group's world position (center)
    const parentWorldPos = new THREE.Vector3().setFromMatrixPosition(parentWorldMatrix);
    console.log("Parent World Pos:", parentWorldPos.toArray());

    // Calculate OverlayItem's world position
    const localPos = new THREE.Vector3(positionX, positionY, positionZ);
    const overlayWorldPos = localPos.clone().applyMatrix4(parentWorldMatrix);
    console.log("OverlayItem World Pos:", overlayWorldPos.toArray());

    // Determine the "up" direction of the parent group (local Y-axis transformed to world space)
    const upVector = new THREE.Vector3(0, 1, 0);
    const worldUpVector = upVector.clone().applyMatrix4(parentWorldMatrix).normalize();
    console.log("World Up Vector:", worldUpVector.toArray());

    // Determine the "right" direction for horizontal offset (local X-axis transformed to world space)
    const rightVector = new THREE.Vector3(1, 0, 0);
    const worldRightVector = rightVector.clone().applyMatrix4(parentWorldMatrix).normalize();
    console.log("World Right Vector:", worldRightVector.toArray());

    // Position camera above the parent group, offset along the up vector
    const offsetDistance = 5;
    const cameraTargetPos = parentWorldPos.clone().add(worldUpVector.multiplyScalar(offsetDistance));
    // Apply horizontal offset in the deck's "right" direction
    const horizontalOffset = 2;
    cameraTargetPos.add(worldRightVector.multiplyScalar(horizontalOffset));
    console.log("Camera Target Pos (with offset):", cameraTargetPos.toArray());

    // Animate camera to the target position
    const startPos = camera.position.clone();
    animate(0, 1, {
      duration: 1,
      onUpdate: (t) => {
        camera.position.lerpVectors(startPos, cameraTargetPos, t);
        camera.updateProjectionMatrix();
      },
    });

    // Look at OverlayItem's world position
    camera.lookAt(overlayWorldPos);
    camera.updateProjectionMatrix();
    console.log("Camera LookAt:", overlayWorldPos.toArray());

    // Compute bounding box of balconyGroupRef
    const boundingBox = new THREE.Box3().setFromObject(parentGroupRef.current);
    const boxSize = boundingBox.getSize(new THREE.Vector3());
    console.log("Balcony Group Bounding Box:", {
      min: boundingBox.min.toArray(),
      max: boundingBox.max.toArray(),
      size: boxSize.toArray(),
      center: boundingBox.getCenter(new THREE.Vector3()).toArray(),
    });

    // Rotate OverlayItem to face the camera
    if (groupRef.current) {
      console.log("groupRef.current:", groupRef.current);
      // Calculate direction from OverlayItem to camera
      const cameraDirection = new THREE.Vector3()
        .subVectors(cameraTargetPos, overlayWorldPos)
        .normalize();
      // Create a quaternion to rotate towards the camera
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1), // HTML's default forward direction (positive Z)
        cameraDirection
      );
      // Account for initial rotations
      const initialQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotationX, rotationY, rotationZ, 'XYZ')
      );
      const finalQuaternion = initialQuaternion.multiply(quaternion);

      // Animate rotation using quaternion
      const startQuaternion = groupRef.current.quaternion.clone();
      animate(0, 1, {
        duration: 1,
        onUpdate: (t) => {
          if (groupRef.current) {
            const lerpedQuaternion = new THREE.Quaternion().slerpQuaternions(
              startQuaternion,
              finalQuaternion,
              t
            );
            groupRef.current.quaternion.copy(lerpedQuaternion);
          } else {
            console.warn("groupRef.current is undefined during animation");
          }
        },
        onComplete: () => {
          console.log("Rotation animation completed");
        },
      });
      console.log("OverlayItem Target Quaternion:", [
        finalQuaternion.x,
        finalQuaternion.y,
        finalQuaternion.z,
        finalQuaternion.w,
      ]);
    } else {
      console.warn("groupRef.current is undefined, skipping rotation");
    }

    // Store camera target in Experience.jsx
    setCameraTarget({
      position: cameraTargetPos.toArray(),
      lookAt: overlayWorldPos.toArray(),
    });

    setTimeout(() => {
      console.log("Final Camera Pos:", camera.position.toArray());
      setIsAnimating(false);
    }, 2000);
  };

  const handleResetClick = (e) => {
    e.stopPropagation();
    console.log("Reset Button Clicked!");
    if (typeof setIsAnimating !== "function") {
      console.error("setIsAnimating is not a function:", setIsAnimating);
      return;
    }
    setIsAnimating(true);

    if (!initialCameraState.current.position || !initialCameraState.current.quaternion) {
      console.warn("Initial camera state not found, using fallback position");
      const fallbackPos = new THREE.Vector3(-11, -1, -2);
      animate(0, 1, {
        duration: 1,
        onUpdate: (t) => {
          camera.position.lerpVectors(camera.position, fallbackPos, t);
          camera.updateProjectionMatrix();
        },
      });
      camera.lookAt(-11, -4, -2);
      camera.updateProjectionMatrix();
      setTimeout(() => {
        console.log("Fallback Reset Camera Pos:", camera.position.toArray());
        setIsAnimating(false);
      }, 1000);
      return;
    }
    
    
    // Adjust initial position by moving back 10 units along world Z-axis
    const adjustedPos = initialCameraState.current.position.clone();
    adjustedPos.z += 0; // Move back x units along world Z-axis
    console.log("Adjusted Reset Camera Pos:", adjustedPos.toArray());

    // Animate camera to adjusted position
    const startPos = camera.position.clone();
    animate(0, 1, {
      duration: 1,
      onUpdate: (t) => {
        camera.position.lerpVectors(startPos, adjustedPos, t);
        camera.updateProjectionMatrix();
      },
    });

    // Animate camera rotation back to initial quaternion
    const startQuaternion = camera.quaternion.clone();
    const targetQuaternion = initialCameraState.current.quaternion;
    animate(0, 1, {
      duration: 1,
      onUpdate: (t) => {
        camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, t);
        camera.updateProjectionMatrix();
      },
    });

    // Reset OverlayItem rotation to initial values
    if (groupRef.current) {
      const initialQuaternion = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotationX, rotationY, rotationZ, 'XYZ')
      );
      const startOverlayQuaternion = groupRef.current.quaternion.clone();
      animate(0, 1, {
        duration: 1,
        onUpdate: (t) => {
          if (groupRef.current) {
            const lerpedQuaternion = new THREE.Quaternion().slerpQuaternions(
              startOverlayQuaternion,
              initialQuaternion,
              t
            );
            groupRef.current.quaternion.copy(lerpedQuaternion);
          }
        },
        onComplete: () => {
          console.log("OverlayItem rotation reset completed");
        },
      });
    } else {
      console.warn("groupRef.current is undefined, skipping rotation reset");
    }

    // Clear camera target
    setCameraTarget(null);

    setTimeout(() => {
      console.log("Reset Camera Pos:", camera.position.toArray());
      setIsAnimating(false);
    }, 1000);
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    console.log("Html Pointer Down:", e);
  };

  const handleTestClick = (e) => {
    e.stopPropagation();
    console.log("Test Button Clicked!");
  };

  return (
    <group
      ref={groupRef}
      position={[positionX, positionY, positionZ]}
      rotation={[rotationX, rotationY, rotationZ]}
    >
      <Html
        transform
        distanceFactor={5}
        center
        zIndexRange={[100, 1000]}
        occlude="blending"
        className={`w-64 h-48 rounded-md overflow-hidden transition-opacity duration-1000 ${className}`}
        {...props}
      >
        <div
          className="bg-white bg-opacity-90 backdrop-blur-2xl text-sm p-2 w-full relative"
          style={{ pointerEvents: "auto" }}
        >
          {/* Reset Icon Button */}
          <button
            className="absolute top-2 right-2 w-6 h-6 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center"
            style={{ pointerEvents: "auto" }}
            onClick={handleResetClick}
            title="Reset View"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h5m-5 0l8 8m0 0l8-8m-8 8V9"
              />
            </svg>
          </button>
          <h2 className="font-bold">{title}</h2>
          <p>{description}</p>
          <button
            className={`${bgColor} hover:bg-opacity-50 transition-colors duration-500 px-4 py-2 font-bold text-white w-full text-xs`}
            style={{ pointerEvents: "auto" }}
            onClick={handleButtonClick}
          >
            Add to cart ${price}
          </button>
          <button
            className="bg-blue-500 hover:bg-opacity-50 transition-colors duration-500 px-4 py-2 font-bold text-white w-full text-xs mt-2"
            style={{ pointerEvents: "auto" }}
            onClick={handleTestClick}
          >
            Test Click
          </button>
        </div>
      </Html>
    </group>
  );
};

export default OverlayItem;
// const handleButtonClick = (e) => {
//     e.stopPropagation();
//     console.log("Button Clicked!");
//     if (typeof setIsAnimating !== "function") {
//       console.error("setIsAnimating is not a function:", setIsAnimating);
//       return;
//     }
//     if (typeof setCameraTarget !== "function") {
//       console.error("setCameraTarget is not a function:", setCameraTarget);
//       return;
//     }
//     setIsAnimating(true);

//     if (!parentGroupRef.current) {
//       console.warn("Parent group not found, using fallback position");
//       const fallbackPos = new THREE.Vector3(-11, -1, -2);
//       animate(0, 1, {
//         duration: 1,
//         onUpdate: (t) => {
//           camera.position.lerpVectors(camera.position, fallbackPos, t);
//           camera.updateProjectionMatrix();
//         },
//       });
//       camera.lookAt(-11, -4, -2);
//       camera.updateProjectionMatrix();
//       setTimeout(() => {
//         console.log("Fallback Final Camera Pos:", camera.position.toArray());
//         setIsAnimating(false);
//       }, 2000);
//       return;
//     }

//     // Get parent group's world matrix
//     parentGroupRef.current.updateWorldMatrix(true, false);
//     const parentWorldMatrix = new THREE.Matrix4().copy(parentGroupRef.current.matrixWorld);
//     console.log("Parent World Matrix:", parentWorldMatrix.elements);

//     // Calculate parent group's world position (center)
//     const parentWorldPos = new THREE.Vector3().setFromMatrixPosition(parentWorldMatrix);
//     console.log("Parent World Pos:", parentWorldPos.toArray());

//     // Calculate OverlayItem's world position
//     const localPos = new THREE.Vector3(positionX, positionY, positionZ);
//     const overlayWorldPos = localPos.clone().applyMatrix4(parentWorldMatrix);
//     console.log("OverlayItem World Pos:", overlayWorldPos.toArray());

//     // Determine the "up" direction of the parent group (local Y-axis transformed to world space)
//     const upVector = new THREE.Vector3(0, 1, 0);
//     const worldUpVector = upVector.clone().applyMatrix4(parentWorldMatrix).normalize();
//     console.log("World Up Vector:", worldUpVector.toArray());

//     // Determine the "right" direction for horizontal offset (local X-axis transformed to world space)
//     const rightVector = new THREE.Vector3(1, 0, 0);
//     const worldRightVector = rightVector.clone().applyMatrix4(parentWorldMatrix).normalize();
//     console.log("World Right Vector:", worldRightVector.toArray());

//     // Position camera above the parent group, offset along the up vector
//     const offsetDistance = 5;
//     const cameraTargetPos = parentWorldPos.clone().add(worldUpVector.multiplyScalar(offsetDistance));
//     // Apply horizontal offset in the deck's "right" direction
//     const horizontalOffset = 2;
//     cameraTargetPos.add(worldRightVector.multiplyScalar(horizontalOffset));
//     console.log("Camera Target Pos (with offset):", cameraTargetPos.toArray());

//     // Animate camera to the target position
//     const startPos = camera.position.clone();
//     animate(0, 1, {
//       duration: 1,
//       onUpdate: (t) => {
//         camera.position.lerpVectors(startPos, cameraTargetPos, t);
//         camera.updateProjectionMatrix();
//       },
//     });

//     // Look at OverlayItem's world position
//     camera.lookAt(overlayWorldPos);
//     camera.updateProjectionMatrix();
//     console.log("Camera LookAt:", overlayWorldPos.toArray());

//     // Compute bounding box of balconyGroupRef
//     const boundingBox = new THREE.Box3().setFromObject(parentGroupRef.current);
//     const boxSize = boundingBox.getSize(new THREE.Vector3());
//     console.log("Balcony Group Bounding Box:", {
//       min: boundingBox.min.toArray(),
//       max: boundingBox.max.toArray(),
//       size: boxSize.toArray(),
//       center: boundingBox.getCenter(new THREE.Vector3()).toArray(),
//     });

//     // Rotate OverlayItem to face the camera
//     if (groupRef.current) {
//       console.log("groupRef.current:", groupRef.current); // Debug: Inspect groupRef
//       // Calculate direction from OverlayItem to camera
//       const cameraDirection = new THREE.Vector3()
//         .subVectors(cameraTargetPos, overlayWorldPos)
//         .normalize();
//       // Create a quaternion to rotate towards the camera
//       const quaternion = new THREE.Quaternion().setFromUnitVectors(
//         new THREE.Vector3(0, 0, 1), // HTML's default forward direction (positive Z)
//         cameraDirection
//       );
//       // Account for initial rotations
//       const initialQuaternion = new THREE.Quaternion().setFromEuler(
//         new THREE.Euler(rotationX, rotationY, rotationZ, 'XYZ')
//       );
//       const finalQuaternion = initialQuaternion.multiply(quaternion);

//       // Animate rotation using quaternion
//       const startQuaternion = groupRef.current.quaternion.clone();
//       animate(0, 1, {
//         duration: 1,
//         onUpdate: (t) => {
//           if (groupRef.current) {
//             const lerpedQuaternion = new THREE.Quaternion().slerpQuaternions(
//               startQuaternion,
//               finalQuaternion,
//               t
//             );
//             groupRef.current.quaternion.copy(lerpedQuaternion);
//           } else {
//             console.warn("groupRef.current is undefined during animation");
//           }
//         },
//         onComplete: () => {
//           console.log("Rotation animation completed");
//         },
//       });
//       console.log("OverlayItem Target Quaternion:", [
//         finalQuaternion.x,
//         finalQuaternion.y,
//         finalQuaternion.z,
//         finalQuaternion.w,
//       ]);
//     } else {
//       console.warn("groupRef.current is undefined, skipping rotation");
//     }

//     // Store camera target in Experience.jsx
//     setCameraTarget({
//       position: cameraTargetPos.toArray(),
//       lookAt: overlayWorldPos.toArray(),
//     });

//     setTimeout(() => {
//       console.log("Final Camera Pos:", camera.position.toArray());
//       setIsAnimating(false);
//     }, 2000);
//   };

//   const handlePointerDown = (e) => {
//     e.stopPropagation();
//     console.log("Html Pointer Down:", e);
//   };

//   const handleTestClick = (e) => {
//     e.stopPropagation();
//     console.log("Test Button Clicked!");
//   };

//   return (
//     <group
//       ref={groupRef}
//       position={[positionX, positionY, positionZ]}
//       rotation={[rotationX, rotationY, rotationZ]}
//     >
//       <Html
//         transform
//         distanceFactor={5}
//         center
//         zIndexRange={[100, 1000]}
//         occlude="blending"
//         className={`w-64 h-48 rounded-md overflow-hidden transition-opacity duration-1000 ${className}`}
//         {...props}
//       >
//         <div
//           className="bg-white bg-opacity-90 backdrop-blur-2xl text-sm p-2 w-full"
//           style={{ pointerEvents: "auto" }}
//         >
//           <h2 className="font-bold">{title}</h2>
//           <p>{description}</p>
//           <button
//             className={`${bgColor} hover:bg-opacity-50 transition-colors duration-500 px-4 py-2 font-bold text-white w-full text-xs`}
//             style={{ pointerEvents: "auto" }}
//             onClick={handleButtonClick}
//           >
//             Add to cart ${price}
//           </button>
//           <button
//             className="bg-blue-500 hover:bg-opacity-50 transition-colors duration-500 px-4 py-2 font-bold text-white w-full text-xs mt-2"
//             style={{ pointerEvents: "auto" }}
//             onClick={handleTestClick}
//           >
//             Test Click
//           </button>
//         </div>
//       </Html>
//     </group>
//   );
// };

// export default OverlayItem;





//glass baby

function GlassComponent({ geometry, position, rotation, scale }) {
  //  <GlassComponent
  //       geometry={nodes.Door_Front_House_material_0.geometry}
  //       position={[400, 200, 0]}
  //       rotation={[-Math.PI / 2, 0, 0]}
  //       scale={100}
  //     /> for the office component if you need to redo npx gltfjsx
  return (
    <mesh geometry={geometry} position={position} rotation={rotation} scale={scale}>
      {/* The black frame overlay */}


      {/* <MeshTransmissionMaterial
        color="#e0f7ff"
        transmission={1}
        roughness={0.1}
        thickness={0.4}
        chromaticAberration={0.02}
      /> */}
            {/* The black frame overlay */}

       {/* <MeshTransmissionMaterial
          color="#444444"               
          transmission={0.9}            
          roughness={0.15} 
          thickness={0.5}     
          ior={1}           
          anisotropy={0.05}
          chromaticAberration={0.005}
        /> */}
             <MeshTransmissionMaterial
          color="#444444"               // dark gray-blue tone (lighter than #222)
          transmission={0.8}            // more light passes through (less opaque)
          roughness={0.45}              // moderate softness
          thickness={0.5}               // still has density
          ior={1.3}                     // slightly softer reflections
          anisotropy={0.05}
          chromaticAberration={0.005}
        />
    </mesh>
  );
}

//white floor baby

function SquareComponent({ position, rotation, scale }) {
  return (
    <mesh
      geometry={new THREE.PlaneGeometry(1050, 900)} // Large width and length
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <meshStandardMaterial color="white" side={THREE.DoubleSide} />
    </mesh>
  );
}
export function Office({ section, menuOpened, isDay, setIsAnimating, setCameraTarget, ...props }) {
  const group = useRef();
  const balconyGroupRef = useRef(); // Ref for the balcony group
  const { nodes, materials, animations } = useGLTF("models/scene.glb");
  const texture = useTexture("textures/scene.jpg");
  const textureVSCode = useVideoTexture("textures/vscode.mp4");
  const { actions, mixer } = useAnimations(animations, group);

  texture.flipY = false;
  texture.encoding = THREE.sRGBEncoding;

  const textureMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
  });

  const textureGlassMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: 0.32,
  });

  const textureOpacity = useMotionValue(0);
  const glassTextureOpacity = useMotionValue(0);

  useEffect(() => {
    animate(textureOpacity, section === 0 ? 1 : 0);
    animate(glassTextureOpacity, section === 0 ? 0.32 : 0);
  }, [section]);

  useFrame(() => {
    textureMaterial.opacity = textureOpacity.get();
    textureGlassMaterial.opacity = glassTextureOpacity.get();
  });

  return (
    <group ref={group} {...props} dispose={null} position={[-11, -4, -2]} rotation={[0, 0, 0]} scale={0.01}>
      {/* <group scale={0.01}> */}
        <SquareComponent
          position={[420, 14, -260]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={1}
        />
        <GlassComponent
          geometry={nodes.Door_Front_House_material_0001.geometry}
          position={[400, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Window_front_2nd_floor001_House_material_0001.geometry}
          position={[400, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Window_front_2nd_floor_House_material_0001.geometry}
          position={[400, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Window_front_1st_floor_House_material_0001.geometry}
          position={[400, 200, 10]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Door_side_House_material_0001.geometry}
          position={[400, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Garage_door_House_material_0001.geometry}
          position={[0, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <group position={[950.267, 199.77, -398.613]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={100}>
          <mesh geometry={nodes.Balcony_Glass_door_Upper004_House_material_0.geometry} material={materials.House_material} />
        </group>
        <group position={[950.267, 199.77, -28.613]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={100}>
          <mesh geometry={nodes.Balcony_Glass_door_Upper005_House_material_0.geometry} material={materials.House_material} />
        </group>
        <group position={[0.488, 406.956, 204.005]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Balcony_rail_glass_House_material_0.geometry} material={materials.House_material} />
        </group>
        <group position={[-228.117, 406.956, 1.194]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} scale={100} ref={balconyGroupRef}>
          <mesh geometry={nodes.Balcony_rail_glass001_House_material_0.geometry} material={materials.House_material} />
          <OverlayItem
            rotationX={Math.PI / 2}
            rotationY={-Math.PI / 2}
            rotationZ={0}
            positionX={1.2}
            positionY={-0.1}
            positionZ={1.2}
            title={"Deck cleaning"}
            description={"Scrib scrub"}
            price={"250-500"}
            bgColor={"bg-yellow-500"}
            className={"transition delay-1000"}
            parentGroupRef={balconyGroupRef}
            setIsAnimating={setIsAnimating}
            setCameraTarget={setCameraTarget} 
          />
        </group>
        <group position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Door_Front_House_material_0.geometry} material={materials.House_material} />
          <mesh geometry={nodes.Door_Front_House_material_0001.geometry} material={materials.House_material} />
        </group>
        <group position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Door_side_House_material_0.geometry} material={materials.House_material} />
        </group>
        <group position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Garage_door_House_material_0.geometry} material={materials.House_material} />
        </group>
        <group position={[400, 200, 8.401]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Window_front_1st_floor_House_material_0.geometry} material={materials.House_material} />
        </group>
        <group position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Window_front_2nd_floor_House_material_0.geometry} material={materials.House_material} />
        </group>
        <group position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
          <mesh geometry={nodes.Window_front_2nd_floor001_House_material_0.geometry} material={materials.House_material} />
        </group>
        <mesh geometry={nodes._Roof_Main_House_material_0.geometry} material={materials.newRoof} position={[450, 709.989, -200]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Back_wall_2nd_floor_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <GlassComponent
          geometry={nodes.Balcony_Glass_door_House_material_0.geometry}
          position={[400, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Balcony_Glass_door_2_House_material_0.geometry}
          position={[402.152, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Balcony_Glass_door_2_Upper_House_material_0.geometry}
          position={[400, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Balcony_Glass_door_2001_House_material_0.geometry}
          position={[400, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <GlassComponent
          geometry={nodes.Balcony_Glass_door_Upper_House_material_0.geometry}
          position={[400, 200, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={100}
        />
        <mesh geometry={nodes.Balcony_Glass_door_Upper001_House_material_0.geometry} material={materials.House_material} position={[454.801, 182.653, -597.463]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_Glass_door_Upper002_House_material_0.geometry} material={materials.House_material} position={[-3.284, 499.399, -602.541]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_Glass_door_Upper003_House_material_0.geometry} material={materials.House_material} position={[-1.15, 199.77, -600.006]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_rail_House_material_0.geometry} material={materials.House_material} position={[3.947, 350.037, 204.274]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_rail_1_House_material_0.geometry} material={materials.House_material} position={[149.634, 350.037, 204.274]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_rail_2_House_material_0.geometry} material={materials.House_material} position={[-149.213, 350.037, 204.274]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_rail_3_House_material_0.geometry} material={materials.House_material} position={[-227.303, 350.037, 1.188]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_rail_4_House_material_0.geometry} material={materials.House_material} position={[-227.303, 350.037, 170.973]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_rail_5_House_material_0.geometry} material={materials.House_material} position={[-227.303, 350.037, -172.734]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_trim_House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_wall_1_House_material_0.geometry} material={materials.House_material} position={[0, 545.015, -200]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_wall_2_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Balcony_wood_floor_House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Driveway_House_material_0.geometry} material={materials.House_material} position={[-4.128, 0, 305.314]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Driveway001_House_material_0.geometry} material={materials.House_material} position={[-162.113, -13.119, 752.987]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Driveway002_House_material_0.geometry} material={materials.House_material} position={[206.757, -13.119, 752.987]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Fence_House_material_0.geometry} material={materials.House_material} position={[-814.541, 174.924, 1.036]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Fence_poles_House_material_0.geometry} material={materials.House_material} position={[-814.53, 210.163, 1091.849]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Fence_poles001_House_material_0.geometry} material={materials.House_material} position={[1257.63, 137.628, 86.034]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Fence_poles002_House_material_0.geometry} material={materials.House_material} position={[224.22, 137.628, -919.778]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} scale={100} />
        <mesh geometry={nodes.Fence001_House_material_0.geometry} material={materials.House_material} position={[1257.619, 95.703, 86.354]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Fence002_House_material_0.geometry} material={materials.House_material} position={[224.209, 95.703, -919.458]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} scale={100} />
        <mesh geometry={nodes.Front_fence_House_material_0.geometry} material={materials.House_material} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Front_fence_2_House_material_0.geometry} material={materials.House_material} position={[535.435, 27.254, 1130.915]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Front_lawn_design_House_material_0.geometry} material={materials.House_material} position={[575.645, 3.672, 789.029]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Garden_Ground_Material_0.geometry} material={materials.Ground_Material} position={[-227.216, -3.571, -56.219]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Garden001_Ground_Material_0.geometry} material={materials.Ground_Material} position={[527.892, -3.677, 429.819]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Grage_wall__House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Grass_Grass_Material_0.geometry} material={materials.Grass_Material} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Gutter_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Gutter_drain_big_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Gutter_drain_small_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.House_main_bottom_House_material_0.geometry} material={materials.House_material} position={[400, 200, 8.401]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.House_main_top_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Path_House_material_0.geometry} material={materials.House_material} position={[-308.445, 0, -458.168]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Path001_House_material_0.geometry} material={materials.House_material} position={[-308.445, 0, -458.168]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Path002_House_material_0.geometry} material={materials.House_material} position={[-308.445, 0, -458.168]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Pine_Bush_texture_0.geometry} material={materials.Bush_texture} position={[-273.902, 88.13, -284.533]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Pine_2_Bush_texture_0.geometry} material={materials.Bush_texture} position={[-195.675, 17.79, 1117.777]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Pine_3_Bush_texture_0.geometry} material={materials.Bush_texture} position={[241.193, 17.79, 1117.777]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Pine001_Bush_texture_0.geometry} material={materials.Bush_texture} position={[-693.076, 185.116, 128.914]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Pine002_Bush_texture_0.geometry} material={materials.Bush_texture} position={[938.995, 185.116, -810.432]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Pine003_Bush_texture_0.geometry} material={materials.Bush_texture} position={[1119.298, 214.967, 1002.216]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Pine004_Bush_texture_0.geometry} material={materials.Bush_texture} position={[-519.526, 214.967, 983.236]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Plant_1_Plant3_0.geometry} material={materials.Plant3} position={[-193.577, -6.586, 1045.817]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Plant_2_Plant3_0.geometry} material={materials.Plant3} position={[243.292, -6.586, 1045.817]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Plant_3_Plant3_0.geometry} material={materials.Plant3} position={[279.711, 30.6, 399.54]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Plant_4_Plant3_0.geometry} material={materials.Plant3} position={[-253.745, 35.451, 260.801]} rotation={[-Math.PI / 2, 0, -0.306]} scale={100} />
        <mesh geometry={nodes.Plant_4001_Plant3_0.geometry} material={materials.Plant3} position={[-683.364, 103.647, -785.771]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Plant_4002_Plant3_0.geometry} material={materials.Plant3} position={[929.224, 64.978, 1043.531]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh pointerEvents="none" geometry={nodes.Plant_4003_Plant3_0.geometry} material={materials.Plant3} position={[-721.595, 64.978, 988.766]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh pointerEvents="none" geometry={nodes.Plant_4004_Plant3_0.geometry} material={materials.Plant3} position={[-625.912, 64.978, 838.016]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh pointerEvents="none" geometry={nodes.Plant_4005_Plant3_0.geometry} material={materials.Plant3} position={[1161.17, 52.84, 801.259]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Ref_house_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Ref_house001_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Ref_house002_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Ref_house003_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Ref_house004_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Ref_house005_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Ref_house006_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Ref_house007_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.rocks_Rock_texture_0.geometry} material={materials.Rock_texture} position={[840.75, -4.967, 412.407]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.rocks001_Rock_texture_0.geometry} material={materials.Rock_texture} position={[-590.829, 12.965, 434.988]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.rocks002_Rock_texture_0.geometry} material={materials.Rock_texture} position={[-231.549, 1.286, -349.319]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.rocks003_Rock_texture_0.geometry} material={materials.Rock_texture} position={[-173.386, 12.965, 247.555]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.rocks004_Rock_texture_0.geometry} material={materials.Rock_texture} position={[1172.839, 12.965, -771.341]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Roof_2_House_material_0.geometry} material={materials.newRoof} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Roof_3_House_material_0.geometry} material={materials.newRoof} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Roof_3001_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Stone_pillar_House_material_0.geometry} material={materials.House_material} position={[-199.478, 46, 198.253]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Stone_pillar_gate_House_material_0.geometry} material={materials.House_material} position={[-338.502, 43.966, 1129.598]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Stone_pillar_gate001_House_material_0.geometry} material={materials.House_material} position={[404.712, 43.966, 1129.598]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Stone_pillar001_House_material_0.geometry} material={materials.House_material} position={[200, 46, 198.253]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Stone_pillar002_House_material_0.geometry} material={materials.House_material} position={[-199.478, 46, -200]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Stone_pillar003_House_material_0.geometry} material={materials.House_material} position={[686.116, 46, 198.253]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Window_front_2nd_floor002_House_material_0.geometry} material={materials.House_material} position={[450, 477.255, -595.358]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.Wood_panel_top_G_House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
      </group>
    // </group>
  );
}

useGLTF.preload("models/scene.glb");




//down here is og working with still option to adjust camera 

// import { useGLTF, useTexture, useVideoTexture, useAnimations, MeshTransmissionMaterial, Html  } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// import { animate, useMotionValue } from "framer-motion";
// import { useEffect, useRef } from "react";
// import * as THREE from "three";

// //white floor baby

// function SquareComponent({ position, rotation, scale }) {
//   return (
//     <mesh
//       geometry={new THREE.PlaneGeometry(1050, 900)} // Large width and length
//       position={position}
//       rotation={rotation}
//       scale={scale}
//     >
//       <meshStandardMaterial color="white" side={THREE.DoubleSide} />
//     </mesh>
//   );
// }
// //glass baby

// function GlassComponent({ geometry, position, rotation, scale }) {
//   //  <GlassComponent
//   //       geometry={nodes.Door_Front_House_material_0.geometry}
//   //       position={[400, 200, 0]}
//   //       rotation={[-Math.PI / 2, 0, 0]}
//   //       scale={100}
//   //     /> for the office component if you need to redo npx gltfjsx
//   return (
//     <mesh geometry={geometry} position={position} rotation={rotation} scale={scale}>
//       {/* The black frame overlay */}


//       {/* <MeshTransmissionMaterial
//         color="#e0f7ff"
//         transmission={1}
//         roughness={0.1}
//         thickness={0.4}
//         chromaticAberration={0.02}
//       /> */}
//             {/* The black frame overlay */}

//        {/* <MeshTransmissionMaterial
//           color="#444444"               
//           transmission={0.9}            
//           roughness={0.15} 
//           thickness={0.5}     
//           ior={1}           
//           anisotropy={0.05}
//           chromaticAberration={0.005}
//         /> */}
//              <MeshTransmissionMaterial
//           color="#444444"               // dark gray-blue tone (lighter than #222)
//           transmission={0.8}            // more light passes through (less opaque)
//           roughness={0.45}              // moderate softness
//           thickness={0.5}               // still has density
//           ior={1.3}                     // slightly softer reflections
//           anisotropy={0.05}
//           chromaticAberration={0.005}
//         />
//     </mesh>
//   );
// }







// /////
// ///3D sign
// /////






// const OverlayItem = ({
//   className = "",
//   title,
//   description,
//   price,
//   bgColor,
//   ...props
// }) => {
//   // const [currentPage] = useAtom(currentPageAtom);
//   return (
//     <Html
//       transform
//       distanceFactor={5}
//       center
//       className={`w-64 h-48 rounded-md overflow-hidden 
//       transition-opacity duration-1000 ${className}`}
//       {...props}
//     >
//       <div className="bg-white bg-opacity-90 backdrop-blur-2xl text-sm p-2 w-full">
//         <h2 className="font-bold">{title}</h2>
//         <p>{description}</p>
//       </div>
//       <button
//         className={`${bgColor} hover:bg-opacity-50 transition-colors duration-500 px-4 py-2 font-bold text-white w-full text-xs`}
//       >
//         Add to cart ${price}
//       </button>
//     </Html>
//   );
// };





// export function Office(props) {
//   const { section } = props;
//   const group = useRef();
//   const { nodes, materials, animations } = useGLTF("models/scene.glb");
//   const texture = useTexture("textures/scene.jpg");
//   const textureVSCode = useVideoTexture("textures/vscode.mp4");
//   const { actions, mixer } = useAnimations(animations, group);

//   texture.flipY = false;
//   texture.encoding = THREE.sRGBEncoding;

//   const textureMaterial = new THREE.MeshStandardMaterial({
//     map: texture,
//     transparent: true,
//     opacity: 1,
//   });

//   const textureGlassMaterial = new THREE.MeshStandardMaterial({
//     map: texture,
//     transparent: true,
//     opacity: 0.32,
//   });
  


//   const textureOpacity = useMotionValue(0);
//   const glassTextureOpacity = useMotionValue(0);

//   useEffect(() => {

//     animate(textureOpacity, section === 0 ? 1 : 0);
//     animate(glassTextureOpacity, section === 0 ? 0.32 : 0);
//     console.log(actions);
 
//    }, [section]);



//   useFrame(() => {
//     textureMaterial.opacity = textureOpacity.get();
//     textureGlassMaterial.opacity = glassTextureOpacity.get();
//   });
// const ZoomCamera = ({ isFirstSlide }) => {
//   const { camera } = useThree();

//   useFrame(() => {
//     camera.position.z = isFirstSlide ? 34 : 10;
//     camera.updateProjectionMatrix();
//   });

//   return null;
// };
//   return (
//     <group ref={group} {...props} dispose={null} position={[-11, -4, -2]}  rotation={[0, 0, 0]} scale={1.1}>
//       <group scale={0.01}>
//         <SquareComponent
//           position={[420, 14, -260]} // Place at ground level, centered in the scene
//           rotation={[-Math.PI / 2, 0, 0]} // Face upwards
//           scale={1} // Match the scale of other components
//         />
//             <GlassComponent
//         geometry={nodes.Door_Front_House_material_0001.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
//                  {/* <GlassComponent
//         geometry={nodes.Window_front_2nd_floor002_House_material_0.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        /> */}
//                  <GlassComponent
//         geometry={nodes.Window_front_2nd_floor001_House_material_0001.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />


//         <GlassComponent
//         geometry={nodes.Window_front_2nd_floor_House_material_0001.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
//          <GlassComponent
//         geometry={nodes.Window_front_1st_floor_House_material_0001.geometry}
//         position={[400, 200, 10]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}

//        />
// {/* <GlassComponent
//         geometry={nodes.Balcony_Glass_door_Upper004_House_material_0001.geometry}
//         position={[950, 200, -390]}
//         rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
//        scale={100}

//        /> */}
//        {/* <GlassComponent
//         geometry={nodes.Balcony_Glass_door_Upper005_House_material_0001.geometry}
//         position={[950, 200, -20]}
//         rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
//        scale={100}

        
//        /> */}
//        {/* <GlassComponent
//         geometry={nodes.Balcony_rail_glass002_House_material_0.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        /> */}
//        {/* <GlassComponent
//         geometry={nodes.Balcony_rail_glass003_House_material_0.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        /> */}
//      <GlassComponent
//         geometry={nodes.Door_side_House_material_0001.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
//        <GlassComponent
//         geometry={nodes.Garage_door_House_material_0001.geometry}
//         position={[0, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
      
//        <group position={[950.267, 199.77, -398.613]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={100}>
//           <mesh geometry={nodes.Balcony_Glass_door_Upper004_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Balcony_Glass_door_Upper004_House_material_0001.geometry} material={materials.House_material} position={[0.012, -0.051, 0]} /> */}
//         </group>
//         <group position={[950.267, 199.77, -28.613]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]} scale={100}>
//           <mesh geometry={nodes.Balcony_Glass_door_Upper005_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Balcony_Glass_door_Upper005_House_material_0001.geometry} material={materials.House_material} position={[0.012, -0.051, 0]} /> */}
//         </group>
//         <group position={[0.488, 406.956, 204.005]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//           <mesh geometry={nodes.Balcony_rail_glass_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Balcony_rail_glass002_House_material_0.geometry} material={materials.House_material} /> */}
//         </group>
//         <group position={[-228.117, 406.956, 1.194]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} scale={100}>
//           <mesh geometry={nodes.Balcony_rail_glass001_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Balcony_rail_glass003_House_material_0.geometry} material={materials.House_material} rotation={[0, 0, -Math.PI]} /> */}
//             <OverlayItem
//               rotation-x={Math.PI / 2}   // <-- fix sideways tilt
//               rotation-y={-90}             // adjust if needed
//               rotation-z={0}              
//               position-x={1.2}
//               position-z={1.2}
//               position-y={-0.1}
//               title={"Deck cleaning"}
//               description={"Scrib scrub"}
//               price={"250-500"}
//               bgColor={"bg-yellow-500"}
//               className={"transition delay-1000"}
//             />
//         </group>
//         <group position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//           <mesh geometry={nodes.Door_Front_House_material_0.geometry} material={materials.House_material} />
//           <mesh geometry={nodes.Door_Front_House_material_0001.geometry} material={materials.House_material} />
//         </group>
//         <group position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//           <mesh geometry={nodes.Door_side_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Door_side_House_material_0001.geometry} material={materials.House_material} /> */}
//         </group>
//         <group position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//           <mesh geometry={nodes.Garage_door_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Garage_door_House_material_0001.geometry} material={materials.House_material} /> */}
//         </group>
//         <group position={[400, 200, 8.401]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//           <mesh geometry={nodes.Window_front_1st_floor_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Window_front_1st_floor_House_material_0001.geometry} material={materials.House_material} /> */}
//         </group>
//         <group position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//           <mesh geometry={nodes.Window_front_2nd_floor_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Window_front_2nd_floor_House_material_0001.geometry} material={materials.House_material} /> */}
//         </group>
//         <group position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
//           <mesh geometry={nodes.Window_front_2nd_floor001_House_material_0.geometry} material={materials.House_material} />
//           {/* <mesh geometry={nodes.Window_front_2nd_floor001_House_material_0001.geometry} material={materials.House_material} /> */}
//         </group>
        
        
//         <mesh geometry={nodes._Roof_Main_House_material_0.geometry} material={materials.newRoof} position={[450, 709.989, -200]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Back_wall_2nd_floor_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />

//         <GlassComponent
//         geometry={nodes.Balcony_Glass_door_House_material_0.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
//        <GlassComponent
//         geometry={nodes.Balcony_Glass_door_2_House_material_0.geometry}
//         position={[402.152, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
//         <GlassComponent
//         geometry={nodes.Balcony_Glass_door_2_Upper_House_material_0.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
//        <GlassComponent
//         geometry={nodes.Balcony_Glass_door_2001_House_material_0.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
//        <GlassComponent
//         geometry={nodes.Balcony_Glass_door_Upper_House_material_0.geometry}
//         position={[400, 200, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         scale={100}
//        />
//         {/* <mesh geometry={nodes.Balcony_Glass_door_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />// */}
//         {/* <mesh geometry={nodes.Balcony_Glass_door_2_House_material_0.geometry} material={materials.House_material} position={[402.152, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} /> // */}
//         {/* <mesh geometry={nodes.Balcony_Glass_door_2_Upper_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />// */}
//         {/* <mesh geometry={nodes.Balcony_Glass_door_2001_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />// */}
//         {/* <mesh geometry={nodes.Balcony_Glass_door_Upper_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />// */}



//         <mesh geometry={nodes.Balcony_Glass_door_Upper001_House_material_0.geometry} material={materials.House_material} position={[454.801, 182.653, -597.463]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_Glass_door_Upper002_House_material_0.geometry} material={materials.House_material} position={[-3.284, 499.399, -602.541]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_Glass_door_Upper003_House_material_0.geometry} material={materials.House_material} position={[-1.15, 199.77, -600.006]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_rail_House_material_0.geometry} material={materials.House_material} position={[3.947, 350.037, 204.274]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_rail_1_House_material_0.geometry} material={materials.House_material} position={[149.634, 350.037, 204.274]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_rail_2_House_material_0.geometry} material={materials.House_material} position={[-149.213, 350.037, 204.274]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_rail_3_House_material_0.geometry} material={materials.House_material} position={[-227.303, 350.037, 1.188]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_rail_4_House_material_0.geometry} material={materials.House_material} position={[-227.303, 350.037, 170.973]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_rail_5_House_material_0.geometry} material={materials.House_material} position={[-227.303, 350.037, -172.734]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_trim_House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_wall_1_House_material_0.geometry} material={materials.House_material} position={[0, 545.015, -200]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_wall_2_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Balcony_wood_floor_House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Driveway_House_material_0.geometry} material={materials.House_material} position={[-4.128, 0, 305.314]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Driveway001_House_material_0.geometry} material={materials.House_material} position={[-162.113, -13.119, 752.987]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Driveway002_House_material_0.geometry} material={materials.House_material} position={[206.757, -13.119, 752.987]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Fence_House_material_0.geometry} material={materials.House_material} position={[-814.541, 174.924, 1.036]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Fence_poles_House_material_0.geometry} material={materials.House_material} position={[-814.53, 210.163, 1091.849]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Fence_poles001_House_material_0.geometry} material={materials.House_material} position={[1257.63, 137.628, 86.034]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Fence_poles002_House_material_0.geometry} material={materials.House_material} position={[224.22, 137.628, -919.778]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} scale={100} />
//         <mesh geometry={nodes.Fence001_House_material_0.geometry} material={materials.House_material} position={[1257.619, 95.703, 86.354]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Fence002_House_material_0.geometry} material={materials.House_material} position={[224.209, 95.703, -919.458]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} scale={100} />
//         <mesh geometry={nodes.Front_fence_House_material_0.geometry} material={materials.House_material} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Front_fence_2_House_material_0.geometry} material={materials.House_material} position={[535.435, 27.254, 1130.915]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Front_lawn_design_House_material_0.geometry} material={materials.House_material} position={[575.645, 3.672, 789.029]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Garden_Ground_Material_0.geometry} material={materials.Ground_Material} position={[-227.216, -3.571, -56.219]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Garden001_Ground_Material_0.geometry} material={materials.Ground_Material} position={[527.892, -3.677, 429.819]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Grage_wall__House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Grass_Grass_Material_0.geometry} material={materials.Grass_Material} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Gutter_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Gutter_drain_big_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Gutter_drain_small_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.House_main_bottom_House_material_0.geometry} material={materials.House_material} position={[400, 200, 8.401]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.House_main_top_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Path_House_material_0.geometry} material={materials.House_material} position={[-308.445, 0, -458.168]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Path001_House_material_0.geometry} material={materials.House_material} position={[-308.445, 0, -458.168]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Path002_House_material_0.geometry} material={materials.House_material} position={[-308.445, 0, -458.168]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Pine_Bush_texture_0.geometry} material={materials.Bush_texture} position={[-273.902, 88.13, -284.533]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Pine_2_Bush_texture_0.geometry} material={materials.Bush_texture} position={[-195.675, 17.79, 1117.777]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Pine_3_Bush_texture_0.geometry} material={materials.Bush_texture} position={[241.193, 17.79, 1117.777]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Pine001_Bush_texture_0.geometry} material={materials.Bush_texture} position={[-693.076, 185.116, 128.914]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Pine002_Bush_texture_0.geometry} material={materials.Bush_texture} position={[938.995, 185.116, -810.432]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Pine003_Bush_texture_0.geometry} material={materials.Bush_texture} position={[1119.298, 214.967, 1002.216]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Pine004_Bush_texture_0.geometry} material={materials.Bush_texture} position={[-519.526, 214.967, 983.236]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Plant_1_Plant3_0.geometry} material={materials.Plant3} position={[-193.577, -6.586, 1045.817]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Plant_2_Plant3_0.geometry} material={materials.Plant3} position={[243.292, -6.586, 1045.817]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Plant_3_Plant3_0.geometry} material={materials.Plant3} position={[279.711, 30.6, 399.54]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Plant_4_Plant3_0.geometry} material={materials.Plant3} position={[-253.745, 35.451, 260.801]} rotation={[-Math.PI / 2, 0, -0.306]} scale={100} />
//         <mesh geometry={nodes.Plant_4001_Plant3_0.geometry} material={materials.Plant3} position={[-683.364, 103.647, -785.771]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Plant_4002_Plant3_0.geometry} material={materials.Plant3} position={[929.224, 64.978, 1043.531]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Plant_4003_Plant3_0.geometry} material={materials.Plant3} position={[-721.595, 64.978, 988.766]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Plant_4004_Plant3_0.geometry} material={materials.Plant3} position={[-625.912, 64.978, 838.016]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Plant_4005_Plant3_0.geometry} material={materials.Plant3} position={[1161.17, 52.84, 801.259]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Ref_house_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Ref_house001_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Ref_house002_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Ref_house003_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Ref_house004_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Ref_house005_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Ref_house006_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Ref_house007_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.rocks_Rock_texture_0.geometry} material={materials.Rock_texture} position={[840.75, -4.967, 412.407]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.rocks001_Rock_texture_0.geometry} material={materials.Rock_texture} position={[-590.829, 12.965, 434.988]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.rocks002_Rock_texture_0.geometry} material={materials.Rock_texture} position={[-231.549, 1.286, -349.319]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.rocks003_Rock_texture_0.geometry} material={materials.Rock_texture} position={[-173.386, 12.965, 247.555]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.rocks004_Rock_texture_0.geometry} material={materials.Rock_texture} position={[1172.839, 12.965, -771.341]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Roof_2_House_material_0.geometry} material={materials.newRoof} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Roof_3_House_material_0.geometry} material={materials.newRoof} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Roof_3001_House_material_0.geometry} material={materials.House_material} position={[400, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Stone_pillar_House_material_0.geometry} material={materials.House_material} position={[-199.478, 46, 198.253]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Stone_pillar_gate_House_material_0.geometry} material={materials.House_material} position={[-338.502, 43.966, 1129.598]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Stone_pillar_gate001_House_material_0.geometry} material={materials.House_material} position={[404.712, 43.966, 1129.598]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Stone_pillar001_House_material_0.geometry} material={materials.House_material} position={[200, 46, 198.253]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Stone_pillar002_House_material_0.geometry} material={materials.House_material} position={[-199.478, 46, -200]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Stone_pillar003_House_material_0.geometry} material={materials.House_material} position={[686.116, 46, 198.253]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Window_front_2nd_floor002_House_material_0.geometry} material={materials.House_material} position={[450, 477.255, -595.358]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         <mesh geometry={nodes.Wood_panel_top_G_House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
//         </group>
//     </group>

//   );
// }

// useGLTF.preload("models/scene.glb");