import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { ChartWithData } from './common.contracts';


/**
 * Trigger an export of one or more charts as a zip file
 * 
 * @param contentItems Array of ChartWithData
 * @param fileName file name to use as zip (excluding extension)
 */
export const exportFiles = (
  contentItems: Array<ChartWithData>,
  fileName: string = 'images'
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const zip = new JSZip();
    // strip file header out- necessary with the way that plotly does exports
    const header = `data:image/png;base64,`;
    contentItems.forEach((item, idx) => {
      zip.file(
        `${item.fileName}.png`,
        (item.content as string).replace(header, ''),
        {
          base64: true,
          binary: false,
        }
      );
    });
    zip
      .generateAsync({ type: 'blob' })
      .then(content => {
        try {
          FileSaver.saveAs(content, `${fileName}.zip`);
          resolve(`Saved as ${fileName}.zip`);
        } catch (ex) {
          reject(`Error saving ${fileName}.zip: ${ex}`);
        }
      })
      .catch(e => {
        console.warn('unable to save: ', e);
        reject(`Error saving ${fileName}.zip: ${e}`);
      });
  });
};
