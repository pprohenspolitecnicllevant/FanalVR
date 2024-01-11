import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ModelLoader from "./ModelLoader";
import { VRButton } from "three/examples/jsm/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

import "./style.css";

// Declaració d'elements principals
//Loader de models GLTF
const modelLoader = new ModelLoader();
//Loader de textures
let textureLoader = null;
const rotationSpeed = 0.0003;
let scene = null;
let camera = null;
let renderer = null;
// array d’objectes dels quals hem d’actualitzar la rotació.
const objects = [];

let controller1;
let controller2;

setupScene();

createElements();

vrElements();

function vrElements() {
  controller1 = renderer.xr.getController(0);
  controller2 = renderer.xr.getController(1);

  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  controller1.addEventListener("connected", function (event) {
    this.add(buildController(event.data));
  });
  controller1.addEventListener("disconnected", function () {
    this.remove(this.children[0]);
  });

  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);
  controller2.addEventListener("connected", function (event) {
    this.add(buildController(event.data));
  });
  controller2.addEventListener("disconnected", function () {
    this.remove(this.children[0]);
  });

  scene.add(controller1);
  scene.add(controller2);

  const controllerModelFactory = new XRControllerModelFactory();

  const controllerGrip1 = renderer.xr.getControllerGrip(0);
  controllerGrip1.add(
    controllerModelFactory.createControllerModel(controllerGrip1)
  );
  scene.add(controllerGrip1);

  const controllerGrip2 = renderer.xr.getControllerGrip(1);
  controllerGrip2.add(
    controllerModelFactory.createControllerModel(controllerGrip2)
  );
  scene.add(controllerGrip2);

  function buildController(data) {
    let geometry, material;
    switch (data.targetRayMode) {
      case "tracked-pointer":
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
        );
        geometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
        );
        material = new THREE.LineBasicMaterial({
          vertexColors: true,
          blending: THREE.AdditiveBlending,
        });
        return new THREE.Line(geometry, material);
      case "gaze":
        geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
        material = new THREE.MeshBasicMaterial({
          opacity: 0.5,
          transparent: true,
        });
        return new THREE.Mesh(geometry, material);
    }
  }

  function onSelectStart() {
    this.userData.isSelecting = true;
  }

  function onSelectEnd() {
    this.userData.isSelecting = false;
  }
}

// Preparació de l'escena
function setupScene() {
  //Loader de textures
  textureLoader = new THREE.TextureLoader();

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 4, 5);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  ////////VR//////////
  document.body.appendChild(VRButton.createButton(renderer));
  renderer.xr.enabled = true;
  ////////////////////

  //controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
}

let time = Date.now();
function animate() {
  const currentTime = Date.now();
  const deltaTime = currentTime - time;
  time = currentTime;

  objects.forEach((obj) => {
    if (obj != null) obj.rotation.y += rotationSpeed * deltaTime;
  });

  const objectsWithAnimations = findObjectsWithAnimations(scene);

  objectsWithAnimations.forEach((object) => {
    object.mixer?.update(deltaTime);
  });

  renderer.render(scene, camera);
  renderer.setAnimationLoop(animate);
}
animate();

function findObjectsWithAnimations(object, result = []) {
  if (object.actions && object.actions.length > 0) {
    // This object has animations, add it to the result array
    result.push(object);
  }

  if (object.children) {
    // Recursively check children

    object.children.forEach((child) => {
      findObjectsWithAnimations(child, result);
    });
  }

  return result;
}

function createElements() {
  const albedoRock = "textures/rockwall/rock_wall_11_diff_2k.jpg";
  const normalRock = "textures/rockwall/rock_wall_11_nor_gl_2k.jpg";
  const armRock = "textures/rockwall/rock_wall_11_arm_2k.jpg";
  const dispRock = "textures/rockwall/rock_wall_11_disp_2k.png";

  const albedoRockTexture = textureLoader.load(albedoRock);
  const normalRockTexture = textureLoader.load(normalRock);
  const armRockTexture = textureLoader.load(armRock);
  const dispRockTexture = textureLoader.load(dispRock);

  const albedoMud = "textures/mud/textures/brown_mud_leaves_01_diff_1k.jpg";
  const normalMud = "textures/mud/textures/brown_mud_leaves_01_nor_gl_1k.jpg";
  const roughMud = "textures/mud/textures/brown_mud_leaves_01_rough_1k.jpg";

  const albedoMudTexture = textureLoader.load(albedoMud);
  const normalMudTexture = textureLoader.load(normalMud);
  const roughMudTexture = textureLoader.load(roughMud);

  //plane
  const planeGeo = new THREE.PlaneGeometry(10, 10);
  const planeMat = new THREE.MeshStandardMaterial({
    map: albedoMudTexture,
    normalMap: normalMudTexture,
    roughnessMap: roughMudTexture,
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.receiveShadow = true;
  plane.rotation.x = Math.PI * -0.5;
  scene.add(plane);

  const sphereGeo = new THREE.SphereGeometry(1);
  const sphereMAT = new THREE.MeshStandardMaterial({
    map: albedoRockTexture,
    normalMap: normalRockTexture,
    aoMap: armRockTexture,
    displacementMap: dispRockTexture,
    displacementScale: 0.6,
  });

  const bolla = new THREE.Mesh(sphereGeo, sphereMAT);
  bolla.castShadow = true;
  bolla.position.y = 1;
  bolla.position.x = 0.5;
  bolla.position.z = -3;
  bolla.scale.set(0.8, 0.8, 0.8);
  scene.add(bolla);
  objects.push(bolla);

  modelLoader.loadModel(
    "models/Lantern.glb",
    new THREE.Vector3(-2.5, 0, -2),
    new THREE.Vector3(0.2, 0.2, 0.2),
    scene,
    true
  );

  modelLoader.loadModel(
    "models/BrainStem.glb",
    new THREE.Vector3(3, 0, -2),
    new THREE.Vector3(1, 1, 1),
    scene,
    true
  );

  // Create a warm-colored point light
  const pointLight = new THREE.PointLight(0xffaa00, 6); // Color: Warm yellow, Intensity: 1
  pointLight.position.set(-0.6, 3.5, -2); // Set the position of the light
  pointLight.castShadow = true;
  // Add the light to the scene
  scene.add(pointLight);

  // Create a warm-colored point light
  const robotoLight = new THREE.PointLight(0xffaa00, 6); // Color: Warm yellow, Intensity: 1
  robotoLight.position.set(2.5, 2.5, -1.5); // Set the position of the light
  robotoLight.castShadow = true;
  // Add the light to the scene
  scene.add(robotoLight);

  // Create a light helper for visualization
  // const lightHelper = new THREE.PointLightHelper(pointLight);
  // scene.add(lightHelper);

  camera.lookAt(plane.position);

  ////////ENTORN/////////////////
  const cubeTextureLoader = new THREE.CubeTextureLoader();
  const environmentMap = cubeTextureLoader.load([
    "textures/environmentMaps/sky/px.png",
    "textures/environmentMaps/sky/nx.png",
    "textures/environmentMaps/sky/py.png",
    "textures/environmentMaps/sky/ny.png",
    "textures/environmentMaps/sky/pz.png",
    "textures/environmentMaps/sky/nz.png",
  ]);

  scene.background = environmentMap;
}

// event javascript per redimensionar de forma responsive
window.addEventListener("resize", () => {
  //actualitzem tamany del renderer, de l'aspect ratio de la càmera, i
  //la matriu de projecció.
  //finalment limitem el pixel ratio a 2 per temes de rendiment
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
