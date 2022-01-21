import { errorHandler } from './error-handler.js';

export async function tryFn({ id, fn, args, onError = [], ...directives }) {
  try {
    return await fn(args);
  } catch (error) {
    return errorHandler({ id, fn, args, onError, directives, error });
  }
}
