import { type Feature as NightingaleFeature } from '@nightingale-elements/nightingale-track';
import { HELP_ICON_IMG_SRC } from '../icons-base64-strings';

/**
 * Generates raw HTML for a subtrack block to be injected in a scrollbox.
 */
export function generateSubTrackCanvasString(
  parentTrackName: string,
  trackId: string,
  index: number,
  trackHeight: number,
  subtrack: NightingaleFeature,
  isNested: boolean,
  isCustomData: boolean,
  sequenceLength: number,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
): string {
  const subtrackLabel = (subtrack as any).label;
  const subtrackTitle = subtrackLabel ? subtrackLabel : subtrack.accession;
  const nestedClass = isNested ? 'nested' : '';
  const customRowClass = isCustomData ? 'custom-row' : '';
  const segments = subtrack.locations?.map((loc) => loc.fragments.map((frag) => `${frag.start} - ${frag.end}`).join(', ')).join('; ');
  const helpDataId = isCustomData ? `${subtrackLabel}: ${segments}` : `${parentTrackName}-${subtrackLabel}`;
  const marginLeft = extraMarginLeft ? extraMarginLeft + 0 : 0;
  const marginRight = extraMarginRight ? extraMarginRight + 10 : 10;

  // Added controls for sending colour in 3D event
  const colourIn3DHTML = colourIn3DControl
    ? `
    <div class="track-btns">
      <button data-event-id="${trackId}->${subtrackLabel}" class="in-3d-btn">in 3D<button>
    </div>
  `
    : '';

  return `
    <div class="pv-track-row non-header-track ${customRowClass}">
      <div class="pv-track-label-col hoverable subtrack label-only dynamic-track ${nestedClass}" name="${trackId}-${subtrackTitle}">
        <div class="track-title">
          <span>${subtrackLabel}<img src="${HELP_ICON_IMG_SRC}" data-help-id="${helpDataId}" class="icon help-icon ${customRowClass}" alt="help icon"/></span>
        </div>
        ${colourIn3DHTML}
      </div>
      <div class="pv-track-container">
        <nightingale-track-canvas-patched
          id="cv-${trackId}-subtrack-${index}"
          class="add-fixed-highlight ${customRowClass}"
          length="${sequenceLength}"
          height="${trackHeight}"
          margin-left="${marginLeft}"
          margin-right="${marginRight}"
          layout="non-overlapping"
          highlight-color="#FFEB3B66"
          highlight-event="onmouseover"
          use-ctrl-to-zoom>
        </nightingale-track-canvas-patched>
      </div>
    </div>
  `;
}
