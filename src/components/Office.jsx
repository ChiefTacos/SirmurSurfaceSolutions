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
  distanceFactor = 25,        // ← new prop, default 20
  parentGroupRef, 
  registerOverlayReset,
  section,
  ...props
}) => {
  const { camera, gl } = useThree();
  // const htmlRef = useRef();
const groupRef = useRef(); // Ref for the THREE.Group
const initialCameraState = useRef({ position: null, quaternion: null });
const [showContent, setShowContent] = useState(false); // State to control visibility
const [isClickable, setIsClickable] = useState(true); //prevent bug when going reseting while animation runs

const [windowPos, setWindowPos] = useState({ x: 0, y: 0 });
const overlayRef = useRef(null); 


const htmlOffset = useRef({ x: 0, y: 0 });
const dragOffset = useRef({ x: 0, y: 0 });
const isDragging = useRef(false);
const lastPos = useRef({ x: 0, y: 0 });
const velocity = useRef({ x: 0, y: 0 });
const lastTimestamp = useRef(0);
const isVisible = section === 0;
const friction = 0.92; // momentum decay
const minVelocity = 0.1; // stop threshold

const portalRoot = useRef(null);

useEffect(() => {
  // Create a unique div for THIS overlay instance
  const div = document.createElement("div");
  div.id = `overlay-portal-${Math.random().toString(36).substr(2, 9)}`;
  document.getElementById("overlay-portals-root").appendChild(div);
  portalRoot.current = div;

  return () => {
    // Cleanup on unmount
    document.getElementById("overlay-portals-root")?.removeChild(div);
  };
}, []);


// This will store the TRUE original camera state (once, when the scene loads)
  const originalCameraState = useRef({
    position: null,
    quaternion: null
  });

  // Capture the original camera position/rotation exactly once
  useEffect(() => {
    if (!originalCameraState.current.position) {
      originalCameraState.current = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
      };
      console.log("Original scene camera saved:", originalCameraState.current.position.toArray());
    }
  }, [camera]);
useEffect(() => {
  if (props.registerOverlayReset) {
    props.registerOverlayReset(() => {
      setShowContent(false);
      setIsClickable(true);
      setCameraTarget(null);
      // Also run the local smooth reset if needed
      handleResetClick({ stopPropagation: () => {} });
    });
  }
}, [props.registerOverlayReset]);



const handleButtonClick = (e) => {
  e.stopPropagation();
  setShowContent(true);
};
useEffect(() => {
  if (!showContent || !overlayRef.current) return;

  const el = overlayRef.current;
  const rect = el.getBoundingClientRect();

  setWindowPos({
    x: window.innerWidth / 2 - rect.width / 2,
    y: window.innerHeight / 2 - rect.height / 2,
  });
}, [showContent]);

const handleResetClick = (e) => {
  e.stopPropagation();
  setShowContent(false);
};


const handleDragStart = (e) => {
  e.stopPropagation();
  isDragging.current = true;

  lastPos.current = { x: e.clientX, y: e.clientY };
  velocity.current = { x: 0, y: 0 };
  lastTimestamp.current = performance.now();

  document.addEventListener("pointermove", handleDragMove);
  document.addEventListener("pointerup", handleDragEnd);
};
const handleDragMove = (e) => {
  if (!isDragging.current) return;

  const now = performance.now();
  const dt = now - lastTimestamp.current;

  const dx = e.clientX - lastPos.current.x;
  const dy = e.clientY - lastPos.current.y;

  setWindowPos((prev) => ({
    x: prev.x + dx,
    y: prev.y + dy,
  }));

  velocity.current = {
    x: dx / dt,
    y: dy / dt,
  };

  lastPos.current = { x: e.clientX, y: e.clientY };
  lastTimestamp.current = now;
};
const handleDragEnd = () => {
  isDragging.current = false;

  document.removeEventListener("pointermove", handleDragMove);
  document.removeEventListener("pointerup", handleDragEnd);

  requestAnimationFrame(mobileMomentum);
};


const mobileMomentum = () => {
  if (isDragging.current) return;

  const speed = Math.abs(velocity.current.x) + Math.abs(velocity.current.y);

  if (speed > 0.5) {
    setWindowPos(prev => ({
      x: prev.x + velocity.current.x * 16,
      y: prev.y + velocity.current.y * 16,
    }));

    velocity.current.x *= friction;
    velocity.current.y *= friction;

    requestAnimationFrame(mobileMomentum);
  } else {
    snapBackIntoBounds();
  }
};

