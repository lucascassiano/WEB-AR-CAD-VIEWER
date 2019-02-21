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
    }   

    preview(obj, path){
        for(let i = 0; i < obj.length; i++){
            obj[i].position.copy(path[i][0]);
        }
        this.moves = this.calculateSum(obj, path);

        this.previewState = [];

        for(let i = 0; i < this.moves.length; i++){
            this.previewState.push(0);
        }

        this.previewEnable = true;
    }

    calculateSum(obj, path){
        let addArr = [];
        for(let i = 0; i < obj.length; i++){
            let addVectors = [];
            for(let j = 0; j < path[i].length; j++){
                if(path[i][j + 1] != null){
                    let currentPos = new THREE.Vector3();
                    currentPos.copy(path[i][j]);
                    let nextPos = new THREE.Vector3();
                    nextPos.copy(path[i][j + 1]);


                    let result = new THREE.Vector3();
                    result.copy(nextPos).sub(currentPos).divideScalar(this.divideSize);

                    addVectors.push(nextPos);
                }
            }

            let addObj = {
                obj: obj[i],
                v: addVectors
            }

            addArr.push(addObj);

        }
       
        return addArr;
    }

    update(){
        if(this.previewEnable){
            for(let i = 0; i < this.moves.length; i++){
                if(this.moves[i].v[this.previewState[i]] != null){

                
                    let currentPos = new THREE.Vector3();
                    currentPos.copy(this.moves[i].obj.position)
                    let nextPos = new THREE.Vector3();
                    nextPos.copy( this.moves[i].v[this.previewState[i]] );
                    
                    var newX = this.lerp(currentPos.x, nextPos.x, this.ease(this.t));   
                    var newY = this.lerp(currentPos.y, nextPos.y, this.ease(this.t));   
                    var newZ = this.lerp(currentPos.z, nextPos.z, this.ease(this.t)); 
                    this.moves[i].obj.position.set(newX, newY, newZ); 
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

