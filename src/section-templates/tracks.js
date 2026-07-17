import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";
import "@nightingale-elements/nightingale-scrollbox";

function isAlwaysExpanded(trackData) {
    return trackData.alwaysExpanded === true;
}

function isSubtrackHidden(ctx, trackData, subtrackData) {
    return ctx.hiddenSubtracks?.[trackData.uuid]?.includes(subtrackData.uuid);
}

function addBorderClass(ctx, hasLabelColor, orAggregate) {
    const otherClass = orAggregate ? "aggregate-track-border" : "";
    return ctx.useDefaultStyles && hasLabelColor ? " non-aggregate-track-border" : otherClass;
}

function hasIn3DSubtrack(trackData) {
    return Array.isArray(trackData?.data) && trackData.data.some(item => item?.in3D);
}

function isTrackIn3DActive(ctx, trackData) {
    return Array.isArray(trackData?.data) &&
        trackData.data.some(item => item?.uuid === ctx.activeIn3DTrackUuid);
}

function isSubtrackIn3DActive(ctx, subtrackData) {
    return subtrackData?.uuid && subtrackData.uuid === ctx.activeIn3DTrackUuid;
}

function in3DButtonTemplate(ctx, trackData, subtrackData = null) {
    if (!ctx.enableIn3D) return ``;

    const hasIn3D = subtrackData
        ? subtrackData.in3D
        : hasIn3DSubtrack(trackData);

    if (!hasIn3D) return ``;

    const isActive = subtrackData
        ? isSubtrackIn3DActive(ctx, subtrackData)
        : isTrackIn3DActive(ctx, trackData);

    const uuidAttr = subtrackData?.uuid || "";

    return html`
        <span
            class="in3DTag${isActive ? " active" : ""}"
            data-in3d-uuid=${uuidAttr}
            title="View in 3D"
            @click=${e => {
                e.stopPropagation();

                if (subtrackData) {
                    ctx.layoutHelper.triggerIn3D(trackData, subtrackData, e.currentTarget);
                } else {
                    ctx.layoutHelper.triggerFirstIn3DForTrack(trackData, e.currentTarget);
                }
            }}
        >
            in 3D
        </span>
    `;
}

function subtrackRowTemplate(ctx, trackData, trackIndex, subtrackData, subtrackIndex, prefix = "main") {
    return html`
        <div
            class="protvistaRow pvSubtrackRow_${prefix}_${trackIndex}_${subtrackIndex}"
            data-track-for="subtrack-container"
            data-track-uuid=${subtrackData.uuid}
            data-track-prefix=${prefix}
            data-track-index=${trackIndex}
            data-subtrack-index=${subtrackIndex}
            style=${styleMap(isSubtrackHidden(ctx, trackData, subtrackData) ? {
                display: "none"
            } : {})}
        >
            <div
                class="protvistaCol1 track-label${addBorderClass(ctx, subtrackData.labelColor, false)}"
                style=${styleMap(ctx.useTrackStyles && subtrackData.labelColor ? {
                    backgroundColor: subtrackData.labelColor
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
                ${!isAlwaysExpanded(trackData) ? html`
                <span
                    class="icon icon-functional hideLabelIcon"
                    data-icon="x"
                    @click=${e => {
                        e.stopPropagation();
                        ctx.layoutHelper.hideSubTrack(trackIndex, subtrackIndex, trackData.uuid, subtrackData.uuid, prefix);
                    }}
                    title="Hide this section"
                ></span>
                ` : ``}

                <div
                    class="pvSubtrackLabel_${prefix}_${trackIndex}_${subtrackIndex} subtrackLabel"
                ></div>
                ${in3DButtonTemplate(ctx, trackData, subtrackData)}

                <span
                    class="icon icon-functional labelZoomIcon pvZoomIcon_${prefix}_${trackIndex}_${subtrackIndex}"
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
                class="protvistaCol2 track-content${addBorderClass(ctx, trackData.labelColor, false)}"
            >
                <protvista-pdb-track
                    .useDefaultStyles=${ctx.useDefaultStyles}
                    class="pvSubtrack_${prefix}_${trackIndex}"
                    data-track-for="subtrack"
                    data-track-uuid=${subtrackData.uuid}
                    data-track-prefix=${prefix}
                    data-track-index=${trackIndex}
                    data-subtrack-index=${subtrackIndex}
                    .data=${subtrackData.data || [subtrackData]}
                    .length=${ctx.viewerData.length}
                    .layout=${ctx.layoutHelper.getTrackLayout(subtrackData.overlapping)}
                    .height=${ctx.layoutHelper.getTrackHeight(subtrackData.length, subtrackData.overlapping)}
                    .display-start=${ctx.viewerData.displayStart || 1}
                    .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
                    .margin-left=${ctx.pvTrackMargins.left}
                    .margin-right=${ctx.pvTrackMargins.right}
                ></protvista-pdb-track>
            </div>
        </div>
    `;
}

