import { uuid } from "../functions/uuid.js";

export const logMiddleware = (logFn) => (ctrl) => (next) => async ({ log, ...step }) => {

  logFn(step);

  const response = await next(step);

  logFn({ _stepId: step._stepId, response });

  return response;
}

export function laminarLogger(createController, logFn = (val) => console.log(val)) {

  return function(...middleware) {

    const ctrl = createController(logMiddleware(logFn), ...middleware);
    const push = ctrl.push;

    ctrl.push = async (flow, args) => {
      const _flowId = uuid();

      return await push((args) => {
        return flow(args).map((step) => step?.constructor === Object ? { ...step, _flowId, _stepId: uuid() } : step);
      }, args);
    }

    return ctrl;
  }
}