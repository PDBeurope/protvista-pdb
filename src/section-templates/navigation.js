import { html } from "lit";
import { PDBePvToolbar } from "./top-toolbar-menu";

function PDBePvNavSection(ctx) {
    return html`<div class="protvistaRow">
                    
        <!-- Top Menu Toolbar -->
        <div class="protvistaCol1 protvistaToolbar">
            ${PDBePvToolbar(ctx)}
        </div>

        <!-- Navigation Component -->
        <div class="protvistaCol2 pvNavSection">
            <protvista-pdb-navigation
                height="44"
                length=${ctx.viewerData.length}
                offset=${ctx.viewerData.offset || 0}
                display-start=${1}
                display-end=${ctx.viewerData.length}
                margin-left=${ctx.pvTrackMargins.left}
                margin-right=${ctx.pvTrackMargins.right}
            </protvista-pdb-navigation>
        </div>

    </div>`;
}

export default PDBePvNavSection;