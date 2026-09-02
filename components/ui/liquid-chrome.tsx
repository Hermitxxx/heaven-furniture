"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

/**
 * LiquidChrome — from ReactBits (MIT), src/ts-tailwind/Backgrounds/LiquidChrome.
 *
 * A full-bleed OGL fragment shader: nine cosine warps of the UV field, then
 * `baseColor / abs(sin(...))`. That division is the whole effect — it blows out
 * to white wherever the sine crosses zero, which reads as metal rather than as
 * a gradient. main() supersamples 3x3 because those bright bands are thin
 * enough to alias badly at one sample per pixel.
 *
 * Two deliberate divergences from the original:
 *   - the uniform objects are held in locals instead of being read back off
 *     `program.uniforms`, so the resize and pointer writes stay typed.
 *   - the effect depends on baseColor's three components rather than on the
 *     array, so an inline `baseColor={[...]}` literal at the call site doesn't
 *     tear down and rebuild the GL context on every render of the parent.
 */

export type LiquidChromeProps = HTMLAttributes<HTMLDivElement> & {
  baseColor?: [number, number, number];
  speed?: number;
  amplitude?: number;
  frequencyX?: number;
  frequencyY?: number;
  interactive?: boolean;
};

const VERTEX_SHADER = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec3 uBaseColor;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform vec2 uMouse;
varying vec2 vUv;

vec4 renderImage(vec2 uvCoord) {
  vec2 fragCoord = uvCoord * uResolution.xy;
  vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

  for (float i = 1.0; i < 10.0; i++) {
    uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
    uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
  }

  vec2 diff = (uvCoord - uMouse);
  float dist = length(diff);
  float falloff = exp(-dist * 20.0);
  float ripple = sin(10.0 * dist - uTime * 2.0) * 0.03;
  uv += (diff / (dist + 0.0001)) * ripple * falloff;

  vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
  return vec4(color, 1.0);
}

void main() {
  vec4 col = vec4(0.0);
  int samples = 0;
  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      vec2 offset = vec2(float(i), float(j)) * (1.0 / uResolution.xy);
      col += renderImage(vUv + offset);
      samples++;
    }
  }
  gl_FragColor = col / float(samples);
}
`;
export function LiquidChrome({
  baseColor = [0.1, 0.1, 0.1],
  speed = 0.2,
  amplitude = 0.5,
  frequencyX = 3,
  frequencyY = 2,
  interactive = true,
  ...props
}: LiquidChromeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [red, green, blue] = baseColor;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ antialias: true });
    const gl = renderer.gl;
    gl.clearColor(1, 1, 1, 1);

    const uTime = { value: 0 };
    const uResolution = { value: new Float32Array([1, 1, 1]) };
    const uMouse = { value: new Float32Array([0, 0]) };

    const program = new Program(gl, {
      vertex: VERTEX_SHADER,
      fragment: FRAGMENT_SHADER,
      uniforms: {
        uTime,
        uResolution,
        uMouse,
        uBaseColor: { value: new Float32Array([red, green, blue]) },
        uAmplitude: { value: amplitude },
        uFrequencyX: { value: frequencyX },
        uFrequencyY: { value: frequencyY },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      uResolution.value[0] = gl.canvas.width;
      uResolution.value[1] = gl.canvas.height;
      uResolution.value[2] = gl.canvas.width / gl.canvas.height;
    };
    window.addEventListener("resize", resize);
    resize();
    const track = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      uMouse.value[0] = (clientX - rect.left) / rect.width;
      uMouse.value[1] = 1 - (clientY - rect.top) / rect.height;
    };
    const handleMouseMove = (event: MouseEvent) => {
      track(event.clientX, event.clientY);
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      track(event.touches[0].clientX, event.touches[0].clientY);
    };

    if (interactive) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("touchmove", handleTouchMove);
    }

    let frame = requestAnimationFrame(function update(t) {
      frame = requestAnimationFrame(update);
      uTime.value = t * 0.001 * speed;
      renderer.render({ scene: mesh });
    });

    container.appendChild(gl.canvas);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      if (interactive) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("touchmove", handleTouchMove);
      }
      gl.canvas.parentElement?.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [red, green, blue, speed, amplitude, frequencyX, frequencyY, interactive]);

  return <div ref={containerRef} className="h-full w-full" {...props} />;
}

export default LiquidChrome;
