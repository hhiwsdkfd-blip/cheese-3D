import * as THREE from 'three';
import { BoardTheme } from '../types/chess';
import {
  createWoodTexture,
  createMarbleTexture,
  createBorderFrameTexture,
  createRunicBorderTexture,
  createRoyalBlackMarbleBorderTexture,
  createIvoryMarbleTexture,
  createObsidianMarbleTexture,
} from './proceduralTextures';

export interface BoardGeometryData {
  boardGroup: THREE.Group;
  squareMeshes: Map<string, THREE.Mesh>;
  tableSurfaceMesh: THREE.Mesh;
  updateTheme: (theme: BoardTheme) => void;
}

export function squareToCoords(square: string): { file: number; rank: number } {
  const fileChar = square.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
  const rankNum = parseInt(square[1], 10) - 1; // '1' -> 0, '8' -> 7
  return { file: fileChar, rank: rankNum };
}

export function coordsToSquare(file: number, rank: number): string {
  const fileChar = String.fromCharCode(97 + file);
  return `${fileChar}${rank + 1}`;
}

export function squareToWorld(square: string): THREE.Vector3 {
  const { file, rank } = squareToCoords(square);
  // White side is at rank 0 (Z = 3.5), Black side is at rank 7 (Z = -3.5)
  // File 0 ('a') is X = -3.5, File 7 ('h') is X = 3.5
  const x = (file - 3.5) * 1.0;
  const z = (3.5 - rank) * 1.0;
  return new THREE.Vector3(x, 0.32, z);
}

export function worldToSquare(worldPos: THREE.Vector3): string | null {
  const file = Math.round(worldPos.x / 1.0 + 3.5);
  const rank = Math.round(3.5 - worldPos.z / 1.0);
  if (file >= 0 && file < 8 && rank >= 0 && rank < 8) {
    return coordsToSquare(file, rank);
  }
  return null;
}

