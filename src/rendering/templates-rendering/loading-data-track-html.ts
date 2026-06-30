export function getLoadingDataHTML(trackName: string, extraMarginLeft?: number, extraMarginRight?: number, maxHeightValue?: number) {
  // Margin calculation
  const marginLeft = extraMarginLeft ? extraMarginLeft + 0 : 0;
  const marginRight = extraMarginRight ? extraMarginRight + 10 : 10;
  const maxHeight = maxHeightValue ? maxHeightValue : 40;

  const marginStyling = `margin-right: ${marginRight}px; margin-left: ${marginLeft}px; max-height: ${maxHeight}px`;

  return `
    <div class="pv-track-label-col">
      <div class="track-title">
        <span class="expand-icon" style="visibility: hidden;">▸</span>
        ${trackName}
      </div>
    </div>
    <div class="pv-track-container no-data">
      <div class="skeleton-loader" style="${marginStyling}"></div>
    </div>
  `;
}
