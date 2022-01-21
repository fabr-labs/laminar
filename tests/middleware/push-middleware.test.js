import { createController } from "../../src/create-controller.js";
import { assertMiddleware } from "../../src/middleware/assert.middleware.js";
import { pushFlowMiddleware } from "../../src/middleware/push-flow.middleware.js";

const ctrl = createController(pushFlowMiddleware, assertMiddleware);

const testData = new Map();

const pushedFlow = () => {

  // A function to modify the test data to assert the flow was pushed:
  return [
    { id: 'setTestData', fn: () => testData.set('TestDataKey', true) },
  ];
}

const pushMiddlewareTestFlow = () => {
  testData.clear();

  // Push an additional flow, then assert the test data was set:
  return [
    { id: 'PushAdditionalFlow', push: pushedFlow },
    { id: 'FlowPushed', fn: () => testData.get('TestDataKey'), assert: { equal: true }},
  ];
}

export const pushMiddlewareTest = () => ctrl.push(pushMiddlewareTestFlow);
