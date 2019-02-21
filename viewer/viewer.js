  var scene, camera, renderer, arToolkitSource;


  var pathFollower = new PathFollower();

  function initViewer(){
 
  
  var onRenderFcts = [];

  //globals

  var lastTimeMsec = null;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();
  scene.add(camera);

  var light = new THREE.AmbientLight("rgb(255, 255, 255)", 1); // soft white light
  scene.add(light);

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(5, 5, 5);

  spotLight.castShadow = true;

  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;

  spotLight.shadow.camera.near = 500;
  spotLight.shadow.camera.far = 4000;
  spotLight.shadow.camera.fov = 30;

  scene.add(spotLight);

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

  ////////////////////////////////////////////////////////////////////////////////
  //          handle arToolkitSource
  ////////////////////////////////////////////////////////////////////////////////
  arToolkitSource = new THREEx.ArToolkitSource({
    // to read from the webcam
    sourceType: "webcam"

    // // to read from an image
    // sourceType : 'image',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',
    // to read from a video
    // sourceType : 'video',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
  });
  arToolkitSource.init(function onReady() {
    onResize();
  });
  
  // handle resize
  window.addEventListener("resize", function() {
    onResize();
  });

  ////////////////////////////////////////////////////////////////////////////////
  //          initialize arToolkitContext
  ////////////////////////////////////////////////////////////////////////////////

  // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "viewer/data/camera/camera_para.dat",
    detectionMode: "mono"
  });
  // initialize it
  arToolkitContext.init(function onCompleted() {
    // copy projection matrix to camera
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });
  // update artoolkit on every frame
  onRenderFcts.push(function() {
    if (arToolkitSource.ready === false) return;
    arToolkitContext.update(arToolkitSource.domElement);

    // update scene.visible if the marker is seen
    scene.visible = camera.visible;
  });

  ////////////////////////////////////////////////////////////////////////////////
  //          Create a ArMarkerControls
  ////////////////////////////////////////////////////////////////////////////////

  // init controls for camera
  var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type: "pattern",
    patternUrl: "viewer/data/markers/patt.hiro",
    // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
    // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
    changeMatrixMode: "cameraTransformMatrix"
  });
  // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
  scene.visible = false;
  //////////////////////////////////////////////////////////////////////////////////
  //		add an object in the scene
  //////////////////////////////////////////////////////////////////////////////////

  if(exportObj != null && exportPath != null){
    for(let i = 0; i < exportObj.length; i++){
      scene.add(exportObj[i]);
    }
    console.log("content imported!");
  }else{
    console.log("content not imported!!!");
  }

 

  //onRenderFcts.push(function(delta) {});

  onRenderFcts.push(function() {
    renderer.render(scene, camera);
  });
  // run the rendering loop

requestAnimationFrame(function animate(nowMsec) {
  // keep looping
  requestAnimationFrame(animate);

  // measure time
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
  var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  lastTimeMsec = nowMsec;
  // call each update function
  onRenderFcts.forEach(function(onRenderFct) {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
  });
});
}

function onResize() {
  arToolkitSource.onResize();
  arToolkitSource.copySizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
  }
}

function previewer(){
  pathFollower.preview(exportObj, exportPath);
}




