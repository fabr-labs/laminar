import { applyMiddleware } from './apply-middleware.js';
import { unhandledError } from './unhandled-error.js';

export function errorHandler({ onError: middleware = [], fn, args, directives, error }) {
  return applyMiddleware(unhandledError, middleware)({ fn, args, directives, error });
}
