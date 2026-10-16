import * as THREE from 'three';

/**
 * Procedural texture generator for luxury 3D chess and Cathedral Hall:
 * - Natural wood grain
 * - Carrara marble
 * - Mystic Runic Border with gold Elder Futhark runes
 * - Cathedral stone masonry, floor flagstones, stained glass, and rose window
 */

export function createWoodTexture(
  baseColor: string,
  grainColor: string,
  ringDensity: number = 30
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = grainColor;
  ctx.lineWidth = 1.2;

  for (let i = 0; i < ringDensity; i++) {
    const yBase = (i / ringDensity) * 512;
    ctx.beginPath();
    ctx.globalAlpha = 0.12 + Math.random() * 0.18;

    for (let x = 0; x <= 512; x += 16) {
      const wobble =
        Math.sin(x * 0.03 + i) * 6 +
        Math.sin(x * 0.08 + i * 2) * 2.5 +
        (Math.random() - 0.5) * 1.5;
      const y = yBase + wobble;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 0.06;
  ctx.fillStyle = grainColor;
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = 4 + Math.random() * 16;
    ctx.fillRect(x, y, len, 0.8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMarbleTexture(
  baseColor: string,
  veinColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 512);

  const numBlobs = 14;
  for (let i = 0; i < numBlobs; i++) {
    const grad = ctx.createRadialGradient(
      Math.random() * 512,
      Math.random() * 512,
      20,
      Math.random() * 512,
      Math.random() * 512,
      180
    );
    grad.addColorStop(0, veinColor);
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  ctx.strokeStyle = veinColor;
  for (let v = 0; v < 8; v++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.15 + Math.random() * 0.2;
    ctx.lineWidth = 0.8 + Math.random() * 2.0;

    let cx = Math.random() * 512;
    let cy = Math.random() * 512;
    ctx.moveTo(cx, cy);

    for (let step = 0; step < 24; step++) {
      cx += (Math.random() - 0.45) * 50;
      cy += (Math.random() - 0.5) * 40;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates the exact royal black marble border with gold filigree and ornate corner decorations
 * matching the user specification:
 * "تُحاط الرقعة بإطار عريض من الرخام الأسود اللامع، مزين بنقوش وزخارف ذهبية دقيقة على الحواف والزوايا"
 */
export function createRoyalBlackMarbleBorderTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Jet Black Polished Marble Base
  ctx.fillStyle = '#07080b';
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Realistic subtle gold, bronze, and platinum marble veins
  const veinColors = ['#dfb75c', '#c59b27', '#ffffff', '#94a3b8'];
  for (let i = 0; i < 30; i++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.06 + Math.random() * 0.12;
    ctx.strokeStyle = veinColors[i % veinColors.length];
    ctx.lineWidth = 0.5 + Math.random() * 2.2;
    let x = Math.random() * 1024;
    let y = Math.random() * 1024;
    ctx.moveTo(x, y);
    for (let s = 0; s < 18; s++) {
      x += (Math.random() - 0.48) * 75;
      y += (Math.random() - 0.5) * 75;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // 3. Ornate Double Gold Perimeter Borders
  ctx.globalAlpha = 0.95;
  ctx.strokeStyle = '#e5b83b';
  ctx.lineWidth = 4.5;
  ctx.strokeRect(24, 24, 976, 976);

  ctx.lineWidth = 1.8;
  ctx.strokeRect(34, 34, 956, 956);

  // Inner border adjacent to the squares (around 98px margin)
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#d4af37';
  ctx.strokeRect(96, 96, 832, 832);

  ctx.lineWidth = 1.2;
  ctx.strokeRect(104, 104, 816, 816);

  // 4. Helper to draw ornate Baroque / Royal Golden Corner Scrollwork
  const drawCornerFiligree = (cx: number, cy: number, flipX: number, flipY: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(flipX, flipY);

    ctx.strokeStyle = '#f3c846';
    ctx.fillStyle = '#f3c846';
    ctx.lineWidth = 2.2;

    // Corner L-bracket gold trim
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(60, 0);
    ctx.lineTo(60, 12);
    ctx.lineTo(12, 12);
    ctx.lineTo(12, 60);
    ctx.lineTo(0, 60);
    ctx.closePath();
    ctx.fill();

    // Ornate curved acanthus swirl
    ctx.beginPath();
    ctx.moveTo(16, 16);
    ctx.bezierCurveTo(45, 20, 50, 48, 25, 48);
    ctx.bezierCurveTo(15, 48, 18, 28, 38, 30);
    ctx.stroke();

    // Diamond accent stud
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(46, 46);
    ctx.lineTo(40, 52);
    ctx.lineTo(34, 46);
    ctx.closePath();
    ctx.fill();

    // Royal corner fleur-de-lis mini
    ctx.beginPath();
    ctx.arc(28, 28, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Draw 4 ornate corner filigrees
  drawCornerFiligree(36, 36, 1, 1);       // Top-left
  drawCornerFiligree(988, 36, -1, 1);     // Top-right
  drawCornerFiligree(36, 988, 1, -1);     // Bottom-left
  drawCornerFiligree(988, 988, -1, -1);   // Bottom-right

  // 5. Center Royal Crest / Palmette on 4 borders
  const drawCenterRoyalBadge = (cx: number, cy: number, rot: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    ctx.fillStyle = '#f3c846';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;

    // 4-point royal star badge
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(5, -6);
    ctx.lineTo(22, 0);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 22);
    ctx.lineTo(-5, 6);
    ctx.lineTo(-22, 0);
    ctx.lineTo(-5, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center jewel pip
    ctx.fillStyle = '#07080b';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  drawCenterRoyalBadge(512, 60, 0);            // Top
  drawCenterRoyalBadge(512, 964, 0);           // Bottom
  drawCenterRoyalBadge(60, 512, Math.PI / 2);  // Left
  drawCenterRoyalBadge(964, 512, Math.PI / 2); // Right

  // 6. Crisp Royal Engraved Coordinates (A-H, 1-8) in Brilliant Gold
  ctx.font = 'bold 26px "Cinzel", "Cairo", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#f5c542';

  const files = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const innerMargin = 104;
  const playfieldSpan = 1024 - innerMargin * 2;
  const squareW = playfieldSpan / 8;

  for (let i = 0; i < 8; i++) {
    const x = innerMargin + squareW * (i + 0.5);
    // Avoid drawing directly under center badge
    if (i !== 3 && i !== 4) {
      ctx.fillText(files[i], x, 970);
      ctx.fillText(files[i], x, 54);
    } else {
      ctx.fillText(files[i], x, 970);
      ctx.fillText(files[i], x, 54);
    }
  }

  for (let i = 0; i < 8; i++) {
    const rankNum = 8 - i;
    const y = innerMargin + squareW * (i + 0.5);
    ctx.fillText(rankNum.toString(), 54, y);
    ctx.fillText(rankNum.toString(), 970, y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates high-luxury Ivory White Marble with golden/champagne micro-veins
 */
export function createIvoryMarbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm Ivory Base
  ctx.fillStyle = '#faf6ee';
  ctx.fillRect(0, 0, 512, 512);

  // Soft champagne/warm gold ambient clouds
  for (let i = 0; i < 12; i++) {
    const grad = ctx.createRadialGradient(
      Math.random() * 512,
      Math.random() * 512,
      10,
      Math.random() * 512,
      Math.random() * 512,
      160
    );
    grad.addColorStop(0, 'rgba(235, 218, 185, 0.35)');
    grad.addColorStop(1, 'rgba(250, 246, 238, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  // Fine golden crystalline veins
  for (let v = 0; v < 7; v++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.18 + Math.random() * 0.15;
    ctx.strokeStyle = v % 2 === 0 ? '#dfc28d' : '#d5c4a1';
    ctx.lineWidth = 0.6 + Math.random() * 1.5;

    let cx = Math.random() * 512;
    let cy = Math.random() * 512;
    ctx.moveTo(cx, cy);

    for (let s = 0; s < 18; s++) {
      cx += (Math.random() - 0.46) * 45;
      cy += (Math.random() - 0.5) * 40;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates polished Obsidian Black Marble with platinum & gold veins
 */
export function createObsidianMarbleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Jet Black Base
  ctx.fillStyle = '#0c0e12';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle smoky clouds
  for (let i = 0; i < 10; i++) {
    const grad = ctx.createRadialGradient(
      Math.random() * 512,
      Math.random() * 512,
      15,
      Math.random() * 512,
      Math.random() * 512,
      140
    );
    grad.addColorStop(0, 'rgba(38, 44, 56, 0.4)');
    grad.addColorStop(1, 'rgba(12, 14, 18, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  // Fine platinum and deep gold veins
  for (let v = 0; v < 8; v++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.15 + Math.random() * 0.18;
    ctx.strokeStyle = v % 2 === 0 ? '#bfa15f' : '#64748b';
    ctx.lineWidth = 0.5 + Math.random() * 1.8;

    let cx = Math.random() * 512;
    let cy = Math.random() * 512;
    ctx.moveTo(cx, cy);

    for (let s = 0; s < 20; s++) {
      cx += (Math.random() - 0.48) * 48;
      cy += (Math.random() - 0.5) * 40;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates the runic border texture
 */
export function createRunicBorderTexture(): THREE.CanvasTexture {
  return createRoyalBlackMarbleBorderTexture();
}

/**
 * Creates realistic cathedral stone masonry wall texture
 */
export function createStoneBrickTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm sandstone base
  ctx.fillStyle = '#bca890';
  ctx.fillRect(0, 0, 512, 512);

  // Brick rows
  const rows = 16;
  const rowHeight = 512 / rows;
  const cols = 8;
  const colWidth = 512 / cols;

  for (let r = 0; r < rows; r++) {
    const y = r * rowHeight;
    const isOdd = r % 2 === 1;
    const xOffset = isOdd ? colWidth / 2 : 0;

    for (let c = -1; c <= cols; c++) {
      const x = c * colWidth + xOffset;
      const shadeNoise = (Math.random() - 0.5) * 35;
      const red = Math.floor(190 + shadeNoise);
      const green = Math.floor(170 + shadeNoise);
      const blue = Math.floor(145 + shadeNoise);

      ctx.fillStyle = `rgb(${red},${green},${blue})`;
      ctx.fillRect(x + 2, y + 2, colWidth - 4, rowHeight - 4);
    }
  }

  // Mortar lines
  ctx.strokeStyle = '#5c5044';
  ctx.lineWidth = 3;
  for (let r = 0; r <= rows; r++) {
    const y = r * rowHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Subtle surface noise
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Cathedral flagstone tiled floor texture
 */
export function createCathedralFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6e5e50';
  ctx.fillRect(0, 0, 512, 512);

  const tiles = 8;
  const tileSize = 512 / tiles;

  for (let r = 0; r < tiles; r++) {
    for (let c = 0; c < tiles; c++) {
      const x = c * tileSize;
      const y = r * tileSize;
      const noise = (Math.random() - 0.5) * 25;
      const val = Math.floor(95 + noise);

      ctx.fillStyle = `rgb(${val + 10},${val},${val - 8})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Subtle bevel/inner shadow
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
    }
  }

  ctx.strokeStyle = '#322a24';
  ctx.lineWidth = 4;
  for (let i = 0; i <= tiles; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, 512);
    ctx.moveTo(0, i * tileSize);
    ctx.lineTo(512, i * tileSize);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Cathedral stained glass window texture
 */
export function createStainedGlassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Light blue sky background
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#bae6fd');
  skyGrad.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 256, 512);

  // Gothic leaded tracery
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;

  // Outer Gothic arch
  ctx.beginPath();
  ctx.moveTo(10, 500);
  ctx.lineTo(10, 200);
  ctx.bezierCurveTo(10, 50, 128, 10, 128, 10);
  ctx.bezierCurveTo(128, 10, 246, 50, 246, 200);
  ctx.lineTo(246, 500);
  ctx.stroke();

  // Glass panes diamond grid
  ctx.lineWidth = 2;
  for (let y = 100; y < 500; y += 40) {
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(236, y);
    ctx.stroke();
  }
  for (let x = 30; x < 240; x += 35) {
    ctx.beginPath();
    ctx.moveTo(x, 150);
    ctx.lineTo(x, 500);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates large Gothic Rose Window texture
 */
export function createRoseWindowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep blue / cyan luminous circle
  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 240);
  grad.addColorStop(0, '#e0f2fe');
  grad.addColorStop(0.6, '#7dd3fc');
  grad.addColorStop(1, '#0284c7');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.fill();

  // Stone tracery spokes
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 8;
  const numSpokes = 16;
  for (let i = 0; i < numSpokes; i++) {
    const angle = (i * Math.PI * 2) / numSpokes;
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(256 + Math.cos(angle) * 240, 256 + Math.sin(angle) * 240);
    ctx.stroke();
  }

  // Concentric decorative rings
  ctx.lineWidth = 7;
  [60, 120, 180, 240].forEach((r) => {
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates coordinate border frame texture with A-H and 1-8 coordinates
 */
export function createBorderFrameTexture(woodColor: string, goldInlayColor: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = woodColor;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.strokeStyle = '#1a0d06';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 40; i++) {
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.moveTo(0, i * 26);
    ctx.bezierCurveTo(300, i * 26 + 10, 700, i * 26 - 10, 1024, i * 26 + 5);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = goldInlayColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, 944, 944);

  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, 928, 928);

  ctx.font = 'bold 30px "Cinzel", "Cairo", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = goldInlayColor;

  const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const innerMargin = 70;
  const boardPlaySpan = 1024 - innerMargin * 2;
  const squareSize = boardPlaySpan / 8;

  for (let i = 0; i < 8; i++) {
    const x = innerMargin + squareSize * (i + 0.5);
    ctx.fillText(cols[i], x, 1000);
    ctx.fillText(cols[i], x, 24);
  }

  for (let i = 0; i < 8; i++) {
    const rank = 8 - i;
    const y = innerMargin + squareSize * (i + 0.5);
    ctx.fillText(rank.toString(), 22, y);
    ctx.fillText(rank.toString(), 1002, y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
