import { html } from "lit";

function PDBePvBoxplotSection(ctx) {
  return html`
    <div class="protvistaRow pvBoxplotGraphRow" style="display:none">
      <div
        class="protvistaCol1 category-label" style="background-color:rgb(128,128,128); borderBottom:1px solid lightgrey"
        @click=${() => ctx.layoutHelper.showBoxplotSection()}
      >
        Relative solvent accessibility (MDDB)
      </div>

      <div class="protvistaCol2 aggregate-track-content pvBoxplotGraphSection">
        <protvista-pdb-boxplot-linegraph
          .length=${ctx.viewerData.length}
          .height=${50}
          .display-start=${ctx.viewerData.displayStart || 1}
          .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
          .margin-left=${ctx.pvTrackMargins.left}
          .margin-right=${ctx.pvTrackMargins.right}
        ></protvista-pdb-boxplot-linegraph>
      </div>
    </div>

    <div class="pvBoxplotDetailRow" style="display:none">
      <div class="protvistaRow">
        <div class="protvistaCol1 track-label" style="background-color:#d3d3d3;borderBottom:1px solid #d3d3d3">
          RSA distribution
        </div>

        <div class="protvistaCol2 track-content pvBoxplotRsaSection">
          <protvista-pdb-boxplot-track
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
          ></protvista-pdb-boxplot-track>
        </div>
      </div>

      <div class="protvistaRow">
        <div class="protvistaCol1 track-label" style="background-color:#d3d3d3;borderBottom:1px solid #d3d3d3">
          Simulated RSA distribution
        </div>

        <div class="protvistaCol2 track-content pvBoxplotSimRsaSection">
          <protvista-pdb-boxplot-track
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
          ></protvista-pdb-boxplot-track>
        </div>
      </div>
    </div>
  `;
}

export default PDBePvBoxplotSection;