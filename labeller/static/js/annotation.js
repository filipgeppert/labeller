import { sendDataAJAX } from './utilities';

let text = document.getElementById("text");
let textAnnotated = document.getElementById("text-annotated");
let annotations = document.getElementById('annotations');
let newCategory = document.getElementById('inputCategory');

let content = "This is an example sentence.";
text.innerText = content;

let saveSelection = document.getElementById('saveSelection');
let saveAnnotations = document.getElementById('saveAnnotations');
let selections = [];
let categories = ['statistics', 'programming', 'devops'];


function getOffset(textInnerHTML) {
    return textInnerHTML.search(/\S/);
}

function addCategory() {
    if (newCategory.value !== ""){
        categories.push(newCategory.value);
        displaySelections(annotations);
    }
}

function displaySelections(annotations) {
    let content = "";
    for (let i=0; i < selections.length; i++) {
        content += '<div class="alert alert-primary row" role="alert">'
            + `<div class="col-4 text-black-50 font-weight-bold">${selections[i].text}</div>`
            + getCategoriesForm(selections[i].id)
            + getDeleteButton(selections[i].id)
            + '</div>';
    }
    annotations.innerHTML = content;
}

function getCategoriesForm (selectionId) {
    let start = "<div class=\"form-group col-6\">" +
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
    let html = '<div class="col-2">'
        + `<a class="btn border-danger text-dark" id="delete${selectionId}" onclick="removeSelection(${selectionId})">`
        + 'Delete</a>'
        + '</div>'
    return html;
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

saveSelection.addEventListener("click", function ()
    {
        let selection = document.getSelection();
        let s = {
            id: selections.length + 1,
            text: selection.toString(),
            from: Math.min(selection.anchorOffset, selection.focusOffset),
            to: Math.max(selection.anchorOffset, selection.focusOffset),
        }
        selections.push(s);
        displaySelections(annotations);
        highlightSelections(textAnnotated, content, selections);
    }
);

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
   sendDataAJAX('ajax/saveLabelledText', data);
});
