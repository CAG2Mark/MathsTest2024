import { AnswerType, initMathInput } from "./mathinput.js";
import { AnswerField } from "./questiondata.js";

export function initTutorial() {
    let tut1 = initMathInput(document.getElementById("tut1"));
    tut1.assignAnswerField(new AnswerField("dummy", AnswerType.NUMBER, false, "dummy"))

    let tut2 = initMathInput(document.getElementById("tut2"));
    tut2.assignAnswerField(new AnswerField("dummy", AnswerType.NUMBER, false, "dummy"))

    let tut3 = initMathInput(document.getElementById("tut3"));
    tut3.assignAnswerField(new AnswerField("dummy", AnswerType.FUNCTION, false, "dummy", ["a", "b"], []))

    let tut4 = initMathInput(document.getElementById("tut4"));
    tut4.assignAnswerField(new AnswerField("dummy", AnswerType.FUNCTION, false, "dummy", ["x"], []))
}
