import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";

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

const boxGeometry = new THREE.BoxGeometry();
const sphereGeometry = new THREE.SphereGeometry();
const icosahedronGeometry = new THREE.IcosahedronGeometry();
const planeGeometry = new THREE.PlaneGeometry();
const torusKnotGeometry = new THREE.TorusKnotGeometry();

const material = new THREE.MeshBasicMaterial();

const texture = new THREE.TextureLoader().load("img/color.jpg");
material.map = texture;

const envTexture = new THREE.CubeTextureLoader().load([
  "img/px.jpg",
  "img/nx.jpg",
  "img/py.jpg",
  "img/ny.jpg",
  "img/pz.jpg",
  "img/nz.jpg"
]);
envTexture.mapping = THREE.CubeReflectionMapping;
material.envMap = envTexture;


const cube = new THREE.Mesh(boxGeometry, material);
cube.position.x = 5;
scene.add(cube)

const sphere = new THREE.Mesh(sphereGeometry, material);
sphere.position.x = 3;
scene.add(sphere)

const icosahedron = new THREE.Mesh(icosahedronGeometry, material);
icosahedron.position.x = 0;
scene.add(icosahedron)

const plane = new THREE.Mesh(planeGeometry, material);
plane.position.x = -2;
scene.add(plane)

const torusKnot = new THREE.Mesh(torusKnotGeometry, material);
torusKnot.position.x = -5;
scene.add(torusKnot)

const options = {
  side: {
    
  }
}



function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();

}

function render() {
  renderer.render(scene, camera);
}

animate();
