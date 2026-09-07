(() => {
  'use strict';
  const defaults = {enabled: true, rate: 2};
  const rates = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10];
  function normalize(value) {
    return {
      enabled: typeof value?.enabled === 'boolean' ? value.enabled : defaults.enabled,
      rate: rates.includes(value?.rate) ? value.rate : defaults.rate
    };
  }
  globalThis.VideoSpeedSettings = {defaults, normalize, rates};
})();
