import { GetAndCompareHash } from '../common';
import { ILineChartProps, ILineChartState } from './line-chart.types';
import { GetLineChartLayoutWithCustomLabels } from './line-chart.layout';

/**
 * If the input data has changed (according to a hash), increment the plot revision and store new hash
 */
export const HandleDerivedStateUpdateForLineChart = (
  propsIn: ILineChartProps,
  stateIn: ILineChartState
) => {
  if (propsIn && propsIn.dset && propsIn.dset.length > 0) {
    const hashed = GetAndCompareHash(
      // opt-in on props to actually watch
      { dset: propsIn.dset, theme: propsIn.useDarkTheme },
      stateIn.dataHash
    );
    if (hashed.hasChanged) {
      return {
        dataset: propsIn.dset,
        revision: stateIn.revision + 1,
        dataHash: hashed.newHash,
        useDarkTheme: propsIn.useDarkTheme,
        chartLayout: GetLineChartLayoutWithCustomLabels(
          propsIn.xLabelStrings,
          propsIn.useDarkTheme
        ),
      };
    } else {
      return stateIn;
    }
  } else {
    return stateIn;
  }
};
