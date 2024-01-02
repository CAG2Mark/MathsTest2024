import { initData } from "./questiondata.js";
import { initUI } from "./ui.js";
import init from "../lib/wasm-math-evaluator/wasm_math_evaluator.js";
import { initTutorial } from "./tutorial.js";

await init();
initData(() => initUI());
initTutorial();