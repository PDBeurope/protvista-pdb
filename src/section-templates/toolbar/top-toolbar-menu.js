import { html } from "lit";

export function PDBePvToolbar(ctx) {
    return html`
        <!-- Reset view icon -->
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
            <div class="protvistaForm rangeForm">
                <div class="left">
                    From <br>
                    <input type="number" class="pvRangeMenu pvRangeMenuStart" value="0" min="1" max="${ctx.viewerData.length}" step="1" />
                </div>
                <div class="right">
                    To <br>
                    <input type="number" class="pvRangeMenu pvRangeMenuEnd" value="0" min="1" max="${ctx.viewerData.length}" step="1" /> <br><br>
                </div>
                <div class="highlight">
                    <input type="checkbox" class="pvRangeMenuHighlight" /> highlight-only
                </div>                                
                <button class="button tiny pvSmallOptionsBtn" @click=${e => ctx.layoutHelper.pvRangeMenuSubmit()}>Submit</button>
            </div>
        </div>

        <!-- Track categories settings menu -->
        <span class="protvistaToolbarIcon" title="Hide sections" @click=${e => ctx.layoutHelper.openCategorySettingsMenu()}>
            <i class="icon icon-functional" data-icon="M"></i>
        </span>
        <div class="settingsMenu viewMenuBox" style="display:none">
            <div class="protvistaRangeMenuTitle">
                <div>Hide sections</div>
                <span class="icon icon-functional protvistaMenuClose" data-icon="x" title="close" @click=${e => {e.stopPropagation();ctx.layoutHelper.openCategorySettingsMenu()}}></span>
            </div>
            <div class="protvistaForm checkForm">
                <table class="pvHideOptionsTable">
                    <tbody>
                    ${ctx.getAllHideableSections().map(section => html`
                    <tr>
                        <td class="pvChkBoxTd">
                            <input
                                type="checkbox"
                                class="pvSectionChkBox"
                                data-section-type=${section.type}
                                data-track-uuid=${section.trackUuid ?? ""}
                                data-track-prefix=${section.prefix ?? ""}
                                data-track-index=${section.trackIndex ?? ""}
                            />
                        </td>
                        <td class="pvChkBoxLabelTd">
                            ${section.label}
                        </td>
                    </tr>
                    `)}
                    <tr style="display:none" class="scOption"></tr>
                    <tr style="display:none" class="variationOption"></tr>
                    </tbody>
                </table>
                <br>
                <button class="button tiny pvSmallOptionsBtn" @click=${e => ctx.layoutHelper.pvCategorySettingsMenuSubmit()}>Submit</button>
            </div>
        </div>
    `
}