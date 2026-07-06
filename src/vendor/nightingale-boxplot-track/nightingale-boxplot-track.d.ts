import { ComplexAttributeConverter } from "lit";
/**
 * Attribute converter for attributes of type `number|undefined`.
 * Attribute value empty string or `null` is interpreted as `undefined`; non-empty string is parsed as number.
 * Example:
 *
 * ```ts
 * class NightingaleExampleTrack {
 *   ;@property({ converter: OptionalNumberAttributeConverter })
 *   "y-min"?: number;
 * }
 * ```
 * */
export declare const OptionalNumberAttributeConverter: ComplexAttributeConverter<number | undefined>;
/**
 * Create an attribute converter for attribute that allows a fixed set of string values.
 * Passing an invalid value to the attribute will result in a warning and using the default value instead.
 * Example:
 *
 * ```ts
 * const Weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
 * type Weekday = typeof Weekdays[number];
 *
 * class NightingaleExampleTrack {
 *   ;@property({ converter: EnumAttributeConverter(Weekdays, "Mon") })
 *   day: Weekday;
 * }
 * ```
 * */
export declare function EnumAttributeConverter<T extends string, D extends T>(allowedValues: readonly T[], defaultValue: D): ComplexAttributeConverter<T>;
import NightingaleElement from "@nightingale-elements/nightingale-new-core";
import { Selection } from "d3";
import { PropertyValues } from "lit";
/** Data for a single boxplot (subcolumn) in the visualization (i.e. a single sequence position for a single dataset) */
interface BoxplotDatum {
    /** Position in the sequence (1-based) */
    position: number;
    /** Array of values of the independent variable at the position */
    values: ArrayLike<number>;
}
/** Data for a single dataset in the visualization (i.e. all sequence positions for a single dataset) */
export interface BoxplotDataset {
    /** Name of the dataset */
    name: string;
    /** Color of the dataset visualization */
    color?: string;
    /** Array of boxplot data for individual positions in the sequence */
    positions: BoxplotDatum[];
}
/** Data for `NightingaleBoxplotTrack`.
 * A list of one or more datasets, where each dataset contains boxplot data for individual positions in the sequence.
 * In case of multiple datasets, the boxplots for each dataset will be shown side-by-side at each sequence position. */
