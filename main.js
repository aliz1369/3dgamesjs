import * as THREE from "three";
import * as CANNON from "cannon-es";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GUI } from "dat.gui";

//setup Scene
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));
scene.fog = new THREE.Fog(0x222222, 1000, 2000);
//setup render
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor(scene.fog.color, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;
//Lights

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

// const spotLight = new THREE.SpotLight(0xffffff, 0.9, 0, Math.PI / 8, 1);
// spotLight.position.set(-30, 40, 30);
// spotLight.target.position.set(0, 0, 0);
// spotLight.castShadow = true;
// spotLight.shadow.camera.near = 10;
// spotLight.shadow.camera.far = 100;
// spotLight.shadow.camera.fov = 30;
// spotLight.shadow.mapSize.width = 512;
// spotLight.shadow.mapSize.height = 512;
// scene.add(spotLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.15);
directionalLight.position.set(-30, 40, 30);
directionalLight.target.position.set(0, 0, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 128;
directionalLight.shadow.mapSize.height = 128;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 1000;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.15);
directionalLight1.position.set(200, 500, 300);
directionalLight1.target.position.set(-30, 20, 20);
directionalLight1.castShadow = true;
directionalLight1.shadow.mapSize.width = 256;
directionalLight1.shadow.mapSize.height = 256;
directionalLight1.shadow.camera.near = 0.5;
directionalLight1.shadow.camera.far = 1000;
directionalLight1.shadow.camera.left = -10;
directionalLight1.shadow.camera.right = 10;
directionalLight1.shadow.camera.top = 10;
directionalLight1.shadow.camera.bottom = -10;
scene.add(directionalLight1);
//Setup Camera
const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(cameraHelper);

const cameraHelper1 = new THREE.CameraHelper(directionalLight1.shadow.camera);
scene.add(cameraHelper1);
const camera = new THREE.PerspectiveCamera(
  84,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(-10.0, 15.0, 15.0);
camera.lookAt(0, 0, 0);
const cameraOffset = new THREE.Vector3(-10.0, 15.0, 15.0);
//Orbit Control
const controls = new OrbitControls(camera, renderer.domElement);
controls.rotateSpeed = 1.0;
controls.zoomSpeed = 1.2;
controls.enableDamping = true;
controls.enablePan = true;
controls.dampingFactor = 0.2;
controls.minDistance = 10;
controls.maxDistance = 500;

//Create World
const physicsWorld = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0),
});

//Create Ground physics
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
physicsWorld.addBody(groundBody);

//Car Body physics

const carBody = new CANNON.Body({
  mass: 5,
  position: new CANNON.Vec3(0, 6, 0),
  shape: new CANNON.Box(new CANNON.Vec3(4, 0.5, 2)),
});

const vehicle = new CANNON.RigidVehicle({
  chassisBody: carBody,
});

//Car Wheel physics
const mass = 1;
const axisWidth = 6;
const wheelShape = new CANNON.Sphere(1);
const wheelMaterial = new CANNON.Material("wheel");
const down = new CANNON.Vec3(0, -1, 0);

const wheelBody1 = new CANNON.Body({ mass: mass, material: wheelMaterial });
wheelBody1.addShape(wheelShape);
wheelBody1.angularDamping = 0.4;
vehicle.addWheel({
  body: wheelBody1,
  position: new CANNON.Vec3(-2, 0, axisWidth / 2),
  axis: new CANNON.Vec3(0, 0, 1),
  direction: down,
});
const wheelBody2 = new CANNON.Body({ mass: mass, material: wheelMaterial });
wheelBody2.addShape(wheelShape);
wheelBody2.angularDamping = 0.4;
vehicle.addWheel({
  body: wheelBody2,
  position: new CANNON.Vec3(-2, 0, -axisWidth / 2),
  axis: new CANNON.Vec3(0, 0, 1),
  direction: down,
});
const wheelBody3 = new CANNON.Body({ mass: mass, material: wheelMaterial });
wheelBody3.addShape(wheelShape);
wheelBody3.angularDamping = 0.4;
vehicle.addWheel({
  body: wheelBody3,
  position: new CANNON.Vec3(2, 0, axisWidth / 2),
  axis: new CANNON.Vec3(0, 0, 1),
  direction: down,
});
const wheelBody4 = new CANNON.Body({ mass: mass, material: wheelMaterial });
wheelBody4.addShape(wheelShape);
wheelBody4.angularDamping = 0.4;
vehicle.addWheel({
  body: wheelBody4,
  position: new CANNON.Vec3(2, 0, -axisWidth / 2),
  axis: new CANNON.Vec3(0, 0, 1),
  direction: down,
});

vehicle.addToWorld(physicsWorld);

document.addEventListener("keydown", (event) => {
  const maxSteerVal = Math.PI / 8;
  const maxSpeed = 10;
  const maxForce = 100;

  switch (event.key) {
    case "w":
    case "ArrowUp":
      vehicle.setWheelForce(maxForce, 0);
      vehicle.setWheelForce(maxForce, 1);
      break;

    case "s":
    case "ArrowDown":
      vehicle.setWheelForce(-maxForce / 2, 0);
      vehicle.setWheelForce(-maxForce / 2, 1);
      break;

    case "a":
    case "ArrowLeft":
      vehicle.setSteeringValue(maxSteerVal, 0);
      vehicle.setSteeringValue(maxSteerVal, 1);
      break;

    case "d":
    case "ArrowRight":
      vehicle.setSteeringValue(-maxSteerVal, 0);
      vehicle.setSteeringValue(-maxSteerVal, 1);
      break;
  }
});

