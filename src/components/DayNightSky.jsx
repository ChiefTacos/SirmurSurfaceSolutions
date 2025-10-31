// OG 

// import { useThree, useFrame } from "@react-three/fiber";
// import { useMemo, useEffect } from "react";
// import * as THREE from "three";

// export const DayNightSky = ({
//   speed = 1,
//   timezoneOffset = -6,   // CST
//   sunriseHour = 6,
//   sunsetHour = 18,
//   debugForceDay = false, // ← set to true to force day (no stars!)
// }) => {
//   const { gl, scene } = useThree();

//   // ──────────────────────────────────────────────────────────────
//   // Uniforms
//   // ──────────────────────────────────────────────────────────────
//   const uniforms = useMemo(
//     () => ({
//       dayTop: { value: new THREE.Color("#87CEEB") },
//       dayMid: { value: new THREE.Color("#B0E0E6") },
//       dayBottom: { value: new THREE.Color("#E0F6FF") },

//       sunsetTop: { value: new THREE.Color("#ff8c42") },
//       sunsetMid: { value: new THREE.Color("#ff6b6b") },
//       sunsetBottom: { value: new THREE.Color("#cd4e57") },

//       nightTop: { value: new THREE.Color("#0a001f") },
//       nightMid: { value: new THREE.Color("#1a1446") },
//       nightBottom: { value: new THREE.Color("#000000") },

//       sunColor: { value: new THREE.Color("#ffaa00") },
//       moonColor: { value: new THREE.Color("#ccccff") },
//       sunPosition: { value: new THREE.Vector2(0, 0) },
//       sunSize: { value: 0.08 },
//       sunPulse: { value: 0 },

//       starsOpacity: { value: 0 },

//       cloudColor: { value: new THREE.Color("#ffffff") },
//       time: { value: 0 },
//       cloudScale: { value: 2.0 },
//       cloudOffset: { value: new THREE.Vector2(0, 0.7) },

//       mountainHeight: { value: 0.66 },
//       mountainDayColor: { value: new THREE.Color("#2d3748") },
//       mountainNightColor: { value: new THREE.Color("#1a1446") },

//       // DEBUG
//       debugForceDay: { value: 0.0 },
//     }),
//     []
//   );

//   // Update debug uniform when prop changes
//   useEffect(() => {
//     uniforms.debugForceDay.value = debugForceDay ? 1.0 : 0.0;
//   }, [debugForceDay, uniforms]);

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
//     uniform vec3 dayTop, dayMid, dayBottom;
//     uniform vec3 sunsetTop, sunsetMid, sunsetBottom;
//     uniform vec3 nightTop, nightMid, nightBottom;
//     uniform vec3 sunColor, moonColor;
//     uniform vec2 sunPosition;
//     uniform float sunSize, sunPulse;
//     uniform float starsOpacity;
//     uniform vec3 cloudColor;
//     uniform vec3 mountainDayColor, mountainNightColor;
//     uniform float time;
//     uniform float cloudScale;
//     uniform vec2 cloudOffset;
//     uniform float mountainHeight;
//     uniform float debugForceDay;

//     varying vec2 vUv;

//     // ── Noise ─────────────────────────────────────
//     float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
//     float noise(vec2 p){
//       vec2 i = floor(p), f = fract(p);
//       f = f*f*(3.0-2.0*f);
//       return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
//                  mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
//     }

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

//     float mountains(vec2 uv){
//       float h = 0.0, amp = mountainHeight, freq = 1.5;
//       for(int i=0;i<4;i++){
//         h += noise(uv*freq)*amp;
//         amp *= 0.5; freq *= 2.0;
//       }
//       return smoothstep(0.3,0.7,h-(1.0-uv.y)*0.6);
//     }

//     vec3 sunMoon(vec2 uv, vec2 pos, float sz, vec3 col){
//       float d = length(uv-pos);
//       float disk = 1.0-smoothstep(sz*0.8,sz,d);
//       float glow = exp(-d*8.0)*0.8;
//       return col*(disk+glow);
//     }

//     float stars(vec2 uv){
//       float n = 0.0;
//       for(float i=0.0;i<5.0;i++){
//         vec2 p = uv*200.0 + i*123.4;
//         n += pow(snoise(p), 30.0) * 0.8;
//       }
//       return n;
//     }

//     void main(){
//       vec2 uv = vUv;

