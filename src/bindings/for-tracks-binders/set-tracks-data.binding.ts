import { type Feature as NightingaleFeature } from '@nightingale-elements/nightingale-track';
import { NewProtvistaFixedHighlights } from '../../new-protvista-fixed-highlights';
import { ProtvistaHelpTooltipsBinding } from '../after-render-binders/help-tooltip-icons.binding';
import { generateSubTrackCanvasString } from '../../rendering/templates-rendering/subtrack-in-scrollbox-html';
import { getLoadingDataHTML } from '../../rendering/templates-rendering/loading-data-track-html';
import { scaleLinear } from 'd3';
import { NewProtvistaTooltip } from '../../new-protvista-tooltip';
import { ColourIn3DButtonBinding } from '../after-render-binders/colour-in-3d-btn.binding';
import { BehaviorSubject } from 'rxjs';
import { NewProtvistaColourEvent } from '../../track-data.model';
import { ProtvistaOnTrackMouseEvents } from '../after-render-binders/doc-on-track-mouse-evts.binding';

export class SetTracksDataBinding {
  constructor(
    private helpTooltipsBinder: ProtvistaHelpTooltipsBinding,
    private highlights: NewProtvistaFixedHighlights,
    private tooltip: NewProtvistaTooltip,
    private mouseEvents: ProtvistaOnTrackMouseEvents,
    public colour3DBtnBinder?: ColourIn3DButtonBinding,
    public colourBy3DEventStream?: BehaviorSubject<NewProtvistaColourEvent | null>,
    private scrollContainer?: HTMLElement
  ) {}

  /**
   * Assigns data to a given Nightingale track and its scrollbox.
   */
  public setTrackCanvasData(
    container: HTMLElement,
    trackName: string,
    trackId: string,
    parentData: any,
    trackData: NightingaleFeature[],
    tooltipsData: { [key: string]: string },
    isNested: boolean,
    isCustomData: boolean,
    extraMarginLeft: number,
    extraMarginRight: number
  ): void {
    // 1 Assign data to main track
    const track = container.querySelector(`#${trackId}-track`);
    if (track) (track as any).data = trackData;

    // 2 Populate scrollbox subtracks if they exist
    const scrollBox = container.querySelector(`#${trackId}-scrollbox`);
    if (!scrollBox) return;

    const has3DControls = parentData.colourIn3DControl ? parentData.colourIn3DControl : false;
    const trackHeight = parentData.trackHeight !== undefined ? parentData.trackHeight : 40;
    for (let j = 0; j < trackData.length; j++) {
      const subtrack = trackData[j];
      const scrollBoxItem = document.createElement('nightingale-scrollbox-item');
      scrollBoxItem.id = `${trackId}-subtrack-${j}`;
      scrollBoxItem.setAttribute(
        'content-visible',
        generateSubTrackCanvasString(
          trackName,
          trackId,
          j,
          trackHeight,
          subtrack,
          isNested,
          isCustomData,
          (track as any)?.length ?? 0,
          extraMarginLeft,
          extraMarginRight,
          has3DControls
        )
      );
      scrollBoxItem.setAttribute('content-hidden', getLoadingDataHTML((subtrack as any).label, extraMarginLeft, extraMarginRight));
      scrollBoxItem.setAttribute('name', trackId);
      scrollBoxItem.setAttribute('idx', `${j}`);
      scrollBox.appendChild(scrollBoxItem);

      // Assign subtrack data
      (scrollBoxItem as any).data = [subtrack];
    }

    // 3 Handle lazy-load behavior (triggered when item enters scrollbox viewport)
    if ((scrollBox as any).onEnter) {
      (scrollBox as any).onEnter(async (item: any) => {
        if (item.data) {
          for (const trackEl of Array.from(item.getElementsByTagName('nightingale-track-canvas-patched'))) {
            (trackEl as any).data = item.data;
          }
        }
        this.helpTooltipsBinder.bind(container, tooltipsData);
        if (this.colour3DBtnBinder && this.colourBy3DEventStream) this.colour3DBtnBinder.bind(container, this.colourBy3DEventStream);
        this.highlights.triggerFixedHighlight();
      });
    }
  }

  /**
   * Assigns data to a specific Nightingale Coloured Sequence track.
   */
  public setTrackColouredSequenceData(container: HTMLElement, trackId: string, trackData: string) {
    // 1 - Assign data to main coloured sequence track
    const track = container.querySelector(`#${trackId}-coloured-seq-track`);
    if (track) (track as any).sequence = trackData;
  }

