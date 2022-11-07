import * as THREE from 'three';
import * as YUKA from 'yuka';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const cena = new THREE.Scene();

renderer.setClearColor(0xA3A3A3);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 10, 15);
camera.lookAt(cena.position);

const iluminacao = new THREE.AmbientLight(0x333333);
cena.add(iluminacao);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 10, 10);
cena.add(directionalLight);

const veiculo = new YUKA.Vehicle();

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

const path = new YUKA.Path();
path.add( new YUKA.Vector3(-8, 5, 4));
path.add( new YUKA.Vector3(-6, 0, -12));
path.add( new YUKA.Vector3(0, 0, 0));
path.add( new YUKA.Vector3(10, 0, 0));
path.add( new YUKA.Vector3(4, 0, 4));
path.add( new YUKA.Vector3(7, 0, 7));
path.add( new YUKA.Vector3(2, 2, 9));

path.loop = true;

veiculo.position.copy(path.current());

veiculo.maxSpeed = 3;

const followPathBehavior = new YUKA.FollowPathBehavior(path, 3);
veiculo.steering.add(followPathBehavior);

const onPathBehavior = new YUKA.OnPathBehavior(path);
//onPathBehavior.radius = 2;
veiculo.steering.add(onPathBehavior);

const entityManager = new YUKA.EntityManager();
entityManager.add(veiculo);

const loader = new GLTFLoader();
loader.load('./assets/SUV.glb', function(glb) {
    const model = glb.scene;
    //model.scale.set(0.5, 0.5, 0.5);
    cena.add(model);
    model.matrixAutoUpdate = false;
    veiculo.scale = new YUKA.Vector3(0.5, 0.5, 0.5);
    veiculo.setRenderComponent(model, sync);
});

// const vehicleGeometry = new THREE.ConeBufferGeometry(0.1, 0.5, 8);
// vehicleGeometry.rotateX(Math.PI * 0.5);
// const vehicleMaterial = new THREE.MeshNormalMaterial();
// const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
// vehicleMesh.matrixAutoUpdate = false;
// scene.add(vehicleMesh);

const posicao = [];
for(let i = 0; i < path._waypoints.length; i++) {
    const waypoint = path._waypoints[i];
    posicao.push(waypoint.x, waypoint.y, waypoint.z);
}

const lineGeometry = new THREE.BufferGeometry();
lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(posicao, 3));

const lineMaterial = new THREE.LineBasicMaterial({color: 0xFFFFFF});
const lines = new THREE.LineLoop(lineGeometry, lineMaterial);
cena.add(lines);

const tempo = new YUKA.Time();

function animar() {
    const delta = tempo.update().getDelta();
    entityManager.update(delta);
    renderer.render(cena, camera);
}

renderer.setAnimationLoop(animar);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});