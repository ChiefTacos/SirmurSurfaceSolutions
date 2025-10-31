
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
      float noise = random(vUv * 400.0 + time * 0.014); // 👈 slower motion
      float stars = step(0.95, noise) * mask; // .998 for spread out stars
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




// sunset

// import { useThree, useFrame } from "@react-three/fiber";
// import { useMemo } from "react";
// import * as THREE from "three";

// export const BackgroundTexture = () => {
//   const { gl, scene } = useThree();

//   // ──────────────────────────────────────────────────────────────
//   // Uniforms
//   // ──────────────────────────────────────────────────────────────
//   const uniforms = useMemo(
//     () => ({
//       topColor: { value: new THREE.Color("#ff8c42") },     // orange sunset
//       midColor: { value: new THREE.Color("#ff6b6b") },     // coral
//       bottomColor: { value: new THREE.Color("#cd4e57") }, // darker red‑pink
//       sunColor: { value: new THREE.Color("#ffaa00") },
//       sunPosition: { value: new THREE.Vector2(0.10, 0.86) },

//       // sun pulse
//       sunBaseSize: { value: 0.08 },   // normal radius
//       sunPulse: { value: 0.0 },       // 0‑1 animated

//       cloudColor: { value: new THREE.Color("#ffffff") },
//       time: { value: 0 },
//       cloudScale: { value: 2.0 },
//       cloudOffset: { value: new THREE.Vector2(0, 0.7) },
//       mountainHeight: { value: 0.66 },
//       mountainColor: { value: new THREE.Color("#ffffff") },
//     }),
//     []
//   );

//   // ──────────────────────────────────────────────────────────────
//   // Shaders
//   // ──────────────────────────────────────────────────────────────
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
//     uniform vec3 sunColor;
//     uniform vec2 sunPosition;
//     uniform float sunBaseSize;
//     uniform float sunPulse;
//     uniform vec3 cloudColor;
//     uniform vec3 mountainColor;
//     uniform float time;
//     uniform float cloudScale;
//     uniform vec2 cloudOffset;
//     uniform float mountainHeight;

//     varying vec2 vUv;

//     // ---- Noise helpers -------------------------------------------------
//     float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233))) * 43758.5453); }
//     float noise(vec2 p){
//       vec2 i = floor(p), f = fract(p);
//       f = f*f*(3.0-2.0*f);
//       float a = hash(i);
//       float b = hash(i+vec2(1,0));
//       float c = hash(i+vec2(0,1));
//       float d = hash(i+vec2(1,1));
//       return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
//     }

//     // Simplex noise (clouds)
//     vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
//     vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
//     vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
//     float snoise(vec2 v){
//       const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
//       vec2 i  = floor(v + dot(v, C.yy));
//       vec2 x0 = v - i + dot(i, C.xx);
//       vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
//       vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
//       i = mod289(i);
//       vec3 p = permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
//       vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
//       m = m*m; m = m*m;
//       vec3 x_ = 2.0*fract(p*C.www)-1.0;
//       vec3 h = abs(x_)-0.5;
//       vec3 ox = floor(x_+0.5);
//       vec3 a0 = x_-ox;
//       m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
//       vec3 g;
//       g.x  = a0.x*x0.x + h.x*x0.y;
//       g.yz = a0.yz*x12.xz + h.yz*x12.yw;
//       return 130.0*dot(m,g);
//     }

//     // ---- Cloud density -------------------------------------------------
//     float density(vec2 uv){
//       uv = uv*cloudScale + cloudOffset;
//       uv.x += time*0.04;
//       float n1 = snoise(uv*1.0);
//       float n2 = snoise(uv*2.0 + vec2(1.4,9.2));
//       float n3 = snoise(uv*4.0 + vec2(8.3,2.7));
//       float clouds = n1*0.5 + n2*0.3 + n3*0.2;
//       clouds = smoothstep(0.35,0.85,clouds);
//       float heightFade = 1.0 - smoothstep(0.6,1.0,uv.y-cloudOffset.y+0.3);
//       clouds *= heightFade;
//       return clouds;
//     }

