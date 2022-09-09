import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import gsap from "gsap";
import { GUI } from 'dat.gui';
import * as CANNON from 'cannon-es';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader' 
import CannonUtils from "./utils/cannonUtils";

const scene = new THREE.Scene();

const light1 = new THREE.SpotLight();
light1.position.set(25, 50, 10);
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

camera.position.set(4, 6, 7);
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


const stats = Stats();
document.body.appendChild(stats.dom);

const world = new CANNON.World()
world.gravity.set(0, -9.82, 0);
const basicMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
const normalMeterial = new THREE.MeshNormalMaterial({
  side: THREE.DoubleSide,
  wireframe: true,
})
const phoneMeterial = new THREE.MeshPhongMaterial();
const realMeterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  reflectivity: 0,
  roughness: 0.2,
  metalness: 1,
  clearcoat: 0.15,
  clearcoatRoughness: 0.5,
  side: THREE.DoubleSide
});

const inverMeterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0,
  roughness: 0.35,
  transmission: 1.0,
  clearcoat: 1.0,
  clearcoatRoughness: 0.35,
  ior: 1.25,
  // thickness: 0,
})

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const envTextrue = new THREE.CubeTextureLoader().load(
  [
    'img/px.jpg',
    'img/nx.jpg',
    'img/py.jpg',
    'img/ny.jpg',
    'img/pz.jpg',
    'img/nz.jpg',
  ],
  () => {
    inverMeterial.envMap = pmremGenerator.fromCubemap(envTextrue).texture
    pmremGenerator.dispose()
  }
)
const ballMaterial = [];

for (let i = 1; i < 11; i++) {
  ballMaterial.push(
    new THREE.MeshPhysicalMaterial({
      map: new THREE.TextureLoader().load(`img/lottery/${i}-ball.jpeg`),
      roughness: 0.88,
      metalness: 0.5,
      clearcoat: 0.3,
      clearcoatRoughness: 0.15,
    })
  )
  console.warn('ballMaterial', ballMaterial)
}

const positions = [
  [ -2, 3, 0 ],
  [ 0, 3, 0 ],
  [2, 3, 0],
  [0, 3, -2],
  [0, 3, 2],
  [-2, 6, 0],
  [0.5, 8, 0.5],
  [2, 6, 0],
  [0, 6, -2],
  [0, 6, 2],

]

const sphereMesh: THREE.Mesh[] = []
const sphereBody: CANNON.Body[] = []
for (let i = 0; i < 10; i++) {
  const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
  sphereMesh.push(
    new THREE.Mesh(sphereGeo, ballMaterial[i])
  )
  sphereMesh[i].position.set(positions[i][0], positions[i][1], positions[i][2])
  sphereMesh[i].castShadow = true;
  sphereMesh[i].receiveShadow = true;
  scene.add(sphereMesh[i]);
  const sphereShape = new CANNON.Sphere(1);
  sphereBody.push(new CANNON.Body({ mass: 1 }));
  sphereBody[i].addShape(sphereShape);
  sphereBody[i].position.set(sphereMesh[i].position.x, sphereMesh[i].position.y, sphereMesh[i].position.z)
  world.addBody(sphereBody[i]);
}

let inverseSphere: THREE.Object3D;
let inverseSphereBody: CANNON.Body;
let innerRail: THREE.Object3D;
let outerRail: THREE.Object3D;
let modelLoaded = false;
const objLoader = new OBJLoader();

objLoader.load(
  'models/inverseSphere4.obj',
  (object) => {
    object.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        if (child.name.startsWith('sphere')) {
          inverseSphere = child;
          ( inverseSphere as THREE.Mesh ).material = inverMeterial;
          inverseSphere.position.x = 0;
          inverseSphere.position.y = 5;
          let constraintBody = new CANNON.Body({ mass: 0 })
          constraintBody.addShape(new CANNON.Sphere(0.01));
          constraintBody.position.set(0, 5, 0);
          world.addBody(constraintBody);
  
          const shape = CannonUtils.CreateTrimesh(
            ( inverseSphere as THREE.Mesh ).geometry
          )
          inverseSphereBody = new CANNON.Body({ mass: 100 });
          inverseSphereBody.addShape(shape);
          inverseSphereBody.position.set(inverseSphere.position.x, inverseSphere.position.y, inverseSphere.position.z);
          world.addBody(inverseSphereBody);
          const c = new CANNON.PointToPointConstraint(
            constraintBody,
            new CANNON.Vec3(0, 0, 0),
            inverseSphereBody,
            new CANNON.Vec3(0, 0, 0),
          )
          world.addConstraint(c);
        } else if (child.name.startsWith('outerRail_')) {
          outerRail = child;
          ( outerRail as THREE.Mesh ).material = realMeterial;
          outerRail.position.y= 5;
          const outerRailShape = CannonUtils.CreateTrimesh(
            ( outerRail as THREE.Mesh ).geometry
          )
          const outerRailBody = new CANNON.Body({ mass: 0 });
          outerRailBody.addShape(outerRailShape);
          outerRailBody.position.set(0, 5, 0);
          world.addBody(outerRailBody);
        } else if (child.name.startsWith('innerRail_')) {
          innerRail = child;
          ( innerRail as THREE.Mesh ).material = inverMeterial;
          innerRail.position.y = 5;
          const innerRailShape = CannonUtils.CreateTrimesh(
            ( innerRail as THREE.Mesh ).geometry
          )

          inverseSphereBody.addShape(innerRailShape);
        }
      } 
      
    })

    scene.add(inverseSphere);
    scene.add(outerRail);
    scene.add(innerRail);
    modelLoaded = true;
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  },
  (error) => {
    console.log(error)
  }
)

const planeGeo = new THREE.PlaneGeometry( 25, 25 );
const planeMesh = new THREE.Mesh(planeGeo, phoneMeterial);

planeMesh.rotateX(-Math.PI / 2)
planeMesh.receiveShadow = true;
scene.add(planeMesh);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth , window.innerHeight);
}, false)


const clock = new THREE.Clock();
let delta;
function animate() {
  requestAnimationFrame(animate);

  orbitControls.update();
  delta = Math.min(clock.getDelta(), 0.1);
  
  world.step(delta)
  for (let i =0; i< 10; i++) {
    sphereMesh[i].position.set(
      sphereBody[i].position.x,
      sphereBody[i].position.y,
      sphereBody[i].position.z,
    )

    sphereMesh[i].quaternion.set(
      sphereBody[i].quaternion.x,
      sphereBody[i].quaternion.y,
      sphereBody[i].quaternion.z,
      sphereBody[i].quaternion.w,
    )
  }

  if (modelLoaded) {
    inverseSphereBody.angularVelocity.set(0, 0, -0.2);
    inverseSphere.position.set(
      inverseSphereBody.position.x,
      inverseSphereBody.position.y,
      inverseSphereBody.position.z,
    )
    inverseSphere.quaternion.set(
      inverseSphereBody.quaternion.x,
      inverseSphereBody.quaternion.y,
      inverseSphereBody.quaternion.z,
      inverseSphereBody.quaternion.w,
    )
    innerRail.position.set(
      inverseSphereBody.position.x,
      inverseSphereBody.position.y,
      inverseSphereBody.position.z,
    )
    innerRail.quaternion.set(
      inverseSphereBody.quaternion.x,
      inverseSphereBody.quaternion.y,
      inverseSphereBody.quaternion.z,
      inverseSphereBody.quaternion.w,
    )
  }

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();