// reset car force to zero when key is released
document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "w":
    case "ArrowUp":
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 1);
      break;

    case "s":
    case "ArrowDown":
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 1);
      break;

    case "a":
    case "ArrowLeft":
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;

    case "d":
    case "ArrowRight":
      vehicle.setSteeringValue(0, 0);
      vehicle.setSteeringValue(0, 1);
      break;
  }
});

//Ground Material

const groundGeo = new THREE.PlaneGeometry(100, 30);
const groundMat = new THREE.MeshPhongMaterial();
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.receiveShadow = true;
scene.add(groundMesh);

//Car Body Matterial
const boxGeo = new THREE.BoxGeometry(8, 1, 4);
const boxMat = new THREE.MeshNormalMaterial();
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
boxMesh.castShadow = true;
boxMesh.receiveShadow = true;
scene.add(boxMesh);

//Car Wheel Material
const sphereGeometry1 = new THREE.SphereGeometry(1);
const sphereMaterial1 = new THREE.MeshLambertMaterial({ color: 0xdddddd });
const sphereMesh1 = new THREE.Mesh(sphereGeometry1, sphereMaterial1);
sphereMesh1.castShadow = true;
sphereMesh1.receiveShadow = true;
scene.add(sphereMesh1);

const sphereGeometry2 = new THREE.SphereGeometry(1);
const sphereMaterial2 = new THREE.MeshNormalMaterial();
const sphereMesh2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
sphereMesh2.castShadow = true;
sphereMesh2.receiveShadow = true;
scene.add(sphereMesh2);

const sphereGeometry3 = new THREE.SphereGeometry(1);
const sphereMaterial3 = new THREE.MeshNormalMaterial();
const sphereMesh3 = new THREE.Mesh(sphereGeometry3, sphereMaterial3);
sphereMesh3.castShadow = true;
sphereMesh3.receiveShadow = true;
scene.add(sphereMesh3);

const sphereGeometry4 = new THREE.SphereGeometry(1);
const sphereMaterial4 = new THREE.MeshNormalMaterial();
const sphereMesh4 = new THREE.Mesh(sphereGeometry4, sphereMaterial4);
sphereMesh4.castShadow = true;
sphereMesh4.receiveShadow = true;
scene.add(sphereMesh4);

//onResizeWindows()
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

//
const stats = new Stats();
document.body.appendChild(stats.dom);

const data = {
  color: directionalLight.color.getHex(),
  mapsEnabled: true,
  shadowMapSizeWidth: 512,
  shadowMapSizeHeight: 512,
};
const gui = new GUI();
const lightFolder = gui.addFolder("THREE.Light");
lightFolder.addColor(data, "color").onChange(() => {
  directionalLight.color.setHex(
    Number(data.color.toString().replace("#", "0x"))
  );
});
lightFolder.add(directionalLight, "intensity", 0, Math.PI * 2, 0.01);

const directionalLightFolder = gui.addFolder("THREE.DirectionalLight");
directionalLightFolder
  .add(directionalLight.shadow.camera, "left", -10, -1, 0.1)
  .onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(directionalLight.shadow.camera, "right", 1, 10, 0.1)
  .onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(directionalLight.shadow.camera, "top", 1, 10, 0.1)
  .onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(directionalLight.shadow.camera, "bottom", -10, -1, 0.1)
  .onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(directionalLight.shadow.camera, "near", 0.1, 100)
  .onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(directionalLight.shadow.camera, "far", 0.1, 100)
  .onChange(() => directionalLight.shadow.camera.updateProjectionMatrix());
directionalLightFolder
  .add(data, "shadowMapSizeWidth", [256, 512, 1024, 2048, 4096])
  .onChange(() => updateShadowMapSize());
directionalLightFolder
  .add(data, "shadowMapSizeHeight", [256, 512, 1024, 2048, 4096])
  .onChange(() => updateShadowMapSize());
directionalLightFolder.add(directionalLight.position, "x", -50, 50, 0.01);
directionalLightFolder.add(directionalLight.position, "y", -50, 50, 0.01);
directionalLightFolder.add(directionalLight.position, "z", -50, 50, 0.01);
directionalLightFolder.open();

function updateShadowMapSize() {
  directionalLight.shadow.mapSize.width = data.shadowMapSizeWidth;
  directionalLight.shadow.mapSize.height = data.shadowMapSizeHeight;
}

// const meshesFolder = gui.addFolder("Meshes");
// meshesFolder.add(data, "mapsEnabled").onChange(() => {
//   material.forEach((m) => {
//     if (data.mapsEnabled) {
//       m.map = texture;
//     } else {
//       m.map = null;
//     }
//     m.needsUpdate = true;
//   });
// });

function animate() {
  physicsWorld.fixedStep();
  groundMesh.position.copy(groundBody.position);
  groundMesh.quaternion.copy(groundBody.quaternion);

  boxMesh.position.copy(carBody.position);
  boxMesh.quaternion.copy(carBody.quaternion);

  sphereMesh1.position.copy(wheelBody1.position);
  sphereMesh1.quaternion.copy(wheelBody1.quaternion);

  sphereMesh2.position.copy(wheelBody2.position);
  sphereMesh2.quaternion.copy(wheelBody2.quaternion);

  sphereMesh3.position.copy(wheelBody3.position);
  sphereMesh3.quaternion.copy(wheelBody3.quaternion);

  sphereMesh4.position.copy(wheelBody4.position);
  sphereMesh4.quaternion.copy(wheelBody4.quaternion);

  requestAnimationFrame(animate);
  cameraHelper.update();
  // camera.position.copy(boxMesh.position).add(cameraOffset);
  // directionalLight.position.copy(boxMesh.position);
  render();
  stats.update();
}

function render() {
  renderer.render(scene, camera);
}
animate();
