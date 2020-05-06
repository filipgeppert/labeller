let text = document.getElementById("text");
let textAnnotated = document.getElementById("text-annotated");
let annotations = document.getElementById('annotations');
let addCategory = document.getElementById("addCategory");
let saveAnnotation = document.getElementById('saveAnnotation');
let saveAnnotations = document.getElementById('saveAnnotations');
let paragraph_annotations = [];
let current_paragraph_pk = null;

// DOM manipulation
function renderParagraph(paragraphPk) {
    // Select paragraph from initialized list
    let paragraph = paragraph_annotations.filter((s) => s.paragraphPk === paragraphPk)[0];
    current_paragraph_pk = paragraphPk;
    text.innerText = paragraph.text;
    paragraph.displaySelections('annotations')
    // highlightSelections(textAnnotated, content, paragraph.selections);
}

// Data
class Paragraph {
    constructor(text, documentId, paragraphPk) {
        this.text = text;
        this.documentId = documentId;
        this.paragraphPk = paragraphPk;
        this.selections = [];
        this.defaultCategory = "other";
        this.categories = [this.defaultCategory];
    }

    addCategory(category) {
        if (category !== "") {
            this.categories.push(category);
        }
    }

    addSelection(selection) {
        let s = {
            id: this.selections.length + 1,
            text: selection.toString(),
            from: Math.min(selection.anchorOffset, selection.focusOffset),
            to: Math.max(selection.anchorOffset, selection.focusOffset),
            category: this.defaultCategory,
        }
        this.selections.push(s);
    }

    displaySelections(elementId) {
        let content = "";
        for (let i = 0; i < this.selections.length; i++) {
            content += '<li class="list-group-item d-flex justify-content-between align-items-center m-1 row">'
                + `<div class="col-4">${this.selections[i].text}</div>`
                + this.getCategoriesForm(this.selections[i])
                + `<span class="badge badge-danger badge-pill">${this.getDeleteButton(this.selections[i].id)}</span>`
                + '</li>';
        }
        let annotations = document.getElementById(elementId);
        annotations.innerHTML = content;
    }

    getCategoriesForm(selection) {
        let start = "<div class=\"form-group col-6 my-auto\">" +
                    `<select class="form-control" id="selection${selection.id}" onchange="changeCategory(${selection.id})">`
        let end = "</select></div>";
        // let selection = this.selections.filter(s => s.id === selectionId)[0];
        let options = "";
        for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i] === selection.category) {
                options += `<option selected>${this.categories[i]}</option>`
            } else {
                options += `<option>${this.categories[i]}</option>`
            }
        }
        return start + options + end;
    }

    getDeleteButton(selectionId) {
        return `<a id="delete${selectionId}" onclick="removeSelection(${selectionId})">`
            + 'Delete</a>';
    }

    getApiObject() {
    // Returns request ready api object
        return {
            "documentId": JSON.stringify(this.documentId),
            "paragraphId": JSON.stringify(this.paragraphPk),
            "labelledText": JSON.stringify({
                "text": this.text,
                "selections": this.selections,
            })
        };
    }
}


function changeCategory(selectionId) {
    let paragraph = paragraph_annotations.filter((s) => s.paragraphPk === current_paragraph_pk)[0];
    let form = document.getElementById(`selection${selectionId}`);
    let selection = paragraph.selections.filter(s => s.id === selectionId)[0];
    selection.category = form.value;
}

function removeSelection(selectionId) {
    let paragraph = paragraph_annotations.filter((s) => s.paragraphPk === current_paragraph_pk)[0];
    paragraph.selections = paragraph.selections.filter(e => e.id !== selectionId);
    renderParagraph(current_paragraph_pk);
}

function sendDataAJAX (url, data) {
      $.ajax({
        url: url,
        data: data,
        dataType: 'json',
        success: function (data) {
            displayMessage("Annotation saved!", "");
        }
      });
}

function displayMessage(messageLarge, messageSmall) {
    let message = document.getElementById('message');
    let largeMessage = document.getElementById('messageLarge');
    let smallMessage = document.getElementById('messageSmall');

    largeMessage.innerText = messageLarge;
    smallMessage.innerText = messageSmall;

    message.style.display = "inline";
    setTimeout(function () {
        message.style.display = "none";
    }, 3000)

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

    saveAnnotation.addEventListener("click", function () {
            let selection = document.getSelection();
            let current_paragraph = paragraph_annotations.filter((s) => s.paragraphPk === current_paragraph_pk)[0]
            current_paragraph.addSelection(selection);
            renderParagraph(current_paragraph_pk);
        }
    );

    saveAnnotations.addEventListener('click', function () {
        for (let p of paragraph_annotations) {
            // Construct annotation object
            sendDataAJAX('save', p.getApiObject());
        }
    });

    addCategory.addEventListener('click', function () {
       let current_paragraph = paragraph_annotations.filter((s) => s.paragraphPk === current_paragraph_pk)[0];
       let newCategory = document.getElementById('inputCategory');
       current_paragraph.addCategory(newCategory.value);
       renderParagraph(current_paragraph_pk);
    });

    // Click first paragraph button
    let firstParagraphButton = document.getElementById('firstParagraphButton');
    firstParagraphButton.click();
}

init();
