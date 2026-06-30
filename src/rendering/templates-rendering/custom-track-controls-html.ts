import { EDIT_TRACK_ICON } from '../icons-base64-strings';

export function renderAddCustomTrackControls(isSticky: boolean, extraMarginLeft?: number, extraMarginRight?: number) {
  const stickyZIndex = isSticky ? 'always-on-top custom-row controls' : 'controls';
  const marginLeft = extraMarginLeft ? extraMarginLeft + 0 : 0;
  const marginRight = extraMarginRight ? extraMarginRight + 10 : 10;
  return `<div class="pv-track-row ${stickyZIndex}">
      <div class="pv-track-label-col label-only">
        <div class="track-title">
          <span class="expand-icon" style="visibility: hidden;">▸</span>
          Custom tracks
          <img src="${EDIT_TRACK_ICON}" id="pv-edit-custom-btn" class="action-icon" style="margin-left: auto; display: none;" alt="edit icon"/>
        </div>
      </div>
      <div class="pv-track-container custom-data custom-btn-control">
        <button id="pv-add-custom-btn" style="margin-left: ${marginLeft}px; margin-right: ${marginRight}px;">+  Map your residues</button>
      </div>
  </div>`;
}
