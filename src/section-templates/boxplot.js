import { html } from "lit";

function isAlwaysExpanded(ctx) {
    return ctx.alwaysExpanded?.includes('rsa_distribution') === true;
}

function PDBePvBoxplotSection(ctx) {
  return html`
    <div class="protvistaRow pvBoxplotGraphRow" style="display:${isAlwaysExpanded(ctx) ? "table" : "none"}">
      <div
        class="protvistaCol1 category-label pvGreyCategoryLabel ${isAlwaysExpanded(ctx) ? "no-icon" : ""}"
        @click=${() => {
          if (!isAlwaysExpanded(ctx)) {
            ctx.layoutHelper.showBoxplotSection();
          }
        }}
      >
        Average Relative Solvent Accessibility (PDB and MDposit)
      </div>

      <div class="protvistaCol2 aggregate-track-content non-aggregate-track-border pvBoxplotGraphSection">
        <protvista-pdb-boxplot-linegraph
          .useDefaultStyles=${ctx.useDefaultStyles}
          .length=${ctx.viewerData.length}
          .height=${50}
          .display-start=${ctx.viewerData.displayStart || 1}
          .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
          .margin-left=${ctx.pvTrackMargins.left}
          .margin-right=${ctx.pvTrackMargins.right}
        ></protvista-pdb-boxplot-linegraph>
      </div>
    </div>

    <div class="pvBoxplotDetailRow" style="display:${isAlwaysExpanded(ctx) ? "block" : "none"}">
      <div class="protvistaRow">
        <div class="protvistaCol1 track-label pvBoxplotDetailLabel non-aggregate-track-border">
          PDB RSA and Simulated RSA distributions
        </div>

        <div class="protvistaCol2 track-content pvBoxplotRsaSection">
          <protvista-pdb-boxplot-track
            .useDefaultStyles=${ctx.useDefaultStyles}
            .length=${ctx.viewerData.length}
            .height=${300}
            .display-start=${ctx.viewerData.displayStart || 1}
            .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
            y-min="0"
            y-max="100"
            show-axis
            show-nested-highlights
            zoomed-out-outline="whiskers"
            zoom-transition-range="4-5"
            margin-left=${ctx.pvTrackMargins.left}
            margin-right=${ctx.pvTrackMargins.right}
            margin-top="5"
            margin-bottom="5"
            highlight-event="onmouseover"
          ></protvista-pdb-boxplot-track>
        </div>
      </div>
    </div>
  `;
}

export default PDBePvBoxplotSection;