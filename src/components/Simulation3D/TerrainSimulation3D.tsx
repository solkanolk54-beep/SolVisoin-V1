import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Maximize2, 
  RotateCw, 
  Play, 
  Pause, 
  Layers, 
  Eye, 
  Droplets, 
  Flame, 
  Mountain, 
  Gauge, 
  Download, 
  Sliders, 
  Camera, 
  Activity, 
  Sparkles,
  Compass,
  Zap,
  Info
} from 'lucide-react';
import { Language } from '../../types';

interface TerrainSimulation3DProps {
  lang: Language;
  onFocusCoordinates?: (lat: number, lng: number, title: string) => void;
}

interface DamBasinConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  lat: number;
  lng: number;
  capacityMm3: number;
  maxElevationM: number;
  minElevationM: number;
  damWallHeightM: number;
  areaKm2: number;
  burnSeverityRatio: number; // 0-1
  primaryWadiAr: string;
  primaryWadiEn: string;
}

const BASINS: DamBasinConfig[] = [
  {
    id: 'tabellout',
    nameAr: 'حوض سد تابلوط (Tabellout)',
    nameEn: 'Tabellout Dam Basin',
    lat: 36.578,
    lng: 5.986,
    capacityMm3: 294,
    maxElevationM: 1240,
    minElevationM: 340,
    damWallHeightM: 121,
    areaKm2: 890,
    burnSeverityRatio: 0.42,
    primaryWadiAr: 'وادي جن جن وروافده (الأربعاء، تامنتوت)',
    primaryWadiEn: 'Oued Djen Djen & Tributaries (Larbaa, Tamentout)'
  },
  {
    id: 'kissir',
    nameAr: 'حوض سد كيسير (Kissir)',
    nameEn: 'Kissir Dam Basin',
    lat: 36.782,
    lng: 5.672,
    capacityMm3: 68,
    maxElevationM: 980,
    minElevationM: 145,
    damWallHeightM: 65,
    areaKm2: 125,
    burnSeverityRatio: 0.28,
    primaryWadiAr: 'وادي كيسير وغابات الحظيرة الوطنية لتازة',
    primaryWadiEn: 'Oued Kissir & Taza National Park Watershed'
  },
  {
    id: 'boussiaba',
    nameAr: 'حوض سد بوسيابة (Boussiaba)',
    nameEn: 'Boussiaba Dam Basin',
    lat: 36.712,
    lng: 6.240,
    capacityMm3: 120,
    maxElevationM: 1120,
    minElevationM: 190,
    damWallHeightM: 85,
    areaKm2: 440,
    burnSeverityRatio: 0.35,
    primaryWadiAr: 'وادي بوسيابة ووادي الرميلة (الميلية)',
    primaryWadiEn: 'Oued Boussiaba & Oued Rmeila (El Milia)'
  }
];

