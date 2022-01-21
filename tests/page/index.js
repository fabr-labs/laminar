import { createController } from "@fabr-labs/laminar";
import { assertMiddleware } from "@fabr-labs/laminar/middleware/assert.middleware.js";

import { functionTest } from "../core/function.test.js";
import { errorTest } from "../core/on-error.test.js";
import { pushMiddlewareTest } from "../middleware/push-middleware.test.js";
import { asyncMiddlewareTest } from "../middleware/async-middleware.test.js";

const ctrl = createController(assertMiddleware);

export function runTestsFlow() {

  return [
    { id: 'resetTestData', assert: { reset: true }},
    { fn: functionTest },
    // { fn: errorTest },
    { fn: pushMiddlewareTest },
    { fn: asyncMiddlewareTest },
    { id: 'logTestSummary', assert: { log: true }}
  ]
}

window.laminar = {
  test: () => {
    ctrl.push(runTestsFlow);
  },
}

window.laminar.test();