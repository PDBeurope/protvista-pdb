import { html } from "lit";

function isAlwaysExpanded(ctx) {
    return ctx.alwaysExpanded?.includes('sequence_conservation') === true;
}

function PDBePvScSection(ctx) {
    return html`<div class="protvistaRow pvConsHistoRow" style="display:${isAlwaysExpanded(ctx) ? "table" : "none"}">
                    
                    <div
                        class="protvistaCol1 category-label pvGreyCategoryLabel ${isAlwaysExpanded(ctx) ? "no-icon" : ""}"
                        @click=${e => {
                            if (!isAlwaysExpanded(ctx)) {
                                ctx.layoutHelper.showConservationPlot();
                            }
                        }}
                    >Sequence conservation</div>

                    <div class="protvistaCol2 aggregate-track-content non-aggregate-track-border pvConservationHistoSection">
                        <protvista-pdb-sc-histogram
                            .useDefaultStyles=${ctx.useDefaultStyles}
                            accession=${ctx._entryId ? ctx._entryId : ctx._accession}
                            length=${ctx.viewerData.length}
                            height=${44}
                            .margin-left=${ctx.pvTrackMargins.left}
                            .margin-right=${ctx.pvTrackMargins.right}
                            .display-start=${ctx.viewerData.displayStart || 1}
                            .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
                        ></protvista-pdb-sc-histogram>
                    </div>
                </div>
                <div class="pvConservationPlotRow" style="display:${isAlwaysExpanded(ctx) ? "block" : "none"}">
                    <div class="protvistaRow">
                        <div class="protvistaCol1 track-label pvConsDetailLabel non-aggregate-track-border">
                            <div class="pvConsDetailTitle">
                                <b>Amino acid probabilities</b>
                                <span @mouseover=${e => {
                                    e.stopPropagation();
                                    ctx.layoutHelper.showLabelTooltip(e)
                                    }} @mouseout=${e => {
                                    e.stopPropagation();
                                    ctx.layoutHelper.hideLabelTooltip()
                                }}>
                                    <a href="https://github.com/PDBe-KB/pdbe-kb-manual/wiki/Sequence-conservation-scores" target="_blank">
                                        <i class="icon icon-generic" data-icon="?"></i>
                                    </a>
                                    <span class="labelTooltipContent" style="display:none;">
                                        The amino acid probabilities are calculated using HMM profiles based on multiple sequence alignments. Click to see more details...
                                    </span>
                                </span>
                            </div>
                            <div class="pvConsDetailControl control">
                                <p>Data displayed by</p>
                                <div>
                                    <label class="legendText">
                                        <input type="radio" class="sc_radio" name="sc_display_radio" value="property" checked @change=${e => ctx.layoutHelper.filterSc('property')}>Property
                                    </label>
                                </div>
                                <div>
                                    <label class="legendText">
                                        <input type="radio" class="sc_radio" name="sc_display_radio" value="probability" @change=${e => ctx.layoutHelper.filterSc('probability')}>Probability
                                    </label>
                                </div>
                            </div>

                            <!-- Note: Display is set to none until we expose MSA files per PDB entity -->
                            <div @mouseover=${e => {
                                e.stopPropagation();
                                ctx.layoutHelper.showLabelTooltip(e)
                                }} @mouseout=${e => {
                                e.stopPropagation();
                                ctx.layoutHelper.hideLabelTooltip()
                            }}
                            style = "${ctx._entryId ? "display: none" : ""}"
                            >
                                <a class="pvConsDetailMSABtn button"
                                    href="${ctx.layoutHelper.getMSADownloadUrl()}">
                                    Download MSA <i class="icon icon-functional" data-icon="="></i>
                                </a>
                                <span class="labelTooltipContent" style="display:none;">
                                    Click to download the multiple sequence alignment (MSA) file
                                </span>
                            </div>

                            <div class="pvConsDetailLegend legend">
                                <p>Amino acid properties</p>
                                <div class="protvista-sc-legend">
                                    <div class="protvista-sc-legend">
                                        <span class="legendColor" style="background:#15a4a4"></span>
                                        <span class="legendText">Aromatic</span>
                                    </div>
                                    <div class="protvista-sc-legend">
                                        <span class="legendColor" style="background:#15c015"></span>
                                        <span class="legendText">Polar</span>
                                    </div>
                                    <div class="protvista-sc-legend">
                                        <span class="legendColor" style="background:#80a0f0"></span>
                                        <span class="legendText">Hydrophobic</span>
                                    </div>
                                    <div class="protvista-sc-legend">
                                        <span class="legendColor" style="background:#c048c0"></span>
                                        <span class="legendText">Negative charge</span>
                                    </div>
                                    <div class="protvista-sc-legend">
                                        <span class="legendColor" style="background:#c0c000"></span>
                                        <span class="legendText">Proline</span>
                                    </div>
                                    <div class="protvista-sc-legend">
                                        <span class="legendColor" style="background:#f01505"></span>
                                        <span class="legendText">Positive charge</span>
                                    </div>
                                    <div class="protvista-sc-legend">
                                        <span class="legendColor" style="background:#f08080"></span>
                                        <span class="legendText">Cysteine</span>
                                    </div>                                  
                                    <div class="protvista-sc-legend">
                                        <span class="legendColor" style="background:#f09048"></span>
                                        <span class="legendText">Glycine</span>
                                    </div>
                                </div>
                            </div>

                            <div class="download-sc-align">
                            </div>
                        </div>

                        <div class="protvistaCol2 track-content pvConservationPlotSection">
                            <protvista-pdb-seq-conservation
                            sc-display-order="property"
                            accession=${ctx._entryId ? ctx._entryId : ctx._accession}
                            length=${ctx.viewerData.length}
                            height=${430}
                            .useDefaultStyles=${ctx.useDefaultStyles}
                            .display-start=${ctx.viewerData.displayStart || 1}
                            .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
                            .margin-left=${ctx.pvTrackMargins.left}
                            .margin-right=${ctx.pvTrackMargins.right}
                            ></protvista-pdb-seq-conservation>
                        </div>
                    </div>
                </div>`

}

export default PDBePvScSection;
