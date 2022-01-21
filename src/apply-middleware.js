export function applyMiddleware(tryFn, middleware) {
  return middleware.reduce((fn, middlewareFn) => middlewareFn(fn), tryFn);
}
