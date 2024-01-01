import { initData } from "./questiondata.js";
import { initUI } from "./ui.js";
import init from "../lib/wasm-math-evaluator/wasm_math_evaluator.js";

await init();
initData(() => initUI());