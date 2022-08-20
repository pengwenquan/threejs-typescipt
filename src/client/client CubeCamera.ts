import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb)

const ambientLight = new THREE.AmbientLight(0xaaaaaa)
scene.add(ambientLight)

const light1 = new THREE.PointLight()
light1.position.set(10, 10, 10)
light1.castShadow = true
light1.shadow.bias = -0.0002
light1.shadow.mapSize.height = 2048
light1.shadow.mapSize.width = 2048
scene.add(light1)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    100
)
camera.position.set(1.75, 1.75, 3.5)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const orbitControls = new OrbitControls(camera, renderer.domElement)
orbitControls.enableDamping = true

const planeGeometry = new THREE.PlaneGeometry(25, 25)
const texture = new THREE.TextureLoader().load('img/color.jpg')
const plane = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshPhongMaterial({ map: texture })
)
plane.rotateX(-Math.PI / 2)
plane.receiveShadow = true
scene.add(plane)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const cubeRenderTarget1 = new THREE.WebGLCubeRenderTarget(128, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
})
const cubeRenderTarget2 = new THREE.WebGLCubeRenderTarget(128, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
})
const cubeRenderTarget3 = new THREE.WebGLCubeRenderTarget(128, {
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
})
const cubeCamera1 = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget1)
const cubeCamera2 = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget2)
const cubeCamera3 = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget3)

const pivot1 = new THREE.Object3D()
scene.add(pivot1)
const pivot2 = new THREE.Object3D()
scene.add(pivot2)
const pivot3 = new THREE.Object3D()
scene.add(pivot3)

const material1 = new THREE.MeshPhongMaterial({
    envMap: cubeRenderTarget1.texture,
})
const material2 = new THREE.MeshPhongMaterial({
    envMap: cubeRenderTarget2.texture,
})
const material3 = new THREE.MeshPhongMaterial({
    envMap: cubeRenderTarget3.texture,
})

const ball1 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material1)
ball1.position.set(1, 1.1, 0)
ball1.castShadow = true
ball1.receiveShadow = true
ball1.add(cubeCamera1)
pivot1.add(ball1)

const ball2 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material2)
ball2.position.set(3.1, 1.1, 0)
ball2.castShadow = true
ball2.receiveShadow = true
ball2.add(cubeCamera2)
pivot2.add(ball2)

const ball3 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material3)
ball3.position.set(5.2, 1.1, 0)
ball3.castShadow = true
ball3.receiveShadow = true
ball3.add(cubeCamera3)
pivot3.add(ball3)

const stats = Stats()
document.body.appendChild(stats.dom)

const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    const delta = clock.getDelta()
    ball1.rotateY(-0.2 * delta)
    pivot1.rotateY(0.2 * delta)
    ball2.rotateY(-0.3 * delta)
    pivot2.rotateY(0.3 * delta)
    ball3.rotateY(-0.4 * delta)
    pivot3.rotateY(0.4 * delta)

    orbitControls.update()

    render()

    stats.update()
}

function render() {
    cubeCamera1.update(renderer, scene)
    cubeCamera2.update(renderer, scene)
    cubeCamera3.update(renderer, scene)

    renderer.render(scene, camera)
}

animate()