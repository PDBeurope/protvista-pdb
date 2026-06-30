/**
 * Renders the collapsed/expandable Nightingale coloured seq container.
 */
export function getColouredSeqTrackHTML(
  trackId: string,
  trackName: string,
  trackHeight: number,
  sequenceLength: number,
  dataScale: string,
  dataRange: string,
  isExpandable: boolean,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
): string {
  // Custom classes and HTML content when track can be expanded/collapsed
  const expansionIcons = isExpandable
    ? `
    <span class="expand-icon collapsed">▸</span>
    <span class="expand-icon expanded" style="display: none;">▾</span>
  `
    : ' <span class="expand-icon expanded" style="visibility: hidden;">▸</span>';
  const nonExpandableClass = isExpandable ? '' : 'not-collapse';
  const expandableHTML = isExpandable
    ? `
    <div class="pv-expanded-tracks for-expanded-${trackId}" style="display: none;">
      <nightingale-scrollbox id="${trackId}-scrollbox"></nightingale-scrollbox>
    </div>
  `
    : '';
  const headerColClasses = isExpandable ? 'hoverable toggle-expansion collapsed' : 'label-only';

  // Margin calculation
  const marginLeft = extraMarginLeft ? extraMarginLeft + 0 : 0;
  const marginRight = extraMarginRight ? extraMarginRight + 10 : 10;

  // Added controls for sending colour in 3D event
  const colourIn3DHTML = colourIn3DControl
    ? `
    <div class="track-btns">
      <span class="expand-icon collapsed" style="visibility: hidden;">▸</span>
      <button data-event-id="${trackId}->${trackName}" class="in-3d-btn">in 3D<button>
    </div>
  `
    : '';

  return `
    <!-- added for dev ref <div class="pv-track-row"> is rendered by appendChild -->
      <div class="collapsible">
        <div class="pv-track-row non-header-track track collapsed" style="align-content: flex-start">
          <div class="pv-track-label-col ${headerColClasses} not-empty ${nonExpandableClass}" track-id="${trackId}">
            <div class="track-title">
              ${expansionIcons}
              ${trackName}
            </div>
            ${colourIn3DHTML}
          </div>
          <div class="pv-track-container for-collapsed-${trackId}">
            <nightingale-colored-sequence
              id="${trackId}-coloured-seq-track"
              length="${sequenceLength}"
              height="${trackHeight}"
              margin-left="${marginLeft}"
              margin-right="${marginRight}"
              highlight-color="#FFEB3B66"
              highlight-event="onmouseover"
              scale="${dataScale}"
              color-range="${dataRange}"
              class="add-fixed-highlight"
              use-ctrl-to-zoom>
            </nightingale-colored-sequence>
          </div>
          <div class="pv-track-container for-collapsed-${trackId}-placeholder" style="display: none;"></div>
        </div>
        <!-- if track canvas is expandable, add nightingale-scrollbox here -->
        ${expandableHTML}
      </div>
    <!-- added for dev ref. </div> is rendered by appendChild -->
  `;
}
