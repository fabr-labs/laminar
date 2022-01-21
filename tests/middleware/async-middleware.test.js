import { createController } from "../../src/create-controller.js";
import { assertMiddleware } from "../../src/middleware/assert.middleware.js";
import { asyncMiddleware } from "../../src/middleware/async.middleware.js";

let testData = [];

const ctrl = createController(assertMiddleware, asyncMiddleware);

function delayedResponse (key) {
  return new Promise((resolve) => {
    setTimeout(() => {
      testData.push(key);
      resolve();
    }, 10);
  });
}

const asyncMiddlewareTestFlow = () => {
  testData = [];

  // Assert async ordering by adding a small delay to some steps:
  return [
    // Set async data:
    { id: 'Step#1', fn: () => testData.push('Step#1') },
    { id: 'Step#2', fn: delayedResponse, args: 'Step#2' },
    // Async block:
    [
      { id: 'Step#3', fn: () => testData.push('Step#3') },
      { id: 'Step#4', fn: delayedResponse, args: 'Step#4' },
      { id: 'Step#5', fn: () => testData.push('Step#5') },
    ],
    { id: 'Step#6', fn: () => testData.push('Step#6') },

    // Assertions:
    { id: 'Async Order', fn: () => testData, assert: { deepEqual: ['Step#1', 'Step#2', 'Step#3', 'Step#5', 'Step#4', 'Step#6'] } },
  ];
}

export const asyncMiddlewareTest = () => ctrl.push(asyncMiddlewareTestFlow);
