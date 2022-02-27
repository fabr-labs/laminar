import { uuid } from "../functions/uuid.js";

const logMiddleware = ({ logger = (data) => console.log(data), length }) => (middleware, i) => (ctrl) => (next) => async (step) => {

  const startAt = performance.now();

  const response = await middleware(ctrl)(next)(step);

  const endAt = performance.now();

  logger({
    middleware: middleware.name,
    first: i === 0,
    last: i === length - 1,
    i,
    startAt,
    endAt,
    step,
    response,
  });

  return response;
}

export function flowLogger(createController, logFn = (val) => console.log(val)) {

  return function(...middleware) {

    const ctrl = createController(...middleware.map(logMiddleware({ length: middleware.length, logger: undefined })));
    const push = ctrl.push;

    ctrl.push = async (flow, args) => {
      const _flowId = uuid();

      return await push((args) => {
        return flow(args).map((step, i) => step?.constructor === Object ? { ...step, _flowId, _stepId: uuid() } : step);
      }, args);
    }

    return ctrl;
  }
}
