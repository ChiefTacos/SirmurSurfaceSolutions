import { useThree, useFrame } from "@react-three/fiber";
import { useMemo, useEffect } from "react";
import * as THREE from "three";


const sunsetFragment = `
  uniform vec3 topColor, midColor, bottomColor;
  uniform vec3 sunColor;
  uniform float sunBaseSize, sunPulse;
  uniform vec3 cloudColor, mountainColor;
  uniform float time, cloudScale;
  uniform vec2 cloudOffset;
  uniform float mountainHeight;
  uniform float isDay; 
  varying vec2 vUv;

  // ---- Noise -------------------------------------------------
  float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
               mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
    m = m*m; m = m*m;
    vec3 x_ = 2.0*fract(p*C.www)-1.0;
    vec3 h = abs(x_)-0.5;
    vec3 ox = floor(x_+0.5);
    vec3 a0 = x_-ox;
    m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
    vec3 g;
    g.x  = a0.x*x0.x + h.x*x0.y;
    g.yz = a0.yz*x12.xz + h.yz*x12.yw;
    return 130.0*dot(m,g);
  }

  // ---- Cloud density -----------------------------------------
  float density(vec2 uv){
    uv = uv*cloudScale + cloudOffset;
    uv.x += time*0.04;
    float n1 = snoise(uv*1.0);
    float n2 = snoise(uv*2.0 + vec2(1.4,9.2));
    float n3 = snoise(uv*4.0 + vec2(8.3,2.7));
    float clouds = n1*0.5 + n2*0.3 + n3*0.2;
    clouds = smoothstep(0.35,0.85,clouds);
    float heightFade = 1.0 - smoothstep(0.6,1.0,uv.y-cloudOffset.y+0.3);
    clouds *= heightFade;
    return clouds;
  }

  // ---- Mountains --------------------------------------------
  float mountains(vec2 uv){
    float h = 0.0, amp = mountainHeight, freq = 1.5;
    for(int i=0;i<4;i++){
      h += noise(uv*freq)*amp;
      amp *= 0.5; freq *= 2.0;
    }
    return smoothstep(0.3,0.7,h-(1.0-uv.y)*0.6);
  }

  // ---- Sun with glow -----------------------------------------
  vec3 sun(vec2 uv, vec2 pos, float sz){
    float d = length(uv-pos);
    float disk = 1.0-smoothstep(sz*0.8,sz,d);
    float glow = exp(-d*8.0)*0.8;
    return sunColor*(disk+glow);
  }

  // ---- Pulsing rays -----------------------------------------
  vec3 rays(vec2 uv, vec2 center){
    // ---- animated parameters --------------------------------
    float rotSpeed   = 0.2;      // rad/sec
    float growSpeed  = 0.12;     // units/sec
    float pulseFreq  = 1.2;      // Hz
    float pulseAmt   = 0.15;     // extra radius

    float t = time;

    // slowly rotating spokes
    float angle = t * rotSpeed;
    mat2 rot = mat2(cos(angle), -sin(angle),
                    sin(angle),  cos(angle));

    // distance from sun centre
    vec2  delta = uv - center;
    float dist  = length(delta);

    // growing radius (starts at sun size, expands outward)
    float baseRadius = sunBaseSize + 0.03;               // match the sun disk
    float rayRadius  = baseRadius + t * growSpeed;       // slowly grows
    rayRadius       += sin(t * pulseFreq * 6.283) * pulseAmt; // tiny pulse

    // ---- ray pattern (8 spokes) -----------------------------
    vec2  dir   = normalize(delta);
    float spokes = 8.0;
    float a     = atan(dir.y, dir.x) + angle;            // rotate with time
    float spoke = abs(fract(a/(6.283/spokes) + 0.5) - 0.5);
    spoke = smoothstep(0.0, 0.15, spoke);                // sharp spokes

    // ---- radial fade (rays disappear as they reach the edge) --
    float rayFade = 1.0 - smoothstep(0.0, 1.5, dist - rayRadius);
    rayFade *= exp(-dist * 2.0);                         // soft fall-off

    float ray = spoke * rayFade;
    return sunColor * ray * 1.8;                         // intensity tweak
  }

  void main(){
    vec2 uv = vUv;

    // ---- Sun locked in the top-right -------------------------
    vec2 sunPos = vec2(0.85, 0.85);   // top-right corner (0…1)

    // ---- Sky gradient ----------------------------------------
    vec3 sky = mix(bottomColor, midColor, uv.y*1.2);
    sky = mix(sky, topColor, uv.y*0.8);

    // ---- Pulsing sun disk + glow -----------------------------
    float radius = sunBaseSize + sunPulse*0.03;
    sky += sun(uv, sunPos, radius);

    // ---- Mountains -------------------------------------------
    float m = mountains(uv);
    sky = mix(sky, mountainColor, m*0.95);

    // ---- Clouds (top only) -----------------------------------
    float cloudMask = step(0.6, uv.y);
    float cloudAlpha = density(uv) * cloudMask;
    sky = mix(sky, cloudColor, cloudAlpha*0.9);

    // ---- Pulsing rays (replace the old static rays) ----------
if (isDay > 0.5) {
      sky += rays(uv, sunPos);
    }
    gl_FragColor = vec4(sky, 1.0);
  }
`;



