let interval;
let currentImg = 1;


let root = "misc/imgs/";
let srcArr = [];

function showControls(){
    stopInterval();

    document.getElementById("textLearn").style.display = "block";
    document.getElementById("textLearn").textContent = "Change the position, rotation or scale.";
    document.getElementById("imgControls").style.display = "block";

    

    srcArr = ["moveLearn.png","rotateLearn.png","scaleLearn.png"];

    

    currentImg = 0;
    interval = setInterval(changeImg, 1500);
    
    
}

function changeImg(){

    document.getElementById("imgControls").src = root + srcArr[currentImg];
    console.log(currentImg);
    if(currentImg >= srcArr.length - 1){
        currentImg = 0;
    }else{
        currentImg++;
    }

}

function stopInterval(){
    if(interval != null){
        clearInterval(interval);
    }
    
}

function displayNone(n){
    if(n == 1){
        document.getElementById("textLearn").style.display = "block";
        document.getElementById("imgControls").style.display = "block";
    }
}

function showKeyframe(){
    stopInterval();

    document.getElementById("textLearn").style.display = "block";
    document.getElementById("textLearn").textContent = "Add the position and rotation to make an animation";
    document.getElementById("imgControls").style.display = "block";
    document.getElementById("imgControls").src = root + "cube.png";
    document.getElementById("auxImg").src = root + "path.png";
    
}
