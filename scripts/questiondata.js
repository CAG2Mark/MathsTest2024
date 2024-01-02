import { AnswerType, formatError } from "./mathinput.js";
import { check_expr } from "../lib/wasm-math-evaluator/wasm_math_evaluator.js";

export class Checkpoint {
    constructor(name, dependsOn, twiceHash) {
        this.name = name;
        this.dependsOn = dependsOn;
        this.twiceHash = twiceHash;
    }

    doSuccessActions() {
        let depends = this.dependsOn;
        for (let i = 0; i < depends.length; ++i) {
            let qName = depends[i];
            let button = questionButtons[qName];
            button.classList.remove("question-sidebar-button-error");
            button.classList.add("question-sidebar-button-success");
        }
        checkpointButtons[this.name].classList.add("checkpoint-sidebar-button-success");

        checkpointProgress[this.name] = true;
        saveCheckpointProgress();
    }

    undoSuccessActions(){
        let depends = this.dependsOn;
        for (let i = 0; i < depends.length; ++i) {
            let qName = depends[i];
            let button = questionButtons[qName];
            button.classList.remove("question-sidebar-button-success");
            button.classList.remove("question-sidebar-button-error");
        }
        checkpointButtons[this.name].classList.remove("checkpoint-sidebar-button-success");

        checkpointProgress[this.name] = false;
        saveCheckpointProgress();
    }

    displaySuccess(code) {
        this.errorPage.style.display = "none";
        this.successPage.style.display = "block";
        this.failPage.style.display = "none";

        this.successPageOutput.innerHTML = code;

        this.doSuccessActions();
    }

    displayFail(undefQues, undefInputs) {
        if (undefQues) {
            this.errorFailMoreInfo.style.display = "inline";
            this.errorFailMoreInfoPill.innerHTML = questionIdx[undefQues] + 1;
            
            let undefText = "";
            let entries = Object.entries(undefInputs);
            entries.forEach(([name, val], idx) => {
                undefText += name + " = " + check_expr(val, []).latex;
                if (idx != entries.length - 1) 
                    undefText += ", \\ "
            })

            katex.render(undefText, this.errorFailMoreInfoInputs, { displayMode: true })
        } else {
            this.errorFailMoreInfo.style.display = "none";
        }

        this.errorPage.style.display = "none";
        this.successPage.style.display = "none";
        this.failPage.style.display = "block";

        this.undoSuccessActions();
    }

    displayError(err, inputVal, qName) {
        this.errorPage.style.display = "block";
        this.successPage.style.display = "none";
        this.failPage.style.display = "none";

        this.errorPagePill.innerHTML = questionIdx[qName] + 1;
        this.errorBox.innerHTML = formatError(inputVal, err);
        this.errorMsgBox.innerHTML = err.msg;

        this.undoSuccessActions();
        let button = questionButtons[qName];
        button.classList.add("question-sidebar-button-error");
    }

    check() {
        let depends = this.dependsOn;
        let ansString = "";

        let undefQues;
        let undefInput;

        for (let i = 0; i < depends.length; ++i) {
            let qName = depends[i];
            let q = questionData[qName];

            let qString = "";

            let ansFields = Object.entries(q.answerFields);
            console.log(ansFields);
            ansFields.sort(([a, b]) => a[0].localeCompare(b[0]));

            for (let j = 0; j < ansFields.length; ++j) {
                let ansField = ansFields[j][1];
                let inpBox = ansField.inputBox;
                
                let res = inpBox.eval();
                // Check if any inputs are NaN or inf
                if (!undefQues && res[2]) {
                    undefQues = qName;
                    undefInput = res[2];
                }

                if (!res[1]) {
                    this.displayError(res[0].error, res[0].error.input, qName);
                    return;
                }

                qString += JSON.stringify(res[0])
            }
            ansString += qString + ",";
        }

        let hash = sha256(ansString);
        let twiceHash = sha256(hash);

        console.log(twiceHash);

        if (twiceHash == this.twiceHash) {
            this.displaySuccess(hash);
        } else {
            this.displayFail(undefQues, undefInput);
        }
    }

