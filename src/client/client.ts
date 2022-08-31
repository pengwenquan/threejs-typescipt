import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import gsap from "gsap";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

const light1 = new THREE.DirectionalLight(0x666666);
light1.position.set(0, 0, 0);
const light2 = new THREE.AmbientLight(0x666666);
// light1.position.set(0, 0, 0);
light2.position.set(0, 0, 0);
scene.add(light1);
// scene.add(light2);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.set(174, 196, 375);

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
  shininess: 20,
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
    let materialClone = material.clone();
    materialClone.map = texture;
    meshChild.material = materialClone;
    meshChild.material.needsUpdate = true;
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
      let position = new THREE.Vector3();
      pcickableObjects[i].getWorldPosition(position)

      // new TWEEN.Tween(camera.position)
      //   .to({
      //     x: position.x + 100,
      //     y: position.y + 100,
      //     z: position.z + 100
      //   }, 2000)
      //   .start()

      let an = gsap.to(camera.position, {
        duration: 3,
        x: position.x + 100,
        y: position.y + 100,
        z: position.z + 100,
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