//       // SUN POSITION FROM JS
//       vec2 sunPos = sunPosition;
//       float sunY = max(sunPos.y, 0.0);

//       // SKY BLENDING
//       vec3 sky;
//       if(sunY <= 0.0){
//         sky = mix(nightBottom, nightMid, uv.y);
//         sky = mix(sky, nightTop, uv.y * 0.5);
//       } else {
//         float dayFactor = sunY;
//         vec3 daySky = mix(dayBottom, dayMid, uv.y);
//         daySky = mix(daySky, dayTop, uv.y * 0.8);

//         vec3 sunsetSky = mix(sunsetBottom, sunsetMid, uv.y);
//         sunsetSky = mix(sunsetSky, sunsetTop, uv.y * 0.8);

//         sky = mix(sunsetSky, daySky, dayFactor);
//       }

//       // SUN / MOON
//       vec3 light = vec3(0);
//       if(sunY > 0.0){
//         float radius = sunSize + sunPulse * 0.03;
//         light = sunMoon(uv, sunPos, radius, sunColor);
//       } else {
//         light = sunMoon(uv, vec2(0.5, 0.3), 0.06, moonColor);
//       }
//       sky += light;

//       // MOUNTAINS
//       float m = mountains(uv);
//       vec3 mtnCol = mix(mountainDayColor, mountainNightColor, 1.0 - sunY);
//       sky = mix(sky, mtnCol, m * 0.95);

//       // CLOUDS
//       float cloudMask = step(0.6, uv.y);
//       float cloudAlpha = density(uv) * cloudMask;
//       sky = mix(sky, cloudColor, cloudAlpha * 0.9);

//       // STARS — ONLY AT NIGHT
//       float star = stars(uv);
//       float starVisibility = (1.0 - sunY) * (1.0 - debugForceDay);
//       sky += vec3(1.0) * star * starVisibility * starsOpacity;

//       gl_FragColor = vec4(sky, 1.0);
//     }
//   `;

//   // ──────────────────────────────────────────────────────────────
//   // Render target & scene
//   // ──────────────────────────────────────────────────────────────
//   const target = useMemo(
//     () => new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
//       minFilter: THREE.LinearFilter,
//       magFilter: THREE.LinearFilter,
//       format: THREE.RGBAFormat,
//     }),
//     []
//   );

//   const bgScene = useMemo(() => {
//     const s = new THREE.Scene();
//     const cam = new THREE.Camera();
//     const mat = new THREE.ShaderMaterial({
//       uniforms,
//       vertexShader,
//       fragmentShader,
//       depthWrite: false,
//     });
//     s.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
//     return { bgScene: s, bgCamera: cam };
//   }, [uniforms]);

//   // ──────────────────────────────────────────────────────────────
//   // Real-time animation — **FIXED: missing }**
//   // ──────────────────────────────────────────────────────────────
//   useFrame(() => {
//     const now = new Date();
//     const utc = now.getTime() + now.getTimezoneOffset() * 60000;
//     const local = new Date(utc + timezoneOffset * 3600000);

//     const hours = local.getHours();
//     const minutes = local.getMinutes();
//     const seconds = local.getSeconds() + local.getMilliseconds() / 1000;

//     const totalSeconds = hours * 3600 + minutes * 60 + seconds;
//     const dayProgress = totalSeconds / 86400;

//     const sunrise = sunriseHour / 24;
//     const sunset = sunsetHour / 24;

//     let sunHeight = 0;
//     let sunX = 0;

//     if (debugForceDay) {
//       sunHeight = 0.8;
//       sunX = 0.5;
//     } else if (dayProgress >= sunrise && dayProgress <= sunset) {
//       const midDay = (sunrise + sunset) / 2;
//       const halfDay = (sunset - sunrise) / 2;
//       sunHeight = Math.sin(((dayProgress - midDay) / halfDay) * Math.PI);
//       sunX = (dayProgress - sunrise) / (sunset - sunrise);
//     }

//     uniforms.time.value = totalSeconds * speed;
//     uniforms.sunPulse.value = (Math.sin(totalSeconds * 0.8) + 1) * 0.5;
//     uniforms.starsOpacity.value = 1.0 - sunHeight;
//     uniforms.sunPosition.value.set(sunX, sunHeight);

// gl.setRenderTarget(target);
// gl.render(bgScene.bgScene, bgScene.bgCamera);
// gl.setRenderTarget(null);
// // gl.autoClear = false;
// scene.background = target.texture; // ← This is correct
//   }); // ← **THIS WAS MISSING**