/////////////////////

////bueatiful night twinkle


////////////
const nightFragment = `
  uniform vec3 topColor, midColor, bottomColor;
  uniform sampler2D textMask;
  uniform float time;
  varying vec2 vUv;

  // ---- Simple 2D hash (fixed star positions) -----------------
  float hash(vec2 p){
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // ---- 2D value noise (smooth, continuous) -------------------
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f*f*(3.0-2.0*f); // smoothstep

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // ---- Smooth star twinkle (no pop-in/out) -------------------
  float starTwinkle(vec2 uv){
    // 1. Fixed high-frequency noise → star positions
    float starMap = noise(uv * 800.0);

    // 2. Only keep brightest spots (inside mask later)
    float star = smoothstep(0.94, 0.96, starMap); // soft edge

    // 3. Per-star phase so they twinkle independently
    float phase = hash(uv * 800.0) * 6.9; // random 0..2π

    // 4. Slow, smooth sine wave + subtle noise wobble
    float speed = 0.9; // global twinkle speed (lower = slower)
    float pulse = sin(time * speed + phase) * 0.5 + 0.5;

    // Add tiny high-freq noise for organic shimmer
    float shimmer = noise(uv * 1200.0 + time * 0.3);
    pulse = mix(pulse, shimmer, 0.19);

    return star * pulse;
  }

  void main(){
    vec2 uv = vUv;

    // Sky gradient
    vec3 col = mix(bottomColor, midColor, smoothstep(0.0, 0.2, uv.y));
    col = mix(col, topColor, smoothstep(0.2, 0.9, uv.y));

    // Text mask
    float mask = texture2D(textMask, uv).r;

    // Stars (only inside mask)
    float stars = starTwinkle(uv) * mask;

    // Add to sky
    col += stars * 2.0; // brightness

    gl_FragColor = vec4(col, 1.0);
  }
`;









///////////////////////////////




/* --------------------------------------------------------------
   3. Shared vertex shader
   -------------------------------------------------------------- */
const vertexShader = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position,1.0);
  }
