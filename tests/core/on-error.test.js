import { createController } from "../../src/create-controller.js";
import { assertMiddleware } from "../../src/middleware/assert.middleware.js";
import { asyncMiddleware } from "../../src/middleware/async.middleware.js";
import { logMiddleware } from "../../src/middleware/log.middleware.js";

const testData = new Map();

const ctrl = createController(assertMiddleware, logMiddleware(false), asyncMiddleware);

function throwError() {
  throw new Error('Test Error');
}

const handleErrorMiddleware = (next) => ({ id, fn, args, directives, error, resolved = false }) => {

  if (!resolved) {
    testData.set('HandledErrorMiddleware', true);

    return next({ id, fn, args, directives, error, resolved: true });
  }

  return next({ id, fn, args, directives, error, resolved });
}

const skippedErrorMiddleware = (next) => ({ id, fn, args, directives, error, resolved = false }) => {

  if (!resolved) {
    testData.set('SkippedErrorMiddleware', true);

    return next({ id, fn, args, directives, error, resolved });
  }

  return next({ id, fn, args, directives, error, resolved });
}

const errorTestFlow = () => {
  testData.clear();

  return [
    { id: 'CatchError', fn: throwError, onError: [skippedErrorMiddleware, handleErrorMiddleware] },
      // Test that the error is caught and the error middleware is called:
    { id: 'ErrorHandledByMiddleware', fn: () => testData.get('HandledErrorMiddleware'), assert: { equal: true }},
      // Test that the caught error skips the next middleware:
    { id: 'HandledErrorSkippedByMiddleware', fn: () => testData.get('SkippedErrorMiddleware'), assert: { equal: undefined }},
  ];
}

export const errorTest = () => ctrl.push(errorTestFlow);
