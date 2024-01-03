let curPage;
let curButton;
let curPageName;

import { checkpointPages, questionPages, questionIdx, questionButtons, checkpointButtons, checkpointData } from "./questiondata.js"

function transitionPage(name, page, button) {
    if (name == curPageName) return;
    curPageName = name;

    page.style.display = "block";
    if (curPage)
        curPage.style.display = "none";
    curPage = page;

    button.classList.add("sidebar-button-selected");
    if (curButton)
        curButton.classList.remove("sidebar-button-selected");
    curButton = button;
    
    button.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
    });
}

function initButton(idx, button) {
    button.setAttribute("tabindex", idx + 1);
    if (button.classList.contains("question-sidebar-button")) {
        let qName = button.dataset.questionName;
        button.getElementsByClassName("inline-circle")[0].innerHTML = questionIdx[qName] + 1;
        button.addEventListener("click", (e) => transitionPage("QUES" + qName, questionPages[qName], button));

        questionButtons[qName] = button;
    } else if (button.classList.contains("checkpoint-sidebar-button")) {
        let cptName = button.dataset.checkpointName;
        button.addEventListener("click", (e) => transitionPage("CPT" + cptName, checkpointPages[cptName], button));

        checkpointButtons[cptName] = button;
    } else {
        let targetName = button.dataset.targetElem;
        let target = document.getElementById(targetName);
        button.addEventListener("click", (e) => transitionPage("OTHER" + targetName, target, button));

        if (targetName == "welcome-page") {
            transitionPage("OTHER" + targetName, target, button);
        }
    }
}

// Setup sidebar buttons
function setupSidebar() {
    let elems = document.getElementById("question-sidebar").getElementsByClassName("sidebar-button");

    for (let i = 0; i < elems.length; ++i)
        if (elems[i].id != "math-input-template")
            initButton(i, elems[i]);

    document.getElementById("question-sidebar-wrap").classList.remove("invisible");
}

function colorCheckpoints() {
    let progress = JSON.parse(localStorage.getItem("checkpointProgress"));
    if (!progress) return;

    let entries = Object.entries(progress);
    entries.forEach(([name, val], _1, _2) => {
        if (!val) return;
        checkpointData[name].doSuccessActions();
    })
}

function showQuestions() {
    document.getElementById("question-area").classList.remove("invisible");
    document.getElementById("loading-screen").classList.add("hidden");
}

export function initUI() {
    setupSidebar();
    showQuestions();
    colorCheckpoints();
}