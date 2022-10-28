import * as THREE from "three";

import { addTargetSelection } from "./labels.js";
import { controls } from "./app.js";

// Global Variables
let isHovering = false;
let active = null;
let isFocused = false;

let onMouseHover = ( ) => { };

// Handles planet clicked
const onMouseClick = ( ) => {
    if(!isHovering || active == null || isFocused)
        return;

    isFocused = true;

    controls.maxDistance = 100;
    controls.minDistance = 50;
    controls.autoRotate = true;
    controls.autoRotateSpeed  = .15;
    controls.target = active.position;
    
    let container = document.getElementsByClassName("card-container")[0];
    let container2 = document.getElementsByClassName("planet-container")[0];
    let container3 = document.getElementsByClassName("close-btn")[0];

    container.classList.remove("hidden");
    container2.classList.remove("hidden");
    container3.classList.remove("hidden");
    
    let btn = container3.children[0];
    
    btn.onclick = () => {
        container.classList.add("hidden");
        container2.classList.add("hidden");
        container3.classList.add("hidden");

        controls.maxDistance = 700;
        controls.minDistance = 250;
        controls.autoRotate = false;
        controls.object.position.set( 0, 450, 500 );
        controls.target = new THREE.Vector3(0, 0, 0);

        isFocused = false;
    }
}

// HINDSIGHT - This is kind of confusingly named / done and should be revisited.
// However, this whole file scares me.

// Sets the handler for hover over a planet - Used to give outline glow
const setOnMouseHover = ( fun ) => {
    onMouseHover = fun;
}

// Sets the handler for hover over a helper selection object
const setSelectionAreaInteraction = ( selection, planet ) => {
    selection.element.onpointerover = () => { handleHover(selection); };
    selection.element.onpointerout = () => { 
        planet.remove(planet.getObjectByName("Outline")); 
        onMouseHover( [ new THREE.Object3D() ] );
        
        isHovering = false;
        active = null;
    };
}

// Passes hover from helper selection objects to planet
const handleHover = ( hovering ) => {
    active = hovering.parent;

    let focus = active.children.filter( child => {
        if(child.name !== "Area" && child.name !== "Outline" && child.name !== "Label")
        return child;
    });
    
    if(isFocused)
        return;
        
    if( !isHovering && active.getObjectByName("Outline") === undefined)
        addTargetSelection( hovering.parent );

    onMouseHover( focus );

    isHovering = true;
}

window.addEventListener( 'mousedown', () => onMouseClick(), true);

export { setOnMouseHover, setSelectionAreaInteraction };
