const { html } = require("lit-html")

function PDBePvSeqSection(ctx) {
    return html `<div class="protvistaRow">
                    
        <!-- Top Menu Toolbar -->
        <div class="protvistaCol1">&nbsp;</div>

        <!-- Navigation Component -->
        <div class="protvistaCol2 pvSeqSection">
            <protvista-sequence length="${ctx.viewerData.length}" sequence="${ctx.viewerData.sequence}"></protvista-sequence>
        </div>

    </div>`
        
}

export default PDBePvSeqSection;