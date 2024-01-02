# wasm-math-evaluator

Symbolic WASM math evaluator library written in Rust. Uses 128 bits of precision thanks to [num-bigfloat](https://crates.io/crates/num-bigfloat).

Includes custom implementations for the Gamma function and combinatorics functions.

More information will be added to the README soon. 

To build, make sure you have `wasm-pack` installed. Then run:
```bash
wasm-pack build --target web
```
To see a live demo, first copy the binaries to `www/wasm-math-evaluator/`:
```bash
cp -r pkg/. www/wasm-math-evaluator/
```
Then, start a webserver in `www`. For example, using Python:
```bash
python -m http.server --directory www 8080 
```
Finally, navigate to `localhost:8080`.

# Credit

Generated using this template: https://github.com/rustwasm/wasm-pack-template