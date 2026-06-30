import { APIVariationData } from './../../models/pv-api-variation-track-data.model';
import { hasAnyVariantsForFilter, PDBE_VARIATION_CONSEQUENCE_FILTERS, PDBE_VARIATION_PROVENANCE_FILTERS } from '../../processing/pv-variation-api-processing';

const variationConsequence = PDBE_VARIATION_CONSEQUENCE_FILTERS;
const variationProvenance = PDBE_VARIATION_PROVENANCE_FILTERS;

export function getVarTrackCanvasHTML(
  trackId: string,
  trackName: string,
  trackData: APIVariationData,
  sequenceLength: number,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
): string {
  // Generate the consequence and provenance filter HTML from imported lists
  const consequenceFiltersHTML = variationConsequence
    .map((filter) => {
      const hasVariants = hasAnyVariantsForFilter(filter.keyword, trackData);
      return `
        <label class="pv-checkbox">
          <input
            type="checkbox"
            class="variant-filter"
            data-filter-type="consequence"
            value="${filter.keyword}"
            ${hasVariants ? 'checked' : 'disabled'}
          />
          ${filter.displayName}
        </label>`;
    })
    .join('');

  const provenanceFiltersHTML = variationProvenance
    .map((filter) => {
      const hasVariants = hasAnyVariantsForFilter(filter.keyword, trackData);
      return `<label class="pv-checkbox">
          <input
            type="checkbox"
            class="variant-filter"
            data-filter-type="provenance"
            value="${filter.keyword}"
            ${hasVariants ? 'checked' : 'disabled'}
          />
          ${filter.displayName}
        </label>
      `;
    })
    .join('');
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
    <!-- Collapsed (summary) variation count linegraph -->
    <div class="pv-track-container for-collapsed-${trackId}">
      <nightingale-linegraph-track
        id="pdbe-pv-variation-count"
        class="add-fixed-highlight"
        height="50"
        length="${sequenceLength}"
        highlight-color="#FFEB3B66"
        margin-left="${marginLeft}"
        margin-right="${marginRight}"
        use-ctrl-to-zoom
      ></nightingale-linegraph-track>
    </div>
  </div>
  <div class="pv-track-row non-header-track track pv-expanded-tracks for-expanded-${trackId}" style="display: none;">
    <div class="pv-track-label-col subtrack label-only variation">

      <p>Filter by Consequence:</p>
      <div class="pv-checkbox-group" data-filter-type="consequence" data-track-id="${trackId}">
        ${consequenceFiltersHTML}
      </div>

      <p style="margin-top: 1em;">Filter by Provenance:</p>
      <div class="pv-checkbox-group" data-filter-type="provenance" data-track-id="${trackId}">
        ${provenanceFiltersHTML}
      </div>
    </div>

    <div class="pv-track-container">
      <nightingale-variation
        id="${trackId}-variation-track"
        class="add-fixed-highlight"
        row-height="24"
        length="${sequenceLength}"
        highlight-color="#FFEB3B66"
        margin-left="${marginLeft}"
        margin-right="${marginRight}"
        use-ctrl-to-zoom
      ></nightingale-variation>
    </div>
  </div>
  `;
}
