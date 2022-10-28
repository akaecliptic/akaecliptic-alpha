import * as THREE from "three";

import { OrbitControls }  from "orbitControls";

import { RenderPass } from "renderPass";
import { EffectComposer } from "effectComposer";
import { OutlinePass } from "outlinePass";
import { ShaderPass } from "shaderPass";
import { UnrealBloomPass } from "unrealBloomPass";

import { CSS2DRenderer } from "cSS2DRenderer";
import { CSS3DRenderer } from "cSS3DRenderer";

import { createStars, loadPlanets, updateOrbits, PLANETS, SUN } from "./celestialBodies.js";
import { setAnimationCallback, setRender, animate } from "./animator.js";
import { setOnMouseHover } from "./interactions.js";
import { addLabel } from "./labels.js";

// HINDSIGHT - Out of all files, I think this is the most untouched.
// Partly because it scares me...
// Mostly because although this is a hacky mess with crass JS, it was my first try at this.
// It ain't pretty, but it's got heart. So, I'll take it.
// The bloom effect code is based on https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_unreal_bloom_selective.html

//The THREEJS important jields
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, .1, 10000);
const renderer = new THREE.WebGLRenderer( { antialias: true } );

camera.position.set( 0, 450, 500 );

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClear = false;

document.body.appendChild( renderer.domElement );

// Constants
const PLANET_LAYER = 0, SUN_LAYER = 1;
const sunLayer = new THREE.Layers();

const darkMaterial = new THREE.MeshBasicMaterial( { color: "black" } );
const materials = {};

const composer = new EffectComposer( renderer );
const composerBloom = new EffectComposer( renderer );

const renderPass = new RenderPass( scene, camera );
const outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
const unrealBloomPass = new UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.2, 1, 0);
const finalPass = new ShaderPass(
    new THREE.ShaderMaterial( {
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: composerBloom.renderTarget2.texture }
        },
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        depthTest: false,
        defines: {}
    } ), "baseTexture"
);

// Additional initialisation for above constants
finalPass.needsSwap = true;
sunLayer.set( SUN_LAYER );
unrealBloomPass.getSeperableBlurMaterial = false

// Render passess
composer.addPass( renderPass );
composer.addPass( outlinePass );
composer.addPass( finalPass );

composerBloom.addPass( renderPass );
composerBloom.addPass( unrealBloomPass );
composerBloom.renderToScreen = false;

// Additional Renderers for CSS Objects
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';

const renderer3D = new CSS3DRenderer();
renderer3D.setSize( window.innerWidth, window.innerHeight );
renderer3D.domElement.style.position = 'absolute';
renderer3D.domElement.style.top = '0px';

document.body.appendChild( labelRenderer.domElement );
document.body.appendChild( renderer3D.domElement );

// Orbital camera
export const controls = new OrbitControls( camera, renderer3D.domElement );

controls.enablePan = false;
controls.maxDistance = 700;
controls.minDistance = 250;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Initialising Scene Objects
const stars = createStars();
stars.forEach( star => {
    scene.add(star);
    star.layers.set( SUN_LAYER );
});

const texture = new THREE.CubeTextureLoader().load([
    '/skybox/Right.png',
    '/skybox/Left.png',
    '/skybox/Top.png',
    '/skybox/Bottom.png',
    '/skybox/Front.png',
    '/skybox/Back.png',
]);

const addSunLight = ( scene ) => {
    const pointLight = new THREE.PointLight( 0xFFEE88, 7, 1000, 1);
    const ambientLight = new THREE.AmbientLight( 0x777777 );

    scene.add( pointLight );
    scene.add( ambientLight );
}

loadPlanets( loaded => {
    scene.add(...loaded.children);
    addSunLight(scene);
    
    SUN.layers.set( SUN_LAYER );
    setOnMouseHover( ( planet ) => { outlinePass.selectedObjects = [ ...planet ] } );
    PLANETS.forEach( planet => { 
        addLabel(planet); 
        planet.layers.set( PLANET_LAYER );
    });
});

// Bloom effect functions to dynamically swap materials
const hidePlanetMaterial = ( planetMesh ) => {
    if ( planetMesh.isMesh && sunLayer.test( planetMesh.layers ) === false ) {
        materials[ planetMesh.uuid ] = planetMesh.material;
        planetMesh.material = darkMaterial;
    }
}

const restorePlanetMaterial = ( planetMesh ) => {
    if ( materials[ planetMesh.uuid ] ) {
        planetMesh.material = materials[ planetMesh.uuid ];
        delete materials[ planetMesh.uuid ];
    }
}

// Call Renderers / Composers in correct processing order
const renderComposers = () => {
    camera.layers.enable( SUN_LAYER );

    scene.traverse(hidePlanetMaterial);
    scene.background = darkMaterial;

    composerBloom.render();

    scene.traverse(restorePlanetMaterial);
    scene.background = texture;

    composer.render();
};

// Resize all necessary components with window
const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    
    camera.updateProjectionMatrix();
    
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight );
    composerBloom.setSize( window.innerWidth, window.innerHeight );
    labelRenderer.setSize( window.innerWidth, window.innerHeight );
    renderer3D.setSize( window.innerWidth, window.innerHeight );
};

window.addEventListener( 'resize', onWindowResize );

// Render loop set up
setRender( () => { 
    renderComposers();
    labelRenderer.render( scene, camera );
    renderer3D.render( scene, camera );
});

setAnimationCallback( () => {
    controls.update();
    updateOrbits( camera );
});

animate();
