import { eval_expr, check_expr } from "../lib/wasm-math-evaluator/wasm_math_evaluator.js"

let mathInputTemplate = document.getElementById("math-input-template");

export const AnswerType = {
    TEXT: "TEXT",
    NUMBER: "NUMBER",
    FUNCTION: "FUNCTION"
}

export function formatError(text, error) {
    text += " ";

    let start = error.start;
    let end = error.start + error.len;

    let fst = text.substring(0, start);
    let mid = text.substring(start, end);
    let snd = text.substring(end);

    fst = "<span class=\"error-text\">" + sanitize(fst) + "</span>";
    mid = "<span class=\"error-highight\">" + sanitize(mid) + "</span>";
    snd = "<span class=\"error-text\">" + sanitize(snd) + "</span>";

    return fst + mid + snd;
}

const DEC_PLACES = 22;

function roundToSigfig(mantissaStr, dp) {
    if (dp == 0) return "0";

    if (dp == mantissaStr.length) return mantissaStr;

    let digits = [...mantissaStr].map(c => c - '0');
    // rounding to even is equivalent to adding 5 and truncating
    digits[dp] += 5;
    for (let i = dp; i >= 0; --i) {
        if (digits[i] < 10) break;
        digits[i] %= 10;
        
        if (i > 0) {
            digits[i - 1] += 1;
        }
    }

    let ret = "";
    for (let i = 0; i < dp; ++i) {
        ret += digits[i].toString();
    }

    return ret;
}

function roundToInt(mantissaStr, exp) {
    return roundToSigfig(mantissaStr, Math.max(0, Math.min(40, exp + 1)));
}

export function sanitize(text) {
    return text.replace("&", "&amp;")
        .replace("\"", "&quot;")
        .replace("\'", "&#039;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("/", "&#47;")
        .replace("\\", "&#92;");
}

export class MathInputBox {
    getValue() {
        return this.textArea.value;
    }
    assignAnswerField(ansField) {
        this.ansField = ansField;
    }

    onChange(callback) {
        this.callback = callback;
    }

    renderError(error) {
        let inp = this.textArea.value;

        this.texArea.style.display = "none";
        this.errorArea.style.display = null;

        this.errorBox.innerHTML = formatError(inp, error);
        this.errorMsgArea.innerHTML = error.msg;
    }

    wrapNum(res) {
        if (res.is_nan) {
            return "NaN";
        }
        if (res.is_inf) {
            return [res.sign, "inf"];
        }

        let mantissaStr = res.mantissa;

        let allZeros = true;
        for (let i = 0; i < mantissaStr.length; ++i) {
            if (mantissaStr[i] == '0') continue;
            allZeros = false;
            break;
        }

        if (allZeros) {
            return ["0"];
        }

        if (this.ansField.isInt) {
            return [res.sign, roundToInt(mantissaStr, res.exp), res.exp];
        }
        return [res.sign, roundToSigfig(mantissaStr, DEC_PLACES), res.exp];
    }

    eval(auxVariables) {
        let inp = this.textArea.value;

        let inputs = [];

        if (auxVariables)
            inputs = auxVariables;

        if (this.ansField.answerType == AnswerType.FUNCTION) {
            let inputsAux = [...inputs];

            let tests = this.ansField.tests;

            let answers = [];

            let undefInp;

            for (let i = 0; i < tests.length; ++i) {
                let vars = Object.entries(tests[i]);
                vars.forEach((pair, _1, _2) => inputsAux.push(pair));

                let res = eval_expr(inp, inputsAux);
                // Check if any inputs are NaN or inf
                if (!undefInp && (res.is_nan || res.is_inf)) {
                    undefInp = tests[i];
                }

                if (res.result != 'EvalSuccess') {
                    return [res, false];
                }

                answers.push(this.wrapNum(res));
            }

            return [answers, true, undefInp];
        } else {
            let res = eval_expr(inp, inputs);
            if (res.result != 'EvalSuccess') {
                return [res, false];
            }

            return [[this.wrapNum(res)], true];
        }
    }

    check() {
        let inp = this.textArea.value;

        if (inp.length == 0) {
            this.texArea.style.display = "none";
            this.errorArea.style.display = "none";
            return;
        }

        let res = check_expr(inp);

        if (res.result != "CheckSuccess") {
            let error = res.error;
            this.renderError(error);
        }
    }

    render() {
        let inp = this.textArea.value;

        if (inp.length == 0) {
            this.texArea.style.display = "none";
            this.errorArea.style.display = "none";
            return;
        }

        if (!this.ansField || this.ansField.answerType == AnswerType.FUNCTION) {
            let res = check_expr(inp, this.ansField.inputs);

            if (res.result == "CheckSuccess") {
                this.texArea.style.display = null;
                this.errorArea.style.display = "none";
                katex.render(res.latex, this.texArea, { displayMode: true });
            } else {
                let error = res.error;
                this.renderError(error);
            }
        } else {
            let res = eval_expr(inp);

            if (res.result == "EvalSuccess") {
                this.texArea.style.display = null;
                this.errorArea.style.display = "none";

                let latex = res.latex;
                let ans = res.text;
                
                function wrapGather(l1, l2) {
                    if (l1.includes(";")) {// contains semicolon, meaning there is a let statement
                        return "\\begin{gather*}" + l1 + " \\\\ " + l2 + "\\end{gather*}"
                    } else {
                        return l1 + " " + l2;
                    }
                }

                if (latex.trim() == ans.trim()) {
                    katex.render(ans, this.texArea, { displayMode: true });
                    return;
                }

                if (res.is_exact) {
                    katex.render(wrapGather(latex, " = " + ans), this.texArea, { displayMode: true });
                } else {
                    katex.render(wrapGather(latex, "\\approx " + ans), this.texArea, { displayMode: true });
                }
            } else {
                let error = res.error;
                this.renderError(error);
            }
        }
    }
    constructor(elem) {
        this.elem = elem;

        let textArea = elem.getElementsByClassName("math-input-textarea")[0];
        let texArea = elem.getElementsByClassName("math-input-tex-area")[0];
        let errorArea = elem.getElementsByClassName("math-input-error-area")[0];

        let errorBox = elem.getElementsByClassName("math-input-error-box")[0];
        let errorMsgArea = elem.getElementsByClassName("math-input-error-msg")[0];

        this.textArea = textArea;
        this.texArea = texArea;
        this.errorArea = errorArea;

        this.errorBox = errorBox;
        this.errorMsgArea = errorMsgArea;

        textArea.addEventListener("input", (e) => {
            this.render();
            if (this.callback) {
                if (this.ansField) {
                    this.callback(this, textArea.value, this.ansField.name, this.ansField.questionName);
                } else {
                    this.callback(this, textArea.value, undefined, undefined);
                }
            }
        });
    }
}

export function initMathInput(elem) {
    let ogId = elem.id;
    let answerName = elem.dataset.answerName;

    let cloned = mathInputTemplate.cloneNode(true);
    elem.replaceWith(cloned);

    cloned.dataset.answerName = answerName;

    if (ogId) {
        cloned.id = ogId;
    } else {
        cloned.removeAttribute("id");
    }

    return new MathInputBox(cloned);
}