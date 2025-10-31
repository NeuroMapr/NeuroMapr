// src/pages/LandingPage.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import brainUrl from "../assets/brain_hologram.glb?url";
import "./LandingPage.css";

export default function LandingPage() {
  const mountRef = useRef(null);

useEffect(() => {
  const container = mountRef.current;
  if (!container) return;
  while (container.firstChild) container.removeChild(container.firstChild);

  // --- Scene / Camera / Renderer ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.8, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // placeholder so you never see pure black
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.6, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  scene.add(cube);

  // --- helpers ---
  function fitCameraToObject(obj) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // move object so its center is at origin, then target origin
    obj.position.sub(center);
    controls.target.copy(new THREE.Vector3(0, 0, 0));

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const fov = (camera.fov * Math.PI) / 180;
    let dist = (maxDim / 2) / Math.tan(fov / 2);
    dist *= 1.4; // padding
    camera.position.set(0, 0, dist);
    camera.near = dist / 50;
    camera.far = dist * 50;
    camera.updateProjectionMatrix();
  }

  // --- lights (for meshes; points ignore lights) ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));

  // --- Load GLB (with DRACO just in case) ---
  const loader = new GLTFLoader();
  import("three/examples/jsm/loaders/DRACOLoader.js").then(({ DRACOLoader }) => {
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(draco);

    let brain = null;

    loader.load(
      brainUrl,
      (gltf) => {
        brain = gltf.scene;
        if (!brain) {
          console.error("GLB has no scene");
          return;
        }

        // brighten/prepare materials
        let meshCount = 0, pointsCount = 0;
        brain.traverse((obj) => {
          if (obj.isPoints && obj.material) {
            pointsCount++;
            const m = obj.material;
            m.color?.set?.("#EAD9FF");     // bright lavender
            m.transparent = true;
            m.opacity = 1.0;
            m.depthWrite = false;
            m.blending = THREE.AdditiveBlending;
            m.toneMapped = false;
            if (m.size !== undefined) m.size = Math.max(m.size, 0.02);
          } else if (obj.isMesh) {
            meshCount++;
            // make meshes visible on black (unlit & bright)
            obj.material = new THREE.MeshBasicMaterial({
              color: 0x9da4ff,   // light lavender-blue
              transparent: true,
              opacity: 0.9,
            });
          }
        });

        // scale, center, and fit camera
        const box = new THREE.Box3().setFromObject(brain);
        const size = new THREE.Vector3(); box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        brain.scale.setScalar(2.2 / maxDim);

        fitCameraToObject(brain);
        brain.rotation.set(0, Math.PI, 0);
        scene.add(brain);

        // only remove cube once brain is in scene
        scene.remove(cube);

        // log what we found (helps debugging if needed)
        console.log(`Brain loaded. meshes=${meshCount}, points=${pointsCount}`);
      },
      (e) => {
        const pct = e.total ? ((e.loaded / e.total) * 100).toFixed(0) : "…";
        // optional: console.log(`Loading brain: ${pct}%`);
      },
      (err) => {
        console.error("Failed to load GLB:", err);
      }
    );

    // --- animate ---
    let raf = 0;
    const animate = () => {
      cube.rotation.y += 0.01; // will stop being visible once removed
      if (brain) brain.rotation.y += 0.0035;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // --- resize ---
    const onResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      scene.traverse((o) => {
        if (o.isMesh) {
          o.geometry?.dispose?.();
          if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose?.());
          else o.material?.dispose?.();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
      draco.dispose?.();
    };
  });
}, []);


return (
  <>
    <div className="landing-container" ref={mountRef}>
      {/* keep this empty — just the canvas goes inside */}
      <div className="hint">Drag to orbit • Scroll to zoom</div>
    </div>

    {/* TEMP: bulletproof overlay to prove text shows */}
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        zIndex: 9999,
        color: "#fff",
        pointerEvents: "none",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "clamp(28px, 6vw, 64px)", textShadow: "0 0 18px #b388ff" }}>
        NeuroMapr
      </h1>
      <p style={{ marginTop: 8, fontSize: "clamp(14px, 2.2vw, 22px)", color: "#dcdcdc" }}>
        Visualize your thoughts in 3D
      </p>
    </div>
  </>
);
}
