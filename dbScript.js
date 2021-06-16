// Database create/open (camera)
// Database objectStore => gallery
// photo capture / video record -> gallery(obs) store
// format:
// data = {
//     mid: 16309394903,
//     type: "img" / "vid",
//     media: actual apka content (img => c.toDataUrl, video => blob) 
// }

let dbAccess;
let container = document.querySelector(".container")
let request = indexedDB.open("Camera", 1);

request.addEventListener("success", function(){
    dbAccess = request.result;
});

request.addEventListener("upgradeneeded", function(){
    let db = request.result;
    db.createObjectStore("gallery", { keyPath: "mId"});
});

request.addEventListener("error", function(){
    alert("error occured");
});

function addMedia(type, media){
    // assumption ki tbhi chalega jb dbAccess hoga

    let tx = dbAccess.transaction("gallery", "readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    let data = {
        mId: Date.now(),
        type,
        media,
    };

    galleryObjectStore.add(data);
}

function viewMedia(){
    // assumption ki tbhi chalega jb dbAccess hoga

    let tx = dbAccess.transaction("gallery", "readonly");
    let galleryObjectStore = tx.objectStore("gallery");
    let req = galleryObjectStore.openCursor();
    req.addEventListener("success", function(){
        let cursor = req.result;

        if(cursor){
            let div = document.createElement("div");
            div.classList.add("media-card");

            div.innerHTML = `<div class="media-container"></div>
                             <div class="action-container">
                                <button class="media-download" data-id="${cursor.value.mId}">Download</button>
                                <button class="media-delete" data-id="${cursor.value.mId}">Delete</button>
                              </div>`;

            let downloadBtn = div.querySelector(".media-download");
            let deleteBtn = div.querySelector(".media-delete");

            deleteBtn.addEventListener("click", function(e){
                let mId = e.currentTarget.getAttribute("data-id");
                //UI se delete karna hai
                e.currentTarget.parentElement.parentElement.remove();
                
                // indexedDB se data delete karna hai
                deleteMediaFromDB(mId);
            })

            if(cursor.value.type == "img"){
                let img = document.createElement("img");
                img.classList.add("media-gallery");
                img.src = cursor.value.media;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(img);

                downloadBtn.addEventListener("click", function(e){
                    let a = document.createElement("a");
                    a.download = "image.jpg";
                    // a.href = e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src; // ye aur niche wali line se same kaam horha hai 
                    a.href = img.src;
                    a.click();
                    a.remove();
                });

            }else{
                let video = document.createElement("video");
                video.classList.add("media-gallery");
                video.src = window.URL.createObjectURL(cursor.value.media);
                video.addEventListener("mouseenter", function(){
                    video.currentTime = 0;
                    video.play();
                });

                video.addEventListener("mouseleave", function(){
                    video.pause();
                });

                video.controls = true;
                video.loop = true;
                let mediaContainer = div.querySelector(".media-container");
                mediaContainer.appendChild(video);

                downloadBtn.addEventListener("click", function(e){
                    let a = document.createElement("a");
                    a.download = "video.mp4";
                    a.href = e.currentTarget.parentElement.parentElement.querySelector(".media-container").children[0].src;
                    a.click();
                    a.remove();
                })
            }

            container.appendChild(div);
            cursor.continue();
        }
    })
}

function deleteMediaFromDB(mId){
    // code jisse hum delete karenge
    let tx = dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    galleryObjectStore.delete(Number(mId));
}