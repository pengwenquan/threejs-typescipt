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

const light1 = new THREE.PointLight();
light1.position.set(10, 10, 10);
scene.add(light1);

const light2 = new THREE.PointLight();
light2.position.set(-10, 10, 0);
scene.add(light2);

const geometry = new THREE.SphereBufferGeometry();

const object1 = new THREE.Mesh(
  geometry,
  new THREE.MeshPhongMaterial({
    color: 0xff0000,
  })
)
object1.position.set(4, 0, 0);
scene.add(object1)
object1.add(new THREE.AxesHelper(5))

const object2 = new THREE.Mesh(
  geometry,
  new THREE.MeshPhongMaterial({
    color: 0x00ff00,
  })
)
object2.position.set(4, 0, 0);
object1.add(object2)
object2.add(new THREE.AxesHelper(5))

const object3 = new THREE.Mesh(
  geometry,
  new THREE.MeshPhongMaterial({
    color: 0x0000ff,
  })
)
object3.position.set(4, 0, 0);
object2.add(object3)
object3.add(new THREE.AxesHelper(5))

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = Stats();
document.body.appendChild(stats.dom);

const gui = new GUI();
const object1Folder = gui.addFolder("Object1");
object1Folder.add(object1.position, 'x', 0, 10, 0.01).name('X Postion')
object1Folder.add(object1.rotation, 'x', 0, Math.PI * 2, 0.01).name('X Rotation')
object1Folder.add(object1.scale, 'x', 0, 2, 0.01).name('X Scale')
object1Folder.open()

const object2Folder = gui.addFolder("Object2");
object2Folder.add(object2.position, 'x', 0, 10, 0.01).name('X Postion')
object2Folder.add(object2.rotation, 'x', 0, Math.PI * 2, 0.01).name('X Rotation')
object2Folder.add(object2.scale, 'x', 0, 2, 0.01).name('X Scale')
object2Folder.open()

const object3Folder = gui.addFolder("Object3");
object3Folder.add(object3.position, 'x', 0, 10, 0.01).name('X Postion')
object3Folder.add(object3.rotation, 'x', 0, Math.PI * 2, 0.01).name('X Rotation')
object3Folder.add(object3.scale, 'x', 0, 2, 0.01).name('X Scale')
object3Folder.open()

const debug = document.getElementById('debug1') as HTMLAnchorElement

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();

  const object1WorldPostion = new THREE.Vector3();
  object1.getWorldPosition(object1WorldPostion)

  const object2WorldPostion = new THREE.Vector3();
  object2.getWorldPosition(object2WorldPostion)

  const object3WorldPostion = new THREE.Vector3();
  object3.getWorldPosition(object3WorldPostion)

  debug.innerText = `
    Red
    Local Pos X: ${object1.position.x.toFixed(2)}
    World Pos X: ${object1WorldPostion.x.toFixed(2)}
    Green
    Local Pos X: ${object2.position.x.toFixed(2)}
    World Pos X: ${object2WorldPostion.x.toFixed(2)}
    Blue
    Local Pos X: ${object3.position.x.toFixed(2)}
    World Pos X: ${object3WorldPostion.x.toFixed(2)}
  `
}

function render() {
  renderer.render(scene, camera);
}

animate();
