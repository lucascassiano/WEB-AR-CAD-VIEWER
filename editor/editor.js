var scene, camera, renderer, orbit, control, gridHelper;

var objects = [];

var lastSelected;
var lastSelectedToMaterial;

var mouse = new THREE.Vector2();

var keyframes = [];

var pathPoints = [];
var pathObjs = [];

var exportPath = null;
var exportObj = null;

var popMenu = false;
var overMenu = false;

var keysOpen = false;

var lastKeySelected = new THREE.Vector2();
var lastKeySelectedElement;

var pathUpdate = false;

var size = 15;
var divisions = 15;

var lightState = true;

var pathFollower = new PathFollower();
var geoFile = new GeoFile();


var elementPicker = document.getElementById("colorPicker");
var picker = new Picker(elementPicker);

function initEditor(){
    document.getElementById("title").style.display = "none";
    document.getElementById("initialPage").style.display = "none";
    document.getElementById("editor").style.display = "block";


    scene = new THREE.Scene();
    scene.background = new THREE.Color("rgb(255,255,255)");
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    
    var light = new THREE.AmbientLight(0x404040, 3); // soft white light
    scene.add(light);

    var light = new THREE.DirectionalLight( 0xffffff, 1, 100 );
    light.position.set( 10, 50, 0 ); 			//default; light shining from top
    light.castShadow = true;            // default false
    scene.add( light );

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setClearColor(new THREE.Color("lightgrey"), 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

   

    gridHelper = new THREE.GridHelper( size, divisions );
    gridHelper.recieveShadows = true;
    scene.add( gridHelper );

    

    console.log(gridHelper)

    // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, transparent: true } );
    // var cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );
    // objects.push(cube);

    // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // var material = new THREE.MeshBasicMaterial( { color: 0x67f5ff, transparent: true } );
    // var cube = new THREE.Mesh( geometry, material );
    // cube.position.set(1,0,1);
    // scene.add( cube );
    // objects.push(cube);
    // console.log(cube);

    camera.position.z = 5;

    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'keydown', onkeydown, false);


    animate();
}

function animate() {
    requestAnimationFrame( animate );
    if(pathUpdate){
        pathFollower.update();
    }
    
    
    render();
}

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
    
    
    if(event.button == 0){
        if(!popMenu){

            if(intersects.length > 0){ 
                if(lastSelected == null){
                    
                    control.attach(intersects[0].object);
                    lastSelected = intersects[0].object;
                    lastSelected.material.opacity = 0.75;
    
                } else if(lastSelected.id != intersects[0].object.id ){
                    
                    control.detach(lastSelected);
                    lastSelected.material.opacity = 1;
    
                    control.attach(intersects[0].object);
                    lastSelected = intersects[0].object;
                    lastSelected.material.opacity = 0.75;
                }
            
               
            }
        }else{
            if(event.path[0].localName == "canvas" ){
                document.getElementById("optBt").style.display = "none";
                popMenu = false;
            }
        }
       
    }else if(event.button == 2){
        
        if(intersects.length > 0){ 
            if(lastSelected != null){
                document.getElementById("optBt").style.display = "block";
                document.getElementById("optBt").style.top = String(event.clientY) + "px";
                document.getElementById("optBt").style.left= String(event.clientX) + "px";
                
    
                lastSelectedToMaterial = intersects[0].object;
                popMenu = true;
            }
           
           
        }
    }
         
}

