// import { useScroll } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// import { gsap } from "gsap";
// import { useEffect, useRef, useState } from "react";

// export const ScrollManager = (props) => {
//   const { section, onSectionChange } = props;

//   const data = useScroll();
//   const lastScroll = useRef(0);
//   const isAnimating = useRef(false);


//   const [isTouchDevice, setIsTouchDevice] = useState(
//     window.innerWidth < 1024
//   );

//   useEffect(() => {
//     const check = () => setIsTouchDevice(window.innerWidth < 1024);
//     window.addEventListener("resize", check);
//     return () => window.removeEventListener("resize", check);
//   }, []);
//   data.fill.classList.add("top-0");
//   data.fill.classList.add("absolute");
//   // ------------------------------
//   // INITIAL SCROLL ANIMATION
//   // ------------------------------
//       gsap.to(data.el, {
//         duration: 10,
//         ease: "power2.inOut",
//         onStart: () => { isAnimating.current = true },
//         onComplete: () => { isAnimating.current = false },
//       });
//   // ------------------------------
//   // SECTION SNAP (when buttons pressed)
//   // ------
//       useEffect(() => {
//         gsap.to(data.el, {
//           duration: 1,
//           scrollTop: section * data.el.clientHeight,
//           onStart: () => {
//             isAnimating.current = true;
//           },
//           onComplete: () => {
//             isAnimating.current = false;
//           },
//         });
//       }, [section]);
//       //MAIN LOOP
//       useFrame(() => {
//         if (isAnimating.current) {
//           lastScroll.current = data.scroll.current;
//           return;
//         }

//    // ---------------------------------------
//     // MOBILE/TABLET MODE — HARD LOCK SCROLL
//     // ---------------------------------------
//     if (isTouchDevice) {
//       const target = section * data.el.clientHeight;

//       // keep the scroll stuck in place every frame
//       if (Math.abs(data.el.scrollTop - target) > 1) {
//         data.el.scrollTop = target;
//       }

//       // update scroll tracker anyway
//       lastScroll.current = data.scroll.current;
//       return; // <-- prevents section changes
//     }

//     // -------------------------------
//     // Your original desktop scroll logic
//     // -------------------------------
//       //   const curSection = Math.floor(data.scroll.current * data.pages);
//       //   if (data.scroll.current > lastScroll.current && curSection === 0) {
//       //     onSectionChange(1);
//       //   }
//       //   if (
//       //     data.scroll.current < lastScroll.current &&
//       //     data.scroll.current < 1 / (data.pages - 1)
//       //   ) {
//       //     onSectionChange(0);
//       //   }
//       //   lastScroll.current = data.scroll.current;
//       // });
//  const curSection = Math.floor(data.scroll.current * data.pages);

//     if (data.scroll.current > lastScroll.current && curSection === 0) {
//       onSectionChange(1);
//     }

//     if (
//       data.scroll.current < lastScroll.current &&
//       data.scroll.current < 1 / (data.pages - 1)
//     ) {
//       onSectionChange(0);
//     }

//     lastScroll.current = data.scroll.current;
//       });

//   return null;
// };


import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

export const ScrollManager = ({ section, onSectionChange }) => {
  const data = useScroll();
  const isAnimating = useRef(false);
  const lastScroll = useRef(0);

  // Dynamically detect mobile/tablet
  const [isTouchDevice, setIsTouchDevice] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const check = () => setIsTouchDevice(window.innerWidth < 1024);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Required for drei layout
  data.fill.classList.add("top-0", "absolute");

  // Initial smooth scroll animation
  gsap.to(data.el, {
    duration: 10,
    ease: "power2.inOut",
    onStart: () => (isAnimating.current = true),
    onComplete: () => (isAnimating.current = false),
  });

  // When section changes (buttons)
  useEffect(() => {
    gsap.to(data.el, {
      duration: 1,
      scrollTop: section * data.el.clientHeight,
      onStart: () => (isAnimating.current = true),
      onComplete: () => (isAnimating.current = false),
    });
  }, [section, data.el]);

  useFrame(() => {
    const targetTop = section * data.el.clientHeight;

    // While GSAP scrolling, lock visually & exit
    if (isAnimating.current) {
      data.el.scrollTop = targetTop;
      lastScroll.current = data.scroll.current;
      return;
    }

    // -------------------------------------------
    // MOBILE/TABLET — HARD FREEZE SCROLL POSITION
    // -------------------------------------------
    if (isTouchDevice) {
      if (Math.abs(data.el.scrollTop - targetTop) > 1) {
        data.el.scrollTop = targetTop;
      }
      lastScroll.current = data.scroll.current;
      return;
    }

    // -------------------------------------------
    // DESKTOP — NATURAL SCROLL SECTION CONTROL
    // -------------------------------------------
    const curSection = Math.floor(data.scroll.current * data.pages);

    if (data.scroll.current > lastScroll.current && curSection === 0) {
      onSectionChange(1);
    }

    if (
      data.scroll.current < lastScroll.current &&
      data.scroll.current < 1 / (data.pages - 1)
    ) {
      onSectionChange(0);
    }

    lastScroll.current = data.scroll.current;
  });

  return null;
};
