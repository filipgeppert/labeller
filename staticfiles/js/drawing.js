let cv = document.getElementById('cv');
let canvas = document.getElementById('imageCanvas');
let ctx = canvas.getContext('2d');
let rect = {}, drag = false, selections = [];
let categoryBox = document.getElementById('categoryLabel');
let categoryButton = document.getElementById('categoryButton');
let saveAnnotationsButton = document.getElementById('saveAnnotations');
let annotations = document.getElementById('annotations');
let id_count = 0;
let current_filename = "";

class Selection {
    constructor(x,y,w,h,label) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.label = label;
        this.id = id_count;
    }
}

function sendDataAJAX (url, data) {
      $.ajax({
        url: url,
        data: data,
        dataType: 'json',
        success: function (data) {
            console.log("Data saved.")
        }
      });
}

function sendImageAJAX (img) {
    let formData = new FormData();
    // let file = $('#cv')[0].files[0];
    formData.append('image', img);
    // TODO: add csrf token
    // https://stackoverflow.com/questions/6506897/csrf-token-missing-or-incorrect-while-post-parameter-via-ajax-in-django
    $.ajax({
       url: 'saveImage',
       type: 'post',
       data: formData,
       contentType: false,
       processData: false,
       success: function () {
            console.log("Success!")
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
            "imageId": JSON.stringify(1),
            "labelledImage": JSON.stringify({
                "text": filename,
                "selections": selections,
            })
        };
        sendDataAJAX('save', data)
        sendImageAJAX();
    }, false);
}


function mouseDown(e) {
  rect.startX = e.pageX - this.offsetLeft;
  rect.startY = e.pageY - this.offsetTop;
  drag = true;
}

function mouseUp() {
  drag = false;
  showInput(rect);
}

function mouseMove(e) {
  if (drag) {
    hideInput();
    rect.w = (e.pageX - this.offsetLeft) - rect.startX;
    rect.h = (e.pageY - this.offsetTop) - rect.startY ;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw();
  }
}

function draw() {
  ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
}

function showInput(rect) {
    let input = document.getElementById('categoryLabel');
    input.style.display = "inline";
    input.style.left = `${rect.w - 100}px`;
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
    for (let i=0; i < selections.length; i++) {
        content += '<div class="alert alert-primary row" role="alert">'
            + `<div class="col-4 text-black-50 font-weight-bold">${selections[i].label}</div>`
            // + getCategoriesForm(selections[i].id)
            + getDeleteButton(selections[i].id)
            + '</div>';
    }
    annotations.innerHTML = content;
}

function saveSelection () {
    let submitValue = document.getElementById('textCategory');
    rect.label = submitValue.value.slice();
    let s = new Selection(rect.startX, rect.startY, rect.w, rect.h, rect.label);
    id_count += 1;
    selections.push(s);
    displaySelections(selections);
}

function removeSelection(selectionId) {
    selections = selections.filter(e => e.id !== selectionId);
    displaySelections(selections);
}

function getDeleteButton(selectionId) {
    let html = '<div class="col-2">'
        + `<a class="btn border-danger text-dark" id="delete${selectionId}" onclick="removeSelection(${selectionId})">`
        + 'Delete</a>'
        + '</div>'
    return html;
}

function openFile(event) {
    let input = event.target;
    let reader = new FileReader();
    reader.onload = function(){
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