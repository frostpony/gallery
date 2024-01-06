const MASTODON_INSTANCE_URL = "https://pone.social"
const MY_ID = "111643007318109517"

var GALLERY = {
    "mainart": [],
    "dailyart": []
};

class MyImage {
    url;
    tags;
    image;

    constructor(url, tags) {
        this.url = url;
        this.tags = tags;
        this.image = new Image();
        this.image.crossOrigin = "Anonymous";
        this.image.src = url;
    }
}

window.onload = async function () {
    load_screen("loading");
    var ok = true;
    var data;
    var last_id = null;
    do {
        data = await get_content(last_id);
        console.log(data);
        if (data != null) {
            GALLERY.mainart = GALLERY.mainart.concat(data.mainart);
            GALLERY.dailyart = GALLERY.dailyart.concat(data.dailyart);
        } else {
            ok = false;
            console.log("An error occured while retriving data!");
            load_screen("error");
            break;
        }
        last_id = data.last_id;
    } while (data.last_id != null);
    
    if (ok) {
        load_screen("main-gallery");
        load_gallery("general");
    }
}

/*

<div class="gallery-image">
    <img>
    <div class="tags"></div>
</div>

*/

function load_gallery(gallery) {
    var title = document.getElementById("gallery-title");
    var cont = document.getElementById("gallery-container");
    
    if (gallery == "general") {
        title.textContent = "~ General Gallery ~";

        while (cont.firstChild) {
            cont.removeChild(cont.lastChild);
        }

        for (var image of GALLERY.mainart) {
            var gallery_image = document.createElement("div");
            gallery_image.classList.add("gallery-image");
            
            (function(img) {
                var cloned_img = img.cloneNode(true);
        
                cloned_img.onload = () => {
                    var rgb = getAverageRGB(cloned_img);
                    rgb.r = Math.max(rgb.r - 10, 0);
                    rgb.g = Math.max(rgb.g - 10, 0);
                    rgb.b = Math.max(rgb.b - 10, 0);
                    cloned_img.parentNode.style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                };
        
                gallery_image.appendChild(cloned_img);
            })(image.image);
            
            var tags = document.createElement("div");
            tags.classList.add("tags");
            gallery_image.appendChild(tags);
            cont.appendChild(gallery_image);
        }
    }

    if (gallery == "daily") {
        title.textContent = "~ Daily Drawings ~";

        while (cont.firstChild) {
            cont.removeChild(cont.lastChild);
        }

        for (var image of GALLERY.dailyart) {
            var gallery_image = document.createElement("div");
            gallery_image.classList.add("gallery-image");
            
            (function(img) {
                var cloned_img = img.cloneNode(true);
        
                cloned_img.onload = () => {
                    var rgb = getAverageRGB(cloned_img);
                    rgb.r = Math.max(rgb.r - 10, 0);
                    rgb.g = Math.max(rgb.g - 10, 0);
                    rgb.b = Math.max(rgb.b - 10, 0);
                    cloned_img.parentNode.style.background = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                };
        
                gallery_image.appendChild(cloned_img);
            })(image.image);
            
            var tags = document.createElement("div");
            tags.classList.add("tags");
            gallery_image.appendChild(tags);
            cont.appendChild(gallery_image);
        }
    }
}

async function get_content(max_id = null) {
    
    var response;
    try {
        if (max_id != null) {
            response = await fetch(MASTODON_INSTANCE_URL + "/api/v1/accounts/" + MY_ID + "/statuses?max_id=" + max_id);
        } else {
            response = await fetch(MASTODON_INSTANCE_URL + "/api/v1/accounts/" + MY_ID + "/statuses");
        }
    } catch {
        return null;
    }

    if (!response.ok || response.status != 200) {
        return null;
    }
    var status_array = await response.json();

    var return_object = {
        "mainart": [],
        "dailyart": [],
        "last_id": null
    };

    if (status_array.length == 20) {
        // TODO: LOOK UP IF THE MAX LENGTH OF RESP STATUS ARRAY CAN BE CHANGED FROM 20
        // BY THE INSTANCEADMIN!!!
        return_object.last_id = status_array[19].id;
    }

    for (var status of status_array) {
        if (status.content.includes("$MAINART")) {
            if (status.content.includes("$ONE") && status.media_attachments.length > 0) {
                var img = new MyImage(status.media_attachments[0].url, []);
                return_object.mainart.push(img);
            } else {
                for (var image of status.media_attachments) {
                    if (image.type == "image") {
                        var img = new MyImage(image.url, []);
                        return_object.mainart.push(img);
                    }
                }
            }
        }

        if (status.content.includes("$DAILYART")) {
            if (status.content.includes("$ONE") && status.media_attachments.length > 0) {
                var img = new MyImage(status.media_attachments[0].url, []);
                return_object.dailyart.push(img);
            } else {
                for (var image of status.media_attachments) {
                    if (image.type == "image") {
                        var img = new MyImage(image.url, []);
                        return_object.dailyart.push(img);
                    }
                }
            }
        }
    }

    return return_object;

}