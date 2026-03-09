/*
   ToMoon Quant - component catalog adapter

   `component-lib.js` is the single source of truth.
   This file only exposes a mutable catalog snapshot for legacy pages.
*/
(function (globalScope) {
  'use strict';

  const source = globalScope.ComponentLib;
  const rawCatalog = source && typeof source.getCatalog === 'function'
    ? source.getCatalog({ includeAliases: false, includeHidden: false })
    : [];

  const CENTRAL_COMPONENTS = rawCatalog.map((spec) => ({
    ...spec,
    inputs: (spec.inputs || []).map((port) => ({ ...port })),
    outputs: (spec.outputs || []).map((port) => ({ ...port })),
    params: { ...(spec.params || {}) },
    params_spec: Object.fromEntries(
      Object.entries(spec.params_spec || {}).map(([key, value]) => [key, { ...value }])
    ),
    tags: Array.isArray(spec.tags) ? spec.tags.slice() : [],
    market_tags: Array.isArray(spec.market_tags) ? spec.market_tags.slice() : [],
  }));

  globalScope.CENTRAL_COMPONENTS = CENTRAL_COMPONENTS;
})(typeof window !== 'undefined' ? window : self);
