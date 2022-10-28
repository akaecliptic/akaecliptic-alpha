import * as THREE from "three";

import { GLTFLoader } from "gLTFLoader";

import { DELTA_TIME } from "./animator.js";

// Helper Functions
const randomInt = ( max ) => {
    return Math.floor( Math.random() * max );
}
const getRandomBias = ( min, max, bias, influence ) => {
    const rnd = Math.random() * ( max - min ) + min; // random in range
    const mix = Math.random() * influence; // random mixer
    return rnd * ( 1 - mix ) + ( bias * mix ); // mix full range and bias
}

// Constants
const CON_GRAVITATIONAL = .0001;
const LOADER = new GLTFLoader();
const PLANETS = [];

// Global Variables
let SUN = null;

// Creates star sphere around solar system
const createStars = () => {
    const geometry1 = new THREE.BufferGeometry();
    const geometry2 = new THREE.BufferGeometry();
    const geometry3 = new THREE.BufferGeometry();

    const vertGroup1 = [];
    const vertGroup2 = [];
    const vertGroup3 = [];
    
    for ( let i = 0; i < 15000; i ++ ) {
        const distance = THREE.MathUtils.randInt( 750, 1000 ); 
        const theta = THREE.MathUtils.randFloat( 0, ( Math.PI * 2 ) ); 
        const phi = getRandomBias( 0, Math.PI, ( Math.PI / 2 ), 3 ); 

        if( i % 10 === 0){ // Least Frequent
            vertGroup1.push( distance * Math.sin(theta) * Math.cos(phi) ); // x
            vertGroup1.push( distance * Math.sin(theta) * Math.sin(phi) ); // y
            vertGroup1.push( distance * Math.cos(theta) ); // z
        }else if(i % 3 === 0){ // More Frequent
            vertGroup2.push( distance * Math.sin(theta) * Math.cos(phi) ); // x
            vertGroup2.push( distance * Math.sin(theta) * Math.sin(phi) ); // y
            vertGroup2.push( distance * Math.cos(theta) ); // z
        }else{ // Most Frequent
            vertGroup3.push( distance * Math.sin(theta) * Math.cos(phi) ); // x
            vertGroup3.push( distance * Math.sin(theta) * Math.sin(phi) ); // y
            vertGroup3.push( distance * Math.cos(theta) ); // z
        }
    }

    geometry1.setAttribute( 'position', new THREE.Float32BufferAttribute( vertGroup1, 3 ) );
    geometry2.setAttribute( 'position', new THREE.Float32BufferAttribute( vertGroup2, 3 ) );
    geometry3.setAttribute( 'position', new THREE.Float32BufferAttribute( vertGroup3, 3 ) );

    geometry1.rotateZ( 90 );
    geometry2.rotateZ( 90 );
    geometry3.rotateZ( 90 );

    return [ 
        new THREE.Points( geometry1, new THREE.PointsMaterial( { color: 0xAAFFFF } ) ),
        new THREE.Points( geometry2, new THREE.PointsMaterial( { color: 0xFFF066 } ) ),
        new THREE.Points( geometry3, new THREE.PointsMaterial( { color: 0xFFFFFF } ) ) 
    ];
}

// Initialising values for each planet
const distributeOrbits = ( planet ) => {
    switch( planet.name ){
        case "Planet-1":
            planet.position.x = 325;
            planet.orbitalDistance = 325;
            planet.orbitalSpeed = .25;
            planet.rotationSpeed = .25;
            break;
        case "Planet-2":
            planet.position.x = 75;
            planet.orbitalDistance = 75;
            planet.orbitalSpeed = .75;
            planet.rotationSpeed = .75;
            break;
        case "Planet-3":
            planet.position.x = 125;
            planet.orbitalDistance = 125;
            planet.orbitalSpeed = .65;
            planet.rotationSpeed = .65;
            break;
        case "Planet-4":
            planet.position.x = 200;
            planet.orbitalDistance = 200;
            planet.orbitalSpeed = .55;
            planet.rotationSpeed = .50;
            break;
        case "Planet-5":
            planet.position.x = 400;
            planet.orbitalDistance = 400;
            planet.orbitalSpeed = .1;
            planet.rotationSpeed = .1;
            break;
    }

    planet.angleMove = randomInt( 360 );
}

// Orbital hints added to make tracking planets orbital path easier
const createOrbitHint = ( planet ) => {
    
    let dist = Math.sqrt(Math.pow(planet.position.x, 2) + Math.pow(planet.position.z, 2));
    // HINDSIGHT - Honestly, I don't know what this arbitrary number is.
    // If I had to guess, at one point the scales were not correctly applied in the Blender file.
    // This multiplier could be a hacky fix because I was unaware at the time.
    dist *= .02222; 

    const curve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        dist, dist,       // xRadius, yRadius
        0, ( 2 * Math.PI ),  // aStartAngle, aEndAngle
    );
    
    const points = curve.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const material = new THREE.LineBasicMaterial( { color : 0xFFFFFF } );

    material.transparent = true;
    material.opacity = .1;

    const line = new THREE.Line( geometry, material );
    line.rotateX( 90 * ( Math.PI / 180 ) );
    line.name = "Orbit";

    return line;
}

// Used to load in planets to scene
const loadPlanets = ( callback ) => {
    LOADER.load( '/render/Planets.glb', loaded => {
        const orbits = [];

        loaded.scene.children.forEach( planet => {
            if ( planet.name != "Planet-Sun" ) {
                distributeOrbits( planet );

                PLANETS.push( planet );
                orbits.push( createOrbitHint( planet ) );
            } else {
                SUN = planet;
            }
        });

        orbits.forEach( orbit => SUN.add( orbit ) );
        
        callback( loaded.scene );
    });
}

// Planet orbital and rotational logic, called once per update
const updateOrbit = ( planet ) => {
    planet.angleMove -= CON_GRAVITATIONAL * DELTA_TIME * planet.orbitalSpeed;
    const totalAngle = Math.PI + planet.angleMove;
    
    const xPos = Math.sin( totalAngle ) * planet.orbitalDistance;
    const zPos = Math.cos( totalAngle ) * planet.orbitalDistance;
    
    planet.position.x = xPos;
    planet.position.z = zPos;
}

const rotatePlanet = ( planet, camera ) => {
    planet.rotation.y += DELTA_TIME * .001 * planet.rotationSpeed;

    // This makes the helper objects always face the camera
    // This was added to make planets easier to click
    planet.children.forEach( child => {
        if ( child.name === "Area" || child.name === "Outline" ) {
            child.lookAt( camera.position );
        }
    });
}

// Wrapper function for planet movement logic
const updateOrbits = ( camera ) => {
    PLANETS.forEach( planet => updateOrbit( planet ) );
    PLANETS.forEach( planet => rotatePlanet( planet, camera ) );
}

export { PLANETS, SUN, createStars, loadPlanets, updateOrbits };
