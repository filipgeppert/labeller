let text = document.getElementById("text");
let textAnnotated = document.getElementById("text-annotated");
let annotations = document.getElementById('annotations');
let newCategory = document.getElementById('inputCategory');
let saveSelection = document.getElementById('saveSelection');
let saveAnnotations = document.getElementById('saveAnnotations');
let paragraph_annotations = [];
let current_paragraph_pk = null;

function renderParagraph(paragraphPk) {
    current_paragraph_pk = paragraphPk;
    let paragraph = paragraph_annotations.filter(s => s.paragraphPk === paragraphPk)[0];
    text.innerText = paragraph.text;
    displaySelections(paragraph.selections)
    // highlightSelections(textAnnotated, content, paragraph.selections);
    console.log(paragraph);
    console.log(paragraphPk);
}


// Data
class Paragraph {
    constructor(text, documentId, paragraphPk) {
        this.text = text;
        this.documentId = documentId;
        this.paragraphPk = paragraphPk;
        this.selections = [];
        this.categories = ['other'];
    }

    addCategory(category) {
        if (category.value !== "") {
            this.categories.push(category.value);
        }
    }

    addSelection(selection) {
        let s = {
            id: this.selections.length + 1,
            text: selection.toString(),
            from: Math.min(selection.anchorOffset, selection.focusOffset),
            to: Math.max(selection.anchorOffset, selection.focusOffset),
        }
        this.selections.push(s);
    }
}


function getOffset(textInnerHTML) {
    return textInnerHTML.search(/\S/);
}

function addCategory() {
    if (newCategory.value !== ""){
        categories.push(newCategory.value);
        displaySelections(annotations);
    }
}

function displaySelections(selections) {
    let content = "";
    for (let i=0; i < selections.length; i++) {
        content += '<li class="list-group-item d-flex justify-content-between align-items-center m-1 row">'
            + `<div class="col-4">${selections[i].text}</div>`
            + getCategoriesForm(selections[i].id)
            + `<span class="badge badge-danger badge-pill">${getDeleteButton(selections[i].id)}</span>`
            + '</li>';
    }
    annotations.innerHTML = content;
}

function getCategoriesForm (selectionId) {
    let start = "<div class=\"form-group col-6 my-auto\">" +
                `<select class="form-control" id="selection${selectionId}" onchange="changeCategory(${selectionId})">`
    let end= "</select></div>";
    let selection = selections.filter(s => s.id === selectionId)[0];
    let options = "";
    for (let i=0; i < categories.length; i++) {
        if (categories[i] === selection.category) {
            options += `<option selected>${categories[i]}</option>`
        } else {
            options += `<option>${categories[i]}</option>`
        }
    }
    return start + options + end;
}

function getDeleteButton(selectionId) {
    return `<a id="delete${selectionId}" onclick="removeSelection(${selectionId})">`
        + 'Delete</a>';
}


function changeCategory(selectionId) {
    let form = document.getElementById(`selection${selectionId}`);
    let selection = selections.filter(s => s.id === selectionId)[0];
    selection.category = form.value;
}

function removeSelection(selectionId) {
    selections = selections.filter(e => e.id !== selectionId);
    displaySelections(annotations);
    highlightSelections(textAnnotated, content, selections);
}

function highlightSelections(element, textContent, selections) {
    let selectionsSorted = selections.sort((a, b) => (a.from > b.from) ? 1 : -1)
    let contentHighlighted = textContent;
    let added = 0;
    for (let i = 0; i < selectionsSorted.length; i++) {
        let start = selectionsSorted[i].from + added;
        let end = selectionsSorted[i].to + added;
        contentHighlighted = contentHighlighted.substring(0, start)
            + '<mark>' + contentHighlighted.substring(start, end)
            + '</mark>' + contentHighlighted.substring(end, contentHighlighted.length);
        added += 13;
    }
    element.innerHTML = contentHighlighted;
}


function readTextFile(file, callback) {
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

//usage:
readTextFile("../ocr/texts/cv_3.json", function(text_json){
    let data = JSON.parse(text_json);
    content = data.annotations[3].text;
    text.innerHTML = content;
});


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


function init() {
    // Init paragraph objects
    for (let paragraph of paragraphs) {
        paragraph_annotations.push(
            new Paragraph(
                paragraph.fields.text,
                paragraph.fields.document,
                paragraph.pk,
            )
        )
    }

    saveSelection.addEventListener("click", function () {
            let selection = document.getSelection();
            let current_paragraph = paragraph_annotations.filter((s) => s.paragraphPk === current_paragraph_pk)[0];
            console.log(current_paragraph);
            current_paragraph.addSelection(selection);
            renderParagraph(current_paragraph_pk);
        }
    );

    saveAnnotations.addEventListener('click', function () {
        // Construct annotation object
        let data = {
            "documentId": JSON.stringify(1),
            "paragraphId": JSON.stringify(1),
            "labelledText": JSON.stringify({
                "text": text.innerText,
                "selections": selections,
            })
        };
        sendDataAJAX('save', data);
    });
}

init();
