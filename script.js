let video = document.querySelector("video");
let vidBtn = document.querySelector("button#record");
let body = document.querySelector("body");
let capBtn = document.querySelector("button#capture");
let zoomIn = document.querySelector(".zoom-in");
let zoomOut = document.querySelector(".zoom-out");
let galleryBtn = document.querySelector("#gallery");
let filters = document.querySelectorAll(".filters");

let minZoom = 1;
let maxZoom = 3;
let currZoom = 1;

let constraints = { video: true, audio: true };  

let mediaRecorder; 
let isRecording = false;  
let chunks = []; 

let filter = ""; 

galleryBtn.addEventListener("click", function(){
    location.assign("gallery.html");
})

for(let i=0; i<filters.length; i++){
    filters[i].addEventListener("click", function(e){
        filter = e.currentTarget.style.backgroundColor;
        removeFilter();
        applyFilter(filter);
    })
}

zoomIn.addEventListener("click", function(){
    let vidCurrScale = video.style.transform.split("(")[1].split(")")[0];
    if(vidCurrScale > maxZoom){
        return;
    }else{
        currZoom = Number(vidCurrScale) + 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
    console.log(currZoom);
})

zoomOut.addEventListener("click", function(){
    if(currZoom > minZoom){
        currZoom -= 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
    console.log(currZoom);
})

vidBtn.addEventListener("click", function () {  
    let innerDiv = vidBtn.querySelector("div");

    if (isRecording) {
        mediaRecorder.stop();  
        isRecording = false;
        innerDiv.classList.remove("record-animation");
    } else {
        mediaRecorder.start();
        isRecording = true;

        filter = "";    
        removeFilter();      
        video.style.transform = `scale(1)`;
        currZoom = 1;
        innerDiv.classList.add("record-animation"); 
    }
});

capBtn.addEventListener("click", function () {  
    capture();                                

    let innerDiv = capBtn.querySelector("div");
    innerDiv.classList.add("capture-animation");
    setTimeout(function(){
        innerDiv.classList.remove("capture-animation");
    },500);
});

navigator.mediaDevices                
    .getUserMedia(constraints)   
    .then(function (mediaStream) { 
        video.srcObject = mediaStream;             
        mediaRecorder = new MediaRecorder(mediaStream);   

        mediaRecorder.addEventListener("dataavailable", function (e) {   
            chunks.push(e.data);
        });

        mediaRecorder.addEventListener("stop", function () {
            let blob = new Blob(chunks, { type: "video/mp4" });  

            addMedia("video", blob); 
            chunks = [];
        });
    });

function capture() {
    let c = document.createElement("canvas");
    c.width = video.videoWidth;             
    c.height = video.videoHeight;

    let ctx = c.getContext("2d");

    ctx.translate(c.width/2, c.height / 2);
    ctx.scale(currZoom, currZoom);
    ctx.translate(-c.width / 2, - c.height /2);

    ctx.drawImage(video, 0, 0);

    if(filter != ""){
        ctx.fillStyle = filter;
        ctx.fillRect(0,0,c.width, c.height);
    }

    addMedia("img", c.toDataURL()); 
}

function applyFilter(filterColor){
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    body.appendChild(filterDiv);
}

function removeFilter(){
    let filterDiv = document.querySelector(".filter-div")
    if(filterDiv)
    filterDiv.remove()
}
