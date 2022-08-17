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

const points = [];
points.push(new THREE.Vector3(-5, 0, 0));
points.push(new THREE.Vector3(5, 0, 0));
const geometry = new THREE.BufferGeometry().setFromPoints(points)
const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff00000 }))
scene.add(line);

// 把线条延长2倍向量(-5, 0, 0) 会变成 （-10， 0， 0）
const positions = ( geometry as THREE.BufferGeometry ).attributes.position.array as Array<number>; // 此处的类型不断言处理好，后面的操作会报类型错误
for(let i = 0; i < positions.length; i +=3) {
  const v = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]).multiplyScalar(2)
  positions[i] = v.x;
}
( geometry as THREE.BufferGeometry ).attributes.position.needsUpdate = true;
console.info(positions)


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
