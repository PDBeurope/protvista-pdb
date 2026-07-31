import { html } from "lit";

function PDBePvLigandInteractionsHeatmapSection(ctx) {
  return html`
    <div class="protvistaRow" style="display:table">
      <div
        class="protvistaCol1 category-label pvGreyCategoryLabel no-icon"
      ></div>
    <div class="protvistaCol2 aggregate-track-content non-aggregate-track-border pvBoxplotGraphSection">
      <nightingale-sequence-heatmap
        .useDefaultStyles=${ctx.useDefaultStyles}
        heatmap-id="heatmap-atoms"
        id="atoms-hm-heatmap-track"
        class="sequence-heatmap-vis add-fixed-highlight"
        height="23"
        .length=${ctx.viewerData.length}
        highlight-color="#FFEB3B66"
        highlight-event="onmouseover"
        min-width="10"
        min-height="10"
        .margin-left=${ctx.pvTrackMargins.left}
        .margin-right=${ctx.pvTrackMargins.right}
        use-ctrl-to-zoom="">
        </nightingale-sequence-heatmap>
    </div>
  </div>

    <div class="protvistaRow" style="display:table">
      <div
        class="protvistaCol1 category-label pvGreyCategoryLabel no-icon"
      ></div>
    <div class="protvistaCol2 aggregate-track-content non-aggregate-track-border pvBoxplotGraphSection">
      <nightingale-sequence-heatmap
        .useDefaultStyles=${ctx.useDefaultStyles}
        heatmap-id="heatmap-resids"
        id="resids-hm-heatmap-track"
        class="sequence-heatmap-vis add-fixed-highlight"
        height="390"
        .length=${ctx.viewerData.length}
        highlight-color="#FFEB3B66"
        highlight-event="onmouseover"
        min-width="10"
        min-height="10"
        .margin-left=${ctx.pvTrackMargins.left}
        .margin-right=${ctx.pvTrackMargins.right}
        use-ctrl-to-zoom="">
        </nightingale-sequence-heatmap>
    </div>
  </div>
  `;
}

export default PDBePvLigandInteractionsHeatmapSection;