import { createController } from "../../src/create-controller.js";
import { assertMiddleware } from "../../src/middleware/assert.middleware.js";

import { functionTest } from "../core/function.test.js";
import { errorTest } from "../core/on-error.test.js";
import { pushMiddlewareTest } from "../middleware/push-middleware.test.js";
import { asyncMiddlewareTest } from "../middleware/async-middleware.test.js";
import { flowLoggerTest } from "../debugging/flow-logger.test.js";

const testTimeout = 1000;
const ctrl = createController(assertMiddleware);

export function runTestsFlow() {

  const timout = setTimeout(() => {
    console.log('%c TEST TIMEOUT: FAILED TO COMPLETE IN %oms:', 'color: #E84258; font-weight: bold; font-size: 14px; margin: 10px;', testTimeout);
  }, testTimeout);

  return [
    { id: 'resetTestData', assert: { init: true }},
    { fn: functionTest },
    { fn: errorTest },
    { fn: pushMiddlewareTest },
    { fn: asyncMiddlewareTest },
    { fn: flowLoggerTest },
    { fn: () => clearTimeout(timout) },
    { id: 'logTestSummary', assert: { log: true }}
  ]
}

window.laminar = {
  test: () => {
    ctrl.push(runTestsFlow);
  },
}

window.laminar.test();