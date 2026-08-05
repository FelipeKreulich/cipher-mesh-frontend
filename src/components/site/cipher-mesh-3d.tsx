"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

/**
 * The mesh the project is named after, alive.
 *
 * A lattice of nodes wired together in three dimensions. Two of them are lit —
 * the two people who can read — and packets of light run the path between them,
 * passing through node after node that cannot open a thing. That is the whole
 * argument of the page as a moving object rather than a sentence.
 *
 * Three.js earns its size here for one reason: bloom. Neon that does not bleed
 * is just coloured lines, and hand-rolling a decent bloom pass is far more work
 * than it is worth. Everything else stays deliberately quiet — thin edges, dim
 * nodes, and the travelling packet as the only genuinely bright thing, so the
 * headline and the two-pane demo keep the foreground.
 */

const SIGNAL = 0x7b2dff;
const SIGNAL_SOFT = 0xa06bff;
const WIRE = 0x4cc9f0;

/** Nodes per axis. Small on purpose: a wall of points reads as noise. */
const N = 5;
const GAP = 1.5;

type Vec = [number, number, number];

const at = (i: number, j: number, k: number): Vec => [
  (i - (N - 1) / 2) * GAP,
  (j - (N - 1) / 2) * GAP,
  (k - (N - 1) / 2) * GAP,
];

/**
 * A walk through the lattice from one corner to the other, one axis at a time.
 * The packet has to travel through intermediate nodes for the point to land:
 * many hands carry it, none of them can open it.
 */
function route(): Vec[] {
  const path: Vec[] = [];
  let [i, j, k] = [0, N - 1, 0];
  path.push(at(i, j, k));
  while (i < N - 1) path.push(at(++i, j, k));
  while (j > 0) path.push(at(i, --j, k));
  while (k < N - 1) path.push(at(i, j, ++k));
  return path;
}

export function CipherMesh3D({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // No WebGL. The layout does not depend on this.
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.append(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      host.clientWidth / Math.max(1, host.clientHeight),
      0.1,
      100,
    );
    camera.position.set(0, 0, 12);

    const world = new THREE.Group();
    scene.add(world);

    // ── the lattice ──────────────────────────────────────────────
    const nodes: Vec[] = [];
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        for (let k = 0; k < N; k++) nodes.push(at(i, j, k));

    const nodeGeometry = new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(nodes.flat(), 3),
    );
    world.add(
      new THREE.Points(
        nodeGeometry,
        new THREE.PointsMaterial({
          color: WIRE,
          size: 0.055,
          transparent: true,
          opacity: 0.5,
          sizeAttenuation: true,
        }),
      ),
    );

    // Edges only between neighbours, so the lattice reads as a grid rather
    // than a hairball.
    const edges: number[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < N; k++) {
          if (i < N - 1) edges.push(...at(i, j, k), ...at(i + 1, j, k));
          if (j < N - 1) edges.push(...at(i, j, k), ...at(i, j + 1, k));
          if (k < N - 1) edges.push(...at(i, j, k), ...at(i, j, k + 1));
        }
      }
    }
    const edgeGeometry = new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(edges, 3),
    );
    world.add(
      new THREE.LineSegments(
        edgeGeometry,
        new THREE.LineBasicMaterial({
          color: WIRE,
          transparent: true,
          opacity: 0.12,
        }),
      ),
    );

    // ── the two who can read ─────────────────────────────────────
    const path = route();
    const endpoints = [path[0], path[path.length - 1]];
    const peers = endpoints.map((p) => {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 16, 16),
        new THREE.MeshBasicMaterial({ color: SIGNAL_SOFT }),
      );
      dot.position.set(...p);
      world.add(dot);
      return dot;
    });

    // ── packets ──────────────────────────────────────────────────
    const curve = new THREE.CatmullRomCurve3(
      path.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
    );
    const packets = [0, 0.34, 0.67].map((offset) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 12, 12),
        new THREE.MeshBasicMaterial({ color: SIGNAL }),
      );
      world.add(mesh);
      return { mesh, offset };
    });

    // Bloom is the entire reason three is here.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(host.clientWidth, host.clientHeight),
      0.85, // strength
      0.75, // radius
      0.22, // threshold — only the lit things bleed
    );
    composer.addPass(bloom);

    // ── motion ───────────────────────────────────────────────────
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const resize = () => {
      const w = host.clientWidth;
      const h = Math.max(1, host.clientHeight);
      renderer.setSize(w, h);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    let frame = 0;
    // Timer, not Clock: Clock is deprecated in three, and Timer has to be
    // stepped explicitly — which is the point, since it lets getElapsed() be
    // read more than once a frame without the value drifting.
    const timer = new THREE.Timer();

    const draw = (now?: number) => {
      timer.update(now);
      const t = timer.getElapsed();

      world.rotation.y = t * 0.055 + pointer.x * 0.22;
      world.rotation.x = Math.sin(t * 0.16) * 0.12 + pointer.y * 0.16;

      for (const { mesh, offset } of packets) {
        curve.getPointAt((t * 0.14 + offset) % 1, mesh.position);
      }
      // The endpoints breathe slightly out of phase, so the pair reads as two
      // people rather than one decoration mirrored.
      peers[0].scale.setScalar(1 + Math.sin(t * 1.6) * 0.12);
      peers[1].scale.setScalar(1 + Math.sin(t * 1.6 + 1.2) * 0.12);

      composer.render();
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      draw(now);
    };

    if (reduce) {
      // One still frame: the mesh is worth seeing even when motion is not
      // wanted, so it is composed rather than skipped.
      world.rotation.set(0.16, 0.6, 0);
      packets.forEach(({ mesh, offset }) =>
        curve.getPointAt(offset, mesh.position),
      );
      composer.render();
    } else {
      frame = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }

    const onVisibility = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else if (!document.hidden && !frame && !reduce) {
        frame = requestAnimationFrame(loop);
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointerMove);
      // Three holds GPU memory until told otherwise; a locale switch remounts
      // this, and leaking a renderer per switch would end badly.
      composer.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const material = mesh.material as THREE.Material | undefined;
        material?.dispose?.();
      });
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className={className} />;
}
