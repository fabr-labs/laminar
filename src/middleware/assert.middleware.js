const testSummary = {
  failed: [],
  passed: 0,
};

export const assertMiddleware = (ctrl) => (next) => async ({ assert, ...step }) => {

  if (assert) {
    if (assert.reset) {
      return next({ fn: () => {
        testSummary.failed = [];
        testSummary.passed = 0;
      }});
    }
    
    if (assert.log) {
      return next({ fn: () => {
        console.log('%c Test Summary:', 'color: #1fe3ed; font-weight: bold; font-size: 14px; margin-top: 10px; margin-bottom: 10px;');
        console.log('%c Assertions Passed: %o', 'color: #34d947; font-weight: bold; font-size: 14px', testSummary.passed);
        console.log('%c Assertions Failed: %o', 'color: #ff442b; font-weight: bold; font-size: 14px ; margin-bottom: 10px;', testSummary.failed.length);
        testSummary.failed.forEach((id) => console.log('%c ✗ %s', 'color: #ff442b; font-weight: bold; margin-top: 4px;', id));
      }});
    }
  }

  const response = await next(step);

  if (assert) {

    if ('equal' in assert) {
      const equal = typeof assert.equal === 'function' ? assert.equal() : assert.equal;

      if (response === equal) {
        testSummary.passed += 1;
        console.log('%c ✓ Assertion Passed: %s: %o', 'color: #34d947', step.id, { response, equal });
      } else {
        testSummary.failed.push(step.id);
        console.assert(response === equal, "for %s: %o does not equal %o", step.id, response, equal);
      }
    }

    if ('gt' in assert) {
      const gt = typeof assert.gt === 'function' ? assert.gt() : assert.gt;

      if (response > gt) {
        testSummary.passed += 1;
        console.log('%c ✓ Assertion Passed: %s: %o', 'color: #34d947', step.id, { gt, response });
      } else {
        testSummary.failed.push(step.id);
        console.assert(response > gt, "for %s: %o is not greater than %o", step.id, response, gt);
      }

    }

    if ('lt' in assert) {
      const lt = typeof assert.lt === 'function' ? assert.lt() : assert.gt;

      if (response < lt) {
        testSummary.passed += 1;
        console.log('%c ✓ Assertion Passed: %s: %o', 'color: #34d947', step.id, { response, lt });
      } else {
        testSummary.failed.push(step.id);
        console.assert(response < lt, "for %s: %o is not less than %o", step.id, response, lt);
      }
    }
  }

  return response;
}
