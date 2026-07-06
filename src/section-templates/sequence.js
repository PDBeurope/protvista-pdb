import { html } from "lit";

function PDBePvSeqSection(ctx) {
    return html `<div class="protvistaRow">
                    
        <!-- Top Menu Toolbar -->
        <div class="protvistaCol1">&nbsp;</div>

        <!-- Navigation Component -->
        <div class="protvistaCol2 pvSeqSection">
            <nightingale-sequence length="${ctx.viewerData.length}" sequence="${ctx.viewerData.sequence}"></nightingale-sequence>
        </div>

    </div>`
        
}

export default PDBePvSeqSection;