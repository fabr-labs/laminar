import { createController } from "@fabr-labs/laminar";
import { assertMiddleware } from "@fabr-labs/laminar/middleware/assert.middleware.js";
import { pushFlowMiddleware } from "@fabr-labs/laminar/middleware/push-flow.middleware.js";
import { mapMiddleware } from "@fabr-labs/laminar/middleware/map.middleware.js";

const ctrl = createController(pushFlowMiddleware, assertMiddleware, mapMiddleware());

const pushedFlow = () => {

  // A function to modify the test data to assert the flow was pushed:
  return [
    { id: 'setTestData', fn: () => 'PushedFlowData', mapSet: 'TestDataKey1' },
  ];
}

const pushMiddlewareTestFlow = () => {

  // Push an additional flow, then assert the test data was set:
  return [
    { id: 'PushAdditionalFlow', push: pushedFlow, args: {}},
    { id: 'FlowPushed', mapGet: 'TestDataKey1', assert: { equal: 'PushedFlowData' }},
  ];
}

export const pushMiddlewareTest = () => ctrl.push(pushMiddlewareTestFlow);
