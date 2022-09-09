import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import gsap from "gsap";
import { GUI } from 'dat.gui';
import * as CANNON from 'cannon-es';

const scene = new THREE.Scene();

const light1 = new THREE.SpotLight();
light1.position.set(2.5, 5, 5);
light1.angle = Math.PI / 4;
light1.penumbra = 0.5;
light1.castShadow = true;
light1.shadow.mapSize.width = 1024;
light1.shadow.mapSize.height = 1024;
light1.shadow.camera.far = 20;
light1.shadow.camera.near = 0.5;
scene.add(light1);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(0, 2, 4);
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
orbitControls.target.y = 0.5;

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const phneMeterial = new THREE.MeshPhongMaterial();
const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(cubeGeo, new THREE.MeshNormalMaterial);
cube.position.set(-3, 3, 0);
cube.castShadow =true;
scene.add(cube)
const cubeShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5))
const cubeBody = new CANNON.Body({ mass: 1 });
cubeBody.addShape(cubeShape);
cubeBody.position.set(cube.position.x, cube.position.y, cube.position.z);
world.addBody(cubeBody)

const planeGeo = new THREE.PlaneGeometry(25, 25);
const plane = new THREE.Mesh(planeGeo, phneMeterial)
plane.rotateX(-Math.PI / 2);
plane.receiveShadow = true;
scene.add(plane);

const planeShape = new CANNON.Plane();
const planeBody = new CANNON.Body({ mass: 0 });
planeBody.addShape(planeShape);
planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
world.addBody(planeBody);


const stats = Stats();
document.body.appendChild(stats.dom);

const clock = new THREE.Clock();
let delta;
function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();
  delta = Math.min(clock.getDelta(), 0.1);
  world.step(delta);

  cube.position.set(
    cubeBody.position.x,
    cubeBody.position.y,
    cubeBody.position.z,
  )

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