function menuState(n){
    if(n == 1){
        menuState = true;
    }else{
        menuState = false
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

    let tempRot= new THREE.Quaternion();
    tempRot.copy(lastSelected.quaternion);

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
                keyframes[i].position = line.geometry.vertices;
                keyframes[i].rotation.push(tempRot);
                
                pathPoints[i].position = line.geometry.vertices;
                pathPoints[i].rotationQuat = keyframes[i].rotation;
                scene.add(keyframes[i].path);

                found = true;

                break;

            }
        }
        if(!found){
            var geometry = new THREE.Geometry();

            geometry.vertices.push(tempPos);
        
            var line = new THREE.Line(geometry, material);
           
            let rotArr = [];
            rotArr.push(tempRot);
            
            let frame = {
                obj: lastSelected,
                path: line,
                position: line.geometry.vertices,
                rotation: rotArr
            }

            scene.add(frame.path);

            pathObjs.push(lastSelected);
            
            let transform = {
                position: line.geometry.vertices,
                rotationQuat: rotArr
            }
            pathPoints.push(transform);

            keyframes.push(frame);
        }
            
    }else{
        var geometry = new THREE.Geometry();

        geometry.vertices.push(tempPos);
    
        var line = new THREE.Line(geometry, material);

        let rotArr = [];
        rotArr.push(tempRot);
        
        let frame = {
            obj: lastSelected,
            path: line,
            position: line.geometry.vertices,
            rotation: rotArr
        }

        scene.add(frame.path);

        pathObjs.push(lastSelected);

        let transform = {
            position: line.geometry.vertices,
            rotationQuat: rotArr
        }
        pathPoints.push(transform);

        keyframes.push(frame);
    }
    
    if(keysOpen){
        keysOpen = false;
        showKeys();
    }
}

function preview(){
    pathFollower.preview(pathObjs, pathPoints);
    pathUpdate = true;
}

function exportContent(n){
    if(n == 1){
        let tempObj = [];
        for(let i = 0; i < pathObjs.length; i++){
            tempObj[i]= pathObjs[i];
            tempObj[i].position.copy(pathPoints[i].position[0]);
        }
        exportObj = tempObj;
        exportPath = pathPoints;
        
    }else{
        let geoText = geoFile.toText(objects);
        let keyText = geoFile.keysToText(pathObjs,pathPoints);
        geoFile.exportToAR(geoText, keyText, "ModelsAR");
    }
}

function onModelLoadFromFile(event) {
    let text = event.target.result;
 
    let toAdd = geoFile.importInAR(text);

    for(let i = 0; i < toAdd.meshesArr.length; i++){
        toAdd.meshesArr[i].mesh.castShadow = true;
        for(let j = 0; j < toAdd.keyframes.length; j++){
            if(toAdd.meshesArr[i].id == toAdd.keyframes[j].id ){
                tempId = toAdd.meshesArr[i].id;
                break;
            }
        }
        toAdd.meshesArr[i].mesh.position.copy(toAdd.keyframes[i].position[0]);

        scene.add(toAdd.meshesArr[i].mesh);

        let addedMesh = scene.children[scene.children.length - 1];

        objects.push(addedMesh);

        var material = new THREE.LineBasicMaterial({
            color: "rgb(255, 00, 00)"
        });

        var geometry = new THREE.Geometry();

        for(let j = 0; j < toAdd.keyframes[i].position.length; j++){
            geometry.vertices.push(toAdd.keyframes[i].position[j]);
        }
    
        var line = new THREE.Line(geometry, material);

        scene.add(line);

        let frame = {
            obj: addedMesh,
            path: line,
            position: line.geometry.vertices,
            rotation: toAdd.keyframes[i].rotationQuat
        }

        keyframes.push(frame);

        pathObjs.push(addedMesh);
        let transform = {
            position:  keyframes[i].position,
            rotationQuat: keyframes[i].rotationQuat
        }
        pathPoints.push(transform);
        
    }

    this.value = "";
}

