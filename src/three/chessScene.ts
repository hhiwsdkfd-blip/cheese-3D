import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { PieceType, PieceColor, BoardTheme, PieceStyleId } from '../types/chess';
import { PieceFactory } from './pieceFactory';
import { buildChessBoard, squareToWorld, worldToSquare, BoardGeometryData } from './boardFactory';
import { buildCathedralEnvironment, CathedralEnvironmentData } from './cathedralEnvironment';
import { soundManager } from '../audio/soundEffects';

export interface ChessSceneCallbacks {
  onSquareSelect: (square: string) => void;
  onPieceMove: (from: string, to: string) => void;
}

interface PieceAnimation {
  mesh: THREE.Group;
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  startTime: number;
  duration: number;
  onComplete?: () => void;
}

interface DisappearingPiece {
  mesh: THREE.Group;
  startPos: THREE.Vector3;
  startTime: number;
  duration: number;
  onComplete?: () => void;
}

export type CameraPreset = 'player' | 'white' | 'black' | 'top' | 'side' | 'cathedral' | 'cinematic';

export class ChessScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  public pieceFactory: PieceFactory;
  private boardData: BoardGeometryData;
  private cathedralData: CathedralEnvironmentData;
  private callbacks: ChessSceneCallbacks;

  // Active Pieces mapped by square
  private pieces: Map<string, THREE.Group> = new Map();

  // Selection & Highlight Meshes
  private selectedSquareMesh!: THREE.Mesh;
  private checkIndicatorMesh!: THREE.Mesh;
  private lastMoveFromMesh!: THREE.Mesh;
  private lastMoveToMesh!: THREE.Mesh;
  private validMoveMarkers: THREE.Mesh[] = [];

  // Suggested Move Highlight (from AI Assistant)
  private suggestedFromMesh!: THREE.Mesh;
  private suggestedToMesh!: THREE.Mesh;

  // Raycaster & Interaction
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-999, -999);
  private selectedSquare: string | null = null;
  private validMovesForSelected: string[] = [];

  // Animation state
  private activeMoveAnimation: PieceAnimation | null = null;
  private disappearingPieces: DisappearingPiece[] = [];
  private isDisposed = false;
  private animationFrameId = 0;

  // Camera animation target
  private cameraTargetPos: THREE.Vector3 | null = null;
  private cameraTargetLookAt: THREE.Vector3 | null = null;

  // Cinematic title rotation
  public isCinematicMode = false;
  public playerPerspective: PieceColor = 'w';

  constructor(
    container: HTMLElement,
    theme: BoardTheme,
    callbacks: ChessSceneCallbacks
  ) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08090d);
    this.scene.fog = new THREE.FogExp2(0x08090d, 0.022);

    // 2. Camera setup - Positioned like screenshot 1/3 (Player front view)
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 120);
    this.camera.position.set(0, 3.8, 6.4);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 28;
    this.controls.target.set(0, 0.8, 0);

    // 6. Cathedral Environment (Pillars, Rose Window, Fire Braziers)
    this.cathedralData = buildCathedralEnvironment();
    this.scene.add(this.cathedralData.group);

    // 7. Lighting Rig
    this.setupLighting();

    // 8. Board and Piece Factories
    this.boardData = buildChessBoard(theme);
    this.scene.add(this.boardData.boardGroup);

    this.pieceFactory = new PieceFactory(theme, 'royal');

    // 9. Highlight Markers
    this.setupHighlightMeshes();

    // 10. Event Listeners
    this.setupEventListeners();

    // 11. Start Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    // Warm Cinematic Golden Sunlight entering diagonally from gothic windows
    // "تدخل أشعة الشمس الذهبية من النوافذ لتمنح المكان إضاءة سينمائية دافئة"
    const sunLight = new THREE.DirectionalLight(0xffecc2, 3.2);
    sunLight.position.set(4, 16, -12);
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 40;
    const d = 7.5;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);
    this.scene.add(sunLight.target);

    // Warm Key Fill from player camera side
    const frontFill = new THREE.DirectionalLight(0xfff5ea, 1.6);
    frontFill.position.set(3, 10, 8);
    this.scene.add(frontFill);

    // Warm Ambient Castle Hall Lighting
    const hemiLight = new THREE.HemisphereLight(0xffd8a8, 0x1f1610, 1.1);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // Back rim light to accentuate golden piece crowns and silhouettes
    const rimLight = new THREE.DirectionalLight(0xffd700, 1.4);
    rimLight.position.set(-6, 10, -8);
    this.scene.add(rimLight);
  }

  private setupHighlightMeshes() {
    // Selected Square Halo
    const selectGeo = new THREE.RingGeometry(0.38, 0.47, 32);
    const selectMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Amber Gold
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    this.selectedSquareMesh = new THREE.Mesh(selectGeo, selectMat);
    this.selectedSquareMesh.rotation.x = -Math.PI / 2;
    this.selectedSquareMesh.position.y = 0.268;
    this.selectedSquareMesh.visible = false;
    this.scene.add(this.selectedSquareMesh);

    // Check Indicator Crimson Glow
    const checkGeo = new THREE.RingGeometry(0.36, 0.48, 32);
    const checkMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    this.checkIndicatorMesh = new THREE.Mesh(checkGeo, checkMat);
    this.checkIndicatorMesh.rotation.x = -Math.PI / 2;
    this.checkIndicatorMesh.position.y = 0.269;
    this.checkIndicatorMesh.visible = false;
    this.scene.add(this.checkIndicatorMesh);

    // Last Move Highlights (From & To)
    const lastFromGeo = new THREE.PlaneGeometry(0.95, 0.95);
    const lastFromMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    });
    this.lastMoveFromMesh = new THREE.Mesh(lastFromGeo, lastFromMat);
    this.lastMoveFromMesh.rotation.x = -Math.PI / 2;
    this.lastMoveFromMesh.position.y = 0.266;
    this.lastMoveFromMesh.visible = false;
    this.scene.add(this.lastMoveFromMesh);

    this.lastMoveToMesh = new THREE.Mesh(lastFromGeo.clone(), lastFromMat.clone());
    this.lastMoveToMesh.rotation.x = -Math.PI / 2;
    this.lastMoveToMesh.position.y = 0.266;
    this.lastMoveToMesh.visible = false;
    this.scene.add(this.lastMoveToMesh);

    // AI Suggested Move Highlights (Emerald/Cyan)
    const sugGeo = new THREE.RingGeometry(0.32, 0.46, 32);
    const sugMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });
    this.suggestedFromMesh = new THREE.Mesh(sugGeo, sugMat);
    this.suggestedFromMesh.rotation.x = -Math.PI / 2;
    this.suggestedFromMesh.position.y = 0.27;
    this.suggestedFromMesh.visible = false;
    this.scene.add(this.suggestedFromMesh);

    this.suggestedToMesh = new THREE.Mesh(sugGeo.clone(), sugMat.clone());
    this.suggestedToMesh.rotation.x = -Math.PI / 2;
    this.suggestedToMesh.position.y = 0.27;
    this.suggestedToMesh.visible = false;
    this.scene.add(this.suggestedToMesh);
  }

  private setupEventListeners() {
    const el = this.renderer.domElement;
    el.addEventListener('pointermove', this.onPointerMove.bind(this));
    el.addEventListener('pointerdown', this.onPointerDown.bind(this));
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private onPointerMove(e: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  private onPointerDown(e: PointerEvent) {
    if (this.isCinematicMode || this.activeMoveAnimation) return;
    if (e.button !== 0) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.25);
    const intersectPoint = new THREE.Vector3();

    if (this.raycaster.ray.intersectPlane(plane, intersectPoint)) {
      const clickedSquare = worldToSquare(intersectPoint);
      if (clickedSquare) {
        if (this.selectedSquare && this.validMovesForSelected.includes(clickedSquare)) {
          this.callbacks.onPieceMove(this.selectedSquare, clickedSquare);
          this.clearSelection();
          return;
        }
        this.callbacks.onSquareSelect(clickedSquare);
      }
    }
  }

  private onWindowResize() {
    if (this.isDisposed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public setSelectedSquare(square: string | null, validMoves: string[] = []) {
    this.selectedSquare = square;
    this.validMovesForSelected = validMoves;

    if (square) {
      const pos = squareToWorld(square);
      this.selectedSquareMesh.position.set(pos.x, 0.268, pos.z);
      this.selectedSquareMesh.visible = true;
      soundManager.playLift();
    } else {
      this.selectedSquareMesh.visible = false;
    }

    this.updateValidMoveMarkers(validMoves);
  }

  public clearSelection() {
    this.setSelectedSquare(null, []);
  }

  private updateValidMoveMarkers(validSquares: string[]) {
    this.validMoveMarkers.forEach((m) => {
      this.scene.remove(m);
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.validMoveMarkers = [];

    for (const sq of validSquares) {
      const pos = squareToWorld(sq);
      const isTargetOccupied = this.pieces.has(sq);

      let marker: THREE.Mesh;
      if (isTargetOccupied) {
        // Red capture bracket
        const geo = new THREE.RingGeometry(0.36, 0.45, 32);
        const mat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        });
        marker = new THREE.Mesh(geo, mat);
      } else {
        // Gold/Amber move dot
        const geo = new THREE.CircleGeometry(0.14, 24);
        const mat = new THREE.MeshBasicMaterial({
          color: 0xeab308,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        });
        marker = new THREE.Mesh(geo, mat);
      }

      marker.rotation.x = -Math.PI / 2;
      marker.position.set(pos.x, 0.268, pos.z);
      this.scene.add(marker);
      this.validMoveMarkers.push(marker);
    }
  }

  public setLastMove(from: string | null, to: string | null) {
    if (from) {
      const p1 = squareToWorld(from);
      this.lastMoveFromMesh.position.set(p1.x, 0.266, p1.z);
      this.lastMoveFromMesh.visible = true;
    } else {
      this.lastMoveFromMesh.visible = false;
    }

    if (to) {
      const p2 = squareToWorld(to);
      this.lastMoveToMesh.position.set(p2.x, 0.266, p2.z);
      this.lastMoveToMesh.visible = true;
    } else {
      this.lastMoveToMesh.visible = false;
    }
  }

  public setCheckSquare(kingSquare: string | null) {
    if (kingSquare) {
      const pos = squareToWorld(kingSquare);
      this.checkIndicatorMesh.position.set(pos.x, 0.269, pos.z);
      this.checkIndicatorMesh.visible = true;
    } else {
      this.checkIndicatorMesh.visible = false;
    }
  }

  public setSuggestedMove(from: string | null, to: string | null) {
    if (from && to) {
      const p1 = squareToWorld(from);
      const p2 = squareToWorld(to);
      this.suggestedFromMesh.position.set(p1.x, 0.27, p1.z);
      this.suggestedFromMesh.visible = true;
      this.suggestedToMesh.position.set(p2.x, 0.27, p2.z);
      this.suggestedToMesh.visible = true;
    } else {
      this.suggestedFromMesh.visible = false;
      this.suggestedToMesh.visible = false;
    }
  }

  public syncPieces(boardState: ({ type: PieceType; color: PieceColor } | null)[][]) {
    this.pieces.forEach((mesh) => {
      this.scene.remove(mesh);
    });
    this.pieces.clear();

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const piece = boardState[r][f];
        if (!piece) continue;

        const square = String.fromCharCode(97 + f) + (8 - r);
        const pieceMesh = this.pieceFactory.createPiece(piece.type, piece.color);
        const worldPos = squareToWorld(square);
        pieceMesh.position.copy(worldPos);

        this.scene.add(pieceMesh);
        this.pieces.set(square, pieceMesh);
      }
    }
  }

  public animateMove(
    from: string,
    to: string,
    isCapture: boolean,
    onFinished?: () => void
  ) {
    const piece = this.pieces.get(from);
    if (!piece) {
      onFinished?.();
      return;
    }

    const capturedPiece = this.pieces.get(to);
    if (capturedPiece) {
      this.pieces.delete(to);
      this.disappearingPieces.push({
        mesh: capturedPiece,
        startPos: capturedPiece.position.clone(),
        startTime: performance.now(),
        duration: 400,
        onComplete: () => {
          this.scene.remove(capturedPiece);
        },
      });
    }

    this.pieces.delete(from);
    this.pieces.set(to, piece);

    const startPos = squareToWorld(from);
    const targetPos = squareToWorld(to);

    this.activeMoveAnimation = {
      mesh: piece,
      startPos,
      targetPos,
      startTime: performance.now(),
      duration: 320,
      onComplete: () => {
        piece.position.copy(targetPos);
        this.activeMoveAnimation = null;
        if (isCapture) {
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }
        onFinished?.();
      },
    };
  }

  /**
   * Camera Presets - Exactly matching screenshots 1, 2, 3, 4!
   */
  public setCameraPreset(preset: CameraPreset) {
    if (preset === 'cinematic') {
      this.isCinematicMode = true;
      return;
    }

    this.isCinematicMode = false;
    let targetPos = new THREE.Vector3(0, 3.8, 6.4);
    let targetLook = new THREE.Vector3(0, 0.8, 0);

    if (preset === 'player') {
      if (this.playerPerspective === 'b') {
        targetPos = new THREE.Vector3(0, 3.8, -6.4);
      } else {
        targetPos = new THREE.Vector3(0, 3.8, 6.4);
      }
      targetLook = new THREE.Vector3(0, 0.8, 0);
    } else if (preset === 'white') {
      targetPos = new THREE.Vector3(0, 3.8, 6.4);
      targetLook = new THREE.Vector3(0, 0.8, 0);
    } else if (preset === 'black') {
      targetPos = new THREE.Vector3(0, 3.8, -6.4);
      targetLook = new THREE.Vector3(0, 0.8, 0);
    } else if (preset === 'top') {
      // Direct overhead tactical view (screenshot 2)
      targetPos = new THREE.Vector3(0, 10.8, 0.05);
      targetLook = new THREE.Vector3(0, 0.25, 0);
    } else if (preset === 'side') {
      // Side profile view (screenshot 1)
      targetPos = new THREE.Vector3(8.5, 4.2, 0);
      targetLook = new THREE.Vector3(0, 0.8, 0);
    } else if (preset === 'cathedral') {
      // Cathedral wide angle high pan (screenshot 4)
      targetPos = new THREE.Vector3(0, 11.5, 13.5);
      targetLook = new THREE.Vector3(0, 1.2, -4);
    }

    this.cameraTargetPos = targetPos;
    this.cameraTargetLookAt = targetLook;
  }

  public updateTheme(theme: BoardTheme) {
    this.boardData.updateTheme(theme);
    this.pieceFactory.updateTheme(theme);
  }

  public setPieceCustomization(whiteColor: string, blackColor: string, style: PieceStyleId) {
    this.pieceFactory.setCustomColors(whiteColor, blackColor, style);
  }

  private animate() {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();

    // 1. Update animated fire brazier flames
    this.cathedralData.updateFlames(now);

    // 2. Cinematic orbit on menu
    if (this.isCinematicMode) {
      const radius = 9.8;
      const speed = now * 0.00032;
      this.camera.position.x = Math.sin(speed) * radius;
      this.camera.position.z = Math.cos(speed) * radius;
      this.camera.position.y = 4.8 + Math.sin(speed * 1.5) * 1.2;
      this.camera.lookAt(0, 0.8, 0);
    } else {
      if (this.cameraTargetPos) {
        this.camera.position.lerp(this.cameraTargetPos, 0.08);
        if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.05) {
          this.cameraTargetPos = null;
        }
      }
      if (this.cameraTargetLookAt) {
        this.controls.target.lerp(this.cameraTargetLookAt, 0.08);
        if (this.controls.target.distanceTo(this.cameraTargetLookAt) < 0.05) {
          this.cameraTargetLookAt = null;
        }
      }
      this.controls.update();
    }

    // 3. Active Moving Piece Parabolic Arc
    if (this.activeMoveAnimation) {
      const { mesh, startPos, targetPos, startTime, duration, onComplete } =
        this.activeMoveAnimation;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const t = 0.5 - 0.5 * Math.cos(progress * Math.PI);

      mesh.position.x = THREE.MathUtils.lerp(startPos.x, targetPos.x, t);
      mesh.position.z = THREE.MathUtils.lerp(startPos.z, targetPos.z, t);
      mesh.position.y = startPos.y + Math.sin(progress * Math.PI) * 1.1;

      if (progress >= 1.0) {
        onComplete?.();
      }
    }

    // 4. Disappearing captured pieces
    for (let i = this.disappearingPieces.length - 1; i >= 0; i--) {
      const anim = this.disappearingPieces[i];
      const elapsed = now - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1.0);

      anim.mesh.rotation.z = progress * 1.4;
      anim.mesh.scale.setScalar(1.0 - progress * 0.7);
      anim.mesh.position.y = anim.startPos.y - progress * 0.3;

      if (progress >= 1.0) {
        anim.onComplete?.();
        this.disappearingPieces.splice(i, 1);
      }
    }

    // 5. Suggested move glowing pulse
    if (this.suggestedFromMesh.visible) {
      const s = 1.0 + Math.sin(now * 0.007) * 0.08;
      this.suggestedFromMesh.scale.set(s, s, 1);
      this.suggestedToMesh.scale.set(s, s, 1);
    }

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animationFrameId);

    window.removeEventListener('resize', this.onWindowResize);

    this.cathedralData.dispose();
    this.pieces.forEach((m) => {
      this.scene.remove(m);
    });
    this.pieces.clear();

    this.controls.dispose();
    this.renderer.dispose();

    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