//     // ---- Mountains ----------------------------------------------------
//     float mountains(vec2 uv){
//       float h = 0.0, amp = mountainHeight, freq = 1.5;
//       for(int i=0;i<4;i++){
//         h += noise(uv*freq)*amp;
//         amp *= 0.5; freq *= 2.0;
//       }
//       return smoothstep(0.3,0.7,h-(1.0-uv.y)*0.6);
//     }

//     // ---- Sun with glow ------------------------------------------------
//     vec3 sun(vec2 uv, vec2 pos, float sz){
//       float d = length(uv-pos);
//       float disk = 1.0-smoothstep(sz*0.8,sz,d);
//       float glow = exp(-d*8.0)*0.8;
//       return sunColor*(disk+glow);
//     }

//     void main(){
//       vec2 uv = vUv;

//       // sky gradient
//       vec3 sky = mix(bottomColor,midColor,uv.y*1.2);
//       sky = mix(sky,topColor,uv.y*0.8);

//       // *** SUN (pulsing) ***
//       float radius = sunBaseSize + sunPulse * 0.03;   // <-- pulse added here
//       sky += sun(uv, sunPosition, radius);

//       // mountains
//       float m = mountains(uv);
//       sky = mix(sky, mountainColor, m*0.95);

//       // clouds (top area only)
//       float cloudMask = step(0.6,uv.y);
//       float cloudAlpha = density(uv)*cloudMask;
//       sky = mix(sky, cloudColor, cloudAlpha*0.9);

//       // subtle sun rays
//       float ray = 0.0;
//       for(float i=0.0;i<8.0;i++){
//         float a = i/8.0*6.283;
//         vec2 dir = normalize(vec2(cos(a),sin(a)));
//         float t = dot(uv-sunPosition,dir);
//         ray += exp(-abs(t)*20.0)*0.3;
//       }
//       sky += sunColor*ray*0.1;

//       gl_FragColor = vec4(sky,1.0);
//     }
//   `;

//   // ──────────────────────────────────────────────────────────────
//   // Render target
//   // ──────────────────────────────────────────────────────────────
//   const target = useMemo(
//     () =>
//       new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
//         minFilter: THREE.LinearFilter,
//         magFilter: THREE.LinearFilter,
//         format: THREE.RGBAFormat,
//       }),
//     []
//   );

//   // ──────────────────────────────────────────────────────────────
//   // Background scene (shader quad)
//   // ──────────────────────────────────────────────────────────────
//   const bgScene = useMemo(() => {
//     const s = new THREE.Scene();
//     const cam = new THREE.Camera();
//     const mat = new THREE.ShaderMaterial({
//       uniforms,
//       vertexShader,
//       fragmentShader,
//       depthWrite: false,
//     });
//     const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
//     s.add(quad);
//     return { bgScene: s, bgCamera: cam };
//   }, [uniforms]);

//   // ──────────────────────────────────────────────────────────────
//   // Animation (time + sun pulse)
//   // ──────────────────────────────────────────────────────────────
//   useFrame((_, delta) => {
//     uniforms.time.value += delta * 0.5;                     // clouds drift
//     // slow breathing pulse (≈4 sec period)
//     const pulse = (Math.sin(uniforms.time.value * 0.8) + 1.0) * 0.5; // 0‑1
//     uniforms.sunPulse.value = pulse;

//     gl.setRenderTarget(target);
//     gl.render(bgScene.bgScene, bgScene.bgCamera);
//     gl.setRenderTarget(null);
//     scene.background = target.texture;
//   });

//   // ──────────────────────────────────────────────────────────────
//   // Nothing to render in the JSX tree
//   // ──────────────────────────────────────────────────────────────
//   return null;
// };