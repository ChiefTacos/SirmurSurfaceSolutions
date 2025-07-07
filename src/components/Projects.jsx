import { Image, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { animate, useMotionValue } from "framer-motion";
import * as THREE from "three";
import { motion } from "framer-motion-3d";
import { atom, useAtom } from "jotai";
import { useEffect, useRef } from "react";

export const projects = [
    {
    title: "First 3d Website",
    url: "https://portfolio-six-pi-54.vercel.app/",
    image: "projects/isoRoom.webp",
    description: "All started here, with a simple dream...",
  },
    {
    title: "Recipe Site",
    url: "https://recipe-app-chieftacos.vercel.app/",
    image: "projects/recipe.png",
    description: "Used to be fully functional where anyone can login and add recipes, now its just a simple site showing my basic HTML skills.",
  },
  {
    title: "MurBURGER",
    url: "https://murburger-proto.vercel.app/",
    image: "projects/murburger.png",
    description: "Prototype website for any restaurant or business that needs to show their products in a 3D space",
  },
  {
    title: "3d Renders",
    url: "#",
    image: "projects/transfer00.jpg",
    description: "Spent some time in blender creating virtual spaces",
  },
  {
    title: "Charcuterie",
    url: "#",
    image: "projects/charcutie.jpg",
    description: "Made high quality charcuterie boards for a summer",
  },
  {
    title: "Illustration",
    url: "#",
    image: "projects/IMG_2889.jpg",
    description: "I like to be creative and draw sometimes",
  },
  {
    title: "Chef Murray",
    url: "#",
    image: "projects/fancyGreenPlate.jpg",
    description: "Worked in numerous restaurants and gained experience on the line",
  },
];


const OverlayObject = ({ url = "projects/illustration.png" }) => {
  const ref = useRef();
  const { mouse, viewport } = useThree();

  // Use refs to persist target values across frames
  const targetPos = useRef(new THREE.Vector3());
  const targetRot = useRef(new THREE.Euler());

  useFrame(() => {
    const x = mouse.x * (viewport.width / 2);
    const y = mouse.y * (viewport.height / 2);

  // Position slightly reacts to mouse
    targetPos.current.set(x, y, 0.3); // Deeper in front for clear parallax layering
    ref.current.position.lerp(targetPos.current, 0.1);

    // Rotation adds extra subtle depth
    targetRot.current.set(-mouse.y * 0.05, mouse.x * 0.05, 0);
    ref.current.rotation.x += (targetRot.current.x - ref.current.rotation.x) * 0.1;
    ref.current.rotation.y += (targetRot.current.y - ref.current.rotation.y) * 0.1;
  });

  return (
    <Image
      ref={ref}
      url={url}
        onError={() => console.warn(`Could not load ${project.image}`)}

      scale={[1.2, 1.2, 1]} 
      transparent
  depthWrite={false} // Avoid blocking other objects in Z-buffer
  toneMapped={false}
    />
  );
};

const Project = (props) => {
  const { project, highlighted } = props;

  const background = useRef();
  const bgOpacity = useMotionValue(0.4);

  useEffect(() => {
    animate(bgOpacity, highlighted ? 0.7 : 0.4);
  }, [highlighted]);

  useFrame(() => {
    background.current.material.opacity = bgOpacity.get();
  });

  return (
    <group {...props}>

      <mesh
        position-z={-0.001}
        onClick={() => window.open(project.url, "_blank")}
        ref={background}
      >
        <planeGeometry args={[2.2, 2]} />
        <meshBasicMaterial color="black" transparent opacity={0.4} />
      </mesh>
      <Image
        scale={[2, 1.2, 1]}
        url={project.image}
        toneMapped={false}
        position-y={0.3}
      />
      <Text
        maxWidth={2}
        anchorX={"left"}
        anchorY={"top"}
        fontSize={0.2}
        position={[-1, -0.4, 0]}
      >
        {project.title.toUpperCase()}
      </Text>
      <Text
        maxWidth={2}
        anchorX="left"
        anchorY="top"
        fontSize={0.1}
        position={[-1, -0.6, 0]}
      >
        {project.description}
      </Text>
    </group>
  );
};

export const currentProjectAtom = atom(Math.floor(projects.length / 2));

export const Projects = () => {
  const { viewport } = useThree();
  const [currentProject] = useAtom(currentProjectAtom);

  return (
    
    <group position-y={-viewport.height * 2 + 1}>
      <OverlayObject url="projects/illustration.png" />

      {projects.map((project, index) => (
        <motion.group
          key={"project_" + index}
          position={[index * 2.5, 0, -3]}
          animate={{
            x: 0 + (index - currentProject) * 2.5,
            y: currentProject === index ? 0 : -0.1,
            z: currentProject === index ? -2 : -3,
            rotateX: currentProject === index ? 0 : -Math.PI / 3,
            rotateZ: currentProject === index ? 0 : -0.1 * Math.PI,
          }}
        >
          <Project project={project} highlighted={index === currentProject} />
        </motion.group>
      ))}
    </group>
  );
};