export function buildChessBoard(theme: BoardTheme): BoardGeometryData {
  const boardGroup = new THREE.Group();
  boardGroup.name = 'chess_board_system';

  // 1. Table Top / Studio Luxury Surface beneath the board
  const tableGeo = new THREE.CylinderGeometry(9.5, 9.5, 0.4, 64);
  const tableMat = new THREE.MeshPhysicalMaterial({
    color: 0x111316,
    roughness: 0.7,
    metalness: 0.15,
    clearcoat: 0.3,
  });
  const tableSurfaceMesh = new THREE.Mesh(tableGeo, tableMat);
  tableSurfaceMesh.position.y = -0.22;
  tableSurfaceMesh.receiveShadow = true;
  boardGroup.add(tableSurfaceMesh);

  // Soft Contact shadow under the chess board
  const contactCanvas = document.createElement('canvas');
  contactCanvas.width = 256;
  contactCanvas.height = 256;
  const cctx = contactCanvas.getContext('2d')!;
  const grad = cctx.createRadialGradient(128, 128, 80, 128, 128, 126);
  grad.addColorStop(0, 'rgba(0,0,0,0.85)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  cctx.fillStyle = grad;
  cctx.fillRect(0, 0, 256, 256);
  const boardShadowTex = new THREE.CanvasTexture(contactCanvas);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(10.8, 10.8),
    new THREE.MeshBasicMaterial({ map: boardShadowTex, transparent: true, opacity: 0.65, depthWrite: false })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.005;
  boardGroup.add(shadowPlane);

  // 2. Main Board Plinth (Stepped Black Marble Altar)
  const plinthGeo = new THREE.BoxGeometry(9.64, 0.35, 9.64);
  const plinthMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(theme.borderWoodColor),
    roughness: 0.15,
    metalness: 0.2,
    clearcoat: 0.85,
    clearcoatRoughness: 0.1,
  });
  const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
  plinthMesh.position.y = 0.12;
  plinthMesh.castShadow = true;
  plinthMesh.receiveShadow = true;
  boardGroup.add(plinthMesh);

  // Recessed Gold Trim Groove around the plinth perimeter
  const goldTrimGeo = new THREE.BoxGeometry(9.72, 0.04, 9.72);
  const goldTrimMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xd4af37),
    metalness: 0.95,
    roughness: 0.12,
    clearcoat: 0.8,
  });
  const goldTrimMesh = new THREE.Mesh(goldTrimGeo, goldTrimMat);
  goldTrimMesh.position.y = -0.04;
  boardGroup.add(goldTrimMesh);

  // Stepped lower black marble base
  const lowerPlinthGeo = new THREE.BoxGeometry(10.4, 0.25, 10.4);
  const lowerPlinthMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x06070a),
    roughness: 0.25,
    metalness: 0.2,
    clearcoat: 0.7,
  });
  const lowerPlinthMesh = new THREE.Mesh(lowerPlinthGeo, lowerPlinthMat);
  lowerPlinthMesh.position.y = -0.16;
  lowerPlinthMesh.receiveShadow = true;
  boardGroup.add(lowerPlinthMesh);

  // 3D Sculpted Golden Corner Brackets at 4 corners of the board
  const cornerBracketMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xf3c846),
    metalness: 0.95,
    roughness: 0.12,
    clearcoat: 0.8,
  });
  const cornerPositions = [
    { x: -4.86, z: -4.86, rot: 0 },
    { x: 4.86, z: -4.86, rot: -Math.PI / 2 },
    { x: 4.86, z: 4.86, rot: Math.PI },
    { x: -4.86, z: 4.86, rot: Math.PI / 2 },
  ];
  cornerPositions.forEach((cp) => {
    const bracketGroup = new THREE.Group();
    // Corner L-block
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.12), cornerBracketMat);
    arm1.position.set(0.25, 0, 0.06);
    bracketGroup.add(arm1);

    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.5), cornerBracketMat);
    arm2.position.set(0.06, 0, 0.25);
    bracketGroup.add(arm2);

    // Corner Boss / Stud
    const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.15, 16), cornerBracketMat);
    stud.position.set(0.08, 0.05, 0.08);
    bracketGroup.add(stud);

    bracketGroup.position.set(cp.x, 0.29, cp.z);
    bracketGroup.rotation.y = cp.rot;
    boardGroup.add(bracketGroup);
  });

  // 3. Top Border Frame with HOLLOW INNER OPENING (so all 64 squares are 100% visible!)
  const frameShape = new THREE.Shape();
  // Outer border dimensions (9.8 x 9.8)
  frameShape.moveTo(-4.9, -4.9);
  frameShape.lineTo(4.9, -4.9);
  frameShape.lineTo(4.9, 4.9);
  frameShape.lineTo(-4.9, 4.9);
  frameShape.closePath();

  // Inner cutout hole (8.02 x 8.02) leaving the entire playfield visible
  const hole = new THREE.Path();
  hole.moveTo(-4.01, -4.01);
  hole.lineTo(4.01, -4.01);
  hole.lineTo(4.01, 4.01);
  hole.lineTo(-4.01, 4.01);
  hole.closePath();
  frameShape.holes.push(hole);

  const borderFrameGeo = new THREE.ShapeGeometry(frameShape);
  // Compute UV coordinates mapped from [0, 1] across the entire 9.8x9.8 span
  const posAttr = borderFrameGeo.attributes.position;
  const uvs = new Float32Array(posAttr.count * 2);
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    uvs[i * 2] = (x + 4.9) / 9.8;
    uvs[i * 2 + 1] = (y + 4.9) / 9.8;
  }
  borderFrameGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const borderTex =
    theme.id === 'royal-marble' || theme.id === 'cathedral-runic'
      ? createRoyalBlackMarbleBorderTexture()
      : createBorderFrameTexture(theme.borderWoodColor, theme.goldAccentColor);

  const borderFrameMat = new THREE.MeshPhysicalMaterial({
    map: borderTex,
    roughness: 0.12,
    metalness: 0.18,
    clearcoat: 0.95,
    clearcoatRoughness: 0.08,
    reflectivity: 0.9,
  });
  const borderFrameMesh = new THREE.Mesh(borderFrameGeo, borderFrameMat);
  borderFrameMesh.rotation.x = -Math.PI / 2;
  borderFrameMesh.position.y = 0.285;
  borderFrameMesh.receiveShadow = true;
  boardGroup.add(borderFrameMesh);

  // 4. Procedural Textures & Materials for Individual 64 Square Tiles
  const isRoyal = theme.id === 'royal-marble';
  const isCathedralOrMarble = theme.id === 'royal-marble' || theme.id === 'cathedral-runic' || theme.id === 'marble-obsidian';

  const lightTex =
    isRoyal
      ? createIvoryMarbleTexture()
      : isCathedralOrMarble
      ? createMarbleTexture('#faf8f5', '#d5cbbe')
      : createWoodTexture('#e4cca4', '#b89467', 22);

  const darkTex =
    isRoyal
      ? createObsidianMarbleTexture()
      : isCathedralOrMarble
      ? createMarbleTexture('#0e1116', '#cbd5e1')
      : createWoodTexture('#442514', '#2b160b', 28);

  const lightSquareMat = new THREE.MeshPhysicalMaterial({
    map: lightTex,
    color: new THREE.Color(theme.lightSquareColor),
    roughness: isCathedralOrMarble ? 0.08 : 0.4,
    metalness: theme.id === 'gold-titanium' ? 0.6 : 0.04,
    clearcoat: isCathedralOrMarble ? 0.95 : 0.5,
    clearcoatRoughness: 0.05,
    reflectivity: 0.95,
  });

  const darkSquareMat = new THREE.MeshPhysicalMaterial({
    map: darkTex,
    color: new THREE.Color(theme.darkSquareColor),
    roughness: isCathedralOrMarble ? 0.08 : 0.45,
    metalness: theme.id === 'gold-titanium' ? 0.7 : 0.08,
    clearcoat: isCathedralOrMarble ? 0.95 : 0.5,
    clearcoatRoughness: 0.05,
    reflectivity: 0.95,
  });

  // Individual beveled 3D square tile geometry (raised flush with the frame)
  const tileGeo = new THREE.BoxGeometry(0.98, 0.08, 0.98);
  const squareMeshes = new Map<string, THREE.Mesh>();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = coordsToSquare(file, rank);
      const isLight = (file + rank) % 2 !== 0;
      const mat = isLight ? lightSquareMat : darkSquareMat;

      const tileMesh = new THREE.Mesh(tileGeo, mat);
      const pos = squareToWorld(square);
      tileMesh.position.set(pos.x, 0.28, pos.z);
      tileMesh.receiveShadow = true;
      tileMesh.castShadow = true;
      tileMesh.userData = { square, isLight };

      boardGroup.add(tileMesh);
      squareMeshes.set(square, tileMesh);
    }
  }

  // Dynamic theme updater
  const updateTheme = (newTheme: BoardTheme) => {
    plinthMat.color.set(newTheme.borderWoodColor);

    const isNewRoyal = newTheme.id === 'royal-marble';
    const isNewMarble = isNewRoyal || newTheme.id === 'cathedral-runic' || newTheme.id === 'marble-obsidian';

    const newLightTex =
      isNewRoyal
        ? createIvoryMarbleTexture()
        : isNewMarble
        ? createMarbleTexture('#eceff1', '#90a4ae')
        : createWoodTexture('#e4cca4', '#b89467', 22);

    const newDarkTex =
      isNewRoyal
        ? createObsidianMarbleTexture()
        : isNewMarble
        ? createMarbleTexture('#181b20', '#37474f')
        : createWoodTexture('#442514', '#2b160b', 28);

    lightSquareMat.map = newLightTex;
    lightSquareMat.color.set(newTheme.lightSquareColor);
    lightSquareMat.roughness = isNewMarble ? 0.08 : 0.4;
    lightSquareMat.metalness = newTheme.id === 'gold-titanium' ? 0.6 : 0.04;
    lightSquareMat.needsUpdate = true;

    darkSquareMat.map = newDarkTex;
    darkSquareMat.color.set(newTheme.darkSquareColor);
    darkSquareMat.roughness = isNewMarble ? 0.08 : 0.45;
    darkSquareMat.metalness = newTheme.id === 'gold-titanium' ? 0.7 : 0.08;
    darkSquareMat.needsUpdate = true;

    const newBorderTex =
      isNewRoyal || newTheme.id === 'cathedral-runic'
        ? createRoyalBlackMarbleBorderTexture()
        : createBorderFrameTexture(newTheme.borderWoodColor, newTheme.goldAccentColor);
    borderFrameMat.map = newBorderTex;
    borderFrameMat.needsUpdate = true;
  };

  return {
    boardGroup,
    squareMeshes,
    tableSurfaceMesh,
    updateTheme,
  };
}