    assignPage(page) {
        this.page = page;
        this.checkButton = page.getElementsByClassName("check-answers-button")[0];

        this.errorPage = page.getElementsByClassName("checkpoint-error")[0];
        this.successPage = page.getElementsByClassName("checkpoint-success")[0];
        this.failPage = page.getElementsByClassName("checkpoint-fail")[0];

        this.successPageOutput = page.getElementsByClassName("checkpoint-code-output")[0];

        this.errorPagePill = page.getElementsByClassName("checkpoint-error-question")[0];
        this.errorBox = page.getElementsByClassName("checkpoint-error-box")[0];
        this.errorMsgBox = page.getElementsByClassName("checkpoint-error-msg")[0];

        this.errorFailMoreInfo = page.getElementsByClassName("checkpoint-fail-more-info")[0];
        this.errorFailMoreInfoPill = page.getElementsByClassName("checkpoint-fail-question")[0];
        this.errorFailMoreInfoInputs = page.getElementsByClassName("checkpoint-fail-inputs")[0];
        

        this.checkButton.addEventListener("click", (e) => this.check());
    }
}

export class Question {
    constructor(name, answerFields) {
        this.name = name;
        this.answerFields = answerFields;
    }
}

export class AnswerField {
    constructor(name, answerType, isInt, questionName, inputs, tests) {
        this.name = name;
        this.answerType = answerType;
        this.isInt = isInt;
        this.questionName = questionName;
        if (answerType == AnswerType.FUNCTION) {
            if (!tests || !inputs) {
                throw new Error("Tried to initialize a FUNCTION answer with no input variables or tests.")
            }
            this.inputs = inputs;
            this.tests = tests;
        }
    }

    assignInputBox(inputBox) {
        this.inputBox = inputBox;
    }
}

export class QuestionProgress {
    constructor(question) {
        this.customVariables = {};
        this.answers = {};

        let fields = Object.entries(question.answerFields);

        fields.forEach(([name, answer], _1, _2) => {
            this.answers[name] = "";
        });
    }
}

export var questionButtons = {};
export var questionPages = {};
export var questionData = {};
export var questionIdx = {};
export var questionProgress = {};
export var checkpointProgress = {};
export var checkpointButtons = {};
export var checkpointPages = {};
export var checkpointData = {};

function discoverQuestions() {
    let pages = document.getElementById("question-area").getElementsByClassName("question-page");
    for (let i = 0; i < pages.length; ++i) {
        let page = pages[i];
        questionPages[page.dataset.questionName] = page;
    }
}

function parseAnswerField(ans, questionName) {
    let name = ans.name;
    let ty = ans.type;
    let isInt = !!ans.isInt;
    if (ty == AnswerType.FUNCTION) {
        let inputs = ans.inputs;
        let tests = ans.tests;
        // normalize all tests so the input is a string
        for (let i = 0; i < tests.length; ++i) {
            let entries = Object.entries(tests[i]);
            for (let j = 0; j < entries.length; ++j) {
                tests[i][entries[j][0]] = entries[j][1].toString();
            }
        }
        return new AnswerField(name, ty, isInt, questionName, inputs, tests);
    } else {
        return new AnswerField(name, ty, isInt,  questionName);
    }
}

function populateQuestionData(json) {
    let qs = json.questions;
    for (let i = 0; i < qs.length; ++i) {
        let q = qs[i];
        let name = q.name;
        let answers = q.answers;

        let answerFields = {}
        for (let i = 0; i < answers.length; ++i) {
            let ans = parseAnswerField(answers[i], name);
            answerFields[ans.name] = ans;
        }

        questionData[name] = new Question(name, answerFields);
        questionIdx[name] = i;
    }

    let cps = json.checkpoints;
    for (let i = 0; i < cps.length; ++i) {
        let cpt = cps[i];
        let name = cpt.name;
        checkpointData[name] = new Checkpoint(name, cpt.depends, cpt.twiceHash);
    }
}

