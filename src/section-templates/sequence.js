import { html } from "lit";

function PDBePvSeqSection(ctx, showLigSequence) {
    return html `<div class="protvistaRow">
                    
        <!-- Top Menu Toolbar -->
        <div class="protvistaCol1">&nbsp;</div>

        <!-- Navigation Component -->
        <div class="protvistaCol2 pvSeqSection">
            ${showLigSequence === false ? html`
              <nightingale-sequence height="44" length="${ctx.viewerData.length}" sequence="${ctx.viewerData.sequence}" margin-left=${ctx.pvTrackMargins.left} margin-right=${ctx.pvTrackMargins.right}></nightingale-sequence>
            ` : html`
              <protvista-pdb-ligand-seq height="44" length="${ctx.viewerData.length}" sequence="${ctx.viewerData.sequence}" margin-left=${ctx.pvTrackMargins.left} margin-right=${ctx.pvTrackMargins.right}></protvista-pdb-ligand-seq>
            `}
        </div>

    </div>`
        
}

export default PDBePvSeqSection;