import { createController } from "../../src/create-controller.js";
import { assertMiddleware } from "../../src/middleware/assert.middleware.js";

const ctrl = createController(assertMiddleware);

const functionTestFlow = () => {

  // A simple test to confirm that the function is called by verifying the step response:
  return [
    { id: 'FunctionCalled', fn: () => 42, assert: { equal: 42 }},
  ];
}

export const functionTest = () => ctrl.push(functionTestFlow);
