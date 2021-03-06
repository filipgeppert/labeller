let cv = document.getElementById('cv');
let cvOffsetX = cv.getBoundingClientRect().x;
let cvOffsetY = cv.getBoundingClientRect().y;
let canvas = document.getElementById('imageCanvas');
let ctx = canvas.getContext('2d');
let rect = {}, drag = false, selections = [];
let categoryBox = document.getElementById('categoryLabel');
let categoryButton = document.getElementById('categoryButton');
let saveAnnotationsButton = document.getElementById('saveAnnotations');
let annotations = document.getElementById('annotations');
let imageId = null;
let id_count = 0;
let current_filename = "";
let messageBox = document.getElementById("message");
let messageLarge = document.getElementById("messageLarge");
let messageSmall = document.getElementById("messageSmall");

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getDeleteButton(selectionId) {
    return `<a id="delete${selectionId}" onclick="removeSelection(${selectionId})">`
        + 'Delete</a>';
}

function getSelectionTemplate(category, id) {
    return '<li class="list-group-item d-flex justify-content-between align-items-center m-1">'
        + `${category}`
        +  `<span class="badge badge-danger badge-pill">${getDeleteButton(id)}</span>`
        +'</li>';
}


class Selection {
    constructor(x, y, w, h, category) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.category = category;
        this.id = id_count;
    }
}

function sendDataAJAX(url, data) {
    $.ajax({
        url: url,
        data: data,
        dataType: 'json',
        success: function (data) {
            messageLarge.innerText = "Annotations successfully saved!"
            messageSmall.innerText = current_filename;
            messageBox.style.display ="inline";
            setTimeout(() => messageBox.style.display = "none", 3000)
        }
    });
}

function sendImageAJAX(img) {
    let formData = new FormData();
    // let file = $('#cv')[0].files[0];
    formData.append('image', img);

    $.ajax({
        url: 'saveImage',
        type: 'post',
        data: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
        },
        contentType: false,
        processData: false,
        success: function (data) {
            imageId = data.imageId;
            console.log("Image was saved.")
        },
        error: function(xhr, status, error) {
            // TODO: add modal info that data was not saved
            console.log(xhr.responseText);
            console.log("There was a problem with saving image.")
        }
    });
}


function init() {
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
    categoryButton.addEventListener('click', saveSelection, false);
    saveAnnotationsButton.addEventListener('click', function () {
        let filename = current_filename.replace(/\.[^/.]+$/, "");
        // downloadAnnotations(selections, `${filename}.json`, 'text/json');
        let data = {
            "imageId": JSON.stringify(imageId),
            "labelledImage": JSON.stringify({
                "selections": selections,
            })
        };
        if (imageId !== null) {
            console.log("Hej");
            sendDataAJAX('save', data);
        } else {
            // TODO: add modal info that data was not saved
            console.log("Problem with saving.");
        }
    }, false);
}


function mouseDown(e) {
    rect.startX = e.pageX - cvOffsetX;
    rect.startY = e.pageY - cvOffsetY;
    drag = true;
}

function mouseUp() {
    drag = false;
    showInput(rect);
}

function mouseMove(e) {
    if (drag) {
        hideInput();
        rect.w = (e.pageX - cvOffsetX) - rect.startX;
        rect.h = (e.pageY - cvOffsetY) - rect.startY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw();
    }
}

function draw() {
    console.log(rect);
    ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
}


function showInput(rect) {
    let input = document.getElementById('categoryLabel');
    input.style.display = "inline";
    input.style.left = `${cvOffsetX}px`;
    input.style.top = `${rect.startY + 10}px`;
    let textCategory = document.getElementById('textCategory');
    textCategory.value = "";
}

function hideInput() {
    let input = document.getElementById('categoryLabel');
    input.style.display = "none";
}

function displaySelections(selections) {
    let content = "";
    for (let i = 0; i < selections.length; i++) {
        content += getSelectionTemplate(selections[i].category, selections[i].id)
    }
    annotations.innerHTML = content;
}

function saveSelection() {
    let submitValue = document.getElementById('textCategory');
    rect.category = submitValue.value.slice();
    let s = new Selection(rect.startX, rect.startY, rect.w, rect.h, rect.category);
    id_count += 1;
    selections.push(s);
    displaySelections(selections);
}

function removeSelection(selectionId) {
    selections = selections.filter(e => e.id !== selectionId);
    displaySelections(selections);
}


function openFile(event) {
    let input = event.target;
    let reader = new FileReader();
    reader.onload = function () {
        let dataURL = reader.result;
        let output = document.getElementById('cv');
        output.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
    sendImageAJAX(input.files[0]);
    // Change name of current file
    current_filename = input.files[0].name;
}


function downloadAnnotations(content, fileName, contentType) {
    let out_file_content = {
        "filename": current_filename,
        "height": 900,
        "width": 600,
        "annotations": content,
    }
    let out_file_content_str = JSON.stringify(out_file_content);
    let a = document.createElement("a");
    let file = new Blob([out_file_content_str], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}


init();