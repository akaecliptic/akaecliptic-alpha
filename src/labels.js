import { CSS2DObject } from "cSS2DRenderer";
import { CSS3DObject } from "cSS3DRenderer";

import { setSelectionAreaInteraction } from "./interactions.js";

// Helper function to set planet name
const getPlanetName = ( name ) => {
    switch( name ){
        case "Planet-1":
            return "TECHNOLOGIES"
        case "Planet-2":
            return "WORK"
        case "Planet-3":
            return "EDUCATION"
        case "Planet-4":
            return "PROFILE"
        case "Planet-5":
            return "CONTACT"
    }
}

// Adds all helper planet objects
const addLabel = ( planet ) => {
    const dist =  planet.children[0].geometry.boundingSphere.radius;

    addSelectionArea(planet, ( planet.name === 'Planet-1' ) ? dist + 15 : dist );

    const planetDiv = document.createElement( 'div' );

    planetDiv.className = 'label';
    planetDiv.textContent = getPlanetName(planet.name);

    const planetLabel = new CSS2DObject( planetDiv );

    planetLabel.position.set( 0, dist, 0 );
    planetLabel.name = 'Label'

    planet.add( planetLabel );
};

// Adds object to make clicking planets easier
const addSelectionArea = ( planet, radius ) => {
    
    const selectionDiv = document.createElement( 'div' );

    // CSS styling
    selectionDiv.className = 'selectionArea';

    selectionDiv.style.height = `${radius + 12}px`;
    selectionDiv.style.width = `${radius + 12}px`;
    selectionDiv.style.borderRadius = '100%';

    selectionDiv.style.border = '1px solid';
    selectionDiv.style.borderColor = 'rgba( 255, 255, 255, .5)';

    const selectionArea = new CSS3DObject( selectionDiv );

    selectionArea.position.set( 0, 0, 0 );
    selectionArea.name = 'Area';

    planet.add( selectionArea );
    
    addStyles( planet.name, radius )
    setSelectionAreaInteraction( selectionArea, planet );
}

// Adds animations to CSS3D object
const addStyles = ( id, dist ) => {
    const styles = window.document.styleSheets[0];

    styles.insertRule(`#${id} { animation: target-${id} .25s forwards; }`, styles.cssRules.length );
    styles.insertRule(`@keyframes target-${id} {
            0%  { height: 0px; width: 0px }
            100% { height: ${dist + 20}px; width: ${dist + 20}px }
        }`,
        styles.cssRules.length 
    );
}

// Adds crosshair when hovered
const addTargetSelection = ( planet ) => {
    let dist =  planet.children[0].geometry.boundingSphere.radius;
    dist = ( planet.name === 'Planet-1' ) ? dist + 15 : dist;

    const selectionDiv = document.createElement( 'img' );
    
    selectionDiv.className = 'targetSelection';
    selectionDiv.id = planet.name;

    selectionDiv.style.backgroundColor = 'rgba( 255, 255, 255, 0)';
    selectionDiv.src = 'cross-hair.svg'

    const selectionArea = new CSS3DObject( selectionDiv );

    selectionArea.position.set( 0, 0, 0 );
    selectionArea.name = 'Outline';

    planet.add( selectionArea );
}

export { addLabel, addSelectionArea, addTargetSelection };
