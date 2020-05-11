import { ChartThemeColors } from './line-chart.types';
import { brand, dark, light } from '../theming';

/**
 * Get theme colors for line chart layout
 */
export const getLayoutColors = (
  useDarkTheme: boolean = false
): ChartThemeColors => {
  if (useDarkTheme) {
    return {
      // paper_bgcolor: dark.core.lightBackground,
      paper_bgcolor: brand.D1,
      // plot_bgcolor: dark.core.lightBackground,
      plot_bgcolor: brand.D1,
      axis_color: dark.core.textColor,
    };
  } else {
    return {
      paper_bgcolor: light.primary[1],
      plot_bgcolor: light.primary[2],
      axis_color: light.core.textColor,
    };
  }
};

/**
 * Base layout for line chart
 */
export const GetLineChartLayoutBase = (
  forceCategoryX: boolean = false,
  tickLabels?: string[],
  useDarkTheme?: boolean
) => {
  const themeColors = getLayoutColors(useDarkTheme);
  return {
    autosize: true,
    margin: {
      // l: 90,
      r: 20,
      b: 40,
      t: 20,
    },
    paper_bgcolor: themeColors.paper_bgcolor,
    plot_bgcolor: themeColors.plot_bgcolor,
    showlegend: true,
    legend: {
      orientation: 'h',
      font: {
        color: themeColors.axis_color,
      },
    },
    xaxis: {
      showline: false,
      showgrid: true,
      title: '',
      automargin: true,
      titlefont: {
        size: 18,
        // sad gray
        color: '#7f7f7f',
        // color: "red"
      },
      color: themeColors.axis_color,
      tickcolor: themeColors.axis_color,
      linecolor: themeColors.axis_color,
      // gridcolor: themeColors.axis_color,
      zerolinecolor: themeColors.axis_color,
      linewidth: 1,
      nticks: forceCategoryX ? 12 : undefined,
      ticktext: tickLabels,
      type: 'category',
    },
    yaxis: {
      showline: true,
      showgrid: true,
      title: '',
      automargin: true,
      fixedrange: true,
      titlefont: {
        size: 18,
        color: '#7f7f7f',
      },
      color: themeColors.axis_color,
      tickcolor: themeColors.axis_color,
      linecolor: themeColors.axis_color,
      // gridcolor: themeColors.axis_color,
      zerolinecolor: themeColors.axis_color,
    },
  };
};

/**
 * Get the default line chart layout, but with custom X axis labels
 * @param labels labels to use for X axis
 * @param isDarkMode select whether dark mode should be used or not (default: false)
 */
export const GetLineChartLayoutWithCustomLabels = (
  labels: string[],
  isDarkMode: boolean = false
) => {
  return GetLineChartLayoutBase(true, labels, isDarkMode);
};
