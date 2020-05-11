import { PlotData } from 'plotly.js';

/**
 * Modified plotly chart data- mostly not for direct use, refer to AppPlotData instead
 */
export type interimData = Omit<Omit<PlotData, 'type'>, 'mode'>;

/**
 * Plotly plot data
 */
export type AppPlotData = Partial<interimData> & {
  type: string;
  mode?: string;
  jitter?: number;
  pointpos?: number;
  /**
   * Whether she series should be visible, hidden, or "legendonly" by default
   * Details here: https://plot.ly/javascript/reference/#scatter-visible
   */
  visible?: string | boolean;
  boxpoints?: string | boolean;
  boxmean?: string | boolean;
};

/**
 * Individual, generic time series point
 */
export interface ITimeSeriesPoint {
  asOfDateTime: string;
  xAxisDisplayValue: string;
  displayValue: number;
}

/**
 * Generic time series display title with points
 */
export interface ITimeSeries {
  displayTitle: string;
  points: ITimeSeriesPoint[];
}

/**
 * Container for a single chart
 */
export interface ITimeSeriesContainer {
  chartTitle: string;
  series: ITimeSeries[];
  xAxisLabel: string;
  yAxisLabel: string;
}

/**
 * Chart and series titles
 */
export interface IChartTitles {
  chartTitle: string;
  xAxisLabel: string;
  yAxisLabel: string;
}

/**
 * App plot data with chart + series titles
 */
export interface IPlotDataWithTitles {
  /**
   * Data points for chart
   */
  dset: AppPlotData[];
  /**
   * Display titles for a given chart
   */
  titles: IChartTitles;
}

/**
 * Shared/common plot properties
 */
export interface CommonPlotState {
  /**
   * Input data for plot, post-hash
   */
  dataset: AppPlotData[];
  /**
   * Revision # for plot
   */
  revision: number;

  /**
   * Hash string of dataset
   */
  dataHash: string;
}

/**
 * Shared/common plot properties
 */
export interface CommonPlotProps {
  /**
   * Input data for plot
   */
  dset: AppPlotData[];
}

/**
 * Store chart output before export
 */
export type ChartWithData = {
  /**
   * File name, excluding extension
   */
  fileName: string;
  /**
   * Should be a base64-encoded string
   */
  content: any;
};
