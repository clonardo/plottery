import { Config, Layout, Frame, PlotData, PlotlyHTMLElement } from 'plotly.js';
import { AppPlotData } from './common.contracts';

/**
 * Plotly HTML element with some callbacks and data
 */
export type EnhancedPlotElement = PlotlyHTMLElement & {
  on: (event: any, cb: Function) => void;
  removeListener: Function;
  data?: AppPlotData[];
  layout?: Partial<Layout>;
  _transitionData?: any;
};

export type PlotDataType =
  | 'bar'
  | 'histogram'
  | 'pointcloud'
  | 'scatter'
  | 'scattergl'
  | 'scatter3d'
  | 'surface';

export interface PlotFigure {
  data: AppPlotData[];
  layout: Partial<Layout>;
  frames: Frame[];
}

export interface IPlotWrapperProps {
  data: Array<Partial<AppPlotData>>;
  config: Partial<Config> & { responsive: boolean };
  layout: Partial<Layout>;
  frames?: Array<any>;
  // todo- move out?
  revision?: number;
  /**
   * Callback executed after plot is initialized.
   */
  onInitialized?: (
    figure: Partial<PlotFigure>,
    graphDiv?: PlotlyHTMLElement
  ) => void;
  /**
   * Callback executed when component unmounts, before Plotly.purge strips the
   * graphDiv of all private attributes.
   * Takes (figure, graphDiv)
   */
  onPurge?: (figure: Partial<PlotFigure>, graphDiv?: PlotlyHTMLElement) => void;
  /**
   * Callback executed when a plotly.js API method rejects
   */
  onError?: (err: any) => void;
  /**
   * Callback executed when when a plot is updated due to new data or layout, or when user interacts with a plot.
   */
  onUpdate?: (
    figure: Partial<PlotFigure>,
    graphDiv?: PlotlyHTMLElement
  ) => void;
  /**
   * Assign the graph div to window.gd for debugging
   */
  debug?: boolean;
  style?: Object;
  className?: string;
  /**
   * When true, adds a call to Plotly.Plot.resize() as a window.resize event handler
   */
  useResizeHandler: boolean;
  /**
   * id assigned to the <div> into which the plot is rendered.
   * If one is not provided, a GUID will be used instead
   */
  divId?: string;
}
