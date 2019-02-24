var scene, camera, renderer, orbit, control;

var objects = [];

var lastSelected;

var mouse = new THREE.Vector2();

var keyframes = [];

var pathPoints = [];
var pathObjs = [];

var exportPath = null;
var exportObj = null;

let loadedModels = [];
let loadedMaterials = [];


var pathFollower = new PathFollower();
var geoFile = new GeoFile();

function initEditor(){
    document.getElementById("title").style.display = "none";
    document.getElementById("initialPage").style.display = "none";
    document.getElementById("editor").style.display = "block";


    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(120,120,120)");
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    var light = new THREE.AmbientLight(0x404040, 2); // soft white light
    scene.add(light);

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
    console.log(cube);

    

    

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


function exportContent(n){
    if(n == 1){
        let tempObj = [];
        for(let i = 0; i < pathObjs.length; i++){
            tempObj[i]= pathObjs[i];
            tempObj[i].position.copy(pathPoints[i][0]);
        }
        exportObj = tempObj;
        exportPath = pathPoints;
    }else{
        let geoText = geoFile.toText(objects);
        let keyText = geoFile.keysToText(pathObjs,pathPoints);
        geoFile.exportToAR(geoText, keyText, "teste");
    }
    

    

  //download('test.arcad', 'Hello world!');
}

function onModelLoad(event) {
    let modelData = event.target.result;
  
    let objLoader = new THREE.OBJLoader();
  
    var geometry = objLoader.parse(modelData);
    let pos = new THREE.Vector3(0, 0, 12);
  
    if (geometry.children.length > 0) {
      for (let i = 0; i < geometry.children.length; i++) {
        
        let obj = new THREE.Mesh(
          geometry.children[i].geometry,
          geometry.children[i].material
        );
        obj.position.copy(pos);
        scene.add(obj);
        loadedModels.push(obj);
        objects.push(obj);
      }
    } else {
      let obj = new THREE.Mesh(geometry.geometry, geometry.material);
      obj.position.copy(pos);
      scene.add(obj);
  
      loadedModels.push(obj);
      objects.push(obj);
    }
}
  
function onMaterialLoad(event) {
    let materialData = event.target.result;
    let mtlLoader = new THREE.MTLLoader();
    let material = mtlLoader.parse(materialData);
    let info = material.materialsInfo;
    let tempMat = [];
    let newMatArr;
  
    for (let name in info) {
      let newM = material.createMaterial_(name);
      tempMat.push(newM);
    }
  
    if(tempMat.length > 1){
      newMatArr = material.getAsArray();
      loadedMaterials.push(newMatArr);
    }else if(tempMat.length == 1){
      loadedMaterials.push(tempMat[0]);
    }
  
    if (loadedMaterials.length > 0) {
      for (let i = 0; i < loadedModels.length; i++) {
        loadedModels[i].material = loadedMaterials[i];
        loadedModels[i].needsUpdate = true;
        console.log("Materials Loaded!");
      }
    } else {
      alert("No materials loaded!!");
    }
}
  
function onChooseFile(event, onLoadFileHandler) {
    if (typeof window.FileReader !== "function")
      throw "The file API isn't supported on this browser.";
    let input = event.target;
    if (!input) throw "The browser does not properly implement the event object";
    if (!input.files)
      throw "This browser does not support the `files` property of the file input.";
    if (!input.files[0]) return undefined;
    let file = input.files[0];
    let fr = new FileReader();
    fr.onload = onLoadFileHandler;
    fr.readAsText(file);
}
