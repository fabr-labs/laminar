export const mapMiddleware = (map = new Map()) => (ctrl) => (next) => async ({ mapSet, mapGet, mapClear, ...step }) => {

  if (mapGet) return next({ ...step, fn: () => map.get(mapGet) });

  if (mapClear) return next({ ...step, fn: () => map.clear() });
  
  const response = await next(step);
  
  if (mapSet) map.set(mapSet, response);

  return response;
}
