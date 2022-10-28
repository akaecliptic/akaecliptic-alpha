var DELTA_TIME, lastTime;

var onAnimate = () => {};
var render = () => {};

// Callback setters
const setAnimationCallback = ( callback ) => {
    onAnimate = callback;
}

const setRender = ( callback ) => {
    render = callback;
}

// Main animation loop
const animate = ( timestamp ) => {
    requestAnimationFrame( animate );

    if ( !lastTime ) {
        lastTime = timestamp;
        return;
    }

    DELTA_TIME = timestamp - lastTime;
    lastTime = timestamp;

    onAnimate();

    render();
}

export { DELTA_TIME, setRender, setAnimationCallback, animate };
