import { initData } from "./questiondata.js";
import { initUI } from "./ui.js";
import init from "../lib/wasm-math-evaluator/wasm_math_evaluator.js";
import { initTutorial } from "./tutorial.js";

document.getElementById("loading-screen").classList.remove("hidden");
await init();
initData(() => initUI());
initTutorial();