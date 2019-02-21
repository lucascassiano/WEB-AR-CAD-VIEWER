var scene, camera, renderer, orbit, control;

var objects = [];

var lastSelected;

var mouse = new THREE.Vector2();

var keyframes = [];

var pathPoints = [];
var pathObjs = [];

var exportPath = [];
var exportObj = [];


var pathFollower = new PathFollower();


function initEditor(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(63,63,63)");
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color("lightgrey"), 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    var renderDiv = document.getElementById('renderDiv');

    if(renderDiv.hasChildNodes()){
        renderDiv.removeChild(renderDiv.childNodes[0]);
        renderDiv.appendChild( renderer.domElement );
    }else{
        renderDiv.appendChild( renderer.domElement );
    }

    orbit = new THREE.OrbitControls( camera, renderDiv);
    orbit.update();
    orbit.addEventListener( 'change', render );

    control = new THREE.TransformControls( camera, renderDiv);
    control.addEventListener( 'change', render );

    control.addEventListener( 'dragging-changed', function ( event ) {

        orbit.enabled = ! event.value;

    } );
    scene.add(control);

    var size = 10;
    var divisions = 10;

    var gridHelper = new THREE.GridHelper( size, divisions );
    scene.add( gridHelper );

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    objects.push(cube);

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x67f5ff, transparent: true } );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(1,0,1);
    scene.add( cube );
    objects.push(cube);

    camera.position.z = 5;

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onkeydown, false);


    animate();
}



function animate() {
    requestAnimationFrame( animate );
    pathFollower.update();
    
    render();
};

function render(){
    renderer.render( scene, camera );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown(event) {
    event.preventDefault();
  
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
  
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
  
    let intersects = raycaster.intersectObjects(objects);
    
    if(intersects.length > 0){  
          control.attach(intersects[0].object);
          lastSelected = intersects[0].object;
          lastSelected.material.opacity = 0.75;
        
    }else{
        if(lastSelected != null){
            control.detach(lastSelected);
            lastSelected.material.opacity = 1;
        }
      
    }
}

function onkeydown(event){
    switch ( event.keyCode ) {

      case 81: // Q
          control.setSpace( control.space === "local" ? "world" : "local" );
          break;

      case 17: // Ctrl
          control.setTranslationSnap( 100 );
          control.setRotationSnap( THREE.Math.degToRad( 15 ) );
          break;

      case 87: // W
          control.setMode( "translate" );
          break;

      case 69: // E
          control.setMode( "rotate" );
          break;

      case 82: // R
          control.setMode( "scale" );
          break;

      case 187:
      case 107: // +, =, num+
          control.setSize( control.size + 0.1 );
          break;

      case 189:
      case 109: // -, _, num-
          control.setSize( Math.max( control.size - 0.1, 0.1 ) );
          break;

      case 88: // X
          control.showX = ! control.showX;
          break;

      case 89: // Y
          control.showY = ! control.showY;
          break;

      case 90: // Z
          control.showZ = ! control.showZ;
          break;

      case 32: // Spacebar
          control.enabled = ! control.enabled;
          break;

    }
}

function saveKeyframe(){
    let found = false;

    let tempPos = new THREE.Vector3();
    tempPos.copy(lastSelected.position);

    var material = new THREE.LineBasicMaterial({
        color: "rgb(255, 00, 00)"
    });

    if(keyframes.length > 0){
        
        for(let i = 0; i < keyframes.length; i++ ){
            if(keyframes[i].obj == lastSelected){
                scene.remove(keyframes[i].path);

                var geometry = new THREE.Geometry();
                
                geometry.vertices = keyframes[i].path.geometry.vertices;
                geometry.vertices.push(tempPos);

                var line = new THREE.Line(geometry, material);

                keyframes[i].path = line;
                keyframes[i].pathPoints = line.geometry.vertices;

                
                pathPoints[i] = line.geometry.vertices;

                scene.add(keyframes[i].path);

                found = true;

                break;

            }
        }
        if(!found){
            var geometry = new THREE.Geometry();

            geometry.vertices.push(tempPos);
        
            var line = new THREE.Line(geometry, material);
           
            let frame = {
                obj: lastSelected,
                path: line,
                pathPoints: line.geometry.vertices
            }

            scene.add(frame.path);

            pathObjs.push(lastSelected);
            pathPoints.push(line.geometry.vertices)

            keyframes.push(frame);
        }
            
    }else{
        var geometry = new THREE.Geometry();

        geometry.vertices.push(tempPos);
    
        var line = new THREE.Line(geometry, material);
        
        let frame = {
            obj: lastSelected,
            path: line,
            pathPoints: line.geometry.vertices
        }

        scene.add(frame.path);

        pathObjs.push(lastSelected);
        pathPoints.push(line.geometry.vertices)

        keyframes.push(frame);
    }
    
    
}

function preview(){
    pathFollower.preview(pathObjs, pathPoints);
}


function exportContent(){
    let tempObj = [];
    for(let i = 0; i < pathObjs.length; i++){
        tempObj[i]= pathObjs[i];
        tempObj[i].position.copy(pathPoints[i][0]);
    }
    exportObj = tempObj;
    exportPath = pathPoints;


   // download('test.arcad', 'Hello world!');
}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}