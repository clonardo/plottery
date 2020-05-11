import { Config } from 'plotly.js';

/**
 * Default config for Plotly plots
 */
export const PlotConfigDefaults: Partial<Config> & { responsive: boolean } = {
  showTips: false,
  showLink: false,
  responsive: true,
  displayModeBar: false,
  displaylogo: false,
  locale: 'en-us',
  sendData: false,
};
