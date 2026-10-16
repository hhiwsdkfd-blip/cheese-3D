import * as THREE from 'three';
import { PieceType, PieceColor, BoardTheme, PieceStyleId } from '../types/chess';

// Shared procedural contact shadow texture
let cachedShadowTexture: THREE.CanvasTexture | null = null;
function getContactShadowTexture(): THREE.CanvasTexture {
  if (cachedShadowTexture) return cachedShadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 60);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
  gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.4)');
  gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.12)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  cachedShadowTexture = new THREE.CanvasTexture(canvas);
  return cachedShadowTexture;
}

export class PieceFactory {
  public style: PieceStyleId = 'royal'; // Default matching user request for Royal Armies

  private materialsWhite: {
    body: THREE.MeshPhysicalMaterial;
    accent: THREE.MeshPhysicalMaterial;
    felt: THREE.MeshStandardMaterial;
    steel: THREE.MeshStandardMaterial;
  };
  private materialsBlack: {
    body: THREE.MeshPhysicalMaterial;
    accent: THREE.MeshPhysicalMaterial;
    felt: THREE.MeshStandardMaterial;
    steel: THREE.MeshStandardMaterial;
  };
  private shadowMaterial: THREE.MeshBasicMaterial;

  constructor(theme: BoardTheme, style: PieceStyleId = 'royal') {
    this.style = style;

    this.shadowMaterial = new THREE.MeshBasicMaterial({
      map: getContactShadowTexture(),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });

    this.materialsWhite = this.buildMaterials(
      theme.whitePieceColor,
      theme.whitePieceMetalness,
      theme.whitePieceRoughness,
      theme.goldAccentColor,
      theme.accentMetalness,
      theme.accentRoughness,
      theme.lightFeltColor
    );

    this.materialsBlack = this.buildMaterials(
      theme.blackPieceColor,
      theme.blackPieceMetalness,
      theme.blackPieceRoughness,
      theme.goldAccentColor,
      theme.accentMetalness,
      theme.accentRoughness,
      theme.darkFeltColor
    );
  }

