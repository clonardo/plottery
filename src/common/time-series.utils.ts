import moment from 'moment';
import { ITimeSeries, AppPlotData, ITimeSeriesPoint } from './common.contracts';
import { GenerateColors } from './color-utils';
import { orderBy } from 'lodash';

/**
 * Basic YYYY-MM-DD format for dates
 */
export const API_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Convert JS dates to the YYYY-MM-DD format
 *
 * @param d Date to be converted
 */
export const GetStandardizedDateKeyForApi = (d: Date): string => {
  return moment(d).format(API_DATE_FORMAT);
};

/**
 * Figure out whether a series should be shown or hidden by default based on its display name
 * See https://plot.ly/javascript/reference/#scatter-visible handle visibility=legendonly for details
 * Returns true/visible by default
 *
 * @param ser Series to evaluate
 * @param evalShowHideState OPTIONAL function to evaluate the series name
 */
export const resolveSeriesShowHideState = (
  ser: ITimeSeries,
  evalShowHideState?: (nameIn: string) => string | boolean
): string | boolean => {
  const cleanedTitle = ser.displayTitle
    ? ser.displayTitle.trim().toUpperCase()
    : '';
  if (evalShowHideState != undefined) {
    return evalShowHideState(cleanedTitle);
  } else {
    return true;
  }
};

/**
 * Sample for how to map time series data from API to AppPlotData[], for line chart and such
 * NOTE: assumes that everything is a time series, for now
 * 
 * @param seriesIn ITimeSeries[] from API
 * @param inputDateTimeFormat OPTIONALLY override fomrat to use when parsing input date for sort. Default: YYYY-MM-DD
 * @param evalShowHideState OPTIONAL function to evaluate whether a series should be shown/hidden based on the series name

 */
export const MapSeries = (
  seriesIn: ITimeSeries[],
  inputDateTimeFormat: string = 'YYYY-MM-DD',
  evalShowHideState?: (nameIn: string) => string | boolean
): AppPlotData[] => {
  const colors = GenerateColors(seriesIn.length);
  // this \/ had previously been used for producing breaks in multi-day series of intraday data
  // const isMultiDay = isAnySeriesMultiDay(seriesIn);

  // d3 format strings
  // const tickformatStr = isMultiDay ? '%d-%b %H:%M %p' : '%H:%M %p';

  // check whether a chart is the "intraday index vs. stock 2 day", to determine how to handle gaps and such
  // const is2Day = chartTitle == `Intraday Index vs. Stock 2 Day`;

  // return seriesIn
  const output = seriesIn
    .map((ser, serIdx) => {
      if (ser && ser.points && ser.points.length > 0) {
        const cleanPoints = ser.points;

        /*
        // extract immutable data if needed
        const cleanPoints = isImmutable(ser.points[0])
          ? ser.points.map((x: any) => {
              return (x as ImmutableRecord<ITimeSeriesPoint>).toJS();
            })
          : ser.points;
        */

        const hasDates = true;
        const seriesVisibility: any = resolveSeriesShowHideState(
          ser,
          evalShowHideState
        );
        let sortedPoints = [];
        if (hasDates) {
          // console.log(`${chartTitle} - ${ser.displayTitle} is a date series`)
          sortedPoints = orderBy(
            cleanPoints,
            p => {
              // return parseInt(p.xAxisDisplayValue);
              return moment(p.xAxisDisplayValue, inputDateTimeFormat).toDate();
            },
            'asc'
          );
        } else {
          // console.warn(`${chartTitle} - ${ser.displayTitle} is not a date series`)
          sortedPoints = cleanPoints;
        }
        const points = sortedPoints.reduce(
          (acc, iter: ITimeSeriesPoint) => {
            // below code (commented out) would allow renaming of various stuff
            /*
            const newX = [
              ...acc.x,
              ...[reformatTimeSeries(iter.xAxisDisplayValue, isMultiDay)],
            ];
            const newY = [...acc.y, ...[iter.displayValue]];
            const newText = [
              ...acc.x,
              ...[reformatTimeSeries(iter.xAxisDisplayValue, isMultiDay)],
            ];
            */
            const colorHexStr = colors[serIdx];
            return Object.assign(acc, {
              /*
              x: newX,
              y: newY,
              text: newText,
              */
              x: [...acc.x, ...[iter.asOfDateTime]],
              y: [...acc.y, ...[iter.displayValue]],
              text: [...acc.x, ...[iter.xAxisDisplayValue]],
              marker: {
                color: colorHexStr,
              },
              line: {
                color: colorHexStr,
              },
              connectgaps: true,
            });
          },
          {
            x: [],
            y: [],
            text: [],
            type: 'scatter',
            mode: 'lines+points',
            name: ser.displayTitle,
            visible: seriesVisibility,
            connectgaps: true,
          }
        );

        return points;
      } else return null;
    })
    .filter(x => {
      return x != null;
    });
  return output;
};
