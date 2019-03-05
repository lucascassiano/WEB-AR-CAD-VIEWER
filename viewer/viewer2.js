    //////////////////////////////////////////////////////////////////////////////////
	//		Init
    //////////////////////////////////////////////////////////////////////////////////
    var arWorldRoot;
    var arToolkitSource;
    var arToolkitContext;
    var renderer;
    var objects = [];

    var keyframesViewer = [];

    var exportObj = [];
    var exportPath = [];

    var pathFollower = new PathFollower();

    var geoFile = new GeoFile();

    function initViewer(){

        document.getElementById("viewer").style.display = "block";
        
       
        // init renderer
        renderer = new THREE.WebGLRenderer({
            // antialias	: true,
            alpha: true
        });
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        // renderer.setPixelRatio( 1/2 );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild( renderer.domElement );

        // array of functions for the rendering loop
        var onRenderFcts= [];

        // init scene and camera
        var scene	= new THREE.Scene();
        
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

        //////////////////////////////////////////////////////////////////////////////////
        //		Initialize a basic camera
        //////////////////////////////////////////////////////////////////////////////////

        // Create a camera
        var camera = new THREE.Camera();
        scene.add(camera);

        ////////////////////////////////////////////////////////////////////////////////
        //          handle arToolkitSource
        ////////////////////////////////////////////////////////////////////////////////

        arToolkitSource = new THREEx.ArToolkitSource({
            // to read from the webcam 
            sourceType : 'webcam',

            // to read from an image
            // sourceType : 'image',
            // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',		

            // to read from a video
            // sourceType : 'video',
            // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',		
        })

        arToolkitSource.init(function onReady(){
            onResize()
        })
        
        // handle resize
        window.addEventListener('resize', function(){
            onResize()
        })
        
        
        ////////////////////////////////////////////////////////////////////////////////
        //          initialize arToolkitContext
        ////////////////////////////////////////////////////////////////////////////////
        

        // create atToolkitContext
        arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: './data/camera/camera_para.dat',
            detectionMode: 'mono',
            maxDetectionRate: 30,
            canvasWidth: 80*3,
            canvasHeight: 60*3,
        })
        // initialize it
        arToolkitContext.init(function onCompleted(){
            // copy projection matrix to camera
            camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
        })

        // update artoolkit on every frame
        onRenderFcts.push(function(){
            if( arToolkitSource.ready === false )	return

            arToolkitContext.update( arToolkitSource.domElement )
        })
        
        
        ////////////////////////////////////////////////////////////////////////////////
        //          Create a ArMarkerControls
        ////////////////////////////////////////////////////////////////////////////////
        
        var markerRoot = new THREE.Group
        scene.add(markerRoot)

        var artoolkitMarker = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
            type : 'pattern',
            patternUrl :'./data/markers/patt.hiro'
            // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji'
        })

        // build a smoothedControls
        var smoothedRoot = new THREE.Group()
        scene.add(smoothedRoot)
        var smoothedControls = new THREEx.ArSmoothedControls(smoothedRoot, {
            lerpPosition: 0.4,
            lerpQuaternion: 0.3,
            lerpScale: 1,
        })
        onRenderFcts.push(function(delta){
            smoothedControls.update(markerRoot)
        })
        //////////////////////////////////////////////////////////////////////////////////
        //		add an object in the scene
        //////////////////////////////////////////////////////////////////////////////////

        arWorldRoot = smoothedRoot

        //////////////////////////////////////////////////////////////////////////////////
        //		render the whole thing on the page
        //////////////////////////////////////////////////////////////////////////////////

        // render the scene
        onRenderFcts.push(function(){
            pathFollower.update();
            renderer.render( scene, camera );
            
        })

        // run the rendering loop
        var lastTimeMsec= null
        requestAnimationFrame(function animate(nowMsec){
            // keep looping
            requestAnimationFrame( animate );
            // measure time
            lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
            var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
            lastTimeMsec	= nowMsec
            // call each update function
            onRenderFcts.forEach(function(onRenderFct){
                onRenderFct(deltaMsec/1000, nowMsec/1000)
            })
        })

        if(window.sessionStorage.modelData != undefined){
            exportedDesktop(window.sessionStorage.modelData);
        }

    }

    function onResize(){
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if( arToolkitContext.arController !== null ){
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}

    function previewer(){
        pathFollower.preview(exportObj, exportPath);
    }
    
    function onModelLoadViewer(event) {
        let text = event.target.result;

        let toAdd = geoFile.importInAR(text);

        for(let i = 0; i < toAdd.meshesArr.length; i++){
            toAdd.meshesArr[i].mesh.castShadow = true;
            objects.push(toAdd.meshesArr[i].mesh);
            for(let j = 0; j < toAdd.keyframes.length; j++){
                if(toAdd.meshesArr[i].id == toAdd.keyframes[j].id ){
                keyframesViewer.push(toAdd.keyframes[j]);
                break;
                }
            }
            toAdd.meshesArr[i].mesh.position.copy(keyframesViewer[i].position[0]);
            arWorldRoot.add(toAdd.meshesArr[i].mesh);
        }

        exportObj = objects;
        exportPath = keyframesViewer;

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

    function exportedDesktop(text){
        let toAdd = geoFile.importInAR(text);

        for(let i = 0; i < toAdd.meshesArr.length; i++){
            toAdd.meshesArr[i].mesh.castShadow = true;
            objects.push(toAdd.meshesArr[i].mesh);
            for(let j = 0; j < toAdd.keyframes.length; j++){
                if(toAdd.meshesArr[i].id == toAdd.keyframes[j].id ){
                keyframesViewer.push(toAdd.keyframes[j]);
                break;
                }
            }
            toAdd.meshesArr[i].mesh.position.copy(keyframesViewer[i].position[0]);
            arWorldRoot.add(toAdd.meshesArr[i].mesh);
        }

        exportObj = objects;
        exportPath = keyframesViewer;
    }

    function goToEditor(){
      
        document.location.href = "../editor/editor.html";
    }

    window.onload = initViewer;