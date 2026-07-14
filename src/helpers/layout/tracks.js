/**
 * helpers/layout/tracks.js
 * 
 * In this file: track expand/hide/reset
 * 
 * bindTrackData
 * bindSingleSubtrackData
 * showSubtracks
 * hideSubTrack
 * hideSection
 * showSection
 * resetSection
 * */

export default {

  bindTrackData(scrollbarWidthVal) {
    let trackSelector = ".pvTrack";
    let trackEles = this.ctx.querySelectorAll(trackSelector);

    if (trackEles && trackEles.length > 0) {
      trackEles.forEach((trackEle, _) => {
        const trackUuid = trackEle.dataset.trackUuid;

        const trackRow = this.ctx.querySelector(
          `[data-track-for="track"][data-track-uuid="${trackUuid}"]`,
        );

        const prefix = trackRow?.dataset.trackPrefix ?? "main";
        const domTrackIndex = Number(trackRow?.dataset.trackIndex ?? 0);

        let trackModel = this.ctx.getDataByUuid(trackUuid);

        //Add label
        let labelDetails = this.getLabel(
          trackModel.labelType,
          trackModel.label,
        );

        let labelSelector = `.pvTrackLabel_${prefix}_${domTrackIndex}`;
        let labelEle = this.ctx.querySelector(labelSelector);

        const inlineLinkStyle = this.ctx.useDefaultStyles
          ? ' style="border-bottom:none;margin-left:5px;box-shadow:none;"'
          : "";

        if (labelDetails === "Secondary structure variation") {
          labelDetails += `<a href="https://github.com/PDBe-KB/pdbe-kb-manual/wiki/Secondary-structure-variance" target="_blank" ${inlineLinkStyle} title="Documentation link">
                <i class="icon icon-generic" data-icon="x"></i>
              </a>`;
        }

        if (labelDetails === "Simulated RSA classes (MDposit)") {
          const uniProtId = trackModel?.uniProtId;
          if (uniProtId) {
            labelDetails += `<a href='https://mdposit.mddbr.eu/#/pointer?ref=proteins&id=${uniProtId}' target='_blank' ${inlineLinkStyle}>
              ${uniProtId}
              <i class="icon icon-generic" data-icon="x"></i></a>`;
          }
        }

        if (labelEle) labelEle.innerHTML = labelDetails;

        let trackData = trackModel.data;

        trackEle.data = trackData;
        trackEle.parentNode.style.paddingRight = scrollbarWidthVal + "px";

        // TODO: Conditional first expanded
        const firstExpandable = this.ctx
          .getAllTrackCollections()
          .find(
            ({ prefix: p, trackData }) =>
              p === prefix &&
              !trackData.alwaysExpanded,
          );

        if (
          firstExpandable &&
          firstExpandable.trackIndex === domTrackIndex
        ) {
          const firstTrack = this.ctx.querySelector(
            `[data-track-for="track-container"][data-track-prefix="${prefix}"][data-track-index="${domTrackIndex}"]`,
          );

          if (firstTrack) {
            firstTrack.classList.add("expanded");
            firstTrack.querySelectorAll(".pvTrack")[0].style.display = "none";
          }

          const firstSubtracks = this.ctx.querySelector(
            `.pvSubtracks_${prefix}_${domTrackIndex}`,
          );

          if (firstSubtracks) {
            firstSubtracks.style.display = "block";
          }

          this.initScrollboxes();
          this.ctx.formattedSubTracks.push(trackUuid);
        }
      });
    }
  },


  bindSingleSubtrackData(trackIndex, subtrackIndex, subTrackUuid, prefix="main") {
    const trackEle = this.ctx.querySelector(
      `.pvSubtrackRow_${prefix}_${trackIndex}_${subtrackIndex} protvista-pdb-track`,
    );

    if (!trackEle) return;

    const trackModel = this.ctx.getDataByUuid(subTrackUuid);

    trackEle.data = trackModel.data || [trackModel];
    trackEle.length = this.ctx.viewerData.length;
    trackEle.layout = this.getTrackLayout(trackModel.overlapping);
    trackEle.height = this.getTrackHeight(
      trackModel.length,
      trackModel.overlapping,
    );
    trackEle["display-start"] = this.ctx.viewerData.displayStart || 1;
    trackEle["display-end"] =
      this.ctx.viewerData.displayEnd || this.ctx.viewerData.length;

    const labelSelector = `.pvSubtrackLabel_${prefix}_${trackIndex}_${subtrackIndex}`;
    const labelEle = this.ctx.querySelector(labelSelector);

    if (labelEle) {
      labelEle.innerHTML = this.getLabel(
        trackModel.labelType,
        trackModel.label,
      );
    }
  },

  showSubtracks(trackIndex, trackUuid, prefix = "main") {
    const subTrackEle = this.ctx.querySelector(
      `.pvSubtracks_${prefix}_${trackIndex}`,
    );

    const trackEle = this.ctx.querySelector(
      `.pvTracks_${prefix}_${trackIndex}`,
    );

    if (!subTrackEle || !trackEle) return;

    if (trackEle.classList.contains("expanded")) {
      subTrackEle.style.display = "none";
      trackEle.querySelector(".pvTrack").style.display = "block";
      trackEle.classList.remove("expanded");
    } else {
      trackEle.querySelector(".pvTrack").style.display = "none";
      subTrackEle.style.display = "block";

      if (this.ctx.formattedSubTracks.indexOf(trackUuid) === -1) {
        this.initScrollboxes();
        this.ctx.formattedSubTracks.push(trackUuid);
      }

      trackEle.classList.add("expanded");
    }
  },

  hideSubTrack(
    trackIndex,
    subtrackIndex,
    trackUuid,
    subtrackUuid,
    prefix = "main",
  ) {
    const trackData = this.ctx.getDataByUuid(trackUuid);
    const subtrackData = this.ctx.getDataByUuid(subtrackUuid);

    if (!trackData?.uuid || !subtrackData?.uuid) return;

    if (!Array.isArray(this.ctx.hiddenSubtracks[trackData.uuid])) {
      this.ctx.hiddenSubtracks[trackData.uuid] = [];
    }

    if (!this.ctx.hiddenSubtracks[trackData.uuid].includes(subtrackData.uuid)) {
      this.ctx.hiddenSubtracks[trackData.uuid].push(subtrackData.uuid);
    }

    const row = this.ctx.querySelector(
      `.pvSubtrackRow_${prefix}_${trackIndex}_${subtrackIndex}`,
    );

    if (row) {
      row.style.display = "none";
    }

    const resetButton = this.ctx.querySelector(
      `.pvResetSection_${prefix}_${trackIndex}`,
    );

    if (resetButton) {
      resetButton.style.display = "inline-block";
    }

    if (
      this.ctx.hiddenSubtracks[trackData.uuid].length === trackData.data.length
    ) {
      this.hideSection(trackIndex, trackUuid, prefix);
    }
  },

  hideSection(trackIndexOrType, trackUuid = null, prefix = "main") {
    const trackClasses = [];

    if (trackUuid) {
      const trackData = this.ctx.getDataByUuid(trackUuid);

      trackClasses.push(
        `.pvTracks_${prefix}_${trackIndexOrType}`,
        `.pvSubtracks_${prefix}_${trackIndexOrType}`,
      );
    } else {
      switch (trackIndexOrType) {
        case "conservation":
          trackClasses.push(".pvConsHistoRow", ".pvConservationPlotRow");
          break;

        case "variation":
          trackClasses.push(".pvVariantGraphRow", ".pvVariantPlotRow");
          break;

        case "boxplot":
          trackClasses.push(".pvBoxplotGraphRow", ".pvBoxplotDetailRow");
          break;

        default:
          return;
      }
    }

    trackClasses.forEach((selector) => {
      const element = this.ctx.querySelector(selector);
      if (element) {
        element.style.display = "none";
      }
    });

    const key = trackUuid ? `${prefix}:${trackUuid}` : trackIndexOrType;

    if (!this.ctx.hiddenSections.includes(key)) {
      this.ctx.hiddenSections.push(key);
    }
  },

  showSection(trackIndexOrType, trackUuid = null, prefix = "main") {
    if (trackUuid) {
      const trackData = this.ctx.getDataByUuid(trackUuid);

      if (!trackData) return;

      const subtracks = this.ctx.querySelector(
        `.pvSubtracks_${prefix}_${trackIndexOrType}`,
      );
      if (subtracks) {
        subtracks.style.display = "block";
      }
      if (
        this.ctx.hiddenSubtracks[trackUuid]?.length === trackData.data.length
      ) {
        this.resetSection(trackIndexOrType, trackUuid, prefix);
      }
      
      const track = this.ctx.querySelector(
        `.pvTracks_${prefix}_${trackIndexOrType}`,
      );
      if (track) {
        track.style.display = "table";

        if (track.classList.contains("expanded")) {
          const subtracks = this.ctx.querySelector(
            `.pvSubtracks_${prefix}_${trackIndexOrType}`,
          );

          if (subtracks) {
            subtracks.style.display = "block";
          }

          if (
            this.ctx.hiddenSubtracks[trackUuid]?.length ===
            trackData.data.length
          ) {
            this.resetSection(trackIndexOrType, trackUuid, prefix);
          }
        }
      }
    } else {
      switch (trackIndexOrType) {
        case "conservation": {
          const histo = this.ctx.querySelector(".pvConsHistoRow");
          const plot = this.ctx.querySelector(".pvConservationPlotRow");

          if (histo) histo.style.display = "table";
          if (plot) plot.style.display = "block";
          break;
        }

        case "variation": {
          const graph = this.ctx.querySelector(".pvVariantGraphRow");
          const plot = this.ctx.querySelector(".pvVariantPlotRow");

          if (graph) graph.style.display = "table";
          if (plot) plot.style.display = "block";
          break;
        }

        case "boxplot": {
          const graph = this.ctx.querySelector(".pvBoxplotGraphRow");
          const detail = this.ctx.querySelector(".pvBoxplotDetailRow");

          if (graph) graph.style.display = "table";
          if (detail) detail.style.display = "block";
          break;
        }

        default:
          return;
      }
    }

    const key = trackUuid ? `${prefix}:${trackUuid}` : trackIndexOrType;

    this.ctx.hiddenSections = this.ctx.hiddenSections.filter(
      (hidden) => hidden !== key,
    );
  },

  resetSection(trackIndex, trackUuid, prefix = "main") {
    const trackData = this.ctx.getDataByUuid(trackUuid);

    if (!trackData?.uuid) return;

    const resetButton = this.ctx.querySelector(
      `.pvResetSection_${prefix}_${trackIndex}`,
    );

    if (resetButton) {
      resetButton.style.display = "none";
    }

    trackData.data.forEach((_, subtrackIndex) => {
      const row = this.ctx.querySelector(
        `.pvSubtrackRow_${prefix}_${trackIndex}_${subtrackIndex}`,
      );

      if (row) {
        row.style.display = "table";
      }
    });

    delete this.ctx.hiddenSubtracks[trackData.uuid];
  },
};