import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { Reflector } from 'three/examples/jsm/objects/Reflector'

// position:物体相对于父级的位置、WorldPostion:物体在整体3d视图世界中的位置

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5))

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = Stats();
document.body.appendChild(stats.dom);

const linght = new THREE.AmbientLight();
scene.add(linght);

const gui = new GUI()
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()

let mixer: THREE.AnimationMixer;
let modelReady = false;
const animationActions: THREE.AnimationAction[] = [];
let activeAction: THREE.AnimationAction;
let lastAction: THREE.AnimationAction;
const fbxLoader: FBXLoader = new FBXLoader();

fbxLoader.load(
  'models/vanguard_t_choonyung.fbx',
  (object) => {
    object.scale.set(0.01, 0.01, 0.01);
    mixer = new THREE.AnimationMixer(object);

    const animationAction = mixer.clipAction(
      (object as THREE.Object3D).animations[0]
    )
    animationActions.push(animationAction);
    animationsFolder.add(animations, 'default')
    activeAction = animationActions[0]
    scene.add(object)

    // 添加动画材质
    fbxLoader.load(
      'models/vanguard@breakdance.fbx',
      (object) => {
        const animationAction = mixer.clipAction(
          (object as THREE.Object3D).animations[0]
        )
        animationActions.push(animationAction);
        animationsFolder.add(animations, 'breakdance')
        modelReady = true;
      }
    )
  }
)

const mirrorBack1: Reflector = new Reflector(
  new THREE.PlaneBufferGeometry(2, 2),
  {
      color: new THREE.Color(0x7f7f7f),
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
  }
)

mirrorBack1.position.y = 1
mirrorBack1.position.z = -1
scene.add(mirrorBack1)

const mirrorBack2: Reflector = new Reflector(
  new THREE.PlaneBufferGeometry(2, 2),
  {
      color: new THREE.Color(0x7f7f7f),
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
  }
)

mirrorBack2.position.y = 1
mirrorBack2.position.z = 3
mirrorBack2.rotateY(Math.PI)
scene.add(mirrorBack2)

const animations = {
  default: () => {
    setAction(animationActions[0])
  },
  breakdance: () => {
    setAction(animationActions[1])
  }
}

const setAction = (toAcrtion: THREE.AnimationAction) => {
  console.log(toAcrtion)
  if (toAcrtion !== activeAction) {
    lastAction = activeAction;
    activeAction = toAcrtion;
    lastAction.fadeOut(1);
    activeAction.reset();
    activeAction.fadeIn(1);
    activeAction.play();
  }
}

const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate);
  if (modelReady) {
    mixer.update(clock.getDelta())
  }
  render();
  stats.update();

}

function render() {
  renderer.render(scene, camera);
}

animate();
