"use client";

import { useEffect, useRef } from "react";

const VERTEX = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/**
 * A field of glyph-shaped marks with packets sweeping across it. Violet is what
 * you hold, cyan is what is on the wire, and the marks change on their own
 * schedule the way a terminal repaints. It is ambient: everything here is tuned
 * to stay under the type, never next to it.
 */
const FRAGMENT = `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
out vec4 outColor;

float hash21(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.5);
  return fract(p.x * p.y);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;

  vec2 cellSize = vec2(11.0, 19.0);
  vec2 id = floor(frag / cellSize);
  vec2 f = fract(frag / cellSize);

  float phase = floor(uTime * 1.5 + hash21(id) * 12.0);
  float r = hash21(id + phase * 7.31);

  float w = 0.22 + 0.52 * r;
  float x0 = 0.12 + (0.76 - w) * hash21(id + 3.7);
  float glyph =
    step(x0, f.x) * step(f.x, x0 + w) *
    step(0.24, f.y) * step(f.y, 0.78);

  float packets = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float p = fract(uv.x * 0.55 + uv.y * 0.3 - uTime * (0.035 + fi * 0.018) + fi * 0.41);
    packets += smoothstep(0.0, 0.05, p) * smoothstep(0.22, 0.05, p);
  }

  float lit = step(0.86, r);
  float intensity = glyph * lit * (0.06 + packets * 0.94);

  vec3 signal = vec3(0.482, 0.176, 1.000);
  vec3 wire = vec3(0.298, 0.788, 0.941);
  vec3 color = mix(signal, wire, clamp(uv.x * 0.7 + packets * 0.5, 0.0, 1.0));

  // The left of the page belongs to the type. The field thins out towards it
  // so the headline never has to fight anything for attention.
  float side = smoothstep(0.10, 0.95, uv.x);
  float vignette = smoothstep(1.05, 0.35, length((uv - 0.5) * vec2(1.25, 1.0)));
  float a = intensity * vignette * (0.18 + 0.82 * side) * 0.5;

  outColor = vec4(color * a, a * 0.85);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function CipherField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    // No WebGL2 means no field. The layout does not depend on it.
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);

    // One oversized triangle covers the viewport with no index buffer.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Tracked here rather than read back from the canvas: uniforms belong to
    // the program, so a remount onto an already-correctly-sized canvas still
    // has to write uRes into the new program or it renders at 0x0.
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const next = {
        width: Math.max(1, Math.floor(canvas.clientWidth * dpr)),
        height: Math.max(1, Math.floor(canvas.clientHeight * dpr)),
      };
      if (next.width === width && next.height === height) return;
      width = next.width;
      height = next.height;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uRes, width, height);
    };

    const draw = (time: number) => {
      gl.uniform1f(uTime, time);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    let start = 0;

    // A still frame is the whole animation when motion is not wanted.
    const renderStill = () => {
      resize();
      draw(8.4);
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!start) start = now;
      if (now - last < 33) return; // ~30fps is plenty for ambient motion
      last = now;
      resize();
      draw((now - start) / 1000);
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const play = () => {
      if (motion.matches) {
        stop();
        renderStill();
        return;
      }
      if (!frame) frame = requestAnimationFrame(loop);
    };

    const onVisibility = () => (document.hidden ? stop() : play());

    play();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", play);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", play);
      // Only the objects this effect created are released. Never call
      // loseContext() here: it kills the canvas permanently, so the next mount
      // — Strict Mode, or a locale switch remounting the layout — would get the
      // same dead context back from getContext() and render nothing.
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
