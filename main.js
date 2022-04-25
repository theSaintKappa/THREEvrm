import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRMUtils, VRMSchema, VRM } from '@pixiv/three-vrm';



const progressContainer = document.querySelector('.progress-container');
const currentText = document.querySelector('.current-text');
const progressBar = document.querySelector('.progress-bar');
const progressText = document.querySelector('.progress-text');

THREE.DefaultLoadingManager.onStart = function(url, itemsLoaded, itemsTotal) {
    console.log('Started loading file.');
    currentText.innerText = `Loading asset: ${url} (${itemsLoaded}/${itemsTotal})`;
};
THREE.DefaultLoadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

    progressBar.value = (itemsLoaded / itemsTotal) * 100;

    currentText.innerText = `Loading asset: ${url} (${itemsLoaded}/${itemsTotal})`;
};
THREE.DefaultLoadingManager.onLoad = function() {
    console.log('Loading Complete!');
    progressText.innerText = "Loading Complete!";
    progressContainer.style.opacity = '0';
    setTimeout(() => { progressContainer.remove(); }, 2050);
};



// url params
const urlParams = new URLSearchParams(window.location.search);
var modelName = urlParams.get('vrmModel');
if (modelName === undefined || modelName === null) {
    var modelName = 'astolfo';
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
camera.position.set(0.0, 1.0, 5.0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0.0, 1.0, 0.0);
controls.update();

const scene = new THREE.Scene();

const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1.0, 1.0, 1.0).normalize();
scene.add(light);



// gltf and vrm
const loader = new GLTFLoader();
loader.crossOrigin = 'anonymous';
loader.load(
    `./models/${modelName}.vrm`,

    // called when the resource is loaded
    (gltf) => {

        // calling these functions greatly improves the performance
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);

        // generate VRM instance from gltf
        VRM.from(gltf).then((vrm) => {

            console.log(vrm);
            scene.add(vrm.scene);

            vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;
            vrm.springBoneManager.reset();

        });

    },

    // called while loading is progressing
    (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

    // called when loading has errors
    (error) => console.error(error)

);




// helpers
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

function animate() {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);

}

animate();