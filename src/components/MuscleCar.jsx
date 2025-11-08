
import { useGLTF, useTexture, useVideoTexture, useAnimations, MeshTransmissionMaterial, Html  } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";
import * as THREE from "three";



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


export function MuscleCar(props) {
   const { section } = props;
   const group = useRef();
   const { nodes, materials, animations } = useGLTF("models/classicmusclecar.glb");
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
     console.log(actions);
  
    }, [section]);
 
 
 
   useFrame(() => {
     textureMaterial.opacity = textureOpacity.get();
     textureGlassMaterial.opacity = glassTextureOpacity.get();
   });
 const ZoomCamera = ({ isFirstSlide }) => {
   const { camera } = useThree();
 
   useFrame(() => {
     camera.position.z = isFirstSlide ? 34 : 10;
     camera.updateProjectionMatrix();
   });
 
   return null;
 };
  return (
    // <group {...props} dispose={null}>
        <group {...props} dispose={null} position={[-10.8, -3.47, 6.8]}  rotation={[0.02, 0, 0]} scale={0.46}>


      

      <group scale={[1, 0.848, 5.952]}>

        <GlassComponent
        geometry={nodes.Object_6.geometry}
        scale={1}
       />
        <mesh geometry={nodes.Object_4.geometry} material={materials.Material} />
        <mesh geometry={nodes.Object_5.geometry} material={materials['Material.001']} />
        {/* <mesh geometry={nodes.Object_6.geometry} material={materials['Material.003']} /> */}
        <mesh geometry={nodes.Object_7.geometry} material={materials['Material.004']} />
        <mesh geometry={nodes.Object_8.geometry} material={materials['Material.005']} />
        <mesh geometry={nodes.Object_9.geometry} material={materials['Material.006']} />
        <mesh geometry={nodes.Object_10.geometry} material={materials['Material.007']} />
        <mesh geometry={nodes.Object_11.geometry} material={materials['Material.008']} />
      </group>
      <group position={[-2.234, -0.625, 3.816]}>
        <mesh geometry={nodes.Object_13.geometry} material={materials['Material.001']} />
        <mesh geometry={nodes.Object_14.geometry} material={materials['Material.002']} />
        <mesh geometry={nodes.Object_15.geometry} material={materials['Material.007']} />
      </group>
      <group position={[2.234, -0.531, -3.075]}>
        <mesh geometry={nodes.Object_17.geometry} material={materials['Material.001']} />
        <mesh geometry={nodes.Object_18.geometry} material={materials['Material.002']} />
        <mesh geometry={nodes.Object_19.geometry} material={materials['Material.007']} />
      </group>
      <group position={[2.234, -0.625, 3.816]}>
        <mesh geometry={nodes.Object_21.geometry} material={materials['Material.001']} />
        <mesh geometry={nodes.Object_22.geometry} material={materials['Material.002']} />
        <mesh geometry={nodes.Object_23.geometry} material={materials['Material.007']} />
      </group>
      <group position={[-2.234, -0.531, -3.075]}>
        <mesh geometry={nodes.Object_25.geometry} material={materials['Material.001']} />
        <mesh geometry={nodes.Object_26.geometry} material={materials['Material.002']} />
        <mesh geometry={nodes.Object_27.geometry} material={materials['Material.007']} />
      </group>
    </group>
  )
}

useGLTF.preload('models/classicmusclecar.glb')











