/**
 * helpers/layout/in3d.js
 * 
 * In this file: all In3D logic
 * 
 * triggerFirstIn3DForTrack
 * triggerIn3D
 * updateIn3DButtonState
 * postProcessIn3D
 * findFirstIn3DSubtrack
 * */
export default {

  triggerFirstIn3DForTrack(trackData, sourceElement) {
    const firstIn3DSubtrack = trackData?.data?.find((item) => item?.in3D);

    if (!firstIn3DSubtrack) return;

    this.triggerIn3D(trackData, firstIn3DSubtrack, sourceElement);
  },

  triggerIn3D(trackData, subtrackData, sourceElement) {
    if (!this.ctx.enableIn3D || !subtrackData?.in3D) return;

    const previousUuid = this.ctx.activeIn3DTrackUuid || null;
    const nextUuid = subtrackData.uuid;

    if (!nextUuid) return;

    this.ctx.activeIn3DTrackUuid = nextUuid;

    this.updateIn3DButtonState(previousUuid, nextUuid);

    this.ctx.dispatchEvent(
      new CustomEvent("protvista-pdb-in3d", {
        bubbles: true,
        composed: true,
        detail: {
          activeTrackUuid: nextUuid,
          previousTrackUuid: previousUuid,
          track: trackData,
          subtrack: subtrackData,
          sourceElement,
          accession: this.ctx._accession,
          entryId: this.ctx._entryId,
          entityId: this.ctx._entityId,
        },
      }),
    );
  },

  updateIn3DButtonState(previousUuid, nextUuid) {
    this.ctx.querySelectorAll(".in3DTag.active").forEach((element) => {
      element.classList.remove("active");
    });

    if (!nextUuid) return;

    this.ctx
      .querySelectorAll(`[data-in3d-uuid="${nextUuid}"]`)
      .forEach((element) => {
        element.classList.add("active");
      });

    this.ctx.getAllTrackCollections().forEach(
      ({ prefix, trackIndex, trackData }) => {
        const isParentActive = trackData.data?.some(
          (subtrackData) => subtrackData.uuid === nextUuid,
        );

        const parentRow = this.ctx.querySelector(
          `[data-track-for="track-container"][data-track-prefix="${prefix}"][data-track-index="${trackIndex}"]`,
        );

        if (!parentRow) return;

        const parentButton = parentRow.querySelector(".in3DTag");

        if (parentButton) {
          parentButton.classList.toggle("active", Boolean(isParentActive));
        }
      },
    );
  },

  postProcessIn3D() {
    if (!this.ctx.enableIn3D || !this.ctx.triggerFirstIn3D) return;
    if (this.ctx.activeIn3DTrackUuid) return;
    if (this.ctx._firstIn3DTriggered) return;

    const first = this.findFirstIn3DSubtrack();

    if (!first) return;

    this.ctx._firstIn3DTriggered = true;

    requestAnimationFrame(() => {
      this.triggerIn3D(first.trackData, first.subtrackData, this.ctx);
    });
  },

  findFirstIn3DSubtrack() {
    for (const { prefix, trackIndex, trackData } of this.ctx.getAllTrackCollections()) {
      if (!Array.isArray(trackData.data)) continue;

      for (
        let subtrackIndex = 0;
        subtrackIndex < trackData.data.length;
        subtrackIndex++
      ) {
        const subtrackData = trackData.data[subtrackIndex];

        if (subtrackData?.in3D) {
          return {
            prefix,
            trackData,
            subtrackData,
            trackIndex,
            subtrackIndex,
          };
        }
      }
    }

    return null;
  }
}