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

let constraints = { video: true, audio: true };  // constraints jo bhi media humko chyie

let mediaRecorder; // just a variable
let isRecording = false;  // variable jo record start aur stop karne pe toggle karane main  help krega
let chunks = []; // isme hum raw data ke chunks to store kar lenge

let filter = "";  // canvas main isse image filter dalne keliye

galleryBtn.addEventListener("click", function(){
    location.assign("gallery.html");              // going to gallery.html
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

vidBtn.addEventListener("click", function () {  // button ke click pe recording on aur off ki functionality di hai 
    let innerDiv = vidBtn.querySelector("div");

    if (isRecording) {
        mediaRecorder.stop();  // isse mediaRecorder ka stop event chalega
        isRecording = false;
        //videoBtn.innerText = "Record";  // button ka text change kardiya
        innerDiv.classList.remove("record-animation");
    } else {
        mediaRecorder.start();    // isse mediaRecoder recording start kardega  
        isRecording = true;

        filter = "";    // making filter string empty
        removeFilter();      // removing current filter
        video.style.transform = `scale(1)`;
        currZoom = 1;
        //videoBtn.innerText = "Recording...";
        innerDiv.classList.add("record-animation"); // adding class for animation
    }
});

capBtn.addEventListener("click", function () {  // captureBtn ke click pe event hai
    capture();                                // capture function jo capture karega image

    let innerDiv = capBtn.querySelector("div");
    innerDiv.classList.add("capture-animation");
    setTimeout(function(){
        innerDiv.classList.remove("capture-animation");
    },500);
});

navigator.mediaDevices                // navigator object browser ne diya hai , mediaDevices navigator ka child object hai  
    .getUserMedia(constraints)   // getUserMedia function hai jo constraints leta hai aur humko camera ki input ki power dega , getUserMedia promise return based function hai,
    // jab hum camera ki permission tab ye resolve hoga otherwise reject
    .then(function (mediaStream) {          // promise agar resolve hoga to mediaStream object dega jisme hamari current media aati rhegi
        video.srcObject = mediaStream;     // humne ab mediaStream ko video tag ka src object bna diya
        //audio.srcObject = mediaStream; 
        mediaRecorder = new MediaRecorder(mediaStream);   // MediaRecorder object bnaya recoding krne ke liye

        mediaRecorder.addEventListener("dataavailable", function (e) {  // ye jab chalega jab record krne ki limit exceed ho jaegi 
            chunks.push(e.data);
        });

        mediaRecorder.addEventListener("stop", function () {
            let blob = new Blob(chunks, { type: "video/mp4" });  // blob --> large raw data, chunks ko merge karke hum raw data bna rhe
                                                                      // kis type ki file bnani hai usko whi type bnana hai

            addMedia("video", blob); // indexDb main addMedia ko call aur blob pass kar diya
            chunks = [];


            // let url = URL.createObjectURL(blob);  // jo humne media bnaya uska url bna liya , ye refernce hai data ka

            // let a = document.createElement("a");  // nya anchor tag create kra
            // a.href = url;                         // anchor tag ke href attribute ko url diya
            // a.download = "video.mp4";            //  is naam se save hogi downloaded file
            // a.click();                           // isse file download ho jaegi
            // a.remove();
        });
    });

function capture() {
    let c = document.createElement("canvas");
    c.width = video.videoWidth;            // video tag ke andar jo video chal rhi hai uski width lo, agar hum yahan bas video.height karenge to video tag ki height aaegi jo ki 0 hai abhi aur capture nhi hoga, video tag ki height isliye 0 hai kyuki humne kuch set ni ki thi 
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

    // let a = document.createElement("a");
    // a.download = "image.jpg";
    // a.href = c.toDataURL();         // data ko url main convert kar liya , yahan ye actual data hai

    addMedia("img", c.toDataURL()); // indexDb main addMedia ko call kiya
    // a.click();
    // a.remove();
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