import { NewProtvistaFixedHighlights } from '../../new-protvista-fixed-highlights';
import { NewProtvistaTooltip } from '../../new-protvista-tooltip';
import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';
import { ProtvistaDocMouseTracking } from './doc-mouse-track.binding';
import { ProtvistaOnTrackZoom } from './doc-on-track-zoom.binding';
import { APITrackFragment } from './../../models/pv-api-general-track-data.model';
import { type Feature as NightingaleFeature } from '@nightingale-elements/nightingale-track';

export class ProtvistaOnTrackMouseEvents extends ProtvistaGenericBinding {
  private lastHighlightText?: string;

  constructor(
    private entityId: string,
    private chainId: string,
    private tooltip: NewProtvistaTooltip,
    private highlights: NewProtvistaFixedHighlights,
    private triggerExternal: boolean,
    private mouseTracker: ProtvistaDocMouseTracking,
    private zoomEvts: ProtvistaOnTrackZoom
  ) {
    super();
  }

  /**
   * Helper to decode rawHTML from API endpoints (tooltipContent)
   */
  decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html.replace(/'/g, `"`);
    return txt.value;
  }

  triggerExternalMouseOutEvents() {
    const eventObj = new CustomEvent('protvista-mouseout');
    document.dispatchEvent(eventObj);
  }

  handleNightingaleMouseout() {
    this.tooltip.hideHoverTooltip();
    if (this.triggerExternal) {
      this.triggerExternalMouseOutEvents();
    }
  }

