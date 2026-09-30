// Restores the untyped `any` result of Response/Request.json() for this codebase
// (a dependency's type definitions otherwise narrow it to `unknown`).
interface Body {
    json(): Promise<any>;
}
