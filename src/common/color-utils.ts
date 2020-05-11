import tinycolor from 'tinycolor2';

/**
 * Generate a tetrad or analogous (depending on how many series are needed) color scale of some length
 * @param count number of colors to generate
 * @param seed Seed hex value (default: #065278, which is a nice medium blue)
 */
export const GenerateColors = (
  count: number,
  seed: string = '#065278'
): string[] => {
  const init = tinycolor(seed)
    .tetrad()
    .map(c => {
      return c.toHexString();
    });
  if (count < 4) {
    return init;
  } else if (count < 8) {
    const seed2 = tinycolor(seed)
      .splitcomplement()[0]
      .toHexString();
    const part2 = tinycolor(seed2)
      .tetrad()
      .map(c => {
        return c.toHexString();
      });
    return [...init, ...part2];
  } else {
    return tinycolor(seed)
      .analogous(count + 1)
      .map(c => {
        return c.toHexString();
      });
  }
};
