import * as THREE from 'three';
import {
  createStoneBrickTexture,
  createCathedralFloorTexture,
  createStainedGlassTexture,
  createRoseWindowTexture,
} from './proceduralTextures';

export interface CathedralEnvironmentData {
  group: THREE.Group;
  updateFlames: (time: number) => void;
  dispose: () => void;
}

export function buildCathedralEnvironment(): CathedralEnvironmentData {
  const group = new THREE.Group();
  group.name = 'cathedral_environment';

  // 1. Cathedral Floor
  const floorTex = createCathedralFloorTexture();
  const floorGeo = new THREE.PlaneGeometry(60, 70);
  const floorMat = new THREE.MeshPhysicalMaterial({
    map: floorTex,
    roughness: 0.28,
    metalness: 0.15,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
    reflectivity: 0.7,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.01;
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // 2. Stone Masonry Material for Walls and Columns
  const stoneTex = createStoneBrickTexture();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: stoneTex,
    roughness: 0.75,
    metalness: 0.05,
  });

  // 3. Back Cathedral Wall (Z = -22)
  const backWallGeo = new THREE.BoxGeometry(44, 26, 1.5);
  const backWall = new THREE.Mesh(backWallGeo, stoneMat);
  backWall.position.set(0, 13, -22);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Back Wall Arched Doorway (Royal Carved Wood with Gold Studs & Iron Trim)
  const doorGroup = new THREE.Group();
  doorGroup.position.set(0, 3.75, -21.2);

  const doorGeo = new THREE.BoxGeometry(4.6, 7.6, 0.45);
  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x2e180d,
    roughness: 0.65,
    metalness: 0.15,
  });
  const door = new THREE.Mesh(doorGeo, doorMat);
  doorGroup.add(door);

  // Door Iron / Gold Straps
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, metalness: 0.85, roughness: 0.2 });
  const goldStudMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });

  [-2.2, 0, 2.2].forEach((yOff) => {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.25, 0.48), strapMat);
    strap.position.y = yOff;
    doorGroup.add(strap);

    [-1.8, -0.9, 0, 0.9, 1.8].forEach((xOff) => {
      const stud = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), goldStudMat);
      stud.position.set(xOff, yOff, 0.26);
      doorGroup.add(stud);
    });
  });

  // Royal Golden Door Ring Knockers
  [-0.9, 0.9].forEach((xOff) => {
    const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 8, 16), goldStudMat);
    knocker.position.set(xOff, 0.2, 0.28);
    doorGroup.add(knocker);
  });
  group.add(doorGroup);

  // Gothic Rose Window (Center Back above door)
  const roseTex = createRoseWindowTexture();
  const roseGeo = new THREE.CircleGeometry(4.4, 32);
  const roseMat = new THREE.MeshBasicMaterial({
    map: roseTex,
    side: THREE.DoubleSide,
  });
  const roseWindow = new THREE.Mesh(roseGeo, roseMat);
  roseWindow.position.set(0, 14.5, -21.1);
  group.add(roseWindow);

  // Arched Side Windows on Back Wall
  const stainedGlassTex = createStainedGlassTexture();
  const windowMat = new THREE.MeshBasicMaterial({
    map: stainedGlassTex,
    side: THREE.DoubleSide,
  });
  [-11, -6, 6, 11].forEach((x) => {
    const winGeo = new THREE.PlaneGeometry(2.4, 8.5);
    const winMesh = new THREE.Mesh(winGeo, windowMat);
    winMesh.position.set(x, 12.0, -21.15);
    group.add(winMesh);
  });

  // Golden Cinematic Sunlight Godrays streaming from the high Gothic windows toward the board
  // "تدخل أشعة الشمس الذهبية من النوافذ لتمنح المكان إضاءة سينمائية دافئة"
  const godrayMat = new THREE.MeshBasicMaterial({
    color: 0xffdf78,
    transparent: true,
    opacity: 0.075,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  [-11, -6, 0, 6, 11].forEach((x, idx) => {
    // Volumetric cone/wedge projecting from window down to floor level
    const rayGeo = new THREE.CylinderGeometry(0.6, 3.8, 26, 16, 1, true);
    const rayMesh = new THREE.Mesh(rayGeo, godrayMat);
    rayMesh.position.set(x * 0.7, 10.5, -9.5);
    rayMesh.rotation.x = Math.PI / 4.2;
    rayMesh.rotation.z = (x > 0 ? -0.1 : 0.1) * (idx % 2 === 0 ? 1 : 0.5);
    group.add(rayMesh);
  });

  // 4. Left and Right Hall Walls
  const sideWallGeo = new THREE.BoxGeometry(1.5, 26, 44);
  const leftWall = new THREE.Mesh(sideWallGeo, stoneMat);
  leftWall.position.set(-20, 13, 0);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo, stoneMat);
  rightWall.position.set(20, 13, 0);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // 5. Gothic Fluted Columns (Arranged symmetrically in pairs)
  function createGothicColumn(): THREE.Group {
    const colGroup = new THREE.Group();

    // Base Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 2.4), stoneMat);
    plinth.position.y = 0.6;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    colGroup.add(plinth);

    // Torus Base
    const torusBase = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.5, 24), stoneMat);
    torusBase.position.y = 1.45;
    colGroup.add(torusBase);

    // Main Column Shaft (Cluster of 4 fluted cylinders)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 17, 24), stoneMat);
    shaft.position.y = 10.2;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    colGroup.add(shaft);

    // Fluting sub-shafts around column
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const sub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 17, 12), stoneMat);
      sub.position.set(Math.cos(angle) * 0.92, 10.2, Math.sin(angle) * 0.92);
      colGroup.add(sub);
    }

    // Capital Header
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.4, 2.2), stoneMat);
    cap.position.y = 19.4;
    colGroup.add(cap);

    return colGroup;
  }

  // Position 6 majestic columns (3 on left, 3 on right)
  const columnPositions = [
    { x: -12.5, z: -10 },
    { x: -12.5, z: 2 },
    { x: -12.5, z: 14 },
    { x: 12.5, z: -10 },
    { x: 12.5, z: 2 },
    { x: 12.5, z: 14 },
  ];

  columnPositions.forEach((pos) => {
    const col = createGothicColumn();
    col.position.set(pos.x, 0, pos.z);
    group.add(col);
  });

  // 6. Two Burning Medieval Braziers / Torches (Flanking the board)
  const brazierPedestalGeo = new THREE.BoxGeometry(2.4, 1.0, 2.4);
  const ironBarMat = new THREE.MeshStandardMaterial({
    color: 0x1c1917,
    roughness: 0.8,
    metalness: 0.7,
  });

  const flameLights: THREE.PointLight[] = [];
  const flameMeshes: THREE.Mesh[] = [];

  function createBrazier(x: number, z: number) {
    const bGroup = new THREE.Group();
    bGroup.position.set(x, 0, z);

    // Stone Pedestal
    const ped = new THREE.Mesh(brazierPedestalGeo, stoneMat);
    ped.position.y = 0.5;
    ped.castShadow = true;
    ped.receiveShadow = true;
    bGroup.add(ped);

    // Stepped Upper Pedestal
    const pedTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 1.8), stoneMat);
    pedTop.position.y = 1.2;
    bGroup.add(pedTop);

    // Iron Cauldron Bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 0.9, 16, 1, true), ironBarMat);
    bowl.position.y = 1.8;
    bowl.castShadow = true;
    bGroup.add(bowl);

    // Curved Iron Basket Ribs
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), ironBarMat);
      rib.position.set(Math.cos(angle) * 1.22, 1.9, Math.sin(angle) * 1.22);
      bGroup.add(rib);
    }

    // Glowing Embers Bed
    const emberMat = new THREE.MeshBasicMaterial({ color: 0xff3b00 });
    const embers = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.7, 0.2, 16), emberMat);
    embers.position.y = 1.7;
    bGroup.add(embers);

    // Multi-layered Animated Fire Flame Cones
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      transparent: true,
      opacity: 0.88,
    });
    const flameGeo = new THREE.ConeGeometry(0.85, 2.2, 8, 1, true);
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = 2.8;
    bGroup.add(flameMesh);
    flameMeshes.push(flameMesh);

    // Inner Core Flame
    const coreFlameMat = new THREE.MeshBasicMaterial({
      color: 0xfff066,
      transparent: true,
      opacity: 0.95,
    });
    const coreFlameGeo = new THREE.ConeGeometry(0.5, 1.8, 8, 1, true);
    const coreFlameMesh = new THREE.Mesh(coreFlameGeo, coreFlameMat);
    coreFlameMesh.position.y = 2.6;
    bGroup.add(coreFlameMesh);
    flameMeshes.push(coreFlameMesh);

    // Warm Flickering Fire Point Light
    const fireLight = new THREE.PointLight(0xff7700, 3.5, 16, 1.2);
    fireLight.position.set(0, 2.9, 0);
    fireLight.castShadow = true;
    fireLight.shadow.bias = -0.002;
    bGroup.add(fireLight);
    flameLights.push(fireLight);

    group.add(bGroup);
  }

  // Create Left & Right Braziers as seen in screenshots
  createBrazier(-7.6, 0);
  createBrazier(7.6, 0);

  // Flame animation updater
  const updateFlames = (now: number) => {
    const t = now * 0.005;
    flameMeshes.forEach((mesh, idx) => {
      const wobble = Math.sin(t * 3 + idx) * 0.12;
      mesh.scale.set(1.0 + wobble, 1.0 + Math.cos(t * 4 + idx) * 0.22, 1.0 + wobble);
      mesh.rotation.y += 0.02;
    });

    flameLights.forEach((light, idx) => {
      // Natural fire flicker intensity
      light.intensity = 3.2 + Math.sin(t * 7 + idx * 2) * 0.6 + (Math.random() - 0.5) * 0.3;
    });
  };

  const dispose = () => {
    floorTex.dispose();
    stoneTex.dispose();
    stainedGlassTex.dispose();
    roseTex.dispose();
    floorGeo.dispose();
    floorMat.dispose();
    stoneMat.dispose();
  };

  return {
    group,
    updateFlames,
    dispose,
  };
}
