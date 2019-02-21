class PathFollower{
    constructor(n){
        if(n == null){
            this.divideSize = 100;
        }else{
            this.divideSize = n;
        }
        this.moves;
        this.previewState;
        this.previewEnable = false;
        this.t = 0;
        this.dt = 0.01;
        this.objArr;
        this.pathArr;
    }   

    preview(obj, path){
        this.objArr = obj;
        this.pathArr = path
        for(let i = 0; i < obj.length; i++){
            obj[i].position.copy(path[i][0]);
        }
        this.previewState = [];

        for(let i = 0; i < obj.length; i++){
            this.previewState.push(0);
        }

        this.previewEnable = true;
    }

    update(){
        if(this.previewEnable){
            for(let i = 0; i < this.objArr.length; i++){
                if(this.pathArr[i][this.previewState[i]] != null){

                
                    let currentPos = new THREE.Vector3();
                    currentPos.copy(this.objArr[i].position)
                    let nextPos = new THREE.Vector3();
                    nextPos.copy( this.pathArr[i][this.previewState[i]] );
                    
                    var newX = this.lerp(currentPos.x, nextPos.x, this.ease(this.t));   
                    var newY = this.lerp(currentPos.y, nextPos.y, this.ease(this.t));   
                    var newZ = this.lerp(currentPos.z, nextPos.z, this.ease(this.t)); 
                    this.objArr[i].position.set(newX, newY, newZ); 
                    this.t += this.dt;

                    if(currentPos.equals(nextPos)){
                        this.previewState[i] =  this.previewState[i] + 1;
                        this.t = 0;
                    }
                }   
            }
        }


    }

    lerp(a, b, t) {return a + (b - a) * t}

    ease(t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t}
}