function onModelLoad(event) {
    let modelData = event.target.result;
  
    let objLoader = new THREE.OBJLoader();
  
    let objArr = objLoader.parse(modelData);

    let r = Math.floor(Math.random() * 256); 
    let g = Math.floor(Math.random() * 256); 
    let b = Math.floor(Math.random() * 256); 

    let textColor = "rgb(" + r + "," + g + "," + b + ")";

    let matColor = new THREE.Color(textColor);
    
    var objMat = new THREE.MeshPhongMaterial( { color: matColor  } );
   
    let pos = new THREE.Vector3(0, 0, 0);
  
    if (objArr.children.length > 0) {
      for (let i = 0; i < objArr.children.length; i++) {

        let geometry = new THREE.Geometry();
        geometry.fromBufferGeometry(  objArr.children[i].geometry );

        let obj = new THREE.Mesh(
          geometry,
          objMat
        );
        obj.position.copy(pos);
        obj.castShadow = true;
        obj.position.set(0,1,0);
        scene.add(obj);
        
        objects.push(obj);
      }
    } else {
      let geometry = new THREE.Geometry();
      geometry.fromBufferGeometry( objArr.geometry);

      let obj = new THREE.Mesh(geometry, objMa);
      obj.position.copy(pos);
      obj.castShadow = true;
      obj.position.set(0,1,0);
      scene.add(obj);
  
      
      objects.push(obj);
    }

    this.value = "";
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

    newMatArr = material.getAsArray();
  

    for (let i = 0; i < newMatArr.length; i++) {
        lastSelectedToMaterial.material = newMatArr[i];
        lastSelectedToMaterial.needsUpdate = true;
        console.log("Materials Loaded!");
    }
    document.getElementById("optBt").style.display = "none";
    popMenu = false;
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

function transforms(n){
    if(n == 1){
        control.setMode( "translate" );
    }else if(n == 2){
        control.setMode( "rotate" );
    }else if(n == 3){
        control.setMode( "scale" );
    }
}

function deselect(){
    control.detach(lastSelected);
    lastSelected.material.opacity = 1;
    lastSelected = null;
    document.getElementById("optBt").style.display = "none";
    popMenu = false;
    document.getElementById("timeline").style.display = "none";
}

function setClick(){
    popMenu = true;
}

function setModelColor(){
    picker.onDone = function(color) {
        let newColor = new THREE.Color(color.rgbaString);
        lastSelected.material.color = newColor;
        document.getElementById("optBt").style.display = "none";
        popMenu = false;
    };
}

function deleteSelected(){
    for(let i = 0; i < objects.length; i++){
        if(objects[i].id == lastSelected.id){
           objects.splice(i, 1);
        }
    }

    console.log(lastSelected.id);
    for(let i = 0; i < keyframes.length; i++ ){
        if(keyframes[i].obj.id == lastSelected.id){
            scene.remove(keyframes[i].path);
            keyframes.splice(i, 1);
            pathObjs.splice(i, 1);
            pathPoints.splice(i, 1);
        }
    }

    control.detach(lastSelected);
    scene.remove(lastSelected);
    document.getElementById("optBt").style.display = "none";
}

function showKeys(){
    
    let keyArrIndex;
    let parent = document.getElementById("elementsWrapper");

    for(let i = 0; i < keyframes.length; i++ ){
        if(keyframes[i].obj.id == lastSelected.id){
            keyArrIndex = i;
        }
    }

    if(keyArrIndex != null){ 
        
        if(!keysOpen){
            keysOpen = true;

            document.getElementById("timeline").style.display = "block";
            
            
            let qtnFrames = keyframes[keyArrIndex].position.length;
            let childs = parent.childNodes.length;

            let indexFrames;

            if(childs > 0){
                indexFrames = childs;
            }else{
                indexFrames = 0;
            }
           
            for(let i = indexFrames; i < qtnFrames; i++){
    
                let leftDistance = i * 100;
    
                var btn = document.createElement("DIV");
                let attrIndex = "a" + keyArrIndex + "k" + i;
    
                var attClass = document.createAttribute("class");
                attClass.value = "keyframeDot"; 
                btn.setAttributeNode(attClass); 
    
                var attId = document.createAttribute("id");
                attId.value = attrIndex; 
                btn.setAttributeNode(attId); 
    
                var attClick = document.createAttribute("onclick");
                attClick.value = "selectedKey(this)"; 
                btn.setAttributeNode(attClick); 
    
                btn.style.left = leftDistance + "px";
    
                parent.appendChild(btn);
    
            }
        }else{
            document.getElementById("timeline").style.display = "none";
            keysOpen = false;
        }
       
    }

    document.getElementById("optBt").style.display = "none";
}

function selectedKey(el){
    pathUpdate = false;
    let element =  document.getElementById("timeline");
    let rect = element.getBoundingClientRect();
    element.style.borderTopRightRadius = 0;
    document.getElementById("keysMenu").style.display = "block";
    document.getElementById("keysMenu").style.left = rect.right + "px";

    

    let kId;
    let pId;
    let tempJ;

    for(let i = 0; i < el.id.length; i++){
        if(el.id[i] == "a"){
            for(let j = 0; j < el.id.length; j++){
                if(el.id[j] == "k"){
                    tempJ = j;
                }
            }

            let n;

            for(let j = i+1; j < tempJ; j++){
                if(n == null){
                    n = el.id[j];
                }else{
                    n += el.id[j];
                }
            }
            
            i = tempJ-1;
            kId = n;

        }else if(el.id[i] == "k"){
           
            let n;

            for(let j = i+1; j < el.id.length; j++){
                if(n == null){
                    n = el.id[j];
                }else{
                    n += el.id[j];
                }
            }
            
            pId = n;
        }
    }

    if(lastKeySelectedElement != null){

        lastKeySelectedElement.style.backgroundColor = "rgb(134,142,150)";

        lastKeySelected.x = kId;
        lastKeySelected.y = pId;

        lastKeySelectedElement = el;

        lastKeySelectedElement.style.backgroundColor = "rgb(184,192,200)";
    }else{
        lastKeySelectedElement = el;
        lastKeySelectedElement.style.backgroundColor = "rgb(184,192,200)";

        lastKeySelected.x = kId;
        lastKeySelected.y = pId;
    }
    
   

    lastSelected.position.copy(keyframes[kId].position[pId]);
    lastSelected.quaternion.copy(keyframes[kId].rotation[pId]);
}

function resetKey(){
    for(let i = 0; i < keyframes.length; i++){
        if(lastSelected.id == keyframes[i].obj.id ){
            lastSelected.position.copy(keyframes[i].position[keyframes[i].position.length - 1]);
            lastSelected.quaternion.copy(keyframes[i].rotation[keyframes[i].rotation.length - 1]);
        }
    }
}
    
function deleteKey(){
    
    if(lastKeySelected != null){
        let parent = document.getElementById("elementsWrapper");

    
        keyframes[lastKeySelected.x].position.splice(lastKeySelected.y, 1);
        keyframes[lastKeySelected.x].rotation.splice(lastKeySelected.y, 1);

       
        let LastKeyid = "a" + lastKeySelected.x + "k" + lastKeySelected.y;

        for(let i = 0; i < parent.childNodes.length; i++){
            if(parent.childNodes[i].id == LastKeyid){
                parent.removeChild(parent.childNodes[i]);
            }
        }

        scene.remove(keyframes[lastKeySelected.x].path);

        var material = new THREE.LineBasicMaterial({
            color: "rgb(255, 00, 00)"
        });

        var geometry = new THREE.Geometry();
        
        geometry.vertices = keyframes[lastKeySelected.x].position;

        var line = new THREE.Line(geometry, material);

        keyframes[lastKeySelected.x].path = line;

        scene.add(keyframes[lastKeySelected.x].path);

        let tempPosArr = keyframes[lastKeySelected.x].position;

        keyframes[lastKeySelected.x].obj.position.copy(tempPosArr[tempPosArr.length - 1]);
       
        keysOpen = false;
        showKeys();
    }
}

function changeStyleColor(){
    if(lightState){ 
        scene.background = new THREE.Color("rgb(134,142,150)");
        scene.remove(gridHelper);
        gridHelper = new THREE.GridHelper( size, divisions, new THREE.Color(0xffffff), new THREE.Color(0xffffff) );
        scene.add(gridHelper);
        
        document.getElementById("lightBt").style.backgroundColor = "white";
        
        document.getElementById("toolbar").style.borderColor = "white";

        let tempEls = document.getElementsByClassName('btn');

        for(let i = 0; i < tempEls.length; i++){
            tempEls[i].style.backgroundColor = "white";
        }
     
        
        lightState = false;
    }else{
        scene.background = new THREE.Color("rgb(255,255,255)");
        scene.remove(gridHelper);
        gridHelper = new THREE.GridHelper( size, divisions);
        scene.add(gridHelper);
        
        document.getElementById("lightBt").style.backgroundColor = "rgb(134,142,150)";
        
        document.getElementById("toolbar").style.borderColor = "rgb(134,142,150)";

        let tempEls = document.getElementsByClassName('btn');
        
        for(let i = 0; i < tempEls.length; i++){
            tempEls[i].style.backgroundColor = "rgb(134,142,150)";
        }
       
        lightState = true;
    }
}
