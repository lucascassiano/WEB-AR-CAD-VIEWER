class Arrows{
    constructor(){
        this.arrowMesh = this.createArrows();
        this.rotationMesh = this.createRotation();
        this.attached = false;
        this.meshAttached;
        this.meshBB;
        this.meshBS;
        
        
    }

    createArrows(){
        var arrowGroup = new THREE.Group();

        var geometry = new THREE.BoxGeometry( 1, 0.1, 0.1 );
        var material = new THREE.MeshBasicMaterial( { color:"rgb(255,0,0)" } );
        var X = new THREE.Mesh( geometry, material );
        X.name = "X";
        X.position.set(0.5,0,0);
        arrowGroup.add(X);
        
        var geometry = new THREE.BoxGeometry( 0.1, 1, 0.1 );
        var material = new THREE.MeshBasicMaterial( { color:"rgb(0,255,0)" } );
        var Y = new THREE.Mesh( geometry, material );
        Y.name = "Y";
        Y.position.set(0,0.5,0);
        arrowGroup.add(Y);

        var geometry = new THREE.BoxGeometry( 0.1, 0.1, 1 );
        var material = new THREE.MeshBasicMaterial( { color:"rgb(0,0,255)" } );
        var Z = new THREE.Mesh( geometry, material );
        Z.name = "Z";
        Z.position.set(0,0,0.5);
        arrowGroup.add(Z);

     

        return arrowGroup;
    }

    
    createRotation(){
        var rotationGroup = new THREE.Group();

        var geometry = new THREE.TorusGeometry( 5, 0.3, 5, 40 );
        var material = new THREE.MeshBasicMaterial( { color: "rgb(255,0,0)" } );
        var torusX = new THREE.Mesh( geometry, material );
        torusX.name = "X";
        rotationGroup.add(torusX);

        var geometry = new THREE.TorusGeometry( 5, 0.3, 5, 40 );
        var material = new THREE.MeshBasicMaterial( { color: "rgb(0,255,0)" } );
        var torusY = new THREE.Mesh( geometry, material );
        torusY.name = "Y";
        torusY.rotation.x = Math.PI/2;
        rotationGroup.add(torusY);

        var geometry = new THREE.TorusGeometry( 5, 0.3, 5, 40 );
        var material = new THREE.MeshBasicMaterial( { color: "rgb(0,0,255)" } );
        var torusZ = new THREE.Mesh( geometry, material );
        torusZ.name = "Z";
        torusZ.rotation.y = Math.PI/2;
        rotationGroup.add(torusZ);


        return rotationGroup;
    }


    attach(mesh, key){
        
        mesh.material.transparent = true;
        mesh.material.opacity = 0.5;
        
        this.attached = true;
        this.meshAttached = mesh;

        let bb = new THREE.Box3();
        this.meshBB = bb.setFromObject(mesh);
        let bs = new THREE.Sphere();
        this.meshBS = this.meshBB.getBoundingSphere(bs);
        

        this.readjustArrows();
        this.rotationMesh = this.readjustRotation(this.meshBS);

        
        if(key == "q"){
            mesh.add(this.arrowMesh);
        }else if(key == "w"){
            mesh.add(this.rotationMesh);
        }
        
    }

    detach(mesh){

        mesh.material.transparent = true;
        mesh.material.opacity = 1;
        mesh.remove(this.arrowMesh);
        mesh.remove(this.rotationMesh);

        this.attached = false;
        this.meshAttached = null;
    }

    readjustArrows(){
        let sizeX = 0;
        let sizeY = 0;
        let sizeZ = 0;
        if(this.meshBB.min.x < 0 && this.meshBB.max.x < 0 || this.meshBB.min.x > 0 && this.meshBB.max.x > 0 ){
            sizeX = Math.abs(this.meshBB.min.x - this.meshBB.max.x);
        }else{
            sizeX = Math.abs(this.meshBB.min.x) + Math.abs(this.meshBB.max.x);
        }
        if(this.meshBB.min.y < 0 && this.meshBB.max.y < 0 || this.meshBB.min.y > 0 && this.meshBB.max.y > 0 ){
            sizeY = Math.abs(this.meshBB.min.y - this.meshBB.max.y);
        }else{
            sizeY = Math.abs(this.meshBB.min.y) + Math.abs(this.meshBB.max.y);
        }
        if(this.meshBB.min.z < 0 && this.meshBB.max.z < 0 || this.meshBB.min.z > 0 && this.meshBB.max.z > 0 ){
            sizeZ = Math.abs(this.meshBB.min.z - this.meshBB.max.z);
        }else{
            sizeZ = Math.abs(this.meshBB.min.z) + Math.abs(this.meshBB.max.z);
        }

        this.arrowMesh.children[0].scale.set( sizeX/2 + 3 * sizeX/10 , 2 * sizeX/10, 2 * sizeX/10);
        this.arrowMesh.children[0].position.set((sizeX/2 + 3 * sizeX/10)/2 , 0, 0);
    
        this.arrowMesh.children[1].scale.set( 2 * sizeY/10, sizeY/2 + 3 * sizeY/10 , 2 * sizeY/10);
        this.arrowMesh.children[1].position.set(0, (sizeY/2 + 3 * sizeY/10)/2, 0);
        
        this.arrowMesh.children[2].scale.set( 2 * sizeZ/10, 2 * sizeZ/10, sizeZ/2 + 3 * sizeZ/10);
        this.arrowMesh.children[2].position.set(0 ,0,  (sizeZ/2 + 3 * sizeZ/10)/2);
    }

    readjustRotation(s){
        let radius = s.radius;

        var rotationGroup = new THREE.Group();

        var geometry = new THREE.TorusGeometry(radius, 0.3, 5, 40 );
        var material = new THREE.MeshBasicMaterial( { color: "rgb(255,0,0)" } );
        var torusX = new THREE.Mesh( geometry, material );
        torusX.name = "X";
        torusX.rotation.y = Math.PI/2;
        rotationGroup.add(torusX);

        var geometry = new THREE.TorusGeometry( radius, 0.3, 5, 40 );
        var material = new THREE.MeshBasicMaterial( { color: "rgb(0,255,0)" } );
        var torusY = new THREE.Mesh( geometry, material );
        torusY.name = "Y";
        torusY.rotation.x = Math.PI/2;
        rotationGroup.add(torusY);

        var geometry = new THREE.TorusGeometry( radius, 0.3, 5, 40 );
        var material = new THREE.MeshBasicMaterial( { color: "rgb(0,0,255)" } );
        var torusZ = new THREE.Mesh( geometry, material );
        torusZ.name = "Z";
        
        rotationGroup.add(torusZ);

        return rotationGroup;

    }

    

    




}