`;

export const DayNightSky = ({
  speed = 1,
  timezoneOffset = -6, // CST
  sunriseHour = 6,
  sunsetHour = 18,
  debugForceDay = false, // Controls day/night toggle
}) => {
  const { gl, scene } = useThree();

  /* ---------- Text mask (off-screen canvas) ---------- */
  const textTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const size = 2120;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d") ?? (function () {
      throw new Error("2D context unavailable");
    })();

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "bold 200px 'Orbitron', sans-serif";

    const lines = [
      "★☆  B A D G E R  ★☆",
      "★  S U R F A C E  ★",
      "☆  S O L U T I O N S  ☆",
    ];
    const lineHeight = 220;
    const startY = size * 0.003;

    lines.forEach((line, i) => {
      ctx.fillText(line, size / 2, startY + i * lineHeight);
    });

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  /* ---------- Uniforms for both shaders ---------- */
  const sunsetUniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color("#ff8c42") },
      midColor: { value: new THREE.Color("#ff6b6b") },
      bottomColor: { value: new THREE.Color("#52b1ff") },
      sunColor: { value: new THREE.Color("#ffaa00") },
      sunPosition: { value: new THREE.Vector2(0.1, 0.86) },
      sunBaseSize: { value: 0.08 },
      sunPulse: { value: 0 },
      cloudColor: { value: new THREE.Color("#ffffff") },
      mountainColor: { value: new THREE.Color("#ffffff") },
      time: { value: 0 },
      cloudScale: { value: 2.0 },
      cloudOffset: { value: new THREE.Vector2(0, 0.7) },
      mountainHeight: { value: 0.66 },
      isDay: { value: 1.0 },
    }),
    []
  );

  const nightUniforms = useMemo(
    () => ({
      topColor: { value: new THREE.Color("#1a1446") },
      midColor: { value: new THREE.Color("#3d2391") },
      bottomColor: { value: new THREE.Color("#000000") },
      textMask: { value: textTexture },
      time: { value: 0 },
    }),
    [textTexture]
  );

  /* ---------- Two render targets (day + night) ---------- */
  const rtDay = useMemo(
    () =>
      new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }),
    []
  );
  const rtNight = useMemo(
    () =>
      new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }),
    []
  );

  /* ---------- Two background scenes ---------- */
  const dayScene = useMemo(() => {
    const s = new THREE.Scene();
    const cam = new THREE.Camera();
    const mat = new THREE.ShaderMaterial({
      uniforms: sunsetUniforms,
      vertexShader,
      fragmentShader: sunsetFragment,
      depthWrite: false,
    });
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return { s, cam };
  }, [sunsetUniforms]);

  const nightScene = useMemo(() => {
    const s = new THREE.Scene();
    const cam = new THREE.Camera();
    const mat = new THREE.ShaderMaterial({
      uniforms: nightUniforms,
      vertexShader,
      fragmentShader: nightFragment,
      depthWrite: false,
    });
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    return { s, cam };
  }, [nightUniforms]);

  /* ---------- Cross-fade material ---------- */
  const fadeMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        tDay: { value: rtDay.texture },
        tNight: { value: rtNight.texture },
        mixFactor: { value: 1 }, // 0 = night, 1 = day
      },
      vertexShader,
      fragmentShader: `
        uniform sampler2D tDay, tNight;
        uniform float mixFactor;
        varying vec2 vUv;
        void main(){
          vec3 day = texture2D(tDay, vUv).rgb;
          vec3 night = texture2D(tNight, vUv).rgb;
          gl_FragColor = vec4(mix(night, day, mixFactor), 1.0);
        }
      `,
      depthWrite: false,
    });
  }, [rtDay, rtNight]);

  const fadeScene = useMemo(() => {
    const s = new THREE.Scene();
    const cam = new THREE.Camera();
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), fadeMaterial));
    return { s, cam };
  }, [fadeMaterial]);

  const finalTarget = useMemo(
    () =>
      new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }),
    []
  );

  /* ---------- Animation loop ---------- */
  useFrame(() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + timezoneOffset * 3600000);

    const hours = local.getHours();
    const minutes = local.getMinutes();
    const seconds = local.getSeconds() + local.getMilliseconds() / 1000;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    // Determine day/night based on debugForceDay or time
    let mixFactor;
    let sunHeight = 0;
    let sunX = 0;

    if (debugForceDay) {
      mixFactor = 0.0; // Force NIGHT
      sunHeight = 0.8;
      sunX = 0.5;
    } else {
      mixFactor = 1; // Force DAY
      // Optional: Keep time-based logic if you want automatic switching
     
    }

    // Update uniforms
    sunsetUniforms.time.value = totalSeconds * speed;
    sunsetUniforms.sunPulse.value = (Math.sin(totalSeconds * 0.8) + 1) * 0.5;
    sunsetUniforms.sunPosition.value.set(sunX, sunHeight);
    sunsetUniforms.isDay.value = mixFactor; // Control rays in sunset shader
    nightUniforms.time.value += 0.03; // Star drift

    // Render day and night scenes
    gl.setRenderTarget(rtDay);
    gl.render(dayScene.s, dayScene.cam);
    gl.setRenderTarget(rtNight);
    gl.render(nightScene.s, nightScene.cam);

    // Cross-fade
    fadeMaterial.uniforms.mixFactor.value = mixFactor;
    gl.setRenderTarget(finalTarget);
    gl.render(fadeScene.s, fadeScene.cam);
    gl.setRenderTarget(null);

    // Set as scene background
    scene.background = finalTarget.texture;
  });

  // Optional: Resize handling
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      [rtDay, rtNight, finalTarget].forEach((rt) => {
        rt.setSize(w, h);
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rtDay, rtNight, finalTarget]);

  return null;
};



