const testSummary = {
  failed: [],
  passed: 0,
};

const logResult = (passed, id, values) => {
  if (passed) {
    testSummary.passed += 1;
    console.log('%c ✓ Passed: %o', 'color: #B0D8A4', id);
  } else {
    testSummary.failed.push({ id, values });
    console.log('%c ✗ Failed: %o', 'color: #E84258', id);
  }
}

export const assertMiddleware = (ctrl) => (next) => async ({ assert, ...step }) => {

  if (assert) {

    if (assert.init) {
      return next({ fn: () => {
        console.log('%c Running assertions:', 'color: #FEE191; font-weight: bold; font-size: 14px; margin-top: 10px; margin-bottom: 10px;');
        testSummary.failed = [];
        testSummary.passed = 0;
      }});
    }
    
    if (assert.log) {
      return next({ fn: () => {
        console.log('%c Summary:', 'color: #FEE191; font-weight: bold; font-size: 14px; margin-top: font-size: 14px; margin-top: 10px; margin-bottom: 10px;');
        console.log('%c Assertions Passed: %o', 'color: #B0D8A4; font-weight: bold; font-size: 14px; margin: 10px;', testSummary.passed);
        console.log('%c Assertions Failed: %o', 'color: #E84258; font-weight: bold; font-size: 14px; margin: 10px;', testSummary.failed.length);
        testSummary.failed.forEach(({ id, values }) => {
          console.groupCollapsed('%c ✗ Failed: %o %o', 'color: #E84258', id, values);
            console.trace();
          console.groupEnd();
        });
      }});
    }
  }

  const response = await next(step);

  if (assert) {

    if ('equal' in assert) {
      const equal = typeof assert.equal === 'function' ? assert.equal() : assert.equal;
      logResult(response === equal, step.id, { response, equal });
    }

    if ('deepEqual' in assert) {
      const deepEqual = typeof assert.deepEqual === 'function' ? assert.deepEqual() : assert.deepEqual
      logResult(JSON.stringify(response) === JSON.stringify(deepEqual), step.id, { response, deepEqual });
    }

    if ('gt' in assert) {
      const gt = typeof assert.gt === 'function' ? assert.gt() : assert.gt;
      logResult(response > gt, step.id, { response, gt });
    }

    if ('lt' in assert) {
      const lt = typeof assert.lt === 'function' ? assert.lt() : assert.gt;
      logResult(response < lt, step.id, { response, lt });
    }
  }

  return response;
}
