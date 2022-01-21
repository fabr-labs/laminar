export const logMiddleware = (logAll) => (ctrl) => (next) => ({ log, ...step }) => {

  if (log || logAll) console.log(step);

  return next(step);
}
