// import { useThree, useFrame } from "@react-three/fiber";
// import { useMemo } from "react";
// import * as THREE from "three";

// export const BackgroundTexture = () => {
//   const { gl, scene } = useThree();
//   const uniforms = useMemo(
//     () => ({
//      topColor: { value: new THREE.Color("#1a1446") },     // deep navy-violet top
//       midColor: { value: new THREE.Color("#531cb3") },     // rich purple mid
//       bottomColor: { value: new THREE.Color("#e264ff") },  // vivid magenta-pink horizon
//       glowColor: { value: new THREE.Color("#ffb347") },    // subtle orange glow for sun fade
//       time: { value: 0 },
//     }),
//     []
//   );

//   const vertexShader = `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = vec4(position, 1.0);
//     }
//   `;

//   const fragmentShader = `
//     uniform vec3 topColor;
//     uniform vec3 midColor;
//     uniform vec3 bottomColor;
//     uniform float time;
//     varying vec2 vUv;

//     float random(vec2 st) {
//       return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
//     }

//     void main() {
//       float y = vUv.y;
//       vec3 col = mix(bottomColor, midColor, smoothstep(0.0, 0.6, y));
//       col = mix(col, topColor, smoothstep(0.5, 1.0, y));

//       float stars = step(0.995, random(floor(vUv * 200.0 + time)));
//       stars *= smoothstep(0.5, 1.0, vUv.y);
//       col += stars;

//       gl_FragColor = vec4(col, 1.0);
//     }
//   `;

//   // Create a render target for the background
//   const target = useMemo(
//     () =>
//       new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
//         minFilter: THREE.LinearFilter,
//         magFilter: THREE.LinearFilter,
//       }),
//     []
//   );

//   const sceneBG = useMemo(() => {
//     const sceneBG = new THREE.Scene();
//     const cameraBG = new THREE.Camera();
//     const material = new THREE.ShaderMaterial({
//       uniforms,
//       vertexShader,
//       fragmentShader,
//       depthWrite: false,
//     });
//     const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
//     sceneBG.add(mesh);
//     return { sceneBG, cameraBG };
//   }, []);

//   useFrame((_, delta) => {
//     uniforms.time.value += delta * 0.2;
//     gl.setRenderTarget(target);
//     gl.render(sceneBG.sceneBG, sceneBG.cameraBG);
//     gl.setRenderTarget(null);
//     scene.background = target.texture; // <-- assign to scene
//   });

//   return null; // invisible helper
// }





//dope text stars OG


import { useThree, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

export const BackgroundTexture = () => {
  const { gl, scene } = useThree();

  // 🪄 Create the text mask (offscreen canvas -> texture)
  const textTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const size = 1920; // bigger canvas for sharper text and full-width spread
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, size, size);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Font sizing to fill width nicely
    ctx.font = "bold 180px 'Orbitron', sans-serif"; 

    // Split lines
    const lines = ["★☆  S I R M U R  ★☆", "★  S U R F A C E  ★", "☆  S O L U T I O N S  ☆"];
    const lineHeight = 230; // controls vertical spacing

    // Position text near top (3% from top)
    const startY = size * 0.003;

    lines.forEach((line, i) => {
      ctx.fillText(line, size / 2, startY + i * lineHeight);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, []);

  const uniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color("#1a1446") },
      midColor: { value: new THREE.Color("#3d2391") },
      bottomColor: { value: new THREE.Color("#000000") },
      glowColor: { value: new THREE.Color("#cc0000") },
      textMask: { value: textTexture },
      time: { value: 0 },
    }),
    [textTexture]
  );

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1);
    }
  `;

  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 midColor;
    uniform vec3 bottomColor;
    uniform sampler2D textMask;
    uniform float time;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      float y = vUv.y;
      vec3 col = mix(bottomColor, midColor, smoothstep(0.0, 0.2, y));
      col = mix(col, topColor, smoothstep(0.2, 0.9, y));

      float mask = texture2D(textMask, vUv).r;

      // subtle, slow star twinkle
      float noise = random(vUv * 400.0 + time * 0.015); // 👈 slower motion
      float stars = step(0.992, noise) * mask; // .998 for spread out stars
    //   float stars = smoothstep(0.993, 1, noise) * mask; // white BG

      // gentle shimmer
      float twinkle = sin(time * 0.5 + random(vUv * 800.0) * 6.283) * 0.5 + 0.5;
      stars *= twinkle;

      col += stars * 1.3;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const target = useMemo(
    () =>
      new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    []
  );

  const sceneBG = useMemo(() => {
    const sceneBG = new THREE.Scene();
    const cameraBG = new THREE.Camera();
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    sceneBG.add(mesh);
    return { sceneBG, cameraBG };
  }, []);

  useFrame((_, delta) => {
    // slower time increment for calm motion
    uniforms.time.value += delta * 0.03;
    gl.setRenderTarget(target);
    gl.render(sceneBG.sceneBG, sceneBG.cameraBG);
    gl.setRenderTarget(null);
    scene.background = target.texture;
  });

  return null;
};
