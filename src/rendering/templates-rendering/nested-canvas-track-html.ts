/**
 * Renders the collapsed/expandable Nightingale track canvas container.
 */
export function getNestedTrackCanvasHTML(
  trackId: string,
  trackName: string,
  trackHeight: number,
  isCustomData: boolean,
  sequenceLength: number,
  extraMarginLeft?: number,
  extraMarginRight?: number
): string {
  const customRowClass = isCustomData ? 'custom-row' : '';
  const marginLeft = extraMarginLeft ? extraMarginLeft + 0 : 0;
  const marginRight = extraMarginRight ? extraMarginRight + 10 : 10;

  return `
    <div class="collapsible">
      <div class="pv-track-row non-header-track track collapsed" style="align-content: flex-start">
        <div class="pv-track-label-col hoverable not-empty toggle-expansion collapsed" track-id="${trackId}">
          <div class="track-title">
            <span class="expand-icon collapsed">▸</span>
            <span class="expand-icon expanded" style="display: none;">▾</span>
            ${trackName}
          </div>
        </div>
        <div class="pv-track-container for-collapsed-${trackId}">
          <nightingale-track-canvas-patched
            id="${trackId}-track"
            length="${sequenceLength}"
            height="${trackHeight}"
            margin-left="${marginLeft}"
            margin-right="${marginRight}"
            layout="non-overlapping"
            highlight-color="#FFEB3B66"
            highlight-event="onmouseover"
            class="add-fixed-highlight ${customRowClass}"
            use-ctrl-to-zoom>
          </nightingale-track-canvas-patched>
        </div>
        <div class="pv-track-container for-collapsed-${trackId}-placeholder" style="display: none;"></div>
      </div>
      <div class="pv-expanded-tracks for-expanded-${trackId}" style="display: none;"></div>
    </div>
  `;
}
