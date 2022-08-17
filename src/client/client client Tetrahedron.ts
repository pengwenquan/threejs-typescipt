import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";

// position:物体相对于父级的位置、WorldPostion:物体在整体3d视图世界中的位置

const scene = new THREE.Scene();

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

const material = new THREE.MeshNormalMaterial();
const geometry = new THREE.BufferGeometry();

const points = [
  new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(-1, -1, 1),
  new THREE.Vector3(1, 1, 1),

  new THREE.Vector3(1, 1, 1),
  new THREE.Vector3(1, -1, -1),
  new THREE.Vector3(-1, 1, -1),

  new THREE.Vector3(-1, -1, 1),
  new THREE.Vector3(1, -1, -1),
  new THREE.Vector3(1, 1, 1),

  new THREE.Vector3(-1, 1, -1),
  new THREE.Vector3(1, -1, -1),
  new THREE.Vector3(-1, -1, 1),
]

geometry.setFromPoints(points)

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)


function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();

  const object1WorldPostion = new THREE.Vector3();
}

function render() {
  renderer.render(scene, camera);
}

animate();
