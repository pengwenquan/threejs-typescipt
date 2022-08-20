import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

const light1 = new THREE.SpotLight();
light1.position.set(12.5, 12.5, 12.5);
light1.castShadow = true;
light1.shadow.mapSize.height = 1024;
light1.shadow.mapSize.width = 1024;
scene.add(light1);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.set(15, 15, 15);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const pickableObjects: THREE.Mesh[] = [];
let intersectedObject: THREE.Object3D | null;
const originalMaterials: { [id: string]: THREE.Material | THREE.Material[] } =
  {};
const highlightMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: 0x00ff00,
});

const loader = new GLTFLoader();
loader.load(
  "models/simplescene.glb",
  (gltf) => {
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        switch (m.name) {
          case "Plane":
            m.receiveShadow = true;
            break;
          case "Sphere":
            m.castShadow = true;
            break;
          default:
            m.castShadow = true;
            pickableObjects.push(m);
            originalMaterials[m.name] = (m as THREE.Mesh).material;
        }
      }
    });
    scene.add(gltf.scene);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (err) => {
    console.error(err);
  }
);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const raycaster = new THREE.Raycaster();
let intersects: THREE.Intersection[];
document.addEventListener("mousemove", onDocumentMovue, false);

function onDocumentMovue(event: MouseEvent) {
  raycaster.setFromCamera(
    {
      x: (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
      y: -(event.clientY / renderer.domElement.clientHeight) * 2 + 1,
    },
    camera
  );
  intersects = raycaster.intersectObjects(pickableObjects, false);
  console.log('intersects', intersects)

  if (intersects.length > 0) {
    intersectedObject = intersects[0].object;
  } else {
    intersectedObject = null;
  }
  console.log(pickableObjects, intersectedObject,)
  pickableObjects.forEach((o: THREE.Mesh, i) => {
    if (intersectedObject && intersectedObject.name === o.name) {
      pickableObjects[i].material = highlightMaterial
    } else {
      pickableObjects[i].material = originalMaterials[o.name]
    }
  })
}

const stats = Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