//   return null;
// };





















//WORKING DAY AND NIGHT OTHER ONE IS ASS but got us here with groky


// DayNightBackground.jsx
import { useThree, useFrame } from "@react-three/fiber";
import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

/* --------------------------------------------------------------
   1. Sunset shader (mountains + clouds + pulsing sun)
   -------------------------------------------------------------- */
// const sunsetFragment = `
//   uniform vec3 topColor, midColor, bottomColor;
//   uniform vec3 sunColor;
//   uniform vec2 sunPosition;
//   uniform float sunBaseSize, sunPulse;
//   uniform vec3 cloudColor, mountainColor;
//   uniform float time, cloudScale;
//   uniform vec2 cloudOffset;
//   uniform float mountainHeight;

//   varying vec2 vUv;

//   // ---- Noise -------------------------------------------------
//   float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
//   float noise(vec2 p){
//     vec2 i = floor(p), f = fract(p);
//     f = f*f*(3.0-2.0*f);
//     return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
//                mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
//   }
//   vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
//   vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
//   vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
//   float snoise(vec2 v){
//     const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
//     vec2 i  = floor(v + dot(v, C.yy));
//     vec2 x0 = v - i + dot(i, C.xx);
//     vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
//     vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
//     i = mod289(i);
//     vec3 p = permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
//     vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
//     m = m*m; m = m*m;
//     vec3 x_ = 2.0*fract(p*C.www)-1.0;
//     vec3 h = abs(x_)-0.5;
//     vec3 ox = floor(x_+0.5);
//     vec3 a0 = x_-ox;
//     m *= 1.79284291400159 - 0.85373472095314*(a0*a0+h*h);
//     vec3 g;
//     g.x  = a0.x*x0.x + h.x*x0.y;
//     g.yz = a0.yz*x12.xz + h.yz*x12.yw;
//     return 130.0*dot(m,g);
//   }

//   // ---- Cloud density -----------------------------------------
//   float density(vec2 uv){
//     uv = uv*cloudScale + cloudOffset;
//     uv.x += time*0.04;
//     float n1 = snoise(uv*1.0);
//     float n2 = snoise(uv*2.0 + vec2(1.4,9.2));
//     float n3 = snoise(uv*4.0 + vec2(8.3,2.7));
//     float clouds = n1*0.5 + n2*0.3 + n3*0.2;
//     clouds = smoothstep(0.35,0.85,clouds);
//     float heightFade = 1.0 - smoothstep(0.6,1.0,uv.y-cloudOffset.y+0.3);
//     clouds *= heightFade;
//     return clouds;
//   }

//   // ---- Mountains --------------------------------------------
//   float mountains(vec2 uv){
//     float h = 0.0, amp = mountainHeight, freq = 1.5;
//     for(int i=0;i<4;i++){
//       h += noise(uv*freq)*amp;
//       amp *= 0.5; freq *= 2.0;
//     }
//     return smoothstep(0.3,0.7,h-(1.0-uv.y)*0.6);
//   }

//   // ---- Sun with glow -----------------------------------------
//   vec3 sun(vec2 uv, vec2 pos, float sz){
//     float d = length(uv-pos);
//     float disk = 1.0-smoothstep(sz*0.8,sz,d);
//     float glow = exp(-d*8.0)*0.8;
//     return sunColor*(disk+glow);
//   }

//   void main(){
//     vec2 uv = vUv;

//     // sky gradient
//     vec3 sky = mix(bottomColor,midColor,uv.y*1.2);
//     sky = mix(sky,topColor,uv.y*0.8);

//     // pulsing sun
//     float radius = sunBaseSize + sunPulse*0.03;
//     sky += sun(uv, sunPosition, radius);

//     // mountains
//     float m = mountains(uv);
//     sky = mix(sky, mountainColor, m*0.95);

//     // clouds (top only)
//     float cloudMask = step(0.6,uv.y);
//     float cloudAlpha = density(uv)*cloudMask;
//     sky = mix(sky, cloudColor, cloudAlpha*0.9);

//     // subtle sun rays
//     float ray = 0.0;
//     for(float i=0.0;i<8.0;i++){
//       float a = i/8.0*6.283;
//       vec2 dir = normalize(vec2(cos(a),sin(a)));
//       float t = dot(uv-sunPosition,dir);
//       ray += exp(-abs(t)*20.0)*0.3;
//     }
//     sky += sunColor*ray*0.1;

