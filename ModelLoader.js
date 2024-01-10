import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class ModelLoader {
  constructor() {
    // Initialize any properties or configurations here
    this.loader = new GLTFLoader();
  }

  loadModel(path, position, scale, systemToAdd, shadows = true) {
    // Assuming 'loader' is a property of your class
    this.loader.load(
      path,
      //FUNCIONS DE CALLBACK
      (gltf) => {
        // Recorrem els meshes per habilitar el model per caster sombres
        if (shadows)
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true; // Habilitam el shadowcasting en els mesh del model
            }
          });

        // Si es carrega correctament l'afegim a l'escena
        const object3d = gltf.scene
        object3d.position.set(position.x, position.y, position.z);
        object3d.scale.set(scale.x, scale.y, scale.z);
        systemToAdd.add(object3d);

        // Check if the GLTF model has animations
        if (gltf.animations && gltf.animations.length > 0) {
          // Add animations to the object3d
          const mixer = new THREE.AnimationMixer(object3d);
          const actions = [];

          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            actions.push(action);
          });

          mixer.timeScale = 0.0005; // You can adjust the time scale if needed

          // Store the mixer and actions in a property of object3d (you may adjust this based on your needs)
          object3d.mixer = mixer;
          object3d.actions = actions;

          object3d.actions[0].play();
          // Optionally, start playing the animations
          //object3d.actions.forEach((action) => action.play());
        }
      },
      (xhr) => {
        // Aquesta funció de callback es crida mentre es carrega el model
        // i podem mostrar el progrés de càrrega
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      (error) => {
        // Callback per quan hi ha un error. El podem mostrar per consola.
        console.error(error);
      }
    );
  }
}

// Export the class for importing in other scripts
export default ModelLoader;
