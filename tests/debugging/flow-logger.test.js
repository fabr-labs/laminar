import { createController } from "../../src/create-controller.js";
import { assertMiddleware } from "../../src/middleware/assert.middleware.js";
import { asyncMiddleware } from "../../src/middleware/async.middleware.js";
import { pushFlowMiddleware } from "../../src/middleware/push-flow.middleware.js";
import { flowLogger } from "../../src/debugging/flow-logger.js";

let testData = [];

const ctrl = flowLogger(createController)(assertMiddleware, pushFlowMiddleware, asyncMiddleware);

function delayedResponse (key) {
  return new Promise((resolve) => {
    setTimeout(() => {;
      resolve(testData.push(key));
    }, 10);
  });
}

const pushedFlowLoggerTestFlow = () => {
  // Assert async ordering by adding a small delay to some steps:
  return [
    // Set async data:
    { id: 'PushedStep#1', fn: () => testData.push('PushedStep#1'), args: { test1: 'Pushedtest3' }},
    { id: 'PushedStep#2', fn: delayedResponse, args: 'PushedStep#2' },
    // Async block:
    [
      { id: 'PushedStep#3', fn: () => testData.push('PushedStep#3'), args: { test2: 'Pushedtest4' }},
      { id: 'PushedStep#4', fn: delayedResponse, args: 'PushedStep#4' },
      { id: 'PushedStep#5', fn: () => testData.push('PushedStep#5') },
    ],
    { id: 'PushedStep#6', fn: () => testData.push('PushedStep#6') },
  ];
}

const flowLoggerTestFlow = () => {
  testData = [];

  // Use a mixture of middleware to test the flowLogger compataibility:
  return [
    { id: 'Step#1', fn: () => testData.push('Step#1'), args: { test1: 'Pushedtest1' }},
    { id: 'Step#2', fn: delayedResponse, args: 'Step#2' },
    [
      { id: 'Step#3', fn: () => testData.push('Step#3'), args: { test1: 'Pushedtest2' }},
      { id: 'Step#4', fn: delayedResponse, args: 'Step#4' },
      { id: 'Step#5', push: pushedFlowLoggerTestFlow },
    ],
    { id: 'Step#6', fn: () => testData.push('Step#6') },

    // // Assertions:
    // { id: 'Async Order', fn: () => testData, assert: { deepEqual: ['Step#1', 'Step#2', 'Step#3', 'Step#5', 'Step#4', 'Step#6'] } },
  ];
}

export const flowLoggerTest = () => ctrl.push(flowLoggerTestFlow);
