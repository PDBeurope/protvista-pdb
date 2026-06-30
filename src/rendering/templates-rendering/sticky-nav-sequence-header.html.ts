import { HANDLE_BAR_IMG_SRC, RESET_ICON, SEARCH_HIGHLIGHT_ICON } from '../icons-base64-strings';

/**
 * Renders the sticky header area with navigation and sequence.
 */
export function renderStickyHeaderContent(
  sequence: string,
  sequenceLength: number,
  sequenceForLigands: boolean,
  extraMarginLeft?: number,
  extraMarginRight?: number
): string {
  const marginLeft = extraMarginLeft ? extraMarginLeft + 0 : 0;
  const marginRight = extraMarginRight ? extraMarginRight + 10 : 10;
  const patchedSeq = sequenceForLigands ? '-patched' : '';
  return `
    <div class="pv-track-row">
    <div class="pv-track-col small controls">
        <img src="${RESET_ICON}" id="pv-reset-btn" class="action-icon" style="display: none" alt="reset icon"/>
        <img src="${SEARCH_HIGHLIGHT_ICON}" id="pv-search-highlight-btn" class="action-icon" alt="search icon"/>
    </div>
    <div class="pv-track-col pv-track-container">
        <nightingale-navigation
        length="${sequenceLength}"
        height="30"
        margin-left="${marginLeft}"
        margin-right="${marginRight}"
        use-ctrl-to-zoom>
        </nightingale-navigation>
        <div style="position: relative; width: 100%">
            <div class="navigation-zoom-hint">
                Use handle bars <img src="${HANDLE_BAR_IMG_SRC}" /> or
                <kbd>Ctrl</kbd> + <kbd>Scroll</kbd> to zoom in/out of tracks
            </div>
            <nightingale-sequence${patchedSeq}
                class="add-fixed-highlight"
                length="${sequenceLength}"
                sequence="${sequence}"
                height="26"
                margin-left="${marginLeft}"
                margin-right="${marginRight}"
                use-ctrl-to-zoom>
            </nightingale-sequence${patchedSeq}>
        </div>
    </div>
    </div>
`;
}
