export const leafDissolveShader = {
  vertexShader: /* glsl */ `
    uniform float uDissolve;
    varying vec2 vUv;
    varying vec3 vNormalView;

    void main() {
      vUv = uv;
      vNormalView = normalize(normalMatrix * normal);
      vec3 p = position;
      // Eriyen yaprak kendi ağırlığıyla sarkar (uç mesh'te +Y).
      p.y += uDissolve * uDissolve * uv.y * 0.9;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uDissolve;
    varying vec2 vUv;
    varying vec3 vNormalView;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    void main() {
      float grain = noise(vUv * 7.0) * 0.6 + noise(vUv * 19.0) * 0.4;
      // Yaprağın sapı (uv.y = 0) son erir; sıvı ucuna doğru toplanır.
      float field = mix(grain, 1.0 - vUv.y, 0.55);
      float threshold = uDissolve * 1.1 - 0.05;
      if (field < threshold) discard;

      vec3 green = mix(vec3(0.16, 0.34, 0.1), vec3(0.3, 0.52, 0.18), grain);
      vec3 liquid = vec3(0.62, 0.05, 0.13);
      float wetness = smoothstep(0.3, 0.0, field - threshold) * step(0.001, uDissolve);
      float light = 0.55 + 0.45 * abs(vNormalView.z);
      gl_FragColor = vec4(mix(green, liquid, wetness) * light, 1.0);
      #include <colorspace_fragment>
    }
  `,
}
