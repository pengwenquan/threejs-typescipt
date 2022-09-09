import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import gsap from "gsap";
import { GUI } from 'dat.gui';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

const light1 = new THREE.DirectionalLight(0x111111);
light1.position.set(0, 0, 0);
const light2 = new THREE.AmbientLight(0x555555);
light1.position.set(100, 100, 100);
light2.position.set(0, 0, 0);
// scene.add(light1);
scene.add(light2);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(-22.57, 189.18, 268.59);
const gui = new GUI();
const cameraFolder = gui.addFolder("camera");
cameraFolder.add(camera.position, 'x', -200, 1000, 0.01)
cameraFolder.add(camera.position, 'y', -200, 1000, 0.01)
cameraFolder.add(camera.position, 'z', -200, 1000, 0.01)
cameraFolder.open()

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: true, // 是否使用对数深度缓存。如果要在单个场景中处理巨大的比例差异，就有必要使用
});
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const fbxLoader = new FBXLoader();
// fbxLoader.load(
//   'models/city.fbx',
//   (object) => {
//     scene.add(object);
//   },
// );
let renderEnabled = false;
let material = new THREE.MeshPhongMaterial({
  shininess: 40,
  side: THREE.FrontSide,
});
let mixer: THREE.AnimationMixer;
let pcickableObjects: THREE.Mesh[] = [];
const originalMaterials: { [id: string]: THREE.Material | THREE.Material[] } =
  {};
async function fbx() {
  const textureLoader = new THREE.TextureLoader();
  const obj = await fbxLoader.loadAsync("models/city.fbx");
  mixer = new THREE.AnimationMixer(obj);
  const animation = mixer.clipAction(obj.animations[0]);
  // console.log("animation", obj);
  obj.position.set(0, -40, 0);
  let list = [
    "Transportation",
    "Utilities",
    "Heavy_Industry",
    "Retail",
    "Finance",
    "Manufacturing",
    "Goverment",
    "Healthcare",
  ];
  for (let i = 0; i < 56; i++) {
    // eslint-disable-next-line no-await-in-loop
    const texture = await textureLoader.loadAsync(`img/city/${i + 1}.jpg`);
    const meshChild = obj.children[i] as THREE.Mesh;
    // let materialClone = material.clone();
    let materialClone = new THREE.MeshPhongMaterial({
      shininess: 40,
      side: THREE.FrontSide,
      map: texture,
    });
    // materialClone.map = texture;
    meshChild.material = materialClone;
    // materialClone.needsUpdate = true;
    if (list.includes(meshChild.name)) {
      let meshClone = meshChild.clone();
      meshChild.visible = false;
      meshChild.geometry.dispose();
      meshChild.material.dispose();
      meshClone.scale.set(0.5, 0.5, 0.5);
      obj.add(meshClone);
      pcickableObjects.push(meshClone);
      originalMaterials[meshChild.name] = meshChild.material
    }
  }
  console.log("animation", obj);
  mixer = new THREE.AnimationMixer(obj);

  const animationAction = mixer.clipAction(
    (obj as THREE.Object3D).animations[0]
  );
  scene.add(obj);
  animationAction.play();
  renderEnabled = true;
}
fbx();

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

let mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects: THREE.Intersection[];
let intersectedObject: THREE.Object3D | null;
let highlightMaterial = new THREE.MeshBasicMaterial({
  color: 0x40a9ff,
  transparent: true,
  opacity: 0.7
})

let cloneMesh: THREE.Mesh;

// 鼠标悬停物体
function moveEnterObject(eve: MouseEvent) {
  eve.preventDefault();
  mouse.x = (eve.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(eve.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects(pcickableObjects, false);
  if (intersects.length > 0) {
    intersectedObject = intersects[0].object;
  } else {
    intersectedObject = null;
  }
  pcickableObjects.forEach((o: THREE.Mesh, i) => {
    if (intersectedObject && intersectedObject.name === o.name) {
      pcickableObjects[i].material = highlightMaterial;
    } 
    else {
      pcickableObjects[i].material = originalMaterials[o.name];
    }
  });
}
let placePositionMap: { [key: string]: any } = {
  "Transportation": {x: 43.6, y: 96.54, z: -141.69},
    "Utilities": {x: 175.94, y: 30.36, z: -200},
    "Heavy_Industry": {x: 136.24, y: 30.36, z: 255.35},
    "Retail": {x: 228.88, y: 3.89, z: 43.6},
    "Finance": {x: 162.71, y: 70.07, z: 70.07},
    "Manufacturing": {x: 30.36, y: 43.6, z: -35.81},
    "Goverment": {x: 56.83, y: 56.83, z: -35.81},
    "Healthcare": {x: -9.34, y: 3.89, z: 202.41},
}
function changePlaceView(enc: MouseEvent) {
  enc.preventDefault();
  mouse.x = (enc.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(enc.clientY / renderer.domElement.clientHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects(pcickableObjects, false);
  if (intersects.length > 0) {
    intersectedObject = intersects[0].object;
  } else {
    intersectedObject = null;
  }
  pcickableObjects.forEach((o: THREE.Mesh, i) => {
    if (intersectedObject && intersectedObject.name === o.name) {
      console.warn('intersectedObject.name', intersectedObject.name)
      let position = placePositionMap[intersectedObject.name]
      let an = gsap.to(camera.position, {
        duration: 3,
        x: position.x,
        y: position.y,
        z: position.z,
        ease: "none",
      });
    }
  });
}

window.addEventListener("mousemove", moveEnterObject, false);

window.addEventListener("click", changePlaceView, false);

const stats = Stats();
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();
  if (renderEnabled) {
    mixer.update(clock.getDelta());
  }

  // TWEEN.update()

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