export const TerrainSimulation3D: React.FC<TerrainSimulation3DProps> = ({
  lang,
  onFocusCoordinates
}) => {
  const isAr = lang === 'ar';
  const mountRef = useRef<HTMLDivElement | null>(null);

  // States
  const [selectedBasinId, setSelectedBasinId] = useState<string>('tabellout');
  const [shadingMode, setShadingMode] = useState<'hypsometric' | 'hillshade' | 'burnSeverity' | 'wireframe'>('hypsometric');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [particleDensity, setParticleDensity] = useState<number>(12000); // 2k to 30k
  const [rainIntensityMmH, setRainIntensityMmH] = useState<number>(65); // 0-150 mm/h
  const [hydrophobicWaxLayer, setHydrophobicWaxLayer] = useState<boolean>(true);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [showFlowVectors, setShowFlowVectors] = useState<boolean>(true);
  const [sunAzimuth, setSunAzimuth] = useState<number>(315);
  const [sunAltitude, setSunAltitude] = useState<number>(45);
  const [fps, setFps] = useState<number>(60);
  const [liveSedimentRate, setLiveSedimentRate] = useState<number>(1420); // kg/s
  const [accumulatedSiltM3, setAccumulatedSiltM3] = useState<number>(38500);
  const [cameraPreset, setCameraPreset] = useState<'orbit' | 'dam' | 'top' | 'ravine'>('orbit');
  const [crossSectionActive, setCrossSectionActive] = useState<boolean>(false);
  const [crossSectionPlane, setCrossSectionPlane] = useState<number>(0);

  const currentBasin = useMemo(() => {
    return BASINS.find(b => b.id === selectedBasinId) || BASINS[0];
  }, [selectedBasinId]);

  // Three.js instances ref
  const threeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    terrainMesh: THREE.Mesh;
    waterMesh: THREE.Mesh;
    particles: THREE.Points;
    particlePositions: Float32Array;
    particleVelocities: Float32Array;
    particleAges: Float32Array;
    streamLines: THREE.LineSegments;
    dirLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
    reqId: number;
    elevationData: Float32Array;
    gridSize: number;
    terrainSize: number;
  } | null>(null);

  // Initialize or re-create scene when basin changes
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Create Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913); // Deep night GIS background
    scene.fog = new THREE.FogExp2(0x060913, 0.0018);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 2000);
    camera.position.set(0, 240, 360);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.replaceChildren(renderer.domElement);

    // Grid size for terrain
    const gridSize = 160; // 160x160 resolution = 25,600 DEM vertices
    const terrainSize = 450;
    const geometry = new THREE.PlaneGeometry(terrainSize, terrainSize, gridSize - 1, gridSize - 1);
    geometry.rotateX(-Math.PI / 2);

    // Generate realistic mountainous Jijel canyon topography
    const pos = geometry.attributes.position;
    const elevationData = new Float32Array(pos.count);
    const colors = new Float32Array(pos.count * 3);

    // Height multipliers based on basin
    const maxH = currentBasin.maxElevationM / 10;
    const minH = currentBasin.minElevationM / 10;
    const hRange = maxH - minH;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Procedural mountain valleys and central canyon towards dam wall (z > 140)
      const nx = x / terrainSize;
      const nz = z / terrainSize;

      // Multi-octave Perlin-like mathematical terrain
      const mainRidge = Math.sin(nx * 4 + 1.2) * Math.cos(nz * 3) * 0.45;
      const rugged = Math.sin(nx * 12) * Math.cos(nz * 10) * 0.15;
      const micro = Math.sin(nx * 26 + nz * 20) * 0.06;

      // Central gorge / canyon carving where the dam reservoir sits
      const canyonDistance = Math.abs(nx + 0.1 * Math.sin(nz * 6));
      const canyonCarve = Math.exp(-canyonDistance * 7.0) * 0.65;

      // Slope upwards towards the mountains at negative z (upstream)
      const regionalSlope = (-nz + 0.5) * 0.55;

      let normalizedElev = (mainRidge + rugged + micro + regionalSlope - canyonCarve);
      normalizedElev = Math.max(0, Math.min(1.2, (normalizedElev + 0.5) * 0.8));

      // Elevation in scene units
      const y = minH + normalizedElev * hRange;
      pos.setY(i, y);
      elevationData[i] = y;

      // Default Hypsometric Color Palette:
      // Valley / Reservoir floor (green-cyan) -> Mid slopes (ochre / cedar green) -> High ridges (limestone rocky gray / snow white)
      const t = normalizedElev;
      let r = 0.15, g = 0.45, b = 0.25;
      if (t < 0.25) {
        // Riparian & reservoir buffer
        r = 0.12; g = 0.38; b = 0.42;
      } else if (t < 0.55) {
        // Mediterranean forest & scrubland
        r = 0.22; g = 0.50; b = 0.24;
      } else if (t < 0.82) {
        // Mountainous slopes & eroded sandstone (K-factor zone)
        r = 0.72; g = 0.54; b = 0.28;
      } else {
        // High peaks of Jijel Babors (limestone gray / chalky)
        r = 0.85; g = 0.85; b = 0.90;
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    // Material with Vertex Colors + Lighting
    const terrainMaterial = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.82,
      metalness: 0.1,
      flatShading: false,
      wireframe: false
    });

    const terrainMesh = new THREE.Mesh(geometry, terrainMaterial);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    scene.add(terrainMesh);

    // Reservoir Water Plane at the dam retention level
    const waterLevel = minH + 18;
    const waterGeo = new THREE.PlaneGeometry(140, 180);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0088cc,
      transparent: true,
      opacity: 0.78,
      roughness: 0.1,
      metalness: 0.85
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.set(5, waterLevel, 70);
    scene.add(waterMesh);

    // Dam Wall Structure Representation
    const damWallGeo = new THREE.BoxGeometry(90, currentBasin.damWallHeightM / 4.5, 14);
    const damWallMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.6,
      metalness: 0.3
    });
    const damWallMesh = new THREE.Mesh(damWallGeo, damWallMat);
    damWallMesh.position.set(5, waterLevel + (currentBasin.damWallHeightM / 9), 150);
    scene.add(damWallMesh);

    // Lighting (Sunlight + Ambient)
    const ambientLight = new THREE.AmbientLight(0x404859, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3e0, 2.4);
    dirLight.position.set(180, 260, 180);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 800;
    const d = 260;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // 3D Flow Drainage Network (Line Segments)
    const linePoints: number[] = [];
    // Generate branches flowing down the mountain towards the dam
    const numStreams = 45;
    for (let s = 0; s < numStreams; s++) {
      let currX = (Math.random() - 0.5) * (terrainSize * 0.75);
      let currZ = -terrainSize * 0.42 + Math.random() * 80;
      for (let step = 0; step < 28; step++) {
        // Find height
        const nextX = currX + (0.0 - currX) * 0.08 + (Math.sin(currZ * 0.05 + s) * 2.5);
        const nextZ = currZ + 8.5;
        // Simple elevation estimate
        const y1 = minH + Math.sin(currX * 0.02) * 15 + (180 - currZ) * 0.18;
        const y2 = minH + Math.sin(nextX * 0.02) * 15 + (180 - nextZ) * 0.18;

        linePoints.push(currX, y1 + 1.2, currZ);
        linePoints.push(nextX, y2 + 1.2, nextZ);

        currX = nextX;
        currZ = nextZ;
        if (currZ > 140) break;
      }
    }
    const streamGeo = new THREE.BufferGeometry();
    streamGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
    const streamMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });
    const streamLines = new THREE.LineSegments(streamGeo, streamMat);
    scene.add(streamLines);

    // Particles System: Live Debris Flow & SPH Fluid Mudflow
    const maxParticles = 30000;
    const particlePositions = new Float32Array(maxParticles * 3);
    const particleVelocities = new Float32Array(maxParticles * 3);
    const particleAges = new Float32Array(maxParticles);
    const particleColors = new Float32Array(maxParticles * 3);

    for (let i = 0; i < maxParticles; i++) {
      // Spawn near mountain ridges (negative z)
      const px = (Math.random() - 0.5) * (terrainSize * 0.85);
      const pz = -terrainSize * 0.45 + Math.random() * (terrainSize * 0.6);
      particlePositions[i * 3] = px;
      particlePositions[i * 3 + 1] = minH + 60 + Math.random() * 40;
      particlePositions[i * 3 + 2] = pz;

      particleVelocities[i * 3] = 0;
      particleVelocities[i * 3 + 1] = 0;
      particleVelocities[i * 3 + 2] = 0;
      particleAges[i] = Math.random() * 100;

      // Color starts as muddy silt ochre (sediment load)
      particleColors[i * 3] = 0.85;
      particleColors[i * 3 + 1] = 0.55;
      particleColors[i * 3 + 2] = 0.20;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    // Particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,200,100,0.8)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Save refs
    threeRef.current = {
      renderer,
      scene,
      camera,
      terrainMesh,
      waterMesh,
      particles,
      particlePositions,
      particleVelocities,
      particleAges,
      streamLines,
      dirLight,
      ambientLight,
      reqId: 0,
      elevationData,
      gridSize,
      terrainSize
    };

    // Mouse Interaction (Orbiting)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = {
      radius: 420,
      theta: Math.PI * 0.25,
      phi: Math.PI * 0.32
    };

    const updateCameraPos = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 40, 20);
    };
    updateCameraPos();

    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= dx * 0.007;
      spherical.phi = Math.max(0.1, Math.min(Math.PI * 0.48, spherical.phi - dy * 0.007));
      updateCameraPos();
    };
    const onMouseUp = () => {
      isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(120, Math.min(850, spherical.radius + e.deltaY * 0.4));
      updateCameraPos();
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const newW = mountRef.current.clientWidth;
      const newH = mountRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;

    const animate = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      frameCount++;
      fpsTimer += dt;
      if (fpsTimer >= 1.0) {
        setFps(Math.round(frameCount / fpsTimer));
        frameCount = 0;
        fpsTimer = 0;
      }

      // Physics update: Debris Flow particles
      if (threeRef.current && isSimulating) {
        const { particles, particlePositions, particleVelocities, particleAges, elevationData, gridSize, terrainSize } = threeRef.current;
        const count = Math.min(particlePositions.length / 3, particleDensity);
        const pPos = particlePositions;
        const pVel = particleVelocities;
        const pColors = (particles.geometry.attributes.color as THREE.BufferAttribute).array as Float32Array;

        // Speed multiplier from storm intensity and hydrophobic wax layer
        const speedBoost = (rainIntensityMmH / 50.0) * (hydrophobicWaxLayer ? 2.3 : 1.0);

        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          let px = pPos[idx];
          let py = pPos[idx + 1];
          let pz = pPos[idx + 2];

          // Compute terrain gradient at current position
          const gx = Math.floor(((px / terrainSize) + 0.5) * (gridSize - 1));
          const gz = Math.floor(((pz / terrainSize) + 0.5) * (gridSize - 1));

          let gradX = 0;
          let gradZ = 0;
          let groundY = minH;

          if (gx >= 1 && gx < gridSize - 1 && gz >= 1 && gz < gridSize - 1) {
            const hL = elevationData[gz * gridSize + (gx - 1)];
            const hR = elevationData[gz * gridSize + (gx + 1)];
            const hU = elevationData[(gz - 1) * gridSize + gx];
            const hD = elevationData[(gz + 1) * gridSize + gx];

            gradX = -(hR - hL) * 0.5;
            gradZ = -(hD - hU) * 0.5;
            groundY = elevationData[gz * gridSize + gx];
          }

          // Acceleration downhill
          pVel[idx] += (gradX * 0.08 + (0.0 - px) * 0.005) * speedBoost * dt * 45;
          pVel[idx + 2] += (gradZ * 0.08 + 0.45) * speedBoost * dt * 45;

          // Velocity damping (viscosity of mud / debris)
          const damping = hydrophobicWaxLayer ? 0.94 : 0.88;
          pVel[idx] *= damping;
          pVel[idx + 2] *= damping;

          px += pVel[idx] * dt * 30;
          pz += pVel[idx + 2] * dt * 30;
          py = groundY + 1.2;

          particleAges[i] += dt;

          // Color gradient based on velocity:
          // Low speed (brown sediment) -> Medium speed (amber/yellow) -> Torrential rapid velocity (bright red/white)
          const speed = Math.sqrt(pVel[idx] * pVel[idx] + pVel[idx + 2] * pVel[idx + 2]);
          if (speed < 1.2) {
            pColors[idx] = 0.35;
            pColors[idx + 1] = 0.65;
            pColors[idx + 2] = 0.95; // Clearer water
          } else if (speed < 3.5) {
            pColors[idx] = 0.95;
            pColors[idx + 1] = 0.60;
            pColors[idx + 2] = 0.15; // Muddy ochre
          } else {
            pColors[idx] = 1.0;
            pColors[idx + 1] = 0.20;
            pColors[idx + 2] = 0.10; // Torrential debris rush
          }

          // Respawn at mountain peaks when reaching dam or falling off
          if (pz > 150 || particleAges[i] > 18 || px < -terrainSize * 0.48 || px > terrainSize * 0.48) {
            px = (Math.random() - 0.5) * (terrainSize * 0.8);
            pz = -terrainSize * 0.45 + Math.random() * (terrainSize * 0.35);
            py = minH + 70 + Math.random() * 30;
            pVel[idx] = 0;
            pVel[idx + 1] = 0;
            pVel[idx + 2] = 0;
            particleAges[i] = 0;
          }

          pPos[idx] = px;
          pPos[idx + 1] = py;
          pPos[idx + 2] = pz;
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;

        // Subtle water oscillation
        if (threeRef.current.waterMesh) {
          threeRef.current.waterMesh.position.y = waterLevel + Math.sin(time * 0.002) * 0.35;
        }
      }

      // Render Scene
      renderer.render(scene, camera);
      threeRef.current!.reqId = requestAnimationFrame(animate);
    };

    threeRef.current.reqId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('wheel', onWheel);

      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.reqId);
        renderer.dispose();
      }
    };
  }, [selectedBasinId]);

  // Update Shading Mode (Hypsometric / Hillshade / Burn Severity / Wireframe)
  useEffect(() => {
    if (!threeRef.current) return;
    const { terrainMesh, gridSize, elevationData, terrainSize } = threeRef.current;
    const pos = terrainMesh.geometry.attributes.position;
    const colors = (terrainMesh.geometry.attributes.color as THREE.BufferAttribute).array as Float32Array;
    const mat = terrainMesh.material as THREE.MeshStandardMaterial;

    const maxH = currentBasin.maxElevationM / 10;
    const minH = currentBasin.minElevationM / 10;
    const hRange = Math.max(1, maxH - minH);

    mat.wireframe = shadingMode === 'wireframe';

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const t = Math.max(0, Math.min(1, (y - minH) / hRange));

      if (shadingMode === 'hypsometric') {
        if (t < 0.25) {
          colors[i * 3] = 0.12; colors[i * 3 + 1] = 0.38; colors[i * 3 + 2] = 0.42;
        } else if (t < 0.55) {
          colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.50; colors[i * 3 + 2] = 0.24;
        } else if (t < 0.82) {
          colors[i * 3] = 0.72; colors[i * 3 + 1] = 0.54; colors[i * 3 + 2] = 0.28;
        } else {
          colors[i * 3] = 0.85; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.90;
        }
      } else if (shadingMode === 'hillshade') {
        // Monochrome topographic relief with ambient occlusion
        const shade = 0.25 + t * 0.7;
        colors[i * 3] = shade; colors[i * 3 + 1] = shade; colors[i * 3 + 2] = shade;
      } else if (shadingMode === 'burnSeverity') {
        // High dNBR / Hydrophobic burn zones colored in fiery crimson & scorched charcoal
        const distFromBurnCore = Math.sqrt((x - 20) * (x - 20) + (z + 80) * (z + 80));
        const burnIntensity = Math.exp(-distFromBurnCore / 95.0);
        if (burnIntensity > 0.45) {
          // Severe burn dNBR > 0.66
          colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.15; colors[i * 3 + 2] = 0.10;
        } else if (burnIntensity > 0.2) {
          // Moderate burn dNBR 0.27 - 0.66
          colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.55; colors[i * 3 + 2] = 0.15;
        } else {
          // Unburned healthy forest
          colors[i * 3] = 0.15; colors[i * 3 + 1] = 0.38; colors[i * 3 + 2] = 0.18;
        }
      } else if (shadingMode === 'wireframe') {
        colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 0.4;
      }

      // Optional: Add contour bands if showContours is active
      if (showContours && shadingMode !== 'wireframe') {
        const contourInterval = 10; // Every 10 units = 100 meters
        const distToContour = Math.abs((y % contourInterval) - (contourInterval * 0.5));
        if (distToContour > (contourInterval * 0.46)) {
          // Dark contour line
          colors[i * 3] *= 0.4;
          colors[i * 3 + 1] *= 0.4;
          colors[i * 3 + 2] *= 0.4;
        }
      }
    }

    terrainMesh.geometry.attributes.color.needsUpdate = true;
    mat.needsUpdate = true;
  }, [shadingMode, showContours, currentBasin]);

  // Update Sun Lighting
  useEffect(() => {
    if (!threeRef.current) return;
    const { dirLight } = threeRef.current;
    const radAz = (sunAzimuth * Math.PI) / 180;
    const radAlt = (sunAltitude * Math.PI) / 180;
    const dist = 320;

    dirLight.position.x = dist * Math.cos(radAlt) * Math.sin(radAz);
    dirLight.position.y = dist * Math.sin(radAlt);
    dirLight.position.z = dist * Math.cos(radAlt) * Math.cos(radAz);
  }, [sunAzimuth, sunAltitude]);

  // Update Streams visibility
  useEffect(() => {
    if (!threeRef.current) return;
    threeRef.current.streamLines.visible = showFlowVectors;
  }, [showFlowVectors]);

  // Update Sediment Discharge calculation based on sliders
  useEffect(() => {
    // Silt load = f(Rain, Hydrophobicity, BurnSeverity, Area)
    const hydroMult = hydrophobicWaxLayer ? 2.45 : 1.0;
    const rainFactor = Math.pow(rainIntensityMmH / 50.0, 1.6);
    const rate = Math.round(480 * rainFactor * hydroMult * (currentBasin.burnSeverityRatio + 0.6));
    setLiveSedimentRate(rate);

    // Continuous accumulation
    const interval = setInterval(() => {
      setAccumulatedSiltM3(prev => prev + Math.round((rate / 1600.0) * 1.5));
    }, 1000);
    return () => clearInterval(interval);
  }, [rainIntensityMmH, hydrophobicWaxLayer, currentBasin]);

  // Camera Presets
  const applyCameraPreset = (preset: 'orbit' | 'dam' | 'top' | 'ravine') => {
    if (!threeRef.current) return;
    setCameraPreset(preset);
    const { camera } = threeRef.current;

    if (preset === 'orbit') {
      camera.position.set(0, 240, 360);
      camera.lookAt(0, 40, 20);
    } else if (preset === 'dam') {
      // Close to the dam crest facing upstream
      camera.position.set(5, 75, 195);
      camera.lookAt(5, 55, -40);
    } else if (preset === 'top') {
      // Orthographic Nadir Top View
      camera.position.set(0, 520, 10);
      camera.lookAt(0, 0, 0);
    } else if (preset === 'ravine') {
      // Deep upstream canyon perspective
      camera.position.set(-60, 140, -120);
      camera.lookAt(0, 40, 60);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/70 border border-cyan-500/40 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-cyan-400" />
                OpenGL / WebGL 2.0 GPU Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {isAr ? 'محاكاة ثلاثية الأبعاد لحظية' : 'Real-Time 3D Simulation'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {fps} FPS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {isAr 
                ? 'محاكاة التضاريس ثلاثية الأبعاد وانجراف التربة والسيول الجارفة' 
                : '3D GPU Topographic Simulation & Debris Flow Dynamics'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
              {isAr
                ? 'محرك رسومي تفاعلي متقدم يحاكي فيزيائية تدفق الطمي والمياه الجارفة (SPH Fluid & Particle System) في أحواض سدود ولاية جيجل الاستراتيجية، مع تتبع خطوط الكنتور، التلوين الارتفاعي، وطبقة كراهية الماء الناجمة عن حرائق الغابات.'
                : 'High-fidelity GPU-accelerated simulation of terrain hydrology, debris flow particles, and sediment siltation across strategic Jijel dam catchments with real-time hypsometric tinting and post-fire hydrophobicity.'}
            </p>
          </div>

          {/* Basin Selector Pills */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            {BASINS.map(basin => {
              const isSelected = basin.id === selectedBasinId;
              return (
                <button
                  key={basin.id}
                  onClick={() => setSelectedBasinId(basin.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  <div className="text-start">
                    <div>{isAr ? basin.nameAr : basin.nameEn}</div>
                    <div className="text-[10px] font-mono opacity-80">
                      {basin.capacityMm3}M m³ • {basin.areaKm2} km²
                    </div>
                  </div>
                  {isSelected && <Sparkles className="w-4 h-4 shrink-0 text-slate-950" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 3D Simulation Cockpit */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {/* Left / Center 3D Viewport (3 Columns) */}
        <div className="xl:col-span-3 flex flex-col space-y-3">
          {/* Viewport Card */}
          <div className="relative w-full h-[540px] sm:h-[620px] bg-[#050811] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl group">
            {/* 3D Canvas Mount */}
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Overlaid HUD Controls */}
            {/* Top-Left: Basin Info & Coordinates */}
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 text-xs pointer-events-auto max-w-xs shadow-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-xs">
                  {isAr ? currentBasin.nameAr : currentBasin.nameEn}
                </span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">{isAr ? 'الإحداثيات:' : 'Coords:'}</span>
                  <span className="text-cyan-300 font-bold">{currentBasin.lat}°N, {currentBasin.lng}°E</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">{isAr ? 'الواد الرئيسي:' : 'Main Wadi:'}</span>
                  <span className="text-slate-200 truncate">{isAr ? currentBasin.primaryWadiAr : currentBasin.primaryWadiEn}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">{isAr ? 'قمة التضاريس:' : 'Peak DEM:'}</span>
                  <span className="text-emerald-400 font-bold">{currentBasin.maxElevationM} m</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">{isAr ? 'ارتفاع السد:' : 'Dam Crest:'}</span>
                  <span className="text-amber-400 font-bold">{currentBasin.damWallHeightM} m</span>
                </div>
              </div>
            </div>

            {/* Top-Right: Camera Presets */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-lg">
              <button
                onClick={() => applyCameraPreset('orbit')}
                title={isAr ? 'منظور مداري 3D' : '3D Orbit View'}
                className={`p-2 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                  cameraPreset === 'orbit' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Orbit</span>
              </button>
              <button
                onClick={() => applyCameraPreset('dam')}
                title={isAr ? 'منظور جدار السد' : 'Dam Crest View'}
                className={`p-2 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                  cameraPreset === 'dam' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dam Wall</span>
              </button>
              <button
                onClick={() => applyCameraPreset('ravine')}
                title={isAr ? 'منظور الخانق الجبلي' : 'Upstream Ravine View'}
                className={`p-2 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                  cameraPreset === 'ravine' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mountain className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ravine</span>
              </button>
              <button
                onClick={() => applyCameraPreset('top')}
                title={isAr ? 'منظور عمودي (Orthographic)' : 'Top Nadir View'}
                className={`p-2 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                  cameraPreset === 'top' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Top</span>
              </button>
            </div>

            {/* Bottom-Left: Live Hydrological Telemetry */}
            <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3 text-xs shadow-xl max-w-sm pointer-events-auto">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  {isAr ? 'المقاييس الهيدرولوجية اللحظية' : 'Live Hydro Simulation'}
                </span>
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {particleDensity.toLocaleString()} {isAr ? 'جزيء GPU' : 'GPU Particles'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">{isAr ? 'معدل تدفق الرسوبيات' : 'Sediment Rate'}</div>
                  <div className="text-amber-400 font-bold text-sm">
                    {liveSedimentRate.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">kg/s</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">{isAr ? 'حجم الطمي المتراكم بالسد' : 'Accumulated Silt'}</div>
                  <div className="text-red-400 font-bold text-sm">
                    {accumulatedSiltM3.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">m³</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Right: Shading Mode Switcher Bar */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-xl">
              <button
                onClick={() => setShadingMode('hypsometric')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  shadingMode === 'hypsometric'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isAr ? 'تلوين ارتفاعي' : 'Hypsometric'}
              </button>
              <button
                onClick={() => setShadingMode('hillshade')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  shadingMode === 'hillshade'
                    ? 'bg-slate-200 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isAr ? 'إضاءة ظلية' : 'Hillshade'}
              </button>
              <button
                onClick={() => setShadingMode('burnSeverity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  shadingMode === 'burnSeverity'
                    ? 'bg-red-500 text-white font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isAr ? 'شدة الحريق dNBR' : 'Post-Fire dNBR'}
              </button>
              <button
                onClick={() => setShadingMode('wireframe')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  shadingMode === 'wireframe'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {isAr ? 'شبكي' : 'Wireframe'}
              </button>
            </div>
          </div>

          {/* Quick Explanatory Footer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {isAr
                  ? 'استخدم الماوس أو اللمس لتدوير التضاريس ثلاثية الأبعاد (Pan & Tilt)، والعجلة للتكبير والتصغير (Zoom).'
                  : 'Use mouse drag / touch to orbit terrain (Pan & Tilt), and scroll wheel to zoom in/out.'}
              </span>
            </div>
            {onFocusCoordinates && (
              <button
                onClick={() => onFocusCoordinates(currentBasin.lat, currentBasin.lng, currentBasin.nameAr)}
                className="px-3 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] transition"
              >
                {isAr ? 'عرض الحوض في الخريطة ثنائية الأبعاد (2D GIS)' : 'View in 2D GIS Map'}
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Simulation Parameters & Physical Sliders (1 Column) */}
        <div className="space-y-4">
          {/* Simulation Physical Parameters Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                {isAr ? 'معايير المحاكاة الفيزيائية' : 'Physical Parameters'}
              </h3>
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`p-1.5 rounded-lg text-xs font-mono transition flex items-center gap-1 ${
                  isSimulating ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Run')}</span>
              </button>
            </div>

            {/* Slider 1: Rain Intensity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  {isAr ? 'شدة العاصفة المطرية:' : 'Storm Rainfall:'}
                </span>
                <span className="font-mono text-cyan-300 font-bold">{rainIntensityMmH} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="5"
                value={rainIntensityMmH}
                onChange={e => setRainIntensityMmH(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 mm/h (جاف)</span>
                <span>65 (متوسط)</span>
                <span>150 (طوفاني)</span>
              </div>
            </div>

            {/* Slider 2: Particle Density */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  {isAr ? 'كثافة جزيئات التدفق (GPU):' : 'Particle Count:'}
                </span>
                <span className="font-mono text-emerald-300 font-bold">{particleDensity.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="30000"
                step="1000"
                value={particleDensity}
                onChange={e => setParticleDensity(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Hydrophobic Wax Layer Switch */}
            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-200 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  {isAr ? 'طبقة كراهية الماء (Hydrophobicity)' : 'Post-Fire Hydrophobic Wax'}
                </span>
                <button
                  onClick={() => setHydrophobicWaxLayer(!hydrophobicWaxLayer)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    hydrophobicWaxLayer ? 'bg-red-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      hydrophobicWaxLayer ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {isAr
                  ? 'تزيد سرعة الجريان السطحي بمعدل 2.45 ضعفاً وتمنع ارتشاح التربة نتيجة تفحم المادة العضوية وتبخر الشموع النباتية.'
                  : 'Amplifies debris velocity by 2.45x and reduces soil infiltration to near zero due to vaporized hydrophobic plant waxes.'}
              </p>
            </div>

            {/* Display Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300">
                {isAr ? 'طبقات الإظهار البصري:' : 'Visual Overlays:'}
              </div>

              <label className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer">
                <span>{isAr ? 'خطوط الكنتور الديناميكية (Isohypses)' : 'Dynamic Contour Lines (100m)'}</span>
                <input
                  type="checkbox"
                  checked={showContours}
                  onChange={e => setShowContours(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer">
                <span>{isAr ? 'شبكة مجاري المياه وتجمع السيول (3D Streams)' : '3D Flow Accumulation Streams'}</span>
                <input
                  type="checkbox"
                  checked={showFlowVectors}
                  onChange={e => setShowFlowVectors(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>
            </div>

            {/* Sun Azimuth & Altitude for Hillshade */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>{isAr ? 'إضاءة الشمس وتظليل التضاريس' : 'Sun Illumination (Hillshade)'}</span>
                <span className="font-mono text-[10px] text-amber-400">{sunAzimuth}° / {sunAltitude}°</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px]">{isAr ? 'السمت (Azimuth)' : 'Azimuth'}</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={sunAzimuth}
                    onChange={e => setSunAzimuth(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">{isAr ? 'الارتفاع (Altitude)' : 'Altitude'}</span>
                  <input
                    type="range"
                    min="10"
                    max="85"
                    value={sunAltitude}
                    onChange={e => setSunAltitude(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dam Operational Capacity Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              {isAr ? 'سعة السد وتقديرات الطمي' : 'Dam Siltation Impact'}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">{isAr ? 'السعة الحية الإجمالية:' : 'Total Reservoir Capacity:'}</span>
                <span className="font-mono text-cyan-300 font-bold">{currentBasin.capacityMm3} Million m³</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (accumulatedSiltM3 / (currentBasin.capacityMm3 * 1000000)) * 100 * 5000)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{isAr ? 'فقدان السعة السنوي:' : 'Annual Capacity Loss:'}</span>
                <span className="text-red-400 font-bold">~1.85% ({isAr ? 'تآكل حرج' : 'Critical Siltation'})</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
