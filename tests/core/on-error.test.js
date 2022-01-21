import { createController } from "@fabr-labs/laminar";
import { assertMiddleware } from "@fabr-labs/laminar/middleware/assert.middleware.js";
import { asyncMiddleware } from "@fabr-labs/laminar/middleware/async.middleware.js";
import { mapMiddleware } from "@fabr-labs/laminar/middleware/map.middleware.js";
import { logMiddleware } from "@fabr-labs/laminar/middleware/log.middleware.js";

const testData = new Map();

const ctrl = createController(mapMiddleware(testData), assertMiddleware, logMiddleware(false), asyncMiddleware);

function throwError() {
  throw new Error('Test Error');
}

const handleErrorMiddleware = (next) => ({ id, fn, args, directives, error, resolved = false }) => {

  if (!resolved && error.status === 404) {
    testData.set('HandledErrorMiddleware', true);

    return next({ id, fn, args, directives, error, resolved: true });
  }

  return next({ id, fn, args, directives, error });
}

const skippedErrorMiddleware = (next) => ({ id, fn, args, directives, error, resolved = false }) => {

  if (!resolved) {
    testData.set('SkippedErrorMiddleware', true);

    return next({ id, fn, args, directives, error });
  }

  return next({ id, fn, args, directives, error });
}

const errorTestFlow = () => {

  return [
    { id: 'CatchError', fn: throwError, onError: [skippedErrorMiddleware, handleErrorMiddleware] },
      // Test that the error is caught and the error middleware is called:
    { id: 'ErrorHandledByMiddleware', mapGet: 'HandledErrorMiddleware', assert: { equal: true }},
      // Test that the caught error skips the next middleware:
    { id: 'HandledErrorSkippedByMiddleware', mapGet: 'SkippedErrorMiddleware', assert: { equal: false }},
  ];
}

export const errorTest = () => ctrl.push(errorTestFlow);
