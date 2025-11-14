import { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";

// ---- NEW: Mobile FOV Component ----
export const MobileFOV = () => {
  const { camera } = useThree();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || 
                     'ontouchstart' in window || 
                     navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      camera.fov = 102; // Wider FOV on mobile
    } else {
      camera.fov = 99; // Desktop FOV
    }
    camera.updateProjectionMatrix();
  }, [isMobile, camera]);

  return null;
}