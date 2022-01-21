import { flowGenerator } from './flow-generator.js';

export function createController(...middleware) {
  const ctrl = {};
  const mdw = middleware.map(mdw => mdw(ctrl));

  ctrl.push = async function(flow, ...args) {
    for (const step of flowGenerator(flow, args, mdw)) {
      await step;
    }
  }

  return ctrl;
}
