import { createController } from "@fabr-labs/laminar";
import { assertMiddleware } from "@fabr-labs/laminar/middleware/assert.middleware.js";
import { asyncMiddleware } from "@fabr-labs/laminar/middleware/async.middleware.js";
import { mapMiddleware } from "@fabr-labs/laminar/middleware/map.middleware.js";

import { logMiddleware } from "@fabr-labs/laminar/middleware/log.middleware.js";

const testData = new Map();

const ctrl = createController(mapMiddleware(testData), assertMiddleware, logMiddleware(false), asyncMiddleware);

function delayedResponse () {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(performance.now());
    }, 10);
  });
}

const asyncMiddlewareTestFlow = () => {

  // Test async order by adding a small delay to some steps:
  return [
    // Set async data:
    { id: 'Step#1', fn: () => performance.now(), mapSet: 'Step#1' },
    { id: 'Step#2', fn: delayedResponse, mapSet: 'Step#2' },
    // Async block:
    [
      { id: 'Step#3', fn: () => performance.now(), mapSet: 'Step#3' },
      { id: 'Step#4', fn: delayedResponse, mapSet: 'Step#4' },
      { id: 'Step#5', fn: () => performance.now(), mapSet: 'Step#5' },
    ],
    { id: 'Step#6', fn: () => performance.now(), mapSet: 'Step#6' },

    // Assertions:
    { id: 'Async Order#1', mapGet: 'Step#1', assert: { lt: () => testData.get('Step#2') }},
    { id: 'Async Order#2', mapGet: 'Step#2', assert: { lt: () => testData.get('Step#3') }},
    { id: 'Async Order#3', mapGet: 'Step#3', assert: { lt: () => testData.get('Step#4') }},

    // Step 4 has a delay, so should complete last in the async block:
    { id: 'Async Order#4: async delayed', mapGet: 'Step#4', assert: { gt: () => testData.get('Step#5'), lt: () => testData.get('Step#6') }},

    // Step 5 should wait for the async steps to all complete:
    { id: 'Async Order#5: waits for all async', mapGet: 'Step#5', assert: { gt: () => testData.get('Step#3') }},
    { id: 'Async Order#6', mapGet: 'Step#6', assert: { gt: () => testData.get('Step#5') }},
  ];
}

export const asyncMiddlewareTest = () => ctrl.push(asyncMiddlewareTestFlow);
