import * as THREE from "three";

// This is the initial file following https://threejs.org/docs/#manual/en/introduction/Creating-a-scene

//The THREE Important Fields
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .1, 1000);
const renderer = new THREE.WebGLRenderer();

camera.position.z = 5;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let geomerty, material, cube;

//Every Mesh Needs the first two
geomerty = new THREE.BoxGeometry();
material = new THREE.MeshBasicMaterial( { color: 0x4A0000 } );
cube = new THREE.Mesh( geomerty, material );

scene.add( cube );

const rotateCube = () => {
    cube.rotation.x += .01;
    cube.rotation.y += .01;
}

//Animate function must be set up to to see meshes, called at screen refresh rate
const animate = () => {
    requestAnimationFrame( animate );
    rotateCube();
    renderer.render( scene, camera );
}

animate();