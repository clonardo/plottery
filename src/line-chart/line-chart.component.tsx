import * as React from 'react';

import { GetLineChartLayoutWithCustomLabels } from './line-chart.layout';
import Plotly, { Layout } from 'plotly.js';
import { PlotConfigDefaults, PlotWrapper } from '../common';
import { HandleDerivedStateUpdateForLineChart } from './line-chart-state.utils';
import { ILineChartProps, ILineChartState } from './line-chart.types';

const chartStyles = { width: '100%', height: '100%' };

/**
 * Line chart with enhanced state diffing
 */
export class LineChart extends React.PureComponent<
  ILineChartProps,
  ILineChartState
> {
  state = {
    revision: 0,
    dataset: [],
    dataHash: 'N/A',
    useDarkTheme: false,
    chartLayout: null,
  };

  static defaultProps = {
    heightPx: 300,
    xAxisTitle: '',
    yAxisTitle: '',
    panelWrapTitle: '',
    forceCategoryX: false,
    useDarkTheme: false,
  };

  chartLayout: Partial<Layout>;

  childRef: React.RefObject<PlotWrapper>;

  static getDerivedStateFromProps(
    newProps: ILineChartProps,
    prevState: ILineChartState
  ) {
    return HandleDerivedStateUpdateForLineChart(newProps, prevState);
  }

  constructor(p: ILineChartProps) {
    super(p);
    this.childRef = React.createRef();
    this.state.chartLayout = GetLineChartLayoutWithCustomLabels(
      p.xLabelStrings,
      p.useDarkTheme
    );
    this.state.useDarkTheme = p.useDarkTheme;
  }

  componentDidMount() {
    if (this.props.emitter) {
      // bind event listener
      this.props.emitter.on('export-all', this.exportChartAsImage);
    }
  }

  componentWillUnmount() {
    if (this.props.emitter) {
      // unbind event listener
      this.props.emitter.off('export-all', this.exportChartAsImage);
    }
  }

  /**
   * Force the plot to purge
   */
  forcePlotPurge = () => {
    if (this.childRef && this.childRef.current) {
      this.childRef.current.forcePurge();
    }
  };

  /**
   * Export a given chart as an image
   */
  exportChartAsImage = () => {
    const resolvedTitleFromProps =
      this.props.exportAsTitle && this.props.exportAsTitle != ''
        ? this.props.exportAsTitle
        : this.props.panelWrapTitle;
    console.log(`${resolvedTitleFromProps} export start`);
    const plotDisplayName = resolvedTitleFromProps
      ? resolvedTitleFromProps
      : 'Plot';
    if (this.childRef && this.childRef.current && this.childRef.current.el) {
      const fileName = `${plotDisplayName}`;

      Plotly.toImage(this.childRef.current.el, {
        width: 1024,
        height: 768,
        format: 'png',
      })
        .then(res => {
          // console.log("BASE SIX TEA FOUR: ", res);
          this.props.onExported(fileName, res);
        })
        .catch(e => {
          console.warn('Unable to export chart: ', e);
          this.props.onExportFail(fileName, e);
        });
    } else {
      console.warn(
        `Error exporting chart: chart not available`,
        `Unable to export ${plotDisplayName}`
      );
    }
  };

  render() {
    return (
      <div style={{ height: `${this.props.heightPx}px` }}>
        <PlotWrapper
          revision={this.state.revision}
          style={chartStyles}
          useResizeHandler={true}
          data={this.state.dataset}
          config={PlotConfigDefaults}
          layout={this.state.chartLayout}
          ref={this.childRef}
        />
      </div>
    );
  }
}