function fetchQuestions(callback) {
    fetch("../data/questiondata.json")
        .then(response => response.json())
        .then(json => {
            populateQuestionData(json);
            setupCheckpointPages();
            loadProgress();
            initAllMathInputs();

            if (callback)
                callback();
        });
}

function loadProgress() {
    // pre-populate stuff first
    let data = Object.entries(questionData);
    data.forEach(([name, ques], _1, _2) => {
        questionProgress[name] = new QuestionProgress(ques);
    });  

    let progress = JSON.parse(localStorage.getItem("savedAnswers"));
    if (!progress) return;

    data.forEach(([name, _0], _1, _2) => {
        let qp = questionProgress[name];
        let saved = progress[name];
        
        if (!saved) return;

        qp.customVariables = saved.customVariables;

        if (!saved) return;

        let entries = Object.entries(qp.answers);
        entries.forEach(([ansName, _0], _1, _2) => {
            let savedAns = saved.answers[ansName];
            if (!savedAns) return;
            qp.answers[ansName] = savedAns;
        });
    });  
}

function setupCheckpointPage(page, checkpoint) {
    checkpoint.assignPage(page);
    
    let depends = checkpoint.dependsOn;
    
    let qList = page.getElementsByClassName("checkpoint-question-list")[0];
    qList.innerHTML = "";

    let idxes = [];

    for (let i = 0; i < depends.length; ++i) {
        let qName = depends[i];
        let qIdx = questionIdx[qName];
        idxes.push(qIdx);
    }

    idxes.sort();
    
    for (let i = 0; i < idxes.length; ++i) {
        let qIdx = idxes[i];
        qList.innerHTML += "<span class=\"inline-circle\">" + (qIdx + 1) + "</span>";

        if (i < depends.length - 2) {
            qList.innerHTML += ", ";
        } else if (i == depends.length - 2) {
            qList.innerHTML += " and ";
        }
    }
}

let checkpointTemplate = document.getElementById("checkpoint-area-template");
let questionsArea = document.getElementById("question-area");
function setupCheckpointPages() {
    let cps = Object.entries(checkpointData);

    cps.forEach(([name, cpt], _0, _1) => {
        let cloned = checkpointTemplate.cloneNode(true);
        cloned.removeAttribute("id");
        cloned.dataset.checkpointName = name;
        questionsArea.appendChild(cloned);

        checkpointPages[name] = cloned;

        setupCheckpointPage(cloned, cpt);
    });
}

function saveQuestionProgress() {
    let json = JSON.stringify(questionProgress);
    localStorage.setItem("savedAnswers", json);
}

function saveCheckpointProgress() {
    let json = JSON.stringify(checkpointProgress);
    localStorage.setItem("checkpointProgress", json);
}

import { initMathInput } from "./mathinput.js"

function initAllMathInputs() {
    let qp = Object.entries(questionPages);

    qp.forEach(([name, page], _1, _2) => {
        let q = questionData[name];

        let elems = page.getElementsByClassName("math-input");

        for (let i = 0; i < elems.length; ++i) {
            let elem = elems[i];
            if (elem.id == "math-input-template") continue;
            
            let ansName = elem.dataset.answerName;

            let ansField = q.answerFields[ansName];
            
            let mathInput = initMathInput(elem); 
            ansField.assignInputBox(mathInput);

            mathInput.assignAnswerField(ansField);

            let savedAns = questionProgress[name].answers[ansName];
            if (savedAns) {
                mathInput.textArea.value = savedAns;
                mathInput.render();
            }

            mathInput.onChange((_sender, val, ansName, quesName) => {
                if (!ansName || !quesName) return;

                let qp = questionProgress[quesName];
                if (!qp) return;
                questionProgress[quesName].answers[ansName] = val;
                saveQuestionProgress();
            })
        }
    });
}

export function initData(callback) {
    discoverQuestions();
    fetchQuestions(callback);
}