const snapBackIntoBounds = () => {
  if (!overlayRef.current) return;

  const el = overlayRef.current;
  const rect = el.getBoundingClientRect();
  const padding = 20;

  setWindowPos(prev => {
    let x = prev.x;
    let y = prev.y;

    if (rect.left < padding) x += padding - rect.left;
    if (rect.right > window.innerWidth - padding) x -= rect.right - (window.innerWidth - padding);
    if (rect.top < padding) y += padding - rect.top;
    if (rect.bottom > window.innerHeight - padding) y -= rect.bottom - (window.innerHeight - padding);

    return { x, y };
  });
};

useEffect(() => {
  const handleResize = () => {
    if (showContent) snapBackIntoBounds();
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, [showContent]);

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
     
     
     {/* old working mac os html */}
      {/* <Html
  portal={{ current: gl.domElement.parentNode }}
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "22rem",
    pointerEvents: "none",
    zIndex: "1",
  }}
  center
  distanceFactor={distanceFactor}     // was 20 → makes everything bigger
  occlude={false}       // disables distance-based auto-scaling → same size everywhere
> */}
        <Html
portal={{ current: portalRoot.current }}  
            style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
          pointerEvents: "none",   // ← Html never blocks anything
          zIndex: 10,                           // low = under menu
          }}
          center
          distanceFactor={distanceFactor}
          occlude={false}
        > 
        <div
        style={{
          pointerEvents: isVisible ? "auto" : "none",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
          transitionDelay: isVisible ? "0s" : "0.2s",
          width: "100%",
          height: "100%",
        }}
      >

          <div className="text-sm w-full relative" style={{ pointerEvents: "none" }}>
              {showContent ? (
                <div
                ref={overlayRef}
                className="bg-white  rounded-lg shadow-2xl border border-gray-200 overflow-hidden
                   min-h-[110vh]
                   lg:min-h-[90vh]

                  min-w-[120vw]     /* mobile first */
                  md:min-w-[1000px] md:max-w-[1150px]  /* tablet */
                  lg:min-w-[1200px] lg:max-w-[1400px]  /* desktop */

                "

                  onPointerDown={handleDragStart}


                    style={{
                    position: "absolute",
                    left: windowPos.x,
                    top: windowPos.y,
                    transition: isDragging.current ? "none" : "transform 0.2s ease",
                    cursor: "default",
                    pointerEvents: "auto",
                     userSelect: "none",
                     webkitUserSelect: "none",
            }}
          >

        <div className="flex p-3 gap-2 bg-gray-100">
          <button onClick={handleResetClick} style={{ pointerEvents: "auto" }}>
            <span className="bg-red-500 inline-block w-6 h-6 rounded-full hover:bg-red-600 transition"></span>
          
          </button>
          <button onClick={handleResetClick} style={{ pointerEvents: "auto" }}>
            <span className="bg-yellow-500 inline-block w-6 h-6 rounded-full hover:bg-red-600 transition"></span>
          
          </button>
          {/* <div className="w-4 h-4 rounded-full bg-yellow-500"></div> */}
          {/* <div className="w-4 h-4 rounded-full bg-green-500"></div> */}
        </div>

        <div className="p-10 flex flex-col items-center justify-center gap-10 pt-1">
          <button
          type="submit"
          className="flex justify-center top-96 gap-2 items-center mx-auto shadow-xl text-lg bg-gray-50 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
          style={{ pointerEvents: "auto" }}
        >
          Additional Info
          <svg
            className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
            viewBox="0 0 16 19"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
              className="fill-gray-800 group-hover:fill-gray-800"
            ></path>
          </svg>
        </button>

          <div className="card__content text-center">
            <h1 className="text-5xl font-bold mb-4">{title}</h1>
            <p className="text-2xl text-gray-700 mb-2">{description}</p>
            {price && <p className="text-4xl font-bold text-emerald-600">${price}</p>}
            <p className="mt-8 text-xl text-gray-500">placeholder text</p>
          </div>
          
        </div>
      </div>
    ) : (
     
      <div className="flex items-center justify-center">
    <div 
      className="relative group"
      style={{
        pointerEvents: isClickable ? "auto" : "none",  // Blocks ALL interaction (hover + click)
        opacity: isClickable ? 1 : 0.4,
        transition: "opacity 0.4s ease",
      }}
    >
      <button
        className="relative inline-block p-px font-semibold leading-6 text-white bg-neutral-200 shadow-2xl cursor-pointer rounded-2xl shadow-emerald-900 transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 hover:shadow-emerald-600 z-[50]"
        type="button"
        onClick={handleButtonClick}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          cursor: isClickable ? "pointer" : "not-allowed",
        }}
        // Remove the inline transform hacks — we control everything from parent now
      >
        <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-600 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>

        <span className="relative z-10  block px-4 lg:px-6  py-4 rounded-2xl bg-neutral-950">
          <div className="relative z-10 flex items-center space-x-3 ">
                <div className="hidden lg:inline ">

                  <span className="transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-emerald-300 lg:text-2xl text-xl font-medium pointer-events-none">
                    View 
                    <br /> Service
                  </span>
                </div>

            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-9 transition-all duration-500 group-hover:translate-x-2 group-hover:text-emerald-300"
            >
              <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
            </svg> */}
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4.1 12 6"></path><path d="m5.1 8-2.9-.8"></path><path d="m6 12-1.9 2"></path><path d="M7.2 2.2 8 5.1"></path><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"></path></svg>

          </div>
        </span>
      </button>
    </div>
  </div>
    )}
  </div>
