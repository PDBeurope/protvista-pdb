const { html } = require("lit-html")

function PDBePvNavSection(ctx) {
    return html `<div class="protvistaRow">
                    
        <!-- Top Menu Toolbar -->
        <div class="protvistaCol1 protvistaToolbar" style="position:relative">
            <span class="protvistaToolbarIcon" @click=${e => ctx.layoutHelper.resetView()} title="Reset view">
                <i class="icon icon-functional" data-icon="R"></i>
            </span>

            <!-- View / highlight menu -->
            <span class="protvistaToolbarIcon" title="View / highlight region" @click=${e => ctx.layoutHelper.openRangeMenu()}>
                <i class="icon icon-generic" data-icon="["></i>
            </span>
            <div class="rangeMenu viewMenuBox" style="display:none">
                <div class="protvistaRangeMenuTitle">
                    <div>View region</div>
                    <span class="icon icon-functional protvistaMenuClose" data-icon="x" title="close" @click=${e => {e.stopPropagation();ctx.layoutHelper.openRangeMenu()}}></span>
                </div>
                <div class="protvistaForm rangeForm" style="width:170px;">
                    <div style="float:left;width:48%;">
                        From <br>
                        <input type="number" class="pvRangeMenuStart" value="0" style="display:inline-block;margin:0;" min="1" max="${ctx.viewerData.length}" step="1" />
                    </div>
                    <div style="float:right;width:48%;">
                        To <br>
                        <input type="number" class="pvRangeMenuEnd" value="0" style="display:inline-block;margin:0;" min="1" max="${ctx.viewerData.length}" step="1" /> <br><br>
                    </div>
                    <div style="margin:0 0 10px 0;clear:both;">
                        <input type="checkbox" class="pvRangeMenuHighlight" /> highlight-only
                    </div>                                
                    <button class="button tiny" style="margin:0; letter-spacing: 1px;" @click=${e => ctx.layoutHelper.pvRangeMenuSubmit()}>Submit</button>
                </div>
            </div>
            <!-- View / highlight menu -->

            <!-- Track categories settings menu -->
            <span class="protvistaToolbarIcon" title="Hide sections" @click=${e => ctx.layoutHelper.openCategorySettingsMenu()}>
                <i class="icon icon-functional" data-icon="M"></i>
            </span>
            <div class="settingsMenu viewMenuBox" style="display:none">
                <div class="protvistaRangeMenuTitle">
                    <div>Hide sections</div>
                    <span class="icon icon-functional protvistaMenuClose" data-icon="x" title="close" @click=${e => {e.stopPropagation();ctx.layoutHelper.openCategorySettingsMenu()}}></span>
                </div>
                <div class="protvistaForm rangeForm" style="width:215px;max-height:400px;">
                    <table style="font-size:inherit;margin-bottom:0" class="pvHideOptionsTable">
                        <tbody>
                        ${ctx.viewerData.tracks.map((trackData, trackIndex) => html`
                            <tr>
                            <td style="width:10%;vertical-align:top;">
                                <input type="checkbox" class="pvSectionChkBox" name="cb_${trackIndex}" style="margin:0" />
                            </td>
                            <td style="padding-bottom:5px;">
                                ${trackData.label}
                            </td>
                            </tr>
                        `)}
                        <tr style="display:none" class="scOption"></tr>
                        <tr style="display:none" class="variationOption"></tr>
                        </tbody>
                    </table>
                    <br>
                    <button class="button tiny" style="margin:0; letter-spacing: 1px;" @click=${e => ctx.layoutHelper.pvCategorySettingsMenuSubmit()}>Submit</button>
                </div>
            </div>
            <!-- Track categories settings menu -->
        </div>

        <!-- Navigation Component -->
        <div class="protvistaCol2 pvNavSection">
            <protvista-pdb-navigation length="${ctx.viewerData.length}" offset="${ctx.viewerData.offset}" ></protvista-pdb-navigation>
        </div>

    </div>`
        
}

export default PDBePvNavSection;