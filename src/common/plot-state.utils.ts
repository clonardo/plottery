import { sha1 } from 'object-hash';
import { CommonPlotProps, CommonPlotState } from './common.contracts';
import { v4 } from 'uuid';

/**
 * Wrapper for UUID/v4
 */
export const GetGuid = (): string => {
  return v4();
};

/**
 * For comparing a new hash against an old one.
 * Return whether the hashes have changed, as well as the contents of the new hash
 */
export interface HashAndCompareResult {
  /**
   * New hash string
   */
  newHash: string;
  /**
   * Whether the new hash has changed from the previous one
   */
  hasChanged: boolean;
}

/**
 * Get a SHA1 hash of an item
 * @param input Input item to hash
 * @returns hash of item as string
 */
export const GetHash = <T>(input: T): string => {
  return sha1(input);
};

/**
 * Get a SHA1 hash of an item, and compare it to the previous value.
 * Returns whether the new hash has changed from previous + the contents of the new hash
 *
 * @typeparam T The type to hash
 * @param input Input item used to generate new hash + compare to previous
 * @param prevHash Previous hash string
 */
export const GetAndCompareHash = <T>(
  input: T,
  prevHash: string = ''
): HashAndCompareResult => {
  const newHash = GetHash(input);
  return {
    newHash,
    hasChanged: newHash != prevHash,
  };
};

/**
 * If the input data has changed (according to a hash), increment the plot revision and store new hash
 */
export const HandleDerivedStateUpdate = <
  TProps extends CommonPlotProps,
  TState extends CommonPlotState
>(
  propsIn: TProps,
  stateIn: TState
) => {
  if (propsIn && propsIn.dset && propsIn.dset.length > 0) {
    const hashed = GetAndCompareHash(propsIn.dset, stateIn.dataHash);
    if (hashed.hasChanged) {
      return {
        dataset: propsIn.dset,
        revision: stateIn.revision + 1,
        dataHash: hashed.newHash,
      };
    } else {
      return stateIn;
    }
  } else {
    return stateIn;
  }
};
