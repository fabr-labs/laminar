import { tryFn } from './try-function.js';
import { applyMiddleware } from './apply-middleware.js';

export function* flowGenerator(flow, args, middleware) {
  for (const step of flow(args)) {
    yield applyMiddleware(tryFn, middleware)(step);
  }
}
