/**
 * Renders the collapsed/expandable Nightingale sequence heatmap container.
 */
export function getHeatmapSeqTrackHTML(
  trackId: string,
  trackName: string,
  trackHeight: number,
  sequenceLength: number,
  heatmapId: string,
  isExpandable: boolean,
  hasYScale: boolean,
  mirrorYScale: boolean,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
): string {
  const expansionIcons = isExpandable
    ? `
    <span class="expand-icon collapsed">▸</span>
    <span class="expand-icon expanded" style="display: none;">▾</span>
  `
    : ' <span class="expand-icon expanded" style="visibility: hidden; min-width: 14px;">▸</span>';

  const nonExpandableClass = isExpandable ? '' : 'not-collapse';
  const expandableHTML = isExpandable
    ? `
    <div class="pv-expanded-tracks for-expanded-${trackId}" style="display: none;">
      <nightingale-scrollbox id="${trackId}-scrollbox"></nightingale-scrollbox>
    </div>
  `
    : '';

  const headerColClasses = isExpandable ? 'hoverable toggle-expansion collapsed' : 'label-only';

  let extraMarginLeftValue = extraMarginLeft !== undefined ? extraMarginLeft : 0;
  if (hasYScale) extraMarginLeftValue -= 20;
  const marginLeft = extraMarginLeft !== undefined ? extraMarginLeftValue + 0 : 0;

  let extraMarginRightValue = extraMarginRight !== undefined ? extraMarginRight : 0;
  if (hasYScale) extraMarginRightValue -= 20;
  if (!hasYScale && extraMarginRight !== undefined) extraMarginRightValue -= 30;
  const marginRight = extraMarginRight ? extraMarginRightValue + 10 : 10;

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
          <div class="pv-track-label-col ${headerColClasses} not-empty ${nonExpandableClass}" track-id="${trackId}" style="padding-top: 10px; align-items: flex-start">
            <div class="track-title">
              ${expansionIcons}
              ${trackName}
            </div>
            ${colourIn3DHTML}
          </div>
          <div id="${trackId}-heatmap-track-parent" class="pv-track-container for-collapsed-${trackId}">
          ${hasYScale ? `<div id="${trackId}-yscale-wrapper" class="yscale-wrapper">` : ''}
            <nightingale-sequence-heatmap
              heatmap-id="${heatmapId}"
              id="${trackId}-heatmap-track"
              class="sequence-heatmap-vis add-fixed-highlight"
              height="${trackHeight}"
              length="${sequenceLength}"
              highlight-color="#FFEB3B66"
              highlight-event="onmouseover"
              min-width="10"
              min-height="10"
              margin-left="${marginLeft}"
              margin-right="${marginRight}"
              use-ctrl-to-zoom="">
            </nightingale-sequence-heatmap>
          ${hasYScale ? '</div>' : ''}
          </div>
          <div class="pv-track-container for-collapsed-${trackId}-placeholder" style="display: none;"></div>
        </div>
        <!-- if track canvas is expandable, add nightingale-scrollbox here -->
        ${expandableHTML}
      </div>
    <!-- added for dev ref. </div> is rendered by appendChild -->
  `;
}
