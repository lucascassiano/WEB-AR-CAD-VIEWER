class GeoFile{
    constructor(){
        this.ids;
    }

    toText(arr){  
        let content;
        if(arr[0].type === "Mesh"){ 
            for(let i = 0; i < arr.length; i++){
                let vertices;
                let faces;
                for(let j = 0; j < arr[i].geometry.vertices.length; j++){
                    let vX = arr[i].geometry.vertices[j].x;
                    let vY = arr[i].geometry.vertices[j].y;
                    let vZ = arr[i].geometry.vertices[j].z;

                    let v = " v " + String(vX) +  " " +  String(vY) + " " + String(vZ) + ";";

                    if(vertices == null){
                        vertices = v;
                    }else{
                        vertices += v;
                    }   
                }
                for(let j = 0; j < arr[i].geometry.faces.length; j++){
                    let vA = arr[i].geometry.faces[j].a;
                    let vB = arr[i].geometry.faces[j].b;
                    let vC = arr[i].geometry.faces[j].c;
                    let nX = arr[i].geometry.faces[j].normal.x;
                    let nY = arr[i].geometry.faces[j].normal.y;
                    let nZ = arr[i].geometry.faces[j].normal.z;

                    let f = " f " + String(vA) +  " " +  String(vB) + " " + String(vC) + ";" + " n "+ String(nX) +  " " +  String(nY) + " " + String(nZ) +";";

                    if(faces == null){
                        faces = f;
                    }else{
                        faces += f;
                    }     
                }
                let matObj = arr[i].material;
                let matR = matObj.color.r;
                let matG = matObj.color.g;
                let matB = matObj.color.b;

                let mat = " mat " + String(matR) + " " + String(matG) + " " + String(matB) + ";"; 

                let name;
                if(arr[i].name != null){
                    name = " name " + "Mesh" + i ;
                }else{
                    name = " name " + arr[i].name;
                }
                
                let mesh = " geo" + vertices + " " + faces + mat + name + " id " + arr[i].id + " ";

                if(content == null){
                    content = mesh;
                }else{
                    content += mesh;
                }
            }
        }
        return content;
        
    }
    
    toGeo(text){
        let meshPos = [];
        let meshesArr = [];
        let colors = [];
        let names = [];
        let ids = [];
        for(let i = 0; i < text.length; i++){
            if(text[i] + text[i+1] + text[i+2]  == "geo"){
                let meshRange = {
                    i: i - 1,
                    f: i + 3
                }
              meshPos.push(meshRange);
             
            }else if(text[i] + text[i+1] + text[i+2]  == "mat"){
                let result = this.getVector(text, i+2);
                var color = new THREE.Color( result.v.x, result.v.y, result.v.z);
                colors.push(color);
            }else if(text[i] + text[i+1] + text[i+2] + text[i+3] === "name"){
                let indexK; 
                for(let k = i+5; k < text.length; k++){
                    if(text[k] == " "){
                        indexK = k;
                        break;
                    }
                }
        
                let name;
        
                for(let k = i+5; k < indexK; k++){
                    if(name == null){
                        name = text[k];
                    }else{
                        name += text[k];
                    }
                }

                names.push(name);
                
            }else if(text[i] + text[i+1] == "id"){
                let indexK; 
                for(let k = i+3; k < text.length; k++){
                    if(text[k] == " "){
                        indexK = k;
                        break;
                    }
                }
        
                let id;
        
                for(let k = i+3; k < indexK; k++){
                    if(id == null){
                        id = text[k];
                    }else{
                        id += text[k];
                    }
                }

                ids.push(id);
            }
           
        }

        this.ids = ids;
        
        for(let i = 0; i < meshPos.length; i++){
            
            let vertices = [];
            let faces = [];
            let normals = [];

            if(meshPos[i+1] != null){
                for(let j = meshPos[i].f; j < meshPos[i+1].i; j++){
                    
                    if(text[j] == "v"){
                        
                        let result = this.getVector(text, j);
                        j = result.j;
                        vertices.push(result.v);
                       
                       
                    }else if(text[j] == "f"){
                        let result = this.getVector(text, j);
                        j = result.j;
                        faces.push(result.v);
                        

                    }else if(text[j] == "n"){
                        let result = this.getVector(text, j);
                        j = result.j;
                        normals.push(result.v);
                       
                    }
                }
            }else{
                for(let j = meshPos[i].f; j < text.length; j++){
                    
                    if(text[j] == "v"){
                        
                        let result = this.getVector(text, j);
                        j = result.j;
                        vertices.push(result.v);
                        
                       
                    }else if(text[j] == "f"){
                        let result = this.getVector(text, j);
                        j = result.j;
                        faces.push(result.v);
                       

                    }else if(text[j] == "n"){
                        let result = this.getVector(text, j);
                        j = result.j;
                        normals.push(result.v);
                       
                    }
                }
            }

            let geometry = new THREE.Geometry();
            geometry.vertices = vertices;
            for(let k = 0; k < faces.length; k++){
                var face = new THREE.Face3( faces[k].x, faces[k].y, faces[k].z, normals[k]);
                geometry.faces.push(face);
                geometry.computeVertexNormals();
            }
            
            let material = new THREE.MeshBasicMaterial({color: colors[i]});

            let mesh = new THREE.Mesh(geometry, material);
            mesh.name = names[i];

            let meshObj = {
                id: ids[i],
                mesh: mesh
            }
            meshesArr.push(meshObj);
        }
        return meshesArr;
    }

    getVector(text, j, type){
        
        if(type == null){
            type = "v3";
        }

        let v;


        // X
        let indexJ = j + 2;
        let indexK;
        for(let k = indexJ; k < text.length; k++){
            if(text[k] == " "){
                indexK = k;
                break;
            }
        }

        let n1;

        for(let k = indexJ; k < indexK; k++){
            if(n1 == null){
                n1 = text[k];
            }else{
                n1 += text[k];
            }
        }

        //  Y
        let indexJ2 = indexK + 1;
        let indexK2;
        for(let k = indexJ2; k < text.length; k++){
            if(text[k] == " "){
                indexK2 = k;
                break;
            }
        }

        let n2;

        for(let k = indexJ2; k < indexK2; k++){
            if(n2 == null){
                n2 = text[k];
            }else{
                n2 += text[k];
            }
        }

        //  Z
        let indexJ3 = indexK2 + 1;
        let indexK3;
        for(let k = indexJ3; k < text.length; k++){
            if(type == "v3"){
                if(text[k] == ";"){
                    indexK3 = k;
                    break;
                }
            }else if(type == "v4"){
                if(text[k] == " "){
                    indexK3 = k;
                    break;
                }
            }
           
        }

        let n3;

        for(let k = indexJ3; k < indexK3; k++){
            if(n3 == null){
                n3 = text[k];
            }else{
                n3 += text[k];
            }
        }

        if(type == "v3"){

            v = new THREE.Vector3(parseFloat(n1),parseFloat(n2),parseFloat(n3));

        }else if(type == "v4"){
                
            //  2
            let indexJ4 = indexK3 + 1;
            let indexK4;
            for(let k = indexJ4; k < text.length; k++){
                if(text[k] == ";"){
                    indexK4 = k;
                    break;
                }
            }

            let n4;

            for(let k = indexJ4; k < indexK4; k++){
                if(n4 == null){
                    n4 = text[k];
                }else{
                    n4 += text[k];
                }
            }
            console.log

            v = new THREE.Quaternion(parseFloat(n1), parseFloat(n2), parseFloat(n3), parseFloat(n4));
            console.log(v);

        }


        

        let result = {
            j:indexK3,
            v:v
        }

        return result;
    } 

    keysToText(arrObjs, arrPath){
        let vertices;
        for(let i = 0; i < arrPath.length; i++){
            if(vertices == null){
                vertices = " k "+ String(arrObjs[i].id);
            }else{
                vertices += " k "+ String(arrObjs[i].id);
            }
    
            for(let j = 0; j < arrPath[i].position.length; j++){
                
                let vX = arrPath[i].position[j].x;
                let vY = arrPath[i].position[j].y;
                let vZ = arrPath[i].position[j].z;

                let rX = arrPath[i].rotationQuat[j]._x;
                let rY = arrPath[i].rotationQuat[j]._y;
                let rZ = arrPath[i].rotationQuat[j]._z;
                let rW = arrPath[i].rotationQuat[j]._w;

                let v = " v " + String(vX) +  " " +  String(vY) + " " + String(vZ) + ";" + " q " + String(rX) +  " " +  String(rY) + " " + String(rZ) + " " + String(rW) + ";";
                
                vertices += v;
            }
           
        }
        return vertices;
    }

    keysToArr(text){
        let keys = [];

        for(let i = 0; i < text.length; i++){
            if(text[i] == "k"){
                let position = [];
                let rotation = [];
                let indexJ = i + 2;
                let indexK;

                for(let j = indexJ; j < text.length; j++){
                    if(text[j] == " "){
                        indexK = j;
                        break;
                    }
                }
        
                let id;
        
                for(let k = indexJ; k < indexK; k++){
                    if(id == null){
                        id = text[k];
                    }else{
                        id += text[k];
                    }
                }

                for(let k = indexK; k < text.length; k++){
                    if(text[k] == "v"){
                
                        let result = this.getVector(text, k);
                        k = result.j;
                        position.push(result.v);
                        
                    }else if(text[k] == "q"){

                        let result = this.getVector(text, k, "v4");
                        k = result.j;
                        rotation.push(result.v);
                        
                    }else if(text[k] == "k"){
                        break;
                    }
                }

               let frames = {
                   id: id,
                   position: position,
                   rotationQuat: rotation
               }
               keys.push(frames);
            }
        }
        return keys;
        
    }

    toFile(filename, text){
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

    exportToAR(geoText, keyText, filename){
        let fullText = geoText + keyText;
        let nameExtention = filename + ".arcad";
        this.toFile(nameExtention, fullText);
    }

    importInAR(text){
        let meshesArr = this.toGeo(text);
        let keys = this.keysToArr(text);
        
        let toAdd = {
            meshesArr: meshesArr,
            keyframes: keys
        }

        return toAdd;
    }



}