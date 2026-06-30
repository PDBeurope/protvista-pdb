import { HELP_ICON_IMG_SRC } from '../icons-base64-strings';

/**
 * Renders the collapsed/expandable Nightingale conservation track canvas container.
 */
export function getConsTrackCanvasHTML(
  trackId: string,
  trackName: string,
  sequenceLength: number,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
): string {
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
    <div class="pv-track-row non-header-track track collapsed" style="align-content: flex-start">
      <div class="pv-track-label-col hoverable not-empty toggle-expansion collapsed not-collapse" track-id="${trackId}">
        <div class="track-title">
          <span class="expand-icon collapsed">▸</span>
          <span class="expand-icon expanded" style="display: none;">▾</span>
          ${trackName}
        </div>
        ${colourIn3DHTML}
      </div>
      <div class="pv-track-container for-collapsed-${trackId}">
        <nightingale-linegraph-track
          id="pdbe-pv-conservation-count"
          class="add-fixed-highlight add-fixed-highlight"
          height="50"
          length="${sequenceLength}"
          highlight-color="#FFEB3B66"
          margin-left="${marginLeft}"
          margin-right="${marginRight}"
          use-ctrl-to-zoom
        ></nightingale-linegraph-track>
      </div>
      <div class="pv-track-container for-collapsed-${trackId}-placeholder" style="display: none;"></div>
    </div>

    <!-- Sequence Logo Track -->
    <div class="pv-track-row non-header-track track pv-expanded-tracks for-expanded-${trackId}" style="display: none;">
      <!-- <div class="pv-track-label-col subtrack label-only variation" style="height: 350px; overflow-y: auto"> -->
      <div class="pv-track-label-col subtrack label-only variation" style="overflow-y: auto">
        <p>
          <span class="pdbe-pv-colname-tooltip">
            Amino acid probabilities
            <a target="_blank" href="https://github.com/PDBe-KB/pdbe-kb-manual/wiki/Sequence-conservation-scores">
              <img src="${HELP_ICON_IMG_SRC}" data-help-id="aa-probs" class="icon help-icon" alt="help icon"/>
            </a>
          </span>
        </p>
        <p>Sort columns by:</p>
        <div class="pv-radio-group" data-track-id="${trackId}">
          <label>
            <input
              type="radio"
              name="conservation-sorting-${trackId}"
              class="cons-radio-btn"
              value="default"
              checked
            />
            Amino acid properties
          </label>
          <label>
            <input
              type="radio"
              name="conservation-sorting-${trackId}"
              class="cons-radio-btn"
              value="probability"
            />
            Highest probabilities
          </label>
        </div>

        <div class="legend">
          <p>Amino acid properties</p>
          <div class="protvista-sc-legend">
            <div class="protvista-sc-legend"><span class="pv-legend-color" style="background: #15a4a4"></span><span class="pv-legend-text">Aromatic</span></div>
            <div class="protvista-sc-legend"><span class="pv-legend-color" style="background: #15c015"></span><span class="pv-legend-text">Polar</span></div>
            <div class="protvista-sc-legend"><span class="pv-legend-color" style="background: #80a0f0"></span><span class="pv-legend-text">Hydrophobic</span></div>
            <div class="protvista-sc-legend"><span class="pv-legend-color" style="background: #c048c0"></span><span class="pv-legend-text">Negative charge</span></div>
            <div class="protvista-sc-legend"><span class="pv-legend-color" style="background: #c0c000"></span><span class="pv-legend-text">Proline</span></div>
            <div class="protvista-sc-legend"><span class="pv-legend-color" style="background: #f01505"></span><span class="pv-legend-text">Positive charge</span></div>
            <div class="protvista-sc-legend"><span class="pv-legend-color" style="background: #f08080"></span><span class="pv-legend-text">Cysteine</span></div>
            <div class="protvista-sc-legend"><span class="pv-legend-color" style="background: #f09048"></span><span class="pv-legend-text">Glycine</span></div>
          </div>
        </div>
      </div>
      <div class="pv-track-container">
        <nightingale-conservation-track
          id="${trackId}-conservation-track"
          class="add-fixed-highlight"
          length="${sequenceLength}"
          letter-order="'default'"
          height="350"
          font-family="Helvetica,sans-serif"
          min-font-size="6"
          fade-font-size="12"
          max-font-size="24"
          highlight-event="onmouseover"
          highlight-color="#FFEB3B66"
          margin-color="#ffffffdd"
          margin-left="${marginLeft}"
          margin-right="${marginRight}"
          use-ctrl-to-zoom
        ></nightingale-conservation-track>
      </div>
    </div>
  `;
}
