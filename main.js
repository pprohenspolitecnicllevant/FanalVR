import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import ModelLoader from "./ModelLoader";
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

setupScene();

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
bolla.position.z = -0.5;
bolla.scale.set(0.8, 0.8, 0.8);
scene.add(bolla);
objects.push(bolla);

modelLoader.loadModel(
  "models/Lantern.glb",
  new THREE.Vector3(-2.5, 0, 0),
  new THREE.Vector3(0.2, 0.2, 0.2),
  scene,
  true
);

modelLoader.loadModel(
  "models/BrainStem.glb",
  new THREE.Vector3(2, 0, 2),
  new THREE.Vector3(1, 1, 1),
  scene,
  true
);

// Create a warm-colored point light
const pointLight = new THREE.PointLight(0xffaa00, 6); // Color: Warm yellow, Intensity: 1
pointLight.position.set(-0.6, 3.5, 0); // Set the position of the light
pointLight.castShadow = true;
// Add the light to the scene
scene.add(pointLight);

// Create a warm-colored point light
const robotoLight = new THREE.PointLight(0xffaa00, 6); // Color: Warm yellow, Intensity: 1
robotoLight.position.set(2.5, 2.5, 2.5); // Set the position of the light
robotoLight.castShadow = true;
// Add the light to the scene
scene.add(robotoLight);

// Create a light helper for visualization
// const lightHelper = new THREE.PointLightHelper(pointLight);
// scene.add(lightHelper);

camera.lookAt(bolla.position);

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

  //controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  //directional light
  // const dirlight = new THREE.DirectionalLight(0xffffff, 0.3);
  // dirlight.castShadow = true;
  // dirlight.position.set(4, 4, 2);
  // scene.add(dirlight);

  //spotlight
  // const spotLight = new THREE.SpotLight(0xffffff, 20, 40, Math.PI/8)
  // spotLight.position.set(-5, 4, 1)
  // spotLight.castShadow=true
  // scene.add(spotLight)

}


let time = Date.now();
function animate() {
  const currentTime = Date.now();
  const deltaTime = currentTime - time;
  time = currentTime;

  objects.forEach((obj) => {
    if (obj != null) obj.rotation.y += rotationSpeed * deltaTime;
  });

  const objectsWithAnimations = findObjectsWithAnimations(scene)

  objectsWithAnimations.forEach((object) => {
    object.mixer?.update(deltaTime)
  });

  console.log(objectsWithAnimations)

  camera.lookAt(bolla.position);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
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