</div>

</Html>
    </group>
  );
};


export default OverlayItem;















//glass baby

function GlassComponent({ geometry, position, rotation, scale }) {

  return (
    <mesh geometry={geometry} position={position} rotation={rotation} scale={scale}>

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
export function Office({ section, menuOpened, isDay, setIsAnimating, setCameraTarget, activeOverlayId, setActiveOverlayId, ...props }) {
  const group = useRef();
  const balconyRailGroupRef = useRef();
  const deckFloorGroupRef = useRef();
  const drivewayGroupRef = useRef();
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
       {/* === BALCONY RAIL GROUP === */}
      <group
        position={[-228.117, 406.956, 1.194]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        scale={100}
        ref={balconyRailGroupRef}
      >
        <mesh geometry={nodes.Balcony_rail_glass001_House_material_0.geometry} material={materials.House_material} />
        
      </group>
      <mesh position={[1.2, -0.1, -7.2]} visible={false}   name="balcony-overlay-anchor"
>
      <OverlayItem
        section={section}
        id="balcony"                     // ← give each one a unique string
          key="balcony-rail"
          rotation={[Math.PI / 2, Math.PI / 2, 0]}
         position={[0, 0, 0]}
         distanceFactor={15}
          title="Balcony Rail Cleaning"
          description="Glass + frame scrub"
          price="250-500"
          bgColor="bg-yellow-500"
        /></mesh>
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

        {/* deck not doing the deck persay we are doing the bacony rail as deck */}

        <group
        position={[0, 200, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        scale={100}
        ref={deckFloorGroupRef}
      >
        <mesh geometry={nodes.Balcony_wood_floor_House_material_0.geometry} material={materials.House_material} />
       
      </group>

        {/* <mesh geometry={nodes.Balcony_wood_floor_House_material_0.geometry} material={materials.House_material} position={[0, 200, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100} /> old deck */}

        {/* car //driveway */}
  <group
        position={[-4.128, 0, 305.314]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={100}
        ref={drivewayGroupRef}
      >
        <mesh geometry={nodes.Driveway_House_material_0.geometry} material={materials.House_material} />
        
      </group>
      {/* INVISIBLE ANCHOR FOR DRIVEWAY OVERLAY — this is the magic */}
<mesh
  position={[14.128, 8.8, 1082]}   // X/Z matches your driveway group, Y = height above ground
  visible={false}               // completely invisible
  name="driveway-overlay-anchor"
>
  <OverlayItem
    section={section}
    id="driveway"
    key="driveway"
    // No crazy numbers anymore!
    position={[0, 0, 0]}          // now relative to the anchor
    rotation={[Math.PI / 2, -Math.PI / 2, 0]}
    
    distanceFactor={14}           // perfect size on all devices
    
    title="Driveway Cleaning"
    description="Oil stains + power wash"
    price="300-600"
    bgColor="bg-blue-500"
    
    // Remove parentGroupRef entirely — the mesh itself is the parent now!
  />
</mesh>
      {/* <OverlayItem
        section={section}
        id="driveway"                     // ← give each one a unique string
          key="driveway"
          rotationX={Math.PI / 2}
          rotationY={-Math.PI / 2}
          rotationZ={0}
          positionX={0.2}
          positionY={3}          // ← was -900.1
          positionZ={15}         // ← was 500.4
          distanceFactor={16}
          title="Driveway Cleaning"
          description="Oil stains + power wash"
          price="300-600"
          bgColor="bg-blue-500"
          parentGroupRef={drivewayGroupRef}
          
          activeOverlayId={activeOverlayId}
        setActiveOverlayId={setActiveOverlayId}
        /> */}


        <group position={[-4.128, 0, 305.314]} rotation={[-Math.PI / 2, 0, 0]} scale={100} ref={balconyRailGroupRef}>
          <mesh geometry={nodes.Driveway_House_material_0.geometry} material={materials.House_material} />
          
        </group>
        


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

        {/* gutters */}
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