  private buildMaterials(
    bodyColor: string,
    bodyMetalness: number,
    bodyRoughness: number,
    accentColor: string,
    accentMetalness: number,
    accentRoughness: number,
    feltColor: string
  ) {
    const isFantasy = this.style === 'fantasy';

    const body = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(bodyColor),
      metalness: isFantasy ? 0.2 : bodyMetalness,
      roughness: isFantasy ? 0.08 : bodyRoughness,
      transmission: isFantasy ? 0.75 : 0,
      ior: isFantasy ? 1.52 : 1.45,
      thickness: isFantasy ? 1.2 : 0,
      clearcoat: 0.6,
      clearcoatRoughness: 0.12,
      reflectivity: 0.85,
    });

    const accent = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accentColor),
      metalness: accentMetalness,
      roughness: accentRoughness,
      clearcoat: 0.75,
      clearcoatRoughness: 0.1,
    });

    const steel = new THREE.MeshStandardMaterial({
      color: 0xd4d8df,
      metalness: 0.85,
      roughness: 0.2,
    });

    const felt = new THREE.MeshStandardMaterial({
      color: new THREE.Color(feltColor),
      roughness: 0.95,
      metalness: 0.05,
    });

    return { body, accent, felt, steel };
  }

  public setCustomColors(whiteColor: string, blackColor: string, style?: PieceStyleId) {
    if (style) this.style = style;
    this.materialsWhite.body.color.set(whiteColor);
    this.materialsBlack.body.color.set(blackColor);
    if (this.style === 'fantasy') {
      this.materialsWhite.body.transmission = 0.75;
      this.materialsBlack.body.transmission = 0.75;
      this.materialsWhite.body.roughness = 0.08;
      this.materialsBlack.body.roughness = 0.08;
    } else {
      this.materialsWhite.body.transmission = 0;
      this.materialsBlack.body.transmission = 0;
    }
  }

  public updateTheme(theme: BoardTheme) {
    this.materialsWhite.body.color.set(theme.whitePieceColor);
    this.materialsWhite.body.metalness = theme.whitePieceMetalness;
    this.materialsWhite.body.roughness = theme.whitePieceRoughness;

    this.materialsWhite.accent.color.set(theme.goldAccentColor);
    this.materialsWhite.accent.metalness = theme.accentMetalness;
    this.materialsWhite.accent.roughness = theme.accentRoughness;

    this.materialsBlack.body.color.set(theme.blackPieceColor);
    this.materialsBlack.body.metalness = theme.blackPieceMetalness;
    this.materialsBlack.body.roughness = theme.blackPieceRoughness;

    this.materialsBlack.accent.color.set(theme.goldAccentColor);
    this.materialsBlack.accent.metalness = theme.accentMetalness;
    this.materialsBlack.accent.roughness = theme.accentRoughness;
  }

  private addContactShadow(group: THREE.Group, radius: number = 0.5) {
    const shadowGeo = new THREE.PlaneGeometry(radius * 2, radius * 2);
    const shadowMesh = new THREE.Mesh(shadowGeo, this.shadowMaterial);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    shadowMesh.renderOrder = 1;
    group.add(shadowMesh);
  }

  /**
   * Helper to create a miniature medieval heater shield with gold cross emblem
   */
  private createShield(mats: any): THREE.Group {
    const shieldGroup = new THREE.Group();

    const shape = new THREE.Shape();
    shape.moveTo(-0.14, 0.22);
    shape.lineTo(0.14, 0.22);
    shape.lineTo(0.14, -0.05);
    shape.bezierCurveTo(0.14, -0.22, 0, -0.28, 0, -0.32);
    shape.bezierCurveTo(0, -0.28, -0.14, -0.22, -0.14, -0.05);
    shape.closePath();

    const shieldGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, mats.body);
    shieldMesh.castShadow = true;
    shieldGroup.add(shieldMesh);

    // Golden Cross Emblem on Shield
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.32, 0.01), mats.accent);
    vBar.position.set(0, -0.03, 0.032);
    shieldGroup.add(vBar);

    const hBar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.01), mats.accent);
    hBar.position.set(0, 0.05, 0.032);
    shieldGroup.add(hBar);

    return shieldGroup;
  }

  /**
   * Helper to create a miniature medieval sword
   */
  private createSword(mats: any): THREE.Group {
    const swordGroup = new THREE.Group();

    // Steel Blade
    const bladeGeo = new THREE.BoxGeometry(0.04, 0.55, 0.015);
    const blade = new THREE.Mesh(bladeGeo, mats.steel);
    blade.position.y = 0.32;
    blade.castShadow = true;
    swordGroup.add(blade);

    // Tip
    const tipGeo = new THREE.ConeGeometry(0.025, 0.08, 4);
    const tip = new THREE.Mesh(tipGeo, mats.steel);
    tip.position.y = 0.62;
    swordGroup.add(tip);

    // Golden Crossguard
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.03), mats.accent);
    guard.position.y = 0.05;
    guard.castShadow = true;
    swordGroup.add(guard);

    // Grip & Pommel
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8), mats.body);
    grip.position.y = -0.01;
    swordGroup.add(grip);

    const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), mats.accent);
    pommel.position.y = -0.07;
    swordGroup.add(pommel);

    return swordGroup;
  }

  /**
   * Universal stepped base
   */
  private createBase(mats: any, scaleRadius: number = 1.0) {
    const group = new THREE.Group();
    const r = scaleRadius;

    // Felt pad
    const feltGeo = new THREE.CylinderGeometry(0.38 * r, 0.38 * r, 0.02, 32);
    const feltMesh = new THREE.Mesh(feltGeo, mats.felt);
    feltMesh.position.y = 0.01;
    group.add(feltMesh);

    // Stepped Lathe Base Pedestal
    const basePoints: THREE.Vector2[] = [
      new THREE.Vector2(0, 0.02),
      new THREE.Vector2(0.42 * r, 0.02),
      new THREE.Vector2(0.42 * r, 0.07),
      new THREE.Vector2(0.38 * r, 0.12),
      new THREE.Vector2(0.36 * r, 0.18),
      new THREE.Vector2(0.29 * r, 0.28),
      new THREE.Vector2(0.26 * r, 0.36),
      new THREE.Vector2(0.28 * r, 0.40),
      new THREE.Vector2(0.25 * r, 0.44),
    ];
    const baseGeo = new THREE.LatheGeometry(basePoints, 32);
    baseGeo.computeVertexNormals();
    const baseMesh = new THREE.Mesh(baseGeo, mats.body);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Accent metallic collar ring
    const ringGeo = new THREE.TorusGeometry(0.25 * r, 0.024 * r, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, mats.accent);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.41;
    ringMesh.castShadow = true;
    group.add(ringMesh);

    // Accent metallic lower rim ring on marble pedestal
    const lowerRimGeo = new THREE.TorusGeometry(0.41 * r, 0.022 * r, 16, 32);
    const lowerRim = new THREE.Mesh(lowerRimGeo, mats.accent);
    lowerRim.rotation.x = Math.PI / 2;
    lowerRim.position.y = 0.055;
    lowerRim.castShadow = true;
    group.add(lowerRim);

    return { group, topY: 0.44 };
  }

  /**
   * PAWN (بيدق - جندي مدرع صغير):
   * In 'royal' & 'wizard' style: Noble medieval armored infantry knight
   * with polished helm, chest armor plate, heater shield & sword.
   */
  public createPawn(color: PieceColor): THREE.Group {
    const mats = color === 'w' ? this.materialsWhite : this.materialsBlack;
    const pawn = new THREE.Group();
    pawn.name = `pawn_${color}`;
    this.addContactShadow(pawn, 0.48);

    const { group: baseGroup, topY } = this.createBase(mats, 0.9);
    pawn.add(baseGroup);

    if (this.style === 'modern') {
      // Sleek minimalist cylinder with beveled spherical cap
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.65, 24), mats.body);
      cyl.position.y = topY + 0.32;
      cyl.castShadow = true;
      pawn.add(cyl);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), mats.accent);
      cap.position.y = topY + 0.65;
      cap.castShadow = true;
      pawn.add(cap);
      return pawn;
    }

    // Body Column
    const waistPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.22, topY),
      new THREE.Vector2(0.18, topY + 0.16),
      new THREE.Vector2(0.14, topY + 0.35),
      new THREE.Vector2(0.17, topY + 0.50),
      new THREE.Vector2(0.13, topY + 0.54),
    ];
    const waistGeo = new THREE.LatheGeometry(waistPoints, 32);
    const waistMesh = new THREE.Mesh(waistGeo, mats.body);
    waistMesh.castShadow = true;
    pawn.add(waistMesh);

    // Collar Bead
    const bead = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 16, 32), mats.accent);
    bead.rotation.x = Math.PI / 2;
    bead.position.y = topY + 0.51;
    pawn.add(bead);

    // Head / Kettle Helmet
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 32, 24), mats.body);
    head.position.y = topY + 0.70;
    head.castShadow = true;
    pawn.add(head);

    // Royal / Medieval Style Accessories (Armored Soldier with Shield & Sword)
    if (this.style === 'royal' || this.style === 'wizard') {
      // Kettle Helm / Sallet Brim
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.03, 24), mats.accent);
      brim.position.y = topY + 0.69;
      pawn.add(brim);

      // Crest Spire / Ridge Comb
      const helmetSpire = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 16), mats.accent);
      helmetSpire.position.y = topY + 0.93;
      pawn.add(helmetSpire);

      // Helmet Visor Slit (Realistic visor slot)
      const visorSlit = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.02), mats.accent);
      visorSlit.position.set(0, topY + 0.70, 0.18);
      pawn.add(visorSlit);

      // Chest Heraldic Cross / Cuirass (Armored Soldier)
      const chestV = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.22, 0.015), mats.accent);
      chestV.position.set(0, topY + 0.36, 0.16);
      pawn.add(chestV);

      const chestH = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.035, 0.015), mats.accent);
      chestH.position.set(0, topY + 0.42, 0.16);
      pawn.add(chestH);

      // Heater Shield mounted on the left side with golden cross
      const shield = this.createShield(mats);
      shield.position.set(-0.21, topY + 0.44, 0.14);
      shield.rotation.y = 0.35;
      pawn.add(shield);

      // Upright Sword mounted on the right side
      const sword = this.createSword(mats);
      sword.position.set(0.21, topY + 0.36, 0.10);
      sword.rotation.z = -0.15;
      sword.rotation.x = 0.15;
      pawn.add(sword);
    } else {
      // Classic top pip
      const pip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), mats.accent);
      pip.position.y = topY + 0.90;
      pawn.add(pip);
    }

    return pawn;
  }

  /**
   * ROOK (قلعة / رخ):
   * Fortified castle stone watchtower with battlements and window slits
   */
  public createRook(color: PieceColor): THREE.Group {
    const mats = color === 'w' ? this.materialsWhite : this.materialsBlack;
    const rook = new THREE.Group();
    rook.name = `rook_${color}`;
    this.addContactShadow(rook, 0.56);

    const { group: baseGroup, topY } = this.createBase(mats, 1.05);
    rook.add(baseGroup);

    // Tapering Stone Tower
    const towerPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.26, topY),
      new THREE.Vector2(0.24, topY + 0.25),
      new THREE.Vector2(0.22, topY + 0.55),
      new THREE.Vector2(0.21, topY + 0.78),
      new THREE.Vector2(0.28, topY + 0.88),
      new THREE.Vector2(0.30, topY + 0.95),
    ];
    const towerGeo = new THREE.LatheGeometry(towerPoints, 32);
    const towerMesh = new THREE.Mesh(towerGeo, mats.body);
    towerMesh.castShadow = true;
    rook.add(towerMesh);

    // Golden Corbel Collar
    const corbel = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.026, 16, 32), mats.accent);
    corbel.rotation.x = Math.PI / 2;
    corbel.position.y = topY + 0.88;
    rook.add(corbel);

    // Parapet Floor
    const innerFloor = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.05, 32), mats.body);
    innerFloor.position.y = topY + 0.97;
    rook.add(innerFloor);

    // 4 Sculpted Crenellations (Merlons)
    const crenY = topY + 1.10;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const cren = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.25, 0.12), mats.body);
      const dist = 0.24;
      cren.position.set(Math.cos(angle) * dist, crenY, Math.sin(angle) * dist);
      cren.rotation.y = -angle + Math.PI / 2;
      cren.castShadow = true;
      rook.add(cren);

      if (this.style === 'royal' || this.style === 'wizard') {
        // Golden finial on each corner
        const finial = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 8), mats.accent);
        finial.position.set(Math.cos(angle) * dist, crenY + 0.16, Math.sin(angle) * dist);
        rook.add(finial);
      }
    }

    // Arrow Slit Embrasures on the tower walls
    if (this.style === 'royal' || this.style === 'wizard') {
      [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((angle) => {
        const slit = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.04), mats.accent);
        const dist = 0.23;
        slit.position.set(Math.cos(angle) * dist, topY + 0.55, Math.sin(angle) * dist);
        slit.rotation.y = -angle;
        rook.add(slit);
      });
    }

    return rook;
  }

  /**
   * KNIGHT (حصان / فرس / فارس مدرع):
   * Sculpted horse bust with arched neck, ears, and knightly armour plates
   */
  public createKnight(color: PieceColor): THREE.Group {
    const mats = color === 'w' ? this.materialsWhite : this.materialsBlack;
    const knight = new THREE.Group();
    knight.name = `knight_${color}`;
    this.addContactShadow(knight, 0.55);

    const { group: baseGroup, topY } = this.createBase(mats, 1.05);
    knight.add(baseGroup);

    // Pedestal transition plinth
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 0.2, 32),
      mats.body
    );
    plinth.position.y = topY + 0.1;
    plinth.castShadow = true;
    knight.add(plinth);

    // Sculpted Equine Bust
    const horseShape = new THREE.Shape();
    horseShape.moveTo(-0.16, 0);
    horseShape.bezierCurveTo(-0.25, 0.35, -0.22, 0.75, -0.05, 0.95);
    horseShape.lineTo(0.04, 1.02);
    horseShape.bezierCurveTo(0.12, 0.98, 0.26, 0.78, 0.34, 0.65);
    horseShape.bezierCurveTo(0.38, 0.58, 0.35, 0.50, 0.26, 0.48);
    horseShape.lineTo(0.18, 0.49);
    horseShape.bezierCurveTo(0.15, 0.40, 0.10, 0.30, 0.12, 0.15);
    horseShape.bezierCurveTo(0.14, 0.08, 0.16, 0.04, 0.18, 0);
    horseShape.closePath();

    const horseGeo = new THREE.ExtrudeGeometry(horseShape, {
      steps: 2,
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
    });
    horseGeo.center();
    const horseMesh = new THREE.Mesh(horseGeo, mats.body);
    horseMesh.position.set(0, topY + 0.72, 0);
    horseMesh.rotation.y = Math.PI / 2;
    horseMesh.castShadow = true;
    knight.add(horseMesh);

    // Pointed Horse Ears
    const earGeo = new THREE.ConeGeometry(0.05, 0.18, 8);
    const leftEar = new THREE.Mesh(earGeo, mats.body);
    leftEar.position.set(-0.06, topY + 1.26, 0.02);
    leftEar.rotation.z = 0.25;
    knight.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, mats.body);
    rightEar.position.set(0.06, topY + 1.26, 0.02);
    rightEar.rotation.z = -0.25;
    knight.add(rightEar);

    // Golden Bridle / Eyes
    const eyeGeo = new THREE.SphereGeometry(0.035, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, mats.accent);
    leftEye.position.set(-0.14, topY + 1.05, 0.16);
    knight.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, mats.accent);
    rightEye.position.set(0.14, topY + 1.05, 0.16);
    knight.add(rightEye);

    // Knight Armor Chanfron Plate (Frontal forehead armor plate for warhorse)
    if (this.style === 'royal' || this.style === 'wizard') {
      const chanfron = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.03), mats.accent);
      chanfron.position.set(0, topY + 1.08, 0.21);
      chanfron.rotation.x = 0.28;
      chanfron.castShadow = true;
      knight.add(chanfron);

      // Chanfron Spire Spike
      const chanfronSpike = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.12, 8), mats.accent);
      chanfronSpike.position.set(0, topY + 1.18, 0.25);
      chanfronSpike.rotation.x = 0.75;
      knight.add(chanfronSpike);

      // Mane Golden Armor Segment Plates
      for (let m = 0; m < 3; m++) {
        const manePlate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.14), mats.accent);
        manePlate.position.set(0, topY + 0.82 + m * 0.15, -0.16 - m * 0.03);
        knight.add(manePlate);
      }
    }

    return knight;
  }

  /**
   * BISHOP (فيل / ساحر الكاتدرائية):
   * In 'wizard' style: High mitre with golden crozier wizard staff and spellbook!
   */
  public createBishop(color: PieceColor): THREE.Group {
    const mats = color === 'w' ? this.materialsWhite : this.materialsBlack;
    const bishop = new THREE.Group();
    bishop.name = `bishop_${color}`;
    this.addContactShadow(bishop, 0.52);

    const { group: baseGroup, topY } = this.createBase(mats, 1.0);
    bishop.add(baseGroup);

    // Fluted Column Waist
    const bodyPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.24, topY),
      new THREE.Vector2(0.21, topY + 0.20),
      new THREE.Vector2(0.16, topY + 0.45),
      new THREE.Vector2(0.14, topY + 0.70),
      new THREE.Vector2(0.20, topY + 0.95),
      new THREE.Vector2(0.15, topY + 1.00),
    ];
    const bodyGeo = new THREE.LatheGeometry(bodyPoints, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, mats.body);
    bodyMesh.castShadow = true;
    bishop.add(bodyMesh);

    // Heraldic Golden Cross on Bishop Robe
    const bishopV = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.01), mats.accent);
    bishopV.position.set(0, topY + 0.50, 0.18);
    bishop.add(bishopV);

    const bishopH = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.01), mats.accent);
    bishopH.position.set(0, topY + 0.58, 0.18);
    bishop.add(bishopH);

    // Accent Collar Ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.025, 16, 32), mats.accent);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = topY + 0.95;
    bishop.add(ring);

    // Teardrop Mitre Head
    const headPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.15, topY + 1.00),
      new THREE.Vector2(0.22, topY + 1.15),
      new THREE.Vector2(0.23, topY + 1.28),
      new THREE.Vector2(0.17, topY + 1.45),
      new THREE.Vector2(0.04, topY + 1.62),
    ];
    const headGeo = new THREE.LatheGeometry(headPoints, 32);
    const headMesh = new THREE.Mesh(headGeo, mats.body);
    headMesh.castShadow = true;
    bishop.add(headMesh);

    // Golden Mitre Finial
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), mats.accent);
    finial.position.y = topY + 1.68;
    bishop.add(finial);

    // Wizard Staff / Royal Guard Crozier (matches screenshot 3!)
    if (this.style === 'royal' || this.style === 'wizard') {
      const staffGroup = new THREE.Group();
      // Staff Pole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 12), mats.accent);
      pole.position.y = 0.7;
      staffGroup.add(pole);

      // Spiral Crozier Head
      const crozierHead = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.024, 12, 24, Math.PI * 1.5), mats.accent);
      crozierHead.position.set(0.08, 1.45, 0);
      crozierHead.rotation.z = -0.5;
      staffGroup.add(crozierHead);

      staffGroup.position.set(0.26, topY + 0.1, 0.12);
      staffGroup.castShadow = true;
      bishop.add(staffGroup);
    }

    return bishop;
  }

  /**
   * QUEEN (وزير / ملكة الكاتدرائية):
   * High Gothic queen with rayed spiked golden crown and royal sceptre
   */
  public createQueen(color: PieceColor): THREE.Group {
    const mats = color === 'w' ? this.materialsWhite : this.materialsBlack;
    const queen = new THREE.Group();
    queen.name = `queen_${color}`;
    this.addContactShadow(queen, 0.58);

    const { group: baseGroup, topY } = this.createBase(mats, 1.15);
    queen.add(baseGroup);

    // Hourglass Royal Gown
    const gownPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.27, topY),
      new THREE.Vector2(0.24, topY + 0.22),
      new THREE.Vector2(0.17, topY + 0.60),
      new THREE.Vector2(0.15, topY + 0.90),
      new THREE.Vector2(0.23, topY + 1.10),
      new THREE.Vector2(0.17, topY + 1.18),
    ];
    const gownGeo = new THREE.LatheGeometry(gownPoints, 32);
    const gownMesh = new THREE.Mesh(gownGeo, mats.body);
    gownMesh.castShadow = true;
    queen.add(gownMesh);

    // Waist Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.028, 16, 32), mats.accent);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = topY + 1.10;
    queen.add(collar);

    // Flared Coronet Cup
    const coronetPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.17, topY + 1.18),
      new THREE.Vector2(0.23, topY + 1.30),
      new THREE.Vector2(0.32, topY + 1.52),
    ];
    const coronet = new THREE.Mesh(new THREE.LatheGeometry(coronetPoints, 32), mats.body);
    coronet.castShadow = true;
    queen.add(coronet);

    // Spiked Crown Rays (matches screenshot 3!)
    const numPetals = 8;
    for (let i = 0; i < numPetals; i++) {
      const angle = (i * Math.PI * 2) / numPetals;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 8), mats.accent);
      spike.position.set(Math.cos(angle) * 0.31, topY + 1.58, Math.sin(angle) * 0.31);
      queen.add(spike);
    }

    // Apex Golden Pearl Jewel
    const apexJewel = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), mats.accent);
    apexJewel.position.y = topY + 1.62;
    queen.add(apexJewel);

    // Royal Sceptre in 'royal' and 'wizard' style
    if (this.style === 'royal' || this.style === 'wizard') {
      const sceptre = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.2, 12), mats.accent);
      sceptre.position.set(-0.28, topY + 0.8, 0.12);
      sceptre.rotation.z = 0.2;
      queen.add(sceptre);

      const sceptreHead = new THREE.Mesh(new THREE.OctahedronGeometry(0.06), mats.accent);
      sceptreHead.position.set(-0.40, topY + 1.35, 0.12);
      queen.add(sceptreHead);
    }

    return queen;
  }

  /**
   * KING (ملك الكاتدرائية):
   * High monarch with imperial domed crown, cross pattée, and heraldic broadsword
   */
  public createKing(color: PieceColor): THREE.Group {
    const mats = color === 'w' ? this.materialsWhite : this.materialsBlack;
    const king = new THREE.Group();
    king.name = `king_${color}`;
    this.addContactShadow(king, 0.62);

    const { group: baseGroup, topY } = this.createBase(mats, 1.22);
    king.add(baseGroup);

    // Stately Royal Mantle Column
    const bodyPoints: THREE.Vector2[] = [
      new THREE.Vector2(0.29, topY),
      new THREE.Vector2(0.26, topY + 0.28),
      new THREE.Vector2(0.19, topY + 0.70),
      new THREE.Vector2(0.17, topY + 1.00),
      new THREE.Vector2(0.26, topY + 1.20),
      new THREE.Vector2(0.19, topY + 1.28),
    ];
    const bodyGeo = new THREE.LatheGeometry(bodyPoints, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, mats.body);
    bodyMesh.castShadow = true;
    king.add(bodyMesh);

    // Imperial Breastplate Cross (matching Image 2)
    const kingChestV = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.35, 0.01), mats.accent);
    kingChestV.position.set(0, topY + 0.60, 0.21);
    king.add(kingChestV);

    const kingChestH = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.045, 0.01), mats.accent);
    kingChestH.position.set(0, topY + 0.70, 0.21);
    king.add(kingChestH);

    // Royal Broadsword held upright
    const royalSword = this.createSword(mats);
    royalSword.position.set(0, topY + 0.42, 0.23);
    king.add(royalSword);

    // Double Collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 16, 32), mats.accent);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = topY + 1.20;
    king.add(collar);

    // Imperial Coronet Dome
    const domePoints: THREE.Vector2[] = [
      new THREE.Vector2(0.19, topY + 1.28),
      new THREE.Vector2(0.28, topY + 1.40),
      new THREE.Vector2(0.30, topY + 1.54),
      new THREE.Vector2(0.24, topY + 1.68),
      new THREE.Vector2(0.08, topY + 1.74),
      new THREE.Vector2(0.02, topY + 1.78),
    ];
    const dome = new THREE.Mesh(new THREE.LatheGeometry(domePoints, 32), mats.body);
    dome.castShadow = true;
    king.add(dome);

    // Four Golden Crown Arches (as in screenshot 3!)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 16, Math.PI), mats.accent);
      arch.rotation.y = angle;
      arch.position.y = topY + 1.52;
      king.add(arch);
    }

    // Imperial Cross Pattée Finial
    const crossGroup = new THREE.Group();
    const vMesh = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.32, 0.05), mats.accent);
    crossGroup.add(vMesh);

    const hMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.05), mats.accent);
    hMesh.position.y = 0.05;
    crossGroup.add(hMesh);

    const heartGem = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), mats.body);
    heartGem.position.set(0, 0.05, 0.01);
    crossGroup.add(heartGem);

    crossGroup.position.y = topY + 1.95;
    king.add(crossGroup);

    return king;
  }

  public createPiece(type: PieceType, color: PieceColor): THREE.Group {
    let piece: THREE.Group;
    switch (type) {
      case 'p':
        piece = this.createPawn(color);
        break;
      case 'r':
        piece = this.createRook(color);
        break;
      case 'n':
        piece = this.createKnight(color);
        break;
      case 'b':
        piece = this.createBishop(color);
        break;
      case 'q':
        piece = this.createQueen(color);
        break;
      case 'k':
        piece = this.createKing(color);
        break;
      default:
        piece = this.createPawn(color);
    }

    // Orient knights toward opponent
    if (type === 'n') {
      piece.rotation.y = color === 'w' ? 0 : Math.PI;
    }

    piece.userData = { pieceType: type, pieceColor: color };
    return piece;
  }
}
