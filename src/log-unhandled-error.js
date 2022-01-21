export function logUnhandledError({ id, fn, args, directives, error, resolved = false }) {
  if (resolved) return;

  console.log(`%c Laminar - Unhandled step error: ${error.name}: ${error.message}`, `color: #ed1a3d`);

  console.log('%c Error Step ID %o', `color: #ed1a3d`, id);
  console.log('%c Error Function %o', `color: #ed1a3d`, fn);
  console.log('%c Error Args %o', `color: #ed1a3d`, args);
  console.log('%c Error Directives %o', `color: #ed1a3d`, directives);
  console.error(error);
}
