import React from 'react';
import EventEmitter from 'eventemitter3';
import {
  Thing,
  Props,
  LineChart as LineChartCmp,
  EMITTER_EXPORTED_CHART,
  IPlotDataWithTitles,
  IChartTitles,
  ITimeSeries,
  ITimeSeriesPoint,
  MapSeries,
  EMITTER_EXPORT_CHART_FAIL,
  ChartExportButton,
} from '../src';

// Data from https://github.com/nytimes/covid-19-data/blob/master/us-states.csv
const ronaDataIn: Corowna[] = require('./rona.json');

/**
 * 1 row of coronavirus data
 */
type Corowna = {
  /**
   * YYYY-MM-DD
   */
  date: string;
  state: string;
  fips: number;
  cases: number;
  deaths: number;
};

/**
 * Make a single time series points showing deaths by day
 */
const makeTimeSeriesPointFromRona = (rowna: Corowna): ITimeSeriesPoint => {
  return {
    asOfDateTime: rowna.date,
    // Note: this doesn't actually have to be different than the asOfDateTime- it's just for formatting
    xAxisDisplayValue: rowna.date,
    displayValue: rowna.deaths,
  };
};

// get stuff we actually care about (here, as an array of generic daily time series objects)
const getCorpsePile = (targets: string[]): ITimeSeries[] => {
  return targets.reduce((acc: ITimeSeries[], iter) => {
    return [
      ...acc,
      ...[
        {
          displayTitle: iter,
          points: ronaDataIn
            .filter(x => {
              return x.state == iter;
            })
            .map(makeTimeSeriesPointFromRona),
        },
      ],
    ];
  }, []);
};

/**
 * Build a single line chart with one or more series.
 * Each series is made of generic time series points, which are, in this case, enriched using
 * the MapSeries function
 *
 * @param targetStates states to include in chart- one state per series
 */
const makeLineChartDataSet = (
  targetStates: string[],
  chartDisplayTitle: string
): IPlotDataWithTitles => {
  const chartTitles: IChartTitles = {
    chartTitle: chartDisplayTitle,
    xAxisLabel: 'Date',
    yAxisLabel: 'Cumulative Deaths',
  };
  return {
    titles: chartTitles,
    // MapSeries is just one way to go from an array of generic ITimeSeries -> something we can use in the charts
    dset: MapSeries(getCorpsePile(targetStates)),
  };
};

/**
 * Render a single line chart in a box, with title
 */
const LineChartWithWrapper: React.FC<IPlotDataWithTitles & {
  emitterInstance: EventEmitter;
}> = ({ titles, dset, emitterInstance }) => {
  return (
    <div style={{ border: '1px solid #000066', padding: '20px' }}>
      <div>
        <h4>{titles.chartTitle}</h4>
      </div>
      <LineChartCmp
        onExported={(fileName: string, content: any) => {
          console.log(`Handle Exported Chart: ${fileName}`);
          // emit ChartWithData payload
          emitterInstance.emit(EMITTER_EXPORTED_CHART, {
            fileName: fileName,
            content: content,
          });
        }}
        onExportFail={(fileName: string, content: any) => {
          console.warn(`Failed to export Chart: ${fileName}`);
          // failed to emit ChartWithData payload
          emitterInstance.emit(EMITTER_EXPORT_CHART_FAIL, {
            fileName: fileName,
            content: content,
          });
        }}
        useDarkTheme={false}
        xLabelStrings={dset[0].x as string[]}
        dset={dset}
        panelWrapTitle={titles.chartTitle}
        xAxisTitle={titles.xAxisLabel}
        yAxisTitle={titles.yAxisLabel}
        exportAsTitle={`Exported-${titles.chartTitle}`}
        emitter={emitterInstance}
        forceCategoryX={true}
      />
    </div>
  );
};

/**
 * Event emitter instance- handy for communicating between multiple chart instances
 */
const SHARED_EMITTER = new EventEmitter();

type RONA_GROUP = {
  states: string[];
  displayTitle: string;
};
const NON_FLYOVER_STATES: RONA_GROUP = {
  displayTitle: 'Non-Flyover States',
  states: ['New York', 'California'],
};
const RED_STATES: RONA_GROUP = {
  displayTitle: 'Red States',
  states: ['Georgia', 'Alabama'],
};

// just group the states that we're grouping so we can iterate over them
const _DATA_GROUPS: RONA_GROUP[] = [NON_FLYOVER_STATES, RED_STATES];

// Array of final constructed datasets
const RONA_DATASETS: IPlotDataWithTitles[] = _DATA_GROUPS.map(x => {
  return makeLineChartDataSet(x.states, x.displayTitle);
});

// By passing optional props to this story, you can control the props of the component when
// you consume the story in a test.
export const LineChartDemo = () => {
  return (
    <div>
      <div>
        {RONA_DATASETS.map((x, idx) => {
          return (
            <div key={`${x.titles.chartTitle}-${idx}`}>
              <LineChartWithWrapper
                dset={x.dset}
                titles={x.titles}
                emitterInstance={SHARED_EMITTER}
              />
            </div>
          );
        })}
      </div>
      <div>
        <ChartExportButton
          buttonText={'Export All'}
          chartCount={RONA_DATASETS.length}
          emitterInstance={SHARED_EMITTER}
          exportTitle={'CoronaDeaths'}
        />
      </div>
    </div>
  );
};

export default {
  title: 'Line Chart (with export)',
};
