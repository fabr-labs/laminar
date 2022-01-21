import { applyMiddleware } from './apply-middleware.js';
import { logUnhandledError } from './log-unhandled-error.js';

export function errorHandler({ id, fn, args, onError: middleware = [], directives, error }) {
  return applyMiddleware(logUnhandledError, middleware)({ id, fn, args, directives, error });
}
