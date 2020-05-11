import React, { FC, useState, useEffect } from 'react';
import { ChartWithData } from './common.contracts';
import {
  EMITTER_EXPORT_START,
  EMITTER_EXPORT_ALL,
  EMITTER_EXPORTED_CHART,
  EMITTER_EXPORT_SUCCESS,
  EMITTER_EXPORT_FAILED,
} from './emitter.constants';
import { exportFiles } from './chart-export.utils';
import EventEmitter from 'eventemitter3';

/**
 * Most basic props for an element that can be used to trigger an export of all items
 */
export interface IChartExportButtonProps {
  /**
   * Number of chart datasets- will trigger export once all are populated, or at timeout (5 seconds)
   */
  chartCount: number;
  /**
   * File name to use in export (will append extension, so just provide a name)
   */
  exportTitle: string;

  /**
   * Event emitter instance used to trigger export
   */
  emitterInstance: EventEmitter;

  /**
   * Display text for button
   */
  buttonText?: string;
  /**
   * Optional css class names for button
   */
  buttonClassNames?: string;
}

/**
 * Trigger export of all charts
 */
export const ChartExportButton: FC<IChartExportButtonProps> = (
  props: IChartExportButtonProps
) => {
  const [output, setOutput] = useState<Array<ChartWithData>>([]);
  // track loading state
  const [loading, setLoading] = useState<boolean>(false);
  // track whether the export condition has already been satisfied
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  /**
   * Trigger save, + reset loading + status flags on complete
   */
  const finalizeExport = (exportFileName: string) => {
    if (!exportComplete) {
      setExportComplete(true);
      // console.log("finalizeExport: output length: ", output.length);
      exportFiles(output, exportFileName)
        .then(res => {
          // console.log(`Exported ${exportFileName} `);
          setLoading(false);
          setOutput([]);
          props.emitterInstance.emit(EMITTER_EXPORT_SUCCESS, exportFileName);
        })
        .catch(e => {
          console.warn('Error exporting: ', e);
          props.emitterInstance.emit(EMITTER_EXPORT_FAILED, exportFileName);
        });
    }
  };

  /**
   * Handle a single exported chart
   */
  const handleExportedChart = (item: ChartWithData) => {
    // console.log("ChartExportButton got ", item.fileName);
    setOutput(output => output.concat([item]));
  };

  useEffect(() => {
    if (!exportComplete && output && output.length == props.chartCount) {
      console.log('at target chartCount, finalizing');
      setExportComplete(true);
      finalizeExport(props.exportTitle);
    }

    // console.log(`Output len: ${output.length} / ${props.chartCount}`);
  }, [output, exportComplete]);

  useEffect(() => {
    props.emitterInstance.on(EMITTER_EXPORTED_CHART, handleExportedChart);

    return () => {
      props.emitterInstance.off(EMITTER_EXPORTED_CHART, handleExportedChart);
    };
  }, []);
  return (
    <button
      className={`${
        props.buttonClassNames && props.buttonClassNames != ''
          ? props.buttonClassNames
          : ''
      }`}
      // loading={loading}
      disabled={loading}
      onClick={e => {
        setLoading(true);
        // clear output
        setOutput([]);
        // start accumulator
        props.emitterInstance.emit(EMITTER_EXPORT_START);
        setTimeout(() => {
          // trigger export
          props.emitterInstance.emit(EMITTER_EXPORT_ALL);
        }, 500);
        // wait a few seconds to gather all of the things
        setTimeout(() => {
          // zip and save
          // setLoading(false);
          // just go ahead and finalize if not already done
          if (output && output.length && !exportComplete) {
            finalizeExport(props.exportTitle);
          } else {
            setLoading(false);
            props.emitterInstance.emit(EMITTER_EXPORT_FAILED);
          }
        }, 5000);
      }}
    >
      {`${
        props.buttonText && props.buttonText != ''
          ? props.buttonText
          : 'Export Charts'
      }`}
    </button>
  );
};
