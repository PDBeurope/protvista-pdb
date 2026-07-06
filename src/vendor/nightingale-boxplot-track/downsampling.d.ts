declare const PoolingFunctions: {
    /** Like `Math.max` but handles `NaN` (`max(1, 2) -> 2`, `max(1, NaN) -> 1`, `max(NaN, 2) -> 2`, `max(NaN, NaN) -> NaN`) */
    max(a: number, b: number): number;
    /** Like `Math.min` but handles `NaN` (`min(1, 2) -> 1`, `min(1, NaN) -> 1`, `min(NaN, 2) -> 2`, `min(NaN, NaN) -> NaN`) */
    min(a: number, b: number): number;
};
type PoolingMethod = keyof typeof PoolingFunctions;
/** Helper object for downsampling 1D number arrays, with caching */
export declare class Downsampler {
    readonly poolingMethod: PoolingMethod;
    /** Downsampled versions of the original data (index 1 holds the original data; indices 2, 4, 8 etc. hold increasingly downsampled data) */
    private readonly downsampled;
    /** Function used to compute downsampled value from multiple source values */
    private readonly poolingFunction;
    /** Create a new downsampler for a 1D number array */
    constructor(data: Float32Array, poolingMethod: PoolingMethod);
    /** Return the original full-size data */
    getOriginal(): Float32Array;
    /** Get data downsampled so that `downsampledColumnWidth ~ originalColumnWidth * originalData.length / downsampledData.length ~ 1`.
     * Return original data if `originalColumnWidth > 1`. */
    getDownsampledForColumnWidth(originalColumnWidth: number): Float32Array;
    /** Get data downsampled by `scale`, with caching. `scale` must be a power of 2, greater or equal to 1 (i.e. 1, 2, 4, 8, 16...).
     * Length of the resulting data will be `Math.ceil(originalData.length / scale)` */
    getDownsampledByScale(scale: number): Float32Array;
    /** Return `scale`, a power of 2, such that
     * `0.5 < originalColumnWidth*scale <= 1`  (or  `scale === 1` if `originalColumnWidth > 1`) */
    static targetDownsamplingScale(originalColumnWidth: number): number;
    /** Return one or two scales, each being a power of 2, such that:
     * - in case of two scales: `1 < originalColumnWidth*scale1 < 2` and `0.5 < originalColumnWidth*scale2 < 1`, `scale1 = 2 * scale2`
     * - in case of one scale: `originalColumnWidth*scale === 1` (or `scale === 1` if `originalColumnWidth > 1`)
     *
     * Weights of the scales sum up to 1 (the closer `originalColumnWidth*scale` is to 1, the higher its weight).
     */
    static targetDownsamplingScalesForTransition(originalColumnWidth: number): {
        scale: number;
        weight: number;
    }[];
}
export {};
//# sourceMappingURL=downsampling.d.ts.map