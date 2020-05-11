import { CommonPlotState, CommonPlotProps } from '../common';
import EventEmitter from 'eventemitter3';
import { Layout } from 'plotly.js';

export interface ILineChartProps extends CommonPlotProps {
  /**
   * Optional height of chart in pixels (default: 300)
   */
  heightPx?: number;
  xAxisTitle?: string;
  yAxisTitle?: string;
  /**
   * Set whether to use the panel wrapper
   */
  usePanelWrap?: boolean;
  /**
   * Panel wrapper title
   */
  panelWrapTitle?: string;

  /**
   * Optional title to use for exporting a chart- otherwise will fall back to panelWrapTitle
   */
  exportAsTitle?: string;
  emitter?: EventEmitter;
  /**
   * Optionally force the x axis labels to be shown as categories (useful to collaspe gaps in time series)
   */
  forceCategoryX: boolean;

  xLabelStrings: string[];
  /**
   * Optionally use dark theme (default: false)
   */
  useDarkTheme?: boolean;

  /**
   * Callback once successfully exported a single chart
   * Should typically emit EMITTER_EXPORTED_CHART ('exported-chart-success') on success,
   */
  onExported: (filename: string, content: any) => void;
  /**
   * Callback to show failure exporting single chart
   * Emit EMITTER_EXPORT_CHART_FAIL ('exported-chart-fail') on fail
   */
  onExportFail: (filename: string, content: any) => void;
}

/**
 * Extend common plot state with dark theme support + plot layout
 */
export interface ILineChartState extends CommonPlotState {
  chartLayout: Partial<Layout>;
  /**
   * Whether the dark theme is being used
   */
  useDarkTheme: boolean;
}

/**
 * Relevant colors for theming
 */
export interface ChartThemeColors {
  /**
   * Color applied to paper (outermost plotly chart container)
   */
  paper_bgcolor: string;
  /**
   * Color applied to plot
   */
  plot_bgcolor: string;
  /**
   * Color applied to axis lines + labels
   */
  axis_color: string;
}
