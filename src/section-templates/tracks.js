import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@nightingale-elements/nightingale-scrollbox";

function subtrackRowTemplate(ctx, trackData, trackIndex, subtrackData, subtrackIndex) {
    return html`
        <div class="protvistaRow pvSubtrackRow_${trackIndex}_${subtrackIndex}">
            <div
                class="protvistaCol1 track-label"
                style=${styleMap(subtrackData.labelColor ? {
                    backgroundColor: subtrackData.labelColor,
                    borderBottom: "1px solid lightgrey"
                } : {})}
                @mouseover=${e => {
                    e.stopPropagation();
                    ctx.layoutHelper.showLabelTooltip(e);
                }}
                @mouseout=${e => {
                    e.stopPropagation();
                    ctx.layoutHelper.hideLabelTooltip();
                }}
            >
                <span
                    class="icon icon-functional hideLabelIcon"
                    data-icon="x"
                    @click=${e => {
                        e.stopPropagation();
                        ctx.layoutHelper.hideSubTrack(trackIndex, subtrackIndex);
                    }}
                    title="Hide this section"
                ></span>

                <div
                    class="pvSubtrackLabel_${trackIndex}_${subtrackIndex}"
                    style="word-break: break-all;"
                ></div>

                <span
                    class="icon icon-functional labelZoomIcon pvZoomIcon_${trackIndex}_${subtrackIndex}"
                    data-icon="T"
                    @click=${e => {
                        ctx.layoutHelper.zoomTrack(
                            {
                                start: 1,
                                end: null,
                                trackData: subtrackData
                            },
                            trackIndex + "_" + subtrackIndex
                        );
                    }}
                    title="Click to zoom-out this section"
                ></span>

                ${subtrackData.labelTooltip ? html`
                    <span class="labelTooltipContent" style="display:none;">
                        ${subtrackData.labelTooltip}
                    </span>
                ` : ``}
            </div>

            <div
                class="protvistaCol2 track-content"
                style=${styleMap(trackData.labelColor ? {
                    borderBottom: "1px solid lightgrey"
                } : {})}
            >
                <protvista-pdb-track
                    class="pvSubtrack_${trackIndex}"
                    .data=${subtrackData.data || [subtrackData]}
                    .length=${ctx.viewerData.length}
                    .layout=${ctx.layoutHelper.getTrackLayout(subtrackData.overlapping)}
                    .height=${ctx.layoutHelper.getTrackHeight(subtrackData.length, subtrackData.overlapping)}
                    .display-start=${ctx.viewerData.displayStart || 1}
                    .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
                ></protvista-pdb-track>
            </div>
        </div>
    `;
}

function subtrackPlaceholderTemplate(ctx, trackData, trackIndex, subtrackData, subtrackIndex) {
    return html`
        <div
            class="protvistaRow pvSubtrackRow_${trackIndex}_${subtrackIndex} pvSubtrackPlaceholder"
            style="height:${ctx.layoutHelper.getTrackHeight(subtrackData.length, subtrackData.overlapping)}px;"
        >
            <div
                class="protvistaCol1 track-label"
                style=${styleMap(subtrackData.labelColor ? {
                    backgroundColor: subtrackData.labelColor,
                    borderBottom: "1px solid lightgrey"
                } : {})}
            >
                <div
                    class="pvSubtrackLabel_${trackIndex}_${subtrackIndex}"
                    style="word-break: break-all;"
                ></div>
            </div>

            <div
                class="protvistaCol2 track-content"
                style=${styleMap(trackData.labelColor ? {
                    borderBottom: "1px solid lightgrey"
                } : {})}
            ></div>
        </div>
    `;
}

function PDBePvTracksSection(ctx) {
    return html`${ctx.viewerData.tracks.map((trackData, trackIndex) => html`
        <div class="protvistaRow pvTrackRow pvTracks_${trackIndex}">
            <div
                class="protvistaCol1 category-label"
                data-label-index="${trackIndex}"
                @click=${e => ctx.layoutHelper.showSubtracks(trackIndex)}
                style=${styleMap(trackData.labelColor ? {
                    backgroundColor: trackData.labelColor,
                    borderBottom: "1px solid lightgrey"
                } : {})}
            >
                <span class="pvTrackLabel_${trackIndex}"></span>
                <span
                    class="protvistaResetSectionIcon pvResetSection_${trackIndex}"
                    @click=${e => {
                        e.stopPropagation();
                        ctx.layoutHelper.resetSection(trackIndex);
                    }}
                    title="Reset section"
                >
                    <i class="icon icon-functional" data-icon="R"></i>
                </span>
            </div>

            <div
                class="protvistaCol2 aggregate-track-content"
                style=${styleMap(trackData.labelColor ? {
                    borderBottom: "1px solid lightgrey"
                } : {})}
            >
                <protvista-pdb-track
                    class="pvTrack"
                    .data=${trackData.data}
                    .length=${ctx.viewerData.length}
                    .layout=${ctx.layoutHelper.getTrackLayout(trackData.overlapping)}
                    .height=${ctx.layoutHelper.getTrackHeight(trackData.length, trackData.overlapping)}
                    .display-start=${ctx.viewerData.displayStart || 1}
                    .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
                ></protvista-pdb-track>
            </div>
        </div>

        <div class="protvistaRowGroup pvSubtracks_${trackIndex}">
            <nightingale-scrollbox
                class="pvSubtrackScrollbox pvSubtrackScrollbox_${trackIndex}"
                root-margin="300px"
                disable-scroll-with-ctrl
            >
                ${trackData.data.map((subtrackData, subtrackIndex) => html`
                    <nightingale-scrollbox-item
                        class="pvScrollboxItem pvScrollboxItem_${trackIndex}_${subtrackIndex}"
                        .data=${{
                            ctx,
                            trackData,
                            trackIndex,
                            subtrackData,
                            subtrackIndex,
                            renderVisible: () => subtrackRowTemplate(
                                ctx,
                                trackData,
                                trackIndex,
                                subtrackData,
                                subtrackIndex
                            ),
                            renderHidden: () => subtrackPlaceholderTemplate(
                                ctx,
                                trackData,
                                trackIndex,
                                subtrackData,
                                subtrackIndex
                            )
                        }}
                    >
                        ${subtrackPlaceholderTemplate(
                            ctx,
                            trackData,
                            trackIndex,
                            subtrackData,
                            subtrackIndex
                        )}
                    </nightingale-scrollbox-item>
                `)}
            </nightingale-scrollbox>
        </div>
    `)}`;
}

export default PDBePvTracksSection;