"use client";

import dynamic from "next/dynamic";

/**
 * Three.js is around 150 KB of the bundle, and none of it is needed for the
 * page to be readable. Loading it after the first paint keeps the headline and
 * the two-pane demo fast, and the mesh simply appears a moment later.
 */
const CipherMesh3D = dynamic(
  () => import("@/components/site/cipher-mesh-3d").then((m) => m.CipherMesh3D),
  { ssr: false },
);

export function MeshBackdrop({ className }: { className?: string }) {
  return <CipherMesh3D className={className} />;
}