  triggerExternalClickEvents(start: number, end: number, feature: NightingaleFeature, color?: string) {
    const eventObj = new CustomEvent('protvista-click', {
      detail: {
        start: `${start}`,
        end: `${end}`,
        color: color,
        feature: {
          entityId: this.entityId,
          chainId: this.chainId,
          ...feature, // Spread additional metadata from the feature sometimes used by external viewers such as PDBe Molstar
        },
      },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(eventObj);

    const eventObj2 = new CustomEvent('new-protvista-click', {
      detail: {
        start: `${start}`,
        end: `${end}`,
        color: color,
        feature: {
          entityId: this.entityId,
          chainId: this.chainId,
          ...feature, // Spread additional metadata from the feature sometimes used by external viewers such as PDBe Molstar
        },
      },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(eventObj2);
  }

  handleNightingaleClick(target: HTMLElement, coords: number[], detail: any, zoomStart?: number, zoomEnd?: number) {
    if (!this.tooltip.tooltipElement) return;
    const tooltipContent = this.tooltip.tooltipElement.innerHTML;
    const isCustomData = target.classList.contains('custom-row');
    const feature = detail.feature;

    const xCoordsDetail = detail.parentEvent.offsetX;
    const xCoordsDetailAsResPos = (target as any).getSeqPositionFromX(xCoordsDetail);

    // Show pinned tooltip
    this.tooltip.showPinnedTooltip(target, tooltipContent, { x: coords[0], y: coords[1] }, xCoordsDetailAsResPos, isCustomData, zoomStart, zoomEnd);

    // TODO: search highlight related reset any externally triggered highlight (e.g., SmartSeq select)
    // if (removeFromExternal) {
    //   removeFromExternal();
    // }

    // Determine residue range and color for external click events
    if (this.triggerExternal) {
      let start: number | undefined;
      let end: number | undefined;
      let color: string | undefined;

      // (a) Custom data tracks
      if (tooltipContent.includes('Custom data track:')) {
        color = feature.color;
      }

      // (b) Conservation tracks
      if (feature.probability) {
        start = feature.position;
        end = feature.position;
      }

      // (c) Variation tracks
      else if (feature.variant) {
        start = feature.start;
        end = feature.start;
      }

      // (d) Canvas tracks
      else if (feature.locations?.[0]?.fragments) {
        const fragment = feature.locations[0].fragments.find((f: APITrackFragment) => this.decodeHtml(f.tooltipContent) === this.decodeHtml(tooltipContent));
        if (!fragment) return;
        start = fragment.start;
        end = fragment.end;

        // Use fragment or feature color for multi-residue regions
        if (fragment.start !== fragment.end) {
          color = fragment.color || feature.color;
        }
      }

      // Dispatch external click event (Mol*, Topology Viewer, etc.)
      if (start !== undefined && end !== undefined) {
        this.triggerExternalClickEvents(start, end, feature, color);
      }
    }

    this.highlights.createHighlightText();
    this.highlights.triggerFixedHighlight();
  }

  triggerExternalMouseOverEvents(start: number, end: number, feature?: NightingaleFeature) {
    if (!feature) feature = {} as any;

    const eventObj = new CustomEvent('protvista-mouseover', {
      detail: {
        start: `${start}`,
        end: `${end}`,
        feature: {
          entityId: this.entityId,
          chainId: this.chainId,
          ...feature,
        },
      },
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(eventObj);
  }

  handleNightingaleHover(target: HTMLElement, coords: number[], detail: any) {
    let startPos: number | undefined;
    let endPos: number | undefined;
    let highlightContent: string | undefined;
    let tooltipContent: string | undefined;

    const feature = detail.feature;

    // --- Conservation track ---
    if (feature.probability) {
      const probText = (feature.probability * 100.0).toFixed(2);
      tooltipContent = `Position: ${feature.position}<br>Amino acid: ${feature.aa}<br>Probability: ${probText}%`;
      highlightContent = `${feature.position}:${feature.position}`;
      startPos = feature.position;
      endPos = feature.position;
    }

    // --- Variation track ---
    else if (feature.variant && feature.tooltipContent) {
      tooltipContent = feature.tooltipContent;
      highlightContent = `${feature.start}:${feature.start}`;
      startPos = feature.start;
      endPos = feature.start;
    }

    // --- Canvas track ---
    else if (feature.locations?.[0]?.fragments) {
      const highlight = detail.highlight;
      if (!highlight) return;

      startPos = parseInt(highlight.split(':')[0]);
      endPos = parseInt(highlight.split(':')[1]);

      const fragment = feature.locations[0].fragments.find((f: any) => f.start === startPos && f.end === endPos);
      if (!fragment) return;

      tooltipContent = fragment.tooltipContent;
      highlightContent = highlight;
    }

    // --- Render tooltip if content available ---
    if (tooltipContent && highlightContent) {
      const isCustomData = target.classList.contains('custom-row');
      const xCoordsDetail = detail.parentEvent.offsetX;
      const xCoordsDetailAsResPos = (target as any).getSeqPositionFromX(xCoordsDetail);
      this.tooltip.showHoverTooltip(target, tooltipContent, { x: coords[0], y: coords[1] }, xCoordsDetailAsResPos, isCustomData);
    }
    if (this.triggerExternal && startPos && endPos) {
      this.triggerExternalMouseOverEvents(startPos, endPos, feature);
    }
    return highlightContent;
  }

  override bind(container: HTMLElement) {
    const onChangeEvt = (event: Event) => {
      if (!event.target) return;
      const target = event.target as HTMLElement;
      if (!target.tagName.startsWith('NIGHTINGALE-')) return;

      const detail = (event as CustomEvent).detail;
      if (!detail || detail.cancelMe) return;

      const eventType = detail.eventType;
      if (!eventType) return;

      if (eventType === 'mouseout') {
        this.handleNightingaleMouseout();
        return;
      }

      const coords = [this.mouseTracker.latestMouseX, this.mouseTracker.latestMouseY];
      const feature = detail.feature;
      if (!feature) return;

      if (eventType === 'click') {
        if (this.lastHighlightText) this.highlights.fixedTooltipSelection = this.lastHighlightText;
        this.handleNightingaleClick(target, coords, detail, this.zoomEvts.lastZoomStart, this.zoomEvts.lastZoomEnd);
        this.tooltip.hideHeatmapTooltip(container);
      } else if (eventType === 'mouseover') {
        const highlightText = this.handleNightingaleHover(target, coords, detail);
        this.lastHighlightText = highlightText;
      }
    };
    document.addEventListener('change', onChangeEvt);
    this.elementListeners.push({ element: undefined, handlers: { type: 'change', listener: onChangeEvt } });
  }
}