  /**
   * Assigns data to a specific Nightingale Coloured Sequence track.
   */
  public async setTrackHeatmapSequenceData(
    container: HTMLElement,
    trackId: string,
    trackData: any,
    xDomain: number[],
    yDomain: string[],
    checkpoints: number[],
    colours: string[],
    trackTooltipFn: (d: any, x: number, y: number, xIndex: number, yIndex: number) => string,
    customColorScale?: (score: number) => string
  ) {
    // 1 - Assign data to main coloured sequence track
    const track = container.querySelector<any>(`#${trackId}-heatmap-track`);
    if (!track) return;

    // Assign data
    track.setHeatmapData(xDomain, yDomain, trackData);
    const colorScale = customColorScale ?? scaleLinear(checkpoints, colours);

    // Wait for Lit render
    await track.updateComplete;
    // Apply heatmap color scale
    track.heatmapInstance.setColor((d: any) => colorScale(d.score));
    track.heatmapInstance.setTooltip((d: any, x: number, y: number, xIndex: number, yIndex: number) => {
      const tooltipContent = trackTooltipFn(d, x, y, xIndex, yIndex);
      return tooltipContent;
    });

    // // Set our tooltips from hover events
    track.heatmapInstance.events.hover.subscribe((d: any) => {
      if (d.cell) {
        this.adjustTooltipElements();
        this.mouseEvents.triggerExternalMouseOverEvents(d.cell.x, d.cell.x);
      } else {
        this.mouseEvents.triggerExternalMouseOutEvents();
      }
    });
    // // Set our pinned tooltips from click events

    track.heatmapInstance.events.select.subscribe((d: any) => {
      if (d.cell) {
        this.tooltip.hidePinnedTooltip();
        this.tooltip.hideHeatmapTooltip(container, trackId);
        this.highlights.fixedTooltipSelection = `${d.cell.x}:${d.cell.x}`;
        this.highlights.createHighlightText();
        this.highlights.triggerFixedHighlight();
        this.adjustTooltipElements();
        this.mouseEvents.triggerExternalClickEvents(d.cell.x, d.cell.x, {} as any);
      } else {
        this.highlights.fixedTooltipSelection = '';
        this.highlights.createHighlightText();
        this.highlights.triggerFixedHighlight();
        document.dispatchEvent(new CustomEvent('protvista-close-pin'));
      }
    });
  }

  adjustTooltipElements() {
    if (!this.scrollContainer) return;

    const scrollBounds = this.scrollContainer.getBoundingClientRect();
    // const leftEdge = scrollBounds.left;
    const rightEdge = scrollBounds.right - 30; // padding from the right edge
    const topEdge = scrollBounds.top;
    // const bottomEdge = scrollBounds.bottom - 10; // optional padding from bottom

    const selectors = ['.heatmap-pinned-tooltip-box', '.heatmap-tooltip-box'];

    for (const selector of selectors) {
      const el1 = this.scrollContainer.querySelector(selector) as HTMLElement | null;
      if (el1 !== null) {
        el1.style.translate = '0px 0px';
        el1.classList.remove('flipped-x', 'flipped-y');
        el1.style.zIndex = '5';

        const bounds = el1.getBoundingClientRect();
        const elX = bounds.x;
        const elY = bounds.y;
        const elWidth = bounds.width;
        const elHeight = bounds.height;

        const pin = el1.querySelector('.heatmap-pinned-tooltip-pin') as HTMLElement | null;
        if (pin) {
          pin.style.translate = '0px 0px';
          pin.style.transform = 'none';
        }
        // Compute distances to container edges
        // const distLeft = elX - leftEdge;
        const distRight = rightEdge - (elX + elWidth);
        const distTop = elY - topEdge;
        // const distBottom = bottomEdge - (elY + elHeight);

        // final translate offsets
        let translateX = 0;
        let translateY = 0;
        let translatePinX = 0;
        let translatePinY = 0;
        let pinTransform = '';

        // ---- X FLIP ----
        if (distRight < 0) {
          translateX = -elWidth;
          el1.classList.add('flipped-x');
          translatePinX = elWidth - 5;
          pinTransform += ' rotateY(180deg)';
        }

        // ---- Y FLIP ----
        if (distTop < 0) {
          translateY = elHeight + 5;
          el1.classList.add('flipped-y');
          translatePinY = -(elHeight - 5); // move pin visually to bottom edge
          pinTransform += ' rotateX(180deg)';
        }

        // apply combined translation
        el1.style.translate = `${translateX}px ${translateY}px`;
        if (pin) {
          pin.style.translate = `${translatePinX}px ${translatePinY}px`;
          pin.style.transform = pinTransform.trim();
        }
      }
    }
  }

  /**
   * Assigns data to a specific Nightingale Conservation track.
   */
  public setTrackConservationData(container: HTMLElement, trackId: string, trackData: any, lineTrackData: any) {
    // 1 - Assign data to main conservation track
    const track = container.querySelector(`#${trackId}-conservation-track`);
    if (track) (track as any).data = trackData;

    // 2 - Assign data to line graph
    const lineTrack = container.querySelector(`#pdbe-pv-conservation-count`);
    if (lineTrack) (lineTrack as any).data = lineTrackData;
  }

  /**
   * Assigns data to a specific Nightingale Variation track.
   */
  public setTrackVariationData(container: HTMLElement, trackId: string, trackData: any, lineTrackData: any) {
    // 1 - Assign data to main conservation track
    const track = container.querySelector(`#${trackId}-variation-track`);
    if (track) (track as any).data = trackData;

    // 2 - Assign data to line graph
    const lineTrack = container.querySelector(`#pdbe-pv-variation-count`);
    if (lineTrack) (lineTrack as any).data = lineTrackData;
  }
}
