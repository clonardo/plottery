/**
 * Runs before exporting all charts
 */
export const EMITTER_EXPORT_START = 'export-start';

/**
 * Begin exporting all charts
 */
export const EMITTER_EXPORT_ALL = 'export-all';

/**
 * Exported single chart- includes data.
 * Should be called by the underlying chart component on success
 */
export const EMITTER_EXPORTED_CHART = 'exported-chart-success';

/**
 * Failed to export single chart
 * Should be called by the underlying chart component on failure
 */
export const EMITTER_EXPORT_CHART_FAIL = 'exported-chart-fail';

/**
 * Indicate that the export has completed
 */
export const EMITTER_EXPORT_SUCCESS = 'export-success';
/**
 * Indicate that the export has failed
 */
export const EMITTER_EXPORT_FAILED = 'export-failed';