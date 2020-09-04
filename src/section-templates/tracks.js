const { html } = require("lit-html");
import { styleMap } from 'lit-html/directives/style-map.js';

function PDBePvTracksSection(ctx) {
    return html `${ctx.viewerData.tracks.map((trackData, trackIndex) => html`
        <div class="protvistaRow pvTrackRow pvTracks_${trackIndex}">
            <div class="protvistaCol1 category-label" data-label-index="${trackIndex}" @click=${e => ctx.layoutHelper.showSubtracks(trackIndex)} 
            style=${styleMap(trackData.labelColor ? {backgroundColor: trackData.labelColor, borderBottom: '1px solid lightgrey'} : {})}>
                <span class="pvTrackLabel_${trackIndex}"></span>
                <span class="protvistaResetSectionIcon pvResetSection_${trackIndex}" @click=${e => {e.stopPropagation();ctx.layoutHelper.resetSection(trackIndex)}} title="Reset section">
                <i class="icon icon-functional" data-icon="R"></i>
                </span>
            </div>
            <div class="protvistaCol2 aggregate-track-content" style=${styleMap(trackData.labelColor ? {borderBottom: '1px solid lightgrey'} : {})}>
                <protvista-pdb-track class="pvTrack" length="${ctx.viewerData.length}" layout="${ctx.layoutHelper.getTrackLayout(trackData.overlapping)}" height="${ctx.layoutHelper.getTrackHeight(trackData.length, trackData.overlapping)}"></protvista-pdb-track>
            </div>
        </div>
        <!-- Subtrack Rows Start -->
        <div class="protvistaRowGroup pvSubtracks_${trackIndex}">
            ${trackData.data.map((subtrackData, subtrackIndex) => html`
                <div class="protvistaRow pvSubtrackRow_${trackIndex}_${subtrackIndex}">
                    <div class="protvistaCol1 track-label" style=${styleMap(subtrackData.labelColor ? {backgroundColor: subtrackData.labelColor, borderBottom: '1px solid lightgrey'} : {})}
                    @mouseover=${e => {e.stopPropagation();ctx.layoutHelper.showLabelTooltip(e)}} @mouseout=${e => {e.stopPropagation();ctx.layoutHelper.hideLabelTooltip()}}>
                        <span class="icon icon-functional hideLabelIcon" data-icon="x" @click=${e => {e.stopPropagation();ctx.layoutHelper.hideSubTrack(trackIndex, subtrackIndex)}} 
                        title="Hide this section"></span> 
                        <div class="pvSubtrackLabel_${trackIndex}_${subtrackIndex}" style="word-break: break-all;"></div>
                        <span class="icon icon-functional labelZoomIcon pvZoomIcon_${trackIndex}_${subtrackIndex}" data-icon="T" @click="${e => { ctx.layoutHelper.zoomTrack({start:1, end: null, trackData: subtrackData}, trackIndex+'_'+subtrackIndex); }}
                        title="Click to zoom-out this section"></span>

                        ${subtrackData.labelTooltip ? html`
                            <span class="labelTooltipContent" style="display:none;">${subtrackData.labelTooltip}</span>
                        ` : ``}
                    </div>
                    <div class="protvistaCol2 track-content" style=${styleMap(trackData.labelColor ? {borderBottom: '1px solid lightgrey'} : {})}>
                        <protvista-pdb-track class="pvSubtrack_${trackIndex}" length="${ctx.viewerData.length}" layout="${ctx.layoutHelper.getTrackLayout(subtrackData.overlapping)}" height="${ctx.layoutHelper.getTrackHeight(subtrackData.length, subtrackData.overlapping)}"></protvista-pdb-track>
                    </div>
                </div>`
            )}
        </div>
        <!-- Subrack Rows End -->
    `)}`
        
}

export default PDBePvTracksSection;