export type BoxplotData = BoxplotDataset[];
/** Options for what kind of data can be shown as the shaded outline in zoomed-out visualization */
export declare const ZoomedOutOutlineOptions: readonly ["extremes", "whiskers", "box", "none"];
/** Options for what kind of data can be shown as the shaded outline in zoomed-out visualization */
export type ZoomedOutOutlineOption = typeof ZoomedOutOutlineOptions[number];
declare const NightingaleBoxplotTrack_base: import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withCanvas").WithCanvasInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withZoom").WithZoomInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withResizable").WithResizableInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withMargin").withMarginInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withPosition").withPositionInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withDimensions").WithDimensionsInterface> & import("@nightingale-elements/nightingale-new-core/dist/nightingale-base-element").Constructor<import("@nightingale-elements/nightingale-new-core/dist/mixins/withHighlight").WithHighlightInterface> & typeof NightingaleElement;
/** A Nightingale track for showing distribution of a variable on each residue position via boxplots */
export default class NightingaleBoxplotTrack extends NightingaleBoxplotTrack_base {
    #private;
    /** Bottom limit for Y-axis (default: minimum computed from data). */
    "y-min"?: number;
    /** Top limit for Y-axis (default: maximum computed from data). */
    "y-max"?: number;
    /** Turn on vertical axis. */
    "show-axis"?: boolean;
    /** Turn on showing nested highlights, which indicate selected subcolumn within a column (in case of multiple datasets). */
    "show-nested-highlights"?: boolean;
    /** Position of nested highlight in form "position/iDataset", or "" if none. */
    private "nested-highlight";
    /** What kind of data should be shown as the shaded outline in zoomed-out visualization. */
    "zoomed-out-outline": ZoomedOutOutlineOption;
    /** Width of the gap between displayed columns, relative to the base width (width of one sequence position) (allowed range: 0-1, default: 0.2). */
    "column-gap": number;
    /** Width of the gap between boxes within a column, relative to the column width (allowed range: 0-1, default: 0.1). */
    "box-gap": number;
    /** Boxplot whisker width, relative to the box width (allowed range: 0-1, default: 0.6). */
    "whisker-width": number;
    /** Width of random noise (jitter) to be added to the X-position of the outliers, relative to the box width (allowed range: 0-1, default: 0.4). */
    "outlier-jitter-width": number;
    /** Radius for the circles representing outliers, in CSS pixels (default: 2). Set to 0 to supress outlier rendering. */
    "outlier-radius": number;
    /** Base width(s), in CSS pixels, where the transition from zoomed-out simplified visualization to zoomed-in boxplot visualization happens.
     * Can be either one number (for sharp transition) or a hyphen-separated range.
     * If there are multiple datasets, this width(s) will be multiplied by the number of datasets, to compensate for narrower space for each dataset.
     * Use "0" to always show zoomed-in visualization (or preferrably "0.5-1" to avoid perfomance issues).
     * Use "Infinity" to always show zoomed-out visualization.
     * (default: "4-5") */
    "zoom-transition-range": string;
    private preprocessedData?;
    /** D3 selection for SVG group for highlights (excluding nested highlights) */
    protected svgHighlights?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    /** D3 selection for SVG group for nested highlights */
    protected svgNestedHighlights?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    /** D3 selection for SVG group for margins */
    protected svgMargins?: Selection<SVGGElement, unknown, HTMLElement | SVGElement | null, unknown>;
    connectedCallback(): void;
    /** Get or set the data for the boxplot track */
    get data(): BoxplotData | undefined;
    set data(data: BoxplotData | undefined);
    /** Return the range of Y values corresponding to bottom and top of the viewport (excluding margins) */
    getYLimits(): [yMin: number, yMax: number];
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    protected createTrack(): void;
    protected refresh(): void;
    /** Stamp for tracking changes to the drawing parameters (when the stamp changes, canvas redraw is needed) */
    private readonly _drawStamp;
    /** Request canvas redraw. */
    private requestDraw;
    private readonly _drawer;
    /** Do not call directly! Call `requestDraw` instead to avoid browser freezing. */
    private _draw;
    /** Get a clean auxiliary offscreen canvas for drawing, of the same size as the main canvas.
     * Only one offscreen canvas can be use at any time, because it is reused. */
    private getOffscreenCanvas;
    private _offscreenCanvas?;
    /** Clear the canvas. */
    private clearCanvas;
    /** Draw the data on the canvas. */
    private drawData;
    /** Draw full boxplot visualization ("foreground" / zoomed-in) */
    private drawBoxplotVisualization;
    /** Draw simplified visualization ("background" / zoomed-out) */
    private drawSimplifiedVisualization;
    /** Get a set of shared measurement variables for drawing the boxplot visualizations. */
    private getDrawingMeasurements;
    /** Compute opacity for the "foreground" (zoomed-in) and "background" (zoomed-out) visualization */
    private getFgBgOpacity;
    private getZoomTransitionRange;
    /** Update the SVG highlights (excluding nested highlights) */
    protected updateHighlight(): void;
    /** Update the SVG nested highlights (indicate the pointed subcolumn within the highlighted column) */
    protected updateNestedHighlight(): void;
    /** Update the SVG margins */
    protected updateMargins(): void;
    zoomRefreshed(): void;
    firstUpdated(_changedProperties: PropertyValues): void;
    render(): import("lit-html").TemplateResult<1>;
    onCanvasScaleChange(): void;
    private bindEvents;
    private unbindEvents;
    private handleClick;
    private handleMousemove;
    private handleMouseout;
    /** Get the datum pointed by the mouse cursor at the given SVG coordinates */
    private getPointedDatum;
}
/** Get p-quantile of the dataset. Input values must be sorted for this to work. */
export declare function getQuantile(sortedValues: ArrayLike<number>, p: number): number;
export {};
//# sourceMappingURL=nightingale-boxplot-track.d.ts.map