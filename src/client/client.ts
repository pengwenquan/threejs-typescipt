import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

const light1 = new THREE.SpotLight();
light1.position.set(12.5, 12.5, 12.5);
light1.castShadow = true;
light1.shadow.mapSize.height = 2048;
light1.shadow.mapSize.width = 2048;
scene.add(light1);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.set(15, 15, 15);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.pointerEvents = "none";
document.body.appendChild(labelRenderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;

const pickableObjects: THREE.Mesh[] = [];

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
          default:
            m.castShadow = true;
            break;
        }
        pickableObjects.push(m);
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
  labelRenderer.setSize(window.innerWidth, window.innerHeight)
  render();
}

let ctrlDown = false;
let lineId = 0;
let line: THREE.Line;
let drawingLine = false;
const measurementLabels: { [key: number]: CSS2DObject } = {};

window.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Control") {
    ctrlDown = true;
    orbitControls.enabled = false;
    renderer.domElement.style.cursor = "crosshair";
  }
});

window.addEventListener("keyup", (event: KeyboardEvent) => {
  if (event.key === "Control") {
    ctrlDown = false;
    orbitControls.enabled = true;
    renderer.domElement.style.cursor = "pointer";
    if (drawingLine) {
      scene.remove(line);
      scene.remove(measurementLabels[lineId]);
      drawingLine = false;
    }
  }
});

const raycaster = new THREE.Raycaster();
let intersects: THREE.Intersection[];
const mouse = new THREE.Vector2();
document.addEventListener("pointerdown", onClick, false);

function onClick() {
  if (ctrlDown) {
    raycaster.setFromCamera(mouse, camera)
    intersects = raycaster.intersectObjects(pickableObjects, false)
    if (intersects.length > 0) {
      if (!drawingLine) {
        const points = [];
        points.push(intersects[0].point);
        points.push(intersects[0].point.clone());
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        line = new THREE.LineSegments(
          geometry,
          new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
          })
        );
        line.frustumCulled = false;
        scene.add(line);
  
        const measurementDiv = document.createElement("div") as HTMLElement;
        measurementDiv.className = "measurementLabel";
        measurementDiv.innerText = "0.0m";
        const measurementLabel = new CSS2DObject(measurementDiv);
        measurementLabel.position.copy(intersects[0].point);
        measurementLabels[lineId] = measurementLabel;
        scene.add(measurementLabels[lineId]);
        drawingLine = true;
      } else {
        const positions = line.geometry.attributes.position.array as Array<number>;
        positions[3] = intersects[0].point.x;
        positions[4] = intersects[0].point.y;
        positions[5] = intersects[0].point.z;
        line.geometry.attributes.position.needsUpdate = true;
        lineId++;
        drawingLine = false;
      }
    }
  }
}

document.addEventListener('mousemove', onDocumentMovue, false)

function onDocumentMovue(event: MouseEvent) {
  event.preventDefault();
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  if (drawingLine) {
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(pickableObjects, false);
    if (intersects.length > 0) {
      const positions = line.geometry.attributes.position.array as Array<number>;
      const v0 = new THREE.Vector3(positions[0], positions[1], positions[2]);

      const v1 = new THREE.Vector3(
        intersects[0].point.x,
        intersects[0].point.y,
        intersects[0].point.z
      );

      positions[3] = intersects[0].point.x;
      positions[4] = intersects[0].point.y;
      positions[5] = intersects[0].point.z;
      line.geometry.attributes.position.needsUpdate = true;
      const distance = v0.distanceTo(v1);
      measurementLabels[lineId].element.innerText = distance.toFixed(2) + "m";
      measurementLabels[lineId].position.lerpVectors(v0, v1, 0.5);
    }
  }
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
  labelRenderer.render(scene, camera);
  renderer.render(scene, camera);
}

animate();