function subtrackPlaceholderTemplate(ctx, trackData, trackIndex, subtrackData, subtrackIndex, prefix = "main") {
    return html`
        <div
            class="protvistaRow pvSubtrackRow_${prefix}_${trackIndex}_${subtrackIndex} pvSubtrackPlaceholder"
            data-track-for="subtrack-container"
            data-track-uuid=${subtrackData.uuid}
            data-track-prefix=${prefix}
            data-track-index=${trackIndex}
            data-subtrack-index=${subtrackIndex}
            style=${styleMap({
                height: `${ctx.layoutHelper.getTrackHeight(subtrackData.length, subtrackData.overlapping)}px`,
                ...(isSubtrackHidden(ctx, trackData, subtrackData)
                    ? { display: "none" }
                    : {})
            })}
        >
            <div
                class="protvistaCol1 track-label${addBorderClass(ctx, subtrackData.labelColor, false)}"
                style=${styleMap(ctx.useTrackStyles && subtrackData.labelColor ? {
                    backgroundColor: subtrackData.labelColor
                } : {})}
            >
                <div
                    class="pvSubtrackLabel_${prefix}_${trackIndex}_${subtrackIndex} subtrackLabel"
                ></div>
            </div>

            <div
                class="protvistaCol2 track-content${addBorderClass(ctx, trackData.labelColor, false)}"
            ></div>
        </div>
    `;
}

function PDBePvTracksSection(ctx, tracks = ctx.viewerData.tracks, prefix = "main") {
    if (tracks.length === 0) return '';
    return html`${tracks.map((trackData, trackIndex) => html`
        <div
            class="protvistaRow pvTrackRow pvTracks_${prefix}_${trackIndex}"
            data-track-for="track-container"
            data-track-uuid=${trackData.uuid}
            data-track-prefix=${prefix}
            data-track-index=${trackIndex}
        >
            <div
                class="protvistaCol1 category-label${addBorderClass(ctx, trackData.labelColor, false)} ${isAlwaysExpanded(trackData) ? "no-icon" : ""}"
                @click=${e => {
                    if (!isAlwaysExpanded(trackData)) ctx.layoutHelper.showSubtracks(trackIndex, trackData.uuid, prefix);
                }}
                style=${styleMap(ctx.useTrackStyles && trackData.labelColor ? {
                    backgroundColor: trackData.labelColor
                } : {})}
            >
                <span class="pvTrackLabel_${prefix}_${trackIndex}"></span>
                ${in3DButtonTemplate(ctx, trackData)}
                ${!isAlwaysExpanded(trackData) ? html`
                    <span
                        class="protvistaResetSectionIcon pvResetSection_${prefix}_${trackIndex}"
                        @click=${e => {
                            e.stopPropagation();
                            ctx.layoutHelper.resetSection(trackIndex, trackData.uuid, prefix);
                        }}
                        title="Reset section"
                    >
                        <i class="icon icon-functional" data-icon="R"></i>
                    </span>
                ` : ``}
            </div>

            <div
                class="protvistaCol2 aggregate-track-content${addBorderClass(ctx, trackData.labelColor, true)}"
            >
                <protvista-pdb-track
                    class="pvTrack"
                    .useDefaultStyles=${ctx.useDefaultStyles}
                    data-track-for="track"
                    data-track-uuid=${trackData.uuid}
                    data-track-prefix=${prefix}
                    data-track-index=${trackIndex}
                    .data=${trackData.data}
                    .length=${ctx.viewerData.length}
                    .layout=${ctx.layoutHelper.getTrackLayout(trackData.overlapping)}
                    .height=${ctx.layoutHelper.getTrackHeight(trackData.length, trackData.overlapping)}
                    .display-start=${ctx.viewerData.displayStart || 1}
                    .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
                    .margin-left=${ctx.pvTrackMargins.left}
                    .margin-right=${ctx.pvTrackMargins.right}
                ></protvista-pdb-track>
            </div>
        </div>

        <div
            class="protvistaRowGroup pvSubtracks_${prefix}_${trackIndex} ${isAlwaysExpanded(trackData) ? 'noMaxHeight' : ''}"
            data-track-for="track-scrollbox-container"
            data-track-uuid=${trackData.uuid}
            data-track-prefix=${prefix}
            data-track-index=${trackIndex}
            style=${styleMap(isAlwaysExpanded(trackData)
                    ? { display: "block" }
                    : {}
                )}
        >
            <nightingale-scrollbox
                class="pvSubtrackScrollbox pvSubtrackScrollbox_${prefix}_${trackIndex} ${isAlwaysExpanded(trackData) ? 'noMaxHeight' : ''}"
                root-margin="300px"
                disable-scroll-with-ctrl
            >
                ${trackData.data.map((subtrackData, subtrackIndex) => html`
                    <nightingale-scrollbox-item
                        class="pvScrollboxItem pvScrollboxItem_${prefix}_${trackIndex}_${subtrackIndex}"
                        data-track-for="track-scrollbox"
                        data-track-uuid=${trackData.uuid}
                        data-subtrack-uuid=${subtrackData.uuid}
                        data-track-prefix=${prefix}
                        data-track-index=${trackIndex}
                        data-subtrack-index=${subtrackIndex}
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
                                subtrackIndex,
                                prefix
                            ),
                            renderHidden: () => subtrackPlaceholderTemplate(
                                ctx,
                                trackData,
                                trackIndex,
                                subtrackData,
                                subtrackIndex,
                                prefix
                            )
                        }}
                    >
                        ${subtrackPlaceholderTemplate(
                            ctx,
                            trackData,
                            trackIndex,
                            subtrackData,
                            subtrackIndex,
                            prefix,
                        )}
                    </nightingale-scrollbox-item>
                `)}
            </nightingale-scrollbox>
        </div>
    `)}`;
}

export default PDBePvTracksSection;