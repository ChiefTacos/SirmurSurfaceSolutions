import { useGLTF, useTexture, useVideoTexture, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";
import { motion } from "framer-motion-3d";
import React, { useEffect, useRef } from "react";

import * as THREE from "three";

export function Office(props) {
  const { section } = props;
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("models/scene.gltf");
  const texture = useTexture("textures/scene.jpg");
  const textureVSCode = useVideoTexture("textures/vscode.mp4");
  const { actions } = useAnimations(animations, group);

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
    opacity: 0.42,
  });

  const textureOpacity = useMotionValue(0);
  const glassTextureOpacity = useMotionValue(0);

  useEffect(() => {

    animate(textureOpacity, section === 0 ? 1 : 0);
    animate(glassTextureOpacity, section === 0 ? 0.42 : 0);
    console.log(actions);
    /* const startAnimations = () => {
      Object.keys(actions).forEach((key) => {
        const action = actions[key];
        if (key.includes("logoAnimation")) {

          action.reset().play(); 
          action.clampWhenFinished = true;
        }
      });
    };
  
    if (section === 0) {
      startAnimations(); 
    } */
      const startAnimations = () => {

        Object.keys(actions).forEach((key) => {
          const action = actions[key];
          if (key.includes("logoAnimation")) {
            // Add event listener for when the animation finishes
            action.setLoop(1,3);

            action.clampWhenFinished = true;
            action.setEffectiveTimeScale(1); // Ensure linear time scale
            action.reset();
            action.play();
            action.stopFading().stopWarping();

          
            action.onFinish = () => {
              action.reset();
              action.stop();
            }
          }
        });
      };
    
      if (section === 0) {
        startAnimations();
      }
    
      return () => {
        // Clean up the event listener to avoid memory leaks
        Object.keys(actions).forEach((key) => {
          const action = actions[key];
          if (action.onFinish) {
            action.onFinish = null;
          }
        });
      };
  }, [section]);

  useFrame(() => {
    textureMaterial.opacity = textureOpacity.get();
    textureGlassMaterial.opacity = glassTextureOpacity.get();
  });

  return (
    <group ref={group} {...props} dispose={null} position={[0, 4, 6]} rotation={[0, 4.5, 0]} scale={0.5}>
      
      <group name="Scene">
        <group name="Cylinder004" position={[-3.693, -4.155, -4.282]}>
          <mesh name="Cylinder111" geometry={nodes.Cylinder111.geometry} material={textureMaterial} />
          <mesh name="Cylinder111_1" geometry={nodes.Cylinder111_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder111_2" geometry={nodes.Cylinder111_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder007" position={[-3.693, -4.155, -4.349]}>
          <mesh name="Cylinder168" geometry={nodes.Cylinder168.geometry} material={textureMaterial} />
          <mesh name="Cylinder168_1" geometry={nodes.Cylinder168_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder168_2" geometry={nodes.Cylinder168_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder057" position={[-3.693, -4.155, -4.416]}>
          <mesh name="Cylinder169" geometry={nodes.Cylinder169.geometry} material={textureMaterial} />
          <mesh name="Cylinder169_1" geometry={nodes.Cylinder169_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder169_2" geometry={nodes.Cylinder169_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder058" position={[-3.693, -4.155, -4.484]}>
          <mesh name="Cylinder170" geometry={nodes.Cylinder170.geometry} material={textureMaterial} />
          <mesh name="Cylinder170_1" geometry={nodes.Cylinder170_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder170_2" geometry={nodes.Cylinder170_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder059" position={[-3.693, -4.155, -4.551]}>
          <mesh name="Cylinder171" geometry={nodes.Cylinder171.geometry} material={textureMaterial} />
          <mesh name="Cylinder171_1" geometry={nodes.Cylinder171_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder171_2" geometry={nodes.Cylinder171_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder060" position={[-3.693, -4.155, -4.618]}>
          <mesh name="Cylinder172" geometry={nodes.Cylinder172.geometry} material={textureMaterial} />
          <mesh name="Cylinder172_1" geometry={nodes.Cylinder172_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder172_2" geometry={nodes.Cylinder172_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder061" position={[-3.693, -4.155, -4.685]}>
          <mesh name="Cylinder173" geometry={nodes.Cylinder173.geometry} material={textureMaterial} />
          <mesh name="Cylinder173_1" geometry={nodes.Cylinder173_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder173_2" geometry={nodes.Cylinder173_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder062" position={[-3.693, -4.155, -4.753]}>
          <mesh name="Cylinder174" geometry={nodes.Cylinder174.geometry} material={textureMaterial} />
          <mesh name="Cylinder174_1" geometry={nodes.Cylinder174_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder174_2" geometry={nodes.Cylinder174_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder063" position={[-3.693, -4.155, -4.82]}>
          <mesh name="Cylinder175" geometry={nodes.Cylinder175.geometry} material={textureMaterial} />
          <mesh name="Cylinder175_1" geometry={nodes.Cylinder175_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder175_2" geometry={nodes.Cylinder175_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder064" position={[-3.693, -4.155, -4.887]}>
          <mesh name="Cylinder176" geometry={nodes.Cylinder176.geometry} material={textureMaterial} />
          <mesh name="Cylinder176_1" geometry={nodes.Cylinder176_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder176_2" geometry={nodes.Cylinder176_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder065" position={[-3.693, -4.155, -4.954]}>
          <mesh name="Cylinder177" geometry={nodes.Cylinder177.geometry} material={textureMaterial} />
          <mesh name="Cylinder177_1" geometry={nodes.Cylinder177_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder177_2" geometry={nodes.Cylinder177_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder066" position={[-3.693, -4.155, -5.022]}>
          <mesh name="Cylinder178" geometry={nodes.Cylinder178.geometry} material={textureMaterial} />
          <mesh name="Cylinder178_1" geometry={nodes.Cylinder178_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder178_2" geometry={nodes.Cylinder178_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder067" position={[-3.693, -4.155, -5.089]}>
          <mesh name="Cylinder179" geometry={nodes.Cylinder179.geometry} material={textureMaterial} />
          <mesh name="Cylinder179_1" geometry={nodes.Cylinder179_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder179_2" geometry={nodes.Cylinder179_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder068" position={[-3.693, -4.155, -5.156]}>
          <mesh name="Cylinder180" geometry={nodes.Cylinder180.geometry} material={textureMaterial} />
          <mesh name="Cylinder180_1" geometry={nodes.Cylinder180_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder180_2" geometry={nodes.Cylinder180_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder069" position={[-3.693, -4.155, -5.223]}>
          <mesh name="Cylinder181" geometry={nodes.Cylinder181.geometry} material={textureMaterial} />
          <mesh name="Cylinder181_1" geometry={nodes.Cylinder181_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder181_2" geometry={nodes.Cylinder181_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder070" position={[-3.693, -4.155, -5.291]}>
          <mesh name="Cylinder182" geometry={nodes.Cylinder182.geometry} material={textureMaterial} />
          <mesh name="Cylinder182_1" geometry={nodes.Cylinder182_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder182_2" geometry={nodes.Cylinder182_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder071" position={[-3.693, -4.155, -5.358]}>
          <mesh name="Cylinder183" geometry={nodes.Cylinder183.geometry} material={textureMaterial} />
          <mesh name="Cylinder183_1" geometry={nodes.Cylinder183_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder183_2" geometry={nodes.Cylinder183_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder072" position={[-3.693, -4.155, -5.425]}>
          <mesh name="Cylinder184" geometry={nodes.Cylinder184.geometry} material={textureMaterial} />
          <mesh name="Cylinder184_1" geometry={nodes.Cylinder184_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder184_2" geometry={nodes.Cylinder184_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder073" position={[-3.693, -4.155, -5.492]}>
          <mesh name="Cylinder185" geometry={nodes.Cylinder185.geometry} material={textureMaterial} />
          <mesh name="Cylinder185_1" geometry={nodes.Cylinder185_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder185_2" geometry={nodes.Cylinder185_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder074" position={[-3.693, -4.155, -5.56]}>
          <mesh name="Cylinder186" geometry={nodes.Cylinder186.geometry} material={textureMaterial} />
          <mesh name="Cylinder186_1" geometry={nodes.Cylinder186_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder186_2" geometry={nodes.Cylinder186_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder075" position={[-3.693, -4.155, -5.627]}>
          <mesh name="Cylinder187" geometry={nodes.Cylinder187.geometry} material={textureMaterial} />
          <mesh name="Cylinder187_1" geometry={nodes.Cylinder187_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder187_2" geometry={nodes.Cylinder187_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder076" position={[-3.693, -4.155, -5.694]}>
          <mesh name="Cylinder188" geometry={nodes.Cylinder188.geometry} material={textureMaterial} />
          <mesh name="Cylinder188_1" geometry={nodes.Cylinder188_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder188_2" geometry={nodes.Cylinder188_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder077" position={[-3.693, -4.155, -5.761]}>
          <mesh name="Cylinder189" geometry={nodes.Cylinder189.geometry} material={textureMaterial} />
          <mesh name="Cylinder189_1" geometry={nodes.Cylinder189_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder189_2" geometry={nodes.Cylinder189_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder078" position={[-3.693, -4.155, -5.829]}>
          <mesh name="Cylinder190" geometry={nodes.Cylinder190.geometry} material={textureMaterial} />
          <mesh name="Cylinder190_1" geometry={nodes.Cylinder190_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder190_2" geometry={nodes.Cylinder190_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder079" position={[-3.693, -4.155, -5.896]}>
          <mesh name="Cylinder191" geometry={nodes.Cylinder191.geometry} material={textureMaterial} />
          <mesh name="Cylinder191_1" geometry={nodes.Cylinder191_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder191_2" geometry={nodes.Cylinder191_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder080" position={[-3.693, -4.155, -5.963]}>
          <mesh name="Cylinder192" geometry={nodes.Cylinder192.geometry} material={textureMaterial} />
          <mesh name="Cylinder192_1" geometry={nodes.Cylinder192_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder192_2" geometry={nodes.Cylinder192_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder081" position={[-3.693, -4.155, -6.03]}>
          <mesh name="Cylinder193" geometry={nodes.Cylinder193.geometry} material={textureMaterial} />
          <mesh name="Cylinder193_1" geometry={nodes.Cylinder193_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder193_2" geometry={nodes.Cylinder193_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder082" position={[-3.693, -4.155, -6.098]}>
          <mesh name="Cylinder194" geometry={nodes.Cylinder194.geometry} material={textureMaterial} />
          <mesh name="Cylinder194_1" geometry={nodes.Cylinder194_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder194_2" geometry={nodes.Cylinder194_2.geometry} material={textureMaterial} />
        </group>
        <group name="Cylinder083" position={[-3.693, -4.155, -6.165]}>
          <mesh name="Cylinder195" geometry={nodes.Cylinder195.geometry} material={textureMaterial} />
          <mesh name="Cylinder195_1" geometry={nodes.Cylinder195_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder195_2" geometry={nodes.Cylinder195_2.geometry} material={textureMaterial} />
        </group>
        <mesh name="Vert" geometry={nodes.Vert.geometry} material={textureMaterial} />
        <mesh name="Cube005" geometry={nodes.Cube005.geometry} material={textureMaterial} />
        <mesh name="deckrailing00001" geometry={nodes.deckrailing00001.geometry} material={textureMaterial} />
        <mesh name="deckrailing00002" geometry={nodes.deckrailing00002.geometry} material={textureMaterial} />
        <mesh name="deckrailing00003" geometry={nodes.deckrailing00003.geometry} material={textureMaterial} />
        <mesh name="deckrailing00004" geometry={nodes.deckrailing00004.geometry} material={textureMaterial} />
        <mesh name="deckrailing00005" geometry={nodes.deckrailing00005.geometry} material={textureMaterial} />
        <mesh name="deckrailing00006" geometry={nodes.deckrailing00006.geometry} material={textureMaterial} />
        <mesh name="deck001" geometry={nodes.deck001.geometry} material={textureMaterial} />
        <mesh name="deckrailing00" geometry={nodes.deckrailing00.geometry} material={textureMaterial} />
        <mesh name="deckrailing001" geometry={nodes.deckrailing001.geometry} material={textureMaterial} />
        <mesh name="topRail000" geometry={nodes.topRail000.geometry} material={textureMaterial} />
        <mesh name="topRail001" geometry={nodes.topRail001.geometry} material={textureMaterial} />
        <mesh name="topRail002" geometry={nodes.topRail002.geometry} material={textureMaterial} />
        <mesh name="topRail006" geometry={nodes.topRail006.geometry} material={textureMaterial} />
        <mesh name="stairs" geometry={nodes.stairs.geometry} material={textureMaterial} />
        <mesh name="topRail001001" geometry={nodes.topRail001001.geometry} material={textureMaterial} />
        <mesh name="Plane005" geometry={nodes.Plane005.geometry} material={textureMaterial} />
        <mesh name="Plane006" geometry={nodes.Plane006.geometry} material={textureMaterial} />
        <mesh name="Plane007" geometry={nodes.Plane007.geometry} material={textureMaterial} />
        <mesh name="Plane013" geometry={nodes.Plane013.geometry} material={textureMaterial} />
        <mesh name="Plane016" geometry={nodes.Plane016.geometry} material={textureMaterial} />
        <mesh name="Plane017" geometry={nodes.Plane017.geometry} material={textureMaterial} />
        <mesh name="Plane008" geometry={nodes.Plane008.geometry} material={textureMaterial} />
        <group name="building">
          <mesh name="Cube009" geometry={nodes.Cube009.geometry} material={textureMaterial} />
          <mesh name="Cube009_1" geometry={nodes.Cube009_1.geometry} material={textureMaterial} />
          <mesh name="Cube009_2" geometry={nodes.Cube009_2.geometry} material={textureMaterial} />
          <mesh name="Cube009_3" geometry={nodes.Cube009_3.geometry} material={textureMaterial} />
          <mesh name="Cube009_4" geometry={nodes.Cube009_4.geometry} material={textureMaterial} />
        </group>
        <mesh name="door" geometry={nodes.door.geometry} material={textureMaterial} />
        <group name="cielingBuilding">
          <mesh name="Cube012" geometry={nodes.Cube012.geometry} material={textureMaterial} />
          <mesh name="Cube012_1" geometry={nodes.Cube012_1.geometry} material={textureMaterial} />
          <mesh name="Cube012_2" geometry={nodes.Cube012_2.geometry} material={textureMaterial} />
          <mesh name="Cube012_3" geometry={nodes.Cube012_3.geometry} material={textureMaterial} />
        </group>
        <mesh name="doorHandle" geometry={nodes.doorHandle.geometry} material={textureMaterial} />
        <mesh name="Plane" geometry={nodes.Plane.geometry} material={textureMaterial} />
        <mesh name="Plane001" geometry={nodes.Plane001.geometry} material={textureMaterial} />
        <mesh name="building001" geometry={nodes.building001.geometry} material={textureMaterial} />
        <mesh name="cover001" geometry={nodes.cover001.geometry} material={textureMaterial} />
        <mesh name="cover004" geometry={nodes.cover004.geometry} material={textureMaterial} />
        <mesh name="Cube" geometry={nodes.Cube.geometry} material={textureMaterial} />
        <mesh name="Cube001" geometry={nodes.Cube001.geometry} material={textureMaterial} />
        <mesh name="Cube002" geometry={nodes.Cube002.geometry} material={textureMaterial} />
        <mesh name="Cylinder" geometry={nodes.Cylinder.geometry} material={textureMaterial} />
        <mesh name="Cylinder001" geometry={nodes.Cylinder001.geometry} material={textureMaterial} />
        <mesh name="cielinVernt00001" geometry={nodes.cielinVernt00001.geometry} material={textureMaterial} />
        <mesh name="Cube004" geometry={nodes.Cube004.geometry} material={textureMaterial} />
        <group name="Cylinder003">
          <mesh name="Cylinder004_1" geometry={nodes.Cylinder004_1.geometry} material={textureMaterial} />
          <mesh name="Cylinder004_2" geometry={nodes.Cylinder004_2.geometry} material={textureMaterial} />
        </group>
        <mesh name="Cylinder006" geometry={nodes.Cylinder006.geometry} material={textureMaterial} />
        <mesh name="Cylinder010" geometry={nodes.Cylinder010.geometry} material={textureMaterial} />
        <group name="Plane002">
          <mesh name="Plane004_1" geometry={nodes.Plane004_1.geometry} material={textureMaterial} />
          <mesh name="Plane004_2" geometry={nodes.Plane004_2.geometry} material={textureMaterial} />
        </group>
        <mesh name="Plane003" geometry={nodes.Plane003.geometry} material={textureMaterial} />
        <mesh name="Plane004" geometry={nodes.Plane004.geometry} material={textureMaterial} />
        <mesh name="cover006" geometry={nodes.cover006.geometry} material={textureMaterial} />
        <group name="group1646369301006">
          <mesh name="mesh1646369301007" geometry={nodes.mesh1646369301007.geometry} material={textureMaterial} />
          <mesh name="mesh1646369301007_1" geometry={nodes.mesh1646369301007_1.geometry} material={textureMaterial} />
          <mesh name="mesh1646369301007_2" geometry={nodes.mesh1646369301007_2.geometry} material={textureMaterial} />
          <mesh name="mesh1646369301007_3" geometry={nodes.mesh1646369301007_3.geometry} material={textureMaterial} />
        </group>
        <mesh name="Orchid_mesh" geometry={nodes.Orchid_mesh.geometry} material={textureMaterial} />
        <mesh name="tavble" geometry={nodes.tavble.geometry} material={textureMaterial} />
        <mesh name="monitor" geometry={nodes.monitor.geometry} material={textureMaterial} />
        <mesh name="mouseKeyboard" geometry={nodes.mouseKeyboard.geometry} material={textureMaterial} />
        <group name="couch">
          <mesh name="mesh198131767" geometry={nodes.mesh198131767.geometry} material={textureMaterial} />
          <mesh name="mesh198131767_1" geometry={nodes.mesh198131767_1.geometry} material={textureMaterial} />
          <mesh name="mesh198131767_2" geometry={nodes.mesh198131767_2.geometry} material={textureMaterial} />
          <mesh name="mesh198131767_3" geometry={nodes.mesh198131767_3.geometry} material={textureMaterial} />
          <mesh name="mesh198131767_4" geometry={nodes.mesh198131767_4.geometry} material={textureMaterial} />
          <mesh name="mesh198131767_5" geometry={nodes.mesh198131767_5.geometry} material={textureMaterial} />
        </group>
        <group name="Box003">
          <mesh name="Box003_1" geometry={nodes.Box003_1.geometry} material={textureMaterial} />
          <mesh name="Box003_1_1" geometry={nodes.Box003_1_1.geometry} material={textureMaterial} />
          <mesh name="Box003_1_2" geometry={nodes.Box003_1_2.geometry} material={textureMaterial} />
          <mesh name="Box003_1_3" geometry={nodes.Box003_1_3.geometry} material={textureMaterial} />
        </group>
        <group name="FlowerPot2">
          <mesh name="FlowerPot2_1" geometry={nodes.FlowerPot2_1.geometry} material={textureMaterial} />
          <mesh name="FlowerPot2_2" geometry={nodes.FlowerPot2_2.geometry} material={textureMaterial} />
          <mesh name="FlowerPot2_3" geometry={nodes.FlowerPot2_3.geometry} material={textureMaterial} />
          <mesh name="FlowerPot2_4" geometry={nodes.FlowerPot2_4.geometry} material={textureMaterial} />
        </group>
        <group name="FlowerPot4001">
          <mesh name="FlowerPot4004" geometry={nodes.FlowerPot4004.geometry} material={textureMaterial} />
          <mesh name="FlowerPot4004_1" geometry={nodes.FlowerPot4004_1.geometry} material={textureMaterial} />
          <mesh name="FlowerPot4004_2" geometry={nodes.FlowerPot4004_2.geometry} material={textureMaterial} />
        </group>
        <group name="FlowerPot4003">
          <mesh name="FlowerPot4003_1" geometry={nodes.FlowerPot4003_1.geometry} material={textureMaterial} />
          <mesh name="FlowerPot4003_2" geometry={nodes.FlowerPot4003_2.geometry} material={textureMaterial} />
          <mesh name="FlowerPot4003_3" geometry={nodes.FlowerPot4003_3.geometry} material={textureMaterial} />
        </group>
        <group name="FlowerPot6">
          <mesh name="FlowerPot6_1" geometry={nodes.FlowerPot6_1.geometry} material={textureMaterial} />
          <mesh name="FlowerPot6_2" geometry={nodes.FlowerPot6_2.geometry} material={textureMaterial} />
          <mesh name="FlowerPot6_3" geometry={nodes.FlowerPot6_3.geometry} material={textureMaterial} />
          <mesh name="FlowerPot6_4" geometry={nodes.FlowerPot6_4.geometry} material={textureMaterial} />
        </group>
        <group name="GeoSphere001">
          <mesh name="GeoSphere001_1" geometry={nodes.GeoSphere001_1.geometry} material={textureMaterial} />
          <mesh name="GeoSphere001_1_1" geometry={nodes.GeoSphere001_1_1.geometry} material={textureMaterial} />
        </group>
        <group name="GeoSphere001001">
          <mesh name="GeoSphere001_1001" geometry={nodes.GeoSphere001_1001.geometry} material={textureMaterial} />
          <mesh name="GeoSphere001_1001_1" geometry={nodes.GeoSphere001_1001_1.geometry} material={textureMaterial} />
        </group>
        <mesh name="HibiscusFlower_mesh001" geometry={nodes.HibiscusFlower_mesh001.geometry} material={textureMaterial} />
        <group name="Houseplant_3">
          <mesh name="Houseplant_3_1" geometry={nodes.Houseplant_3_1.geometry} material={textureMaterial} />
          <mesh name="Houseplant_3_2" geometry={nodes.Houseplant_3_2.geometry} material={textureMaterial} />
          <mesh name="Houseplant_3_3" geometry={nodes.Houseplant_3_3.geometry} material={textureMaterial} />
          <mesh name="Houseplant_3_4" geometry={nodes.Houseplant_3_4.geometry} material={textureMaterial} />
        </group>
        <mesh name="Plane010" geometry={nodes.Plane010.geometry} material={textureMaterial} />
        <mesh name="Plane011" geometry={nodes.Plane011.geometry} material={textureMaterial} />
        <group name="FlowerPot2001">
          <mesh name="FlowerPot2001_1" geometry={nodes.FlowerPot2001_1.geometry} material={textureMaterial} />
          <mesh name="FlowerPot2001_2" geometry={nodes.FlowerPot2001_2.geometry} material={textureMaterial} />
          <mesh name="FlowerPot2001_3" geometry={nodes.FlowerPot2001_3.geometry} material={textureMaterial} />
          <mesh name="FlowerPot2001_4" geometry={nodes.FlowerPot2001_4.geometry} material={textureMaterial} />
        </group>
      </group>
    </group>

  );
}

useGLTF.preload("models/scene.gltf");