//     gl_FragColor = vec4(sky,1.0);
//   }
// `;
const sunsetFragment = `
  uniform vec3 topColor, midColor, bottomColor;
  uniform vec3 sunColor;
  uniform float sunBaseSize, sunPulse;
  uniform vec3 cloudColor, mountainColor;
  uniform float time, cloudScale;
  uniform vec2 cloudOffset;
  uniform float mountainHeight;

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
    sky += rays(uv, sunPos);

    gl_FragColor = vec4(sky, 1.0);
  }
`;
/* --------------------------------------------------------------
   2. Night shader (text-mask stars) OG
   -------------------------------------------------------------- */
// const nightFragment = `
//   uniform vec3 topColor, midColor, bottomColor;
//   uniform sampler2D textMask;
//   uniform float time;
//   varying vec2 vUv;

//   float random(vec2 st){
//     return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453);
//   }

//   void main(){
//     float y = vUv.y;
//     vec3 col = mix(bottomColor, midColor, smoothstep(0.0,0.2,y));
//     col = mix(col, topColor, smoothstep(0.2,0.9,y));

//     float mask = texture2D(textMask, vUv).r;

//     // slow star twinkle
//     float noise = random(vUv*400.0 + time*0.2);
//     float stars = step(0.92, noise) * mask;

//     // gentle shimmer
//     float twinkle = sin(time*0.5 + random(vUv*800.0)*6.283)*0.5 + 0.5;
//     stars *= twinkle;

//     col += stars*1.1;

//     gl_FragColor = vec4(col,1.0);
//   }
// `;


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
    col += stars * 1.3; // brightness

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

/* --------------------------------------------------------------
   4. Component
   -------------------------------------------------------------- */
export const DayNightSky = ({
  speed = 1,
  timezoneOffset = -6,      // CST
  sunriseHour = 6,
  sunsetHour = 18,
  debugForceDay = false,
}) => {
  const { gl, scene } = useThree();

  /* ---------- Text mask (off-screen canvas) ---------- */
  const textTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    const size = 1920;
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
      "★☆  S I R M U R  ★☆",
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
      bottomColor: { value: new THREE.Color("#cd4e57") },
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

  /* ---------- Cross-fade material (mixes the two RTs) ---------- */
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
          vec3 day   = texture2D(tDay,   vUv).rgb;
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

  /* ---------- Animation loop (cycle + uniforms) ---------- */
  useFrame(() => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + timezoneOffset * 3600000);

    const hours = local.getHours();
    const minutes = local.getMinutes();
    const seconds = local.getSeconds() + local.getMilliseconds() / 1000;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const dayProgress = totalSeconds / 86400;

    const sunrise = sunriseHour / 24;
    const sunset = sunsetHour / 24;

    let sunHeight = 0;
    let sunX = 0;

    if (debugForceDay) {
      sunHeight = 0.8;
      sunX = 0.5;
    } else if (dayProgress >= sunrise && dayProgress <= sunset) {
      const mid = (sunrise + sunset) / 2;
      const half = (sunset - sunrise) / 2;
      sunHeight = Math.sin(((dayProgress - mid) / half) * Math.PI);
      sunX = (dayProgress - sunrise) / (sunset - sunrise);
    }

    // ----- update sunset uniforms -----
    sunsetUniforms.time.value = totalSeconds * speed;
    const pulse = (Math.sin(totalSeconds * 0.8) + 1) * 0.5;
    sunsetUniforms.sunPulse.value = pulse;
    sunsetUniforms.sunPosition.value.set(sunX, sunHeight);

    // ----- update night uniforms -----
    nightUniforms.time.value += 0.03; // keep the slow star drift

    // ----- render day & night into their RTs -----
    gl.setRenderTarget(rtDay);
    gl.render(dayScene.s, dayScene.cam);
    gl.setRenderTarget(rtNight);
    gl.render(nightScene.s, nightScene.cam);

    // ----- cross-fade -----
    fadeMaterial.uniforms.mixFactor.value = sunHeight; // 0 = night, 1 = day

    gl.setRenderTarget(finalTarget);
    gl.render(fadeScene.s, fadeScene.cam);
    gl.setRenderTarget(null);

    scene.background = finalTarget.texture;
  });

  /* ---------- Resize handling (optional but nice) ---------- */
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