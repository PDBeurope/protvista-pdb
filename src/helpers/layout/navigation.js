/**
 * helpers/layout/navigation.js
 * 
 * In this file: range menu + hide sections menu
 * 
 * openRangeMenu
 * pvRangeMenuSubmit
 * openCategorySettingsMenu
 * pvCategorySettingsMenuSubmit
 * resetView
 * */
export default {
  openRangeMenu() {
    //Close other open menus
    this.ctx.querySelector(".settingsMenu").style.display = "none";

    let menuBox = this.ctx.querySelector(`.rangeMenu`);
    if (menuBox.style.display == "none") {
      let startEle = this.ctx.querySelector(".pvRangeMenuStart");
      let endEle = this.ctx.querySelector(".pvRangeMenuEnd");

      if (startEle.value == 0 || endEle.value == 0) {
        let currentStartVal = 1;
        let currentEndVal = this.ctx.viewerData.length;

        let navEle = this.ctx.querySelectorAll(".pvTrack")[0];
        if (navEle) {
          currentStartVal = navEle.getAttribute("display-start");
          currentEndVal = navEle.getAttribute("display-end");
        }

        startEle.value = Math.round(currentStartVal);
        endEle.value = Math.round(currentEndVal);
      }

      menuBox.style.display = "block";
    } else {
      menuBox.style.display = "none";
    }
  },

  openCategorySettingsMenu() {
    // Close other open menus
    this.ctx.querySelector(".rangeMenu").style.display = "none";

    const menuBox = this.ctx.querySelector(".settingsMenu");

    if (menuBox.style.display == "none") {
      menuBox.querySelectorAll(".pvSectionChkBox").forEach((chkBox) => {
        const type = chkBox.getAttribute("data-section-type");

        if (type === "track") {
          const trackUuid = chkBox.getAttribute("data-track-uuid");
          const prefix = chkBox.getAttribute("data-track-prefix");
          const key = `${prefix}:${trackUuid}`;

          chkBox.checked = this.ctx.hiddenSections.includes(key);
        } else {
          chkBox.checked = this.ctx.hiddenSections.includes(type);
        }
      });

      menuBox.style.display = "block";
    } else {
      menuBox.style.display = "none";
    }
  },

  pvRangeMenuSubmit() {
    let startVal = this.ctx.querySelector(".pvRangeMenuStart").value;
    let endVal = this.ctx.querySelector(".pvRangeMenuEnd").value;

    if (startVal != "" && endVal != "") {
      startVal = parseFloat(startVal);
      endVal = parseFloat(endVal);
      if (endVal >= startVal) {
        if (endVal > this.ctx.viewerData.length) {
          endVal = this.ctx.viewerData.length;
        }

        let resetParam = {
          start: Math.round(startVal),
          end: Math.round(endVal),
        };

        let highlightCheckEle = this.ctx.querySelector(".pvRangeMenuHighlight");
        if (highlightCheckEle.checked) {
          resetParam["highlight"] = true;
        }

        this.resetZoom(resetParam);
        this.openRangeMenu();
      }
    }
  },

  pvCategorySettingsMenuSubmit() {
    this.ctx.querySelectorAll(".pvSectionChkBox").forEach((chkBox) => {
      const type = chkBox.getAttribute("data-section-type");

      if (type === "track") {
        const trackUuid = chkBox.getAttribute("data-track-uuid");
        const prefix = chkBox.getAttribute("data-track-prefix");
        const trackIndex = Number(chkBox.getAttribute("data-track-index"));

        const key = `${prefix}:${trackUuid}`;

        if (chkBox.checked) {
          if (!this.ctx.hiddenSections.includes(key)) {
            this.hideSection(trackIndex, trackUuid, prefix);
          }
        } else {
          if (this.ctx.hiddenSections.includes(key)) {
            this.showSection(trackIndex, trackUuid, prefix);
          }
        }

        return;
      }

      // Dynamic sections
      if (chkBox.checked) {
        if (!this.ctx.hiddenSections.includes(type)) {
          this.hideSection(type);
        }
      } else {
        if (this.ctx.hiddenSections.includes(type)) {
          this.showSection(type);
        }
      }
    });

    this.openCategorySettingsMenu();
  },

  resetView() {
    // Close open menus
    this.ctx.querySelector(".settingsMenu").style.display = "none";
    this.ctx.querySelector(".rangeMenu").style.display = "none";

    // Reset zoom
    if (this.ctx.zoomedTrack !== "") {
      const prevZoomIconEle = this.ctx.querySelector(
        ".pvZoomIcon_" + this.ctx.zoomedTrack,
      );
      if (prevZoomIconEle) {
        prevZoomIconEle.classList.remove("active");
      }
    }

    this.ctx.zoomedTrack = "";
    this.resetZoom({ start: 1, end: null });

    // Collapse all expanded aggregate tracks
    this.ctx.querySelectorAll(".expanded").forEach((trackSection) => {
      trackSection.classList.remove("expanded");

      const aggregateTrack = trackSection.querySelector(".pvTrack");
      if (aggregateTrack) {
        aggregateTrack.style.display = "block";
      }
    });

    // Reset every rendered track
    const firstExpanded = {};

    this.ctx
      .getAllTrackCollections()
      .forEach(({ prefix, trackIndex, trackData }) => {
        const trackRow = this.ctx.querySelector(
          `[data-track-for="track-container"][data-track-prefix="${prefix}"][data-track-index="${trackIndex}"]`,
        );

        const subtrackRow = this.ctx.querySelector(
          `[data-track-for="track-scrollbox-container"][data-track-prefix="${prefix}"][data-track-index="${trackIndex}"]`,
        );

        const resetButton = this.ctx.querySelector(
          `.pvResetSection_${prefix}_${trackIndex}`,
        );

        if (trackData.alwaysExpanded) {
          if (subtrackRow) {
            subtrackRow.style.display = "block";
          }
        } else if (trackRow) {
          trackRow.style.display = "table";

          if (!firstExpanded[prefix] && this.ctx.expandFirst.includes(prefix)) {
            trackRow.classList.add("expanded");

            const aggregate = trackRow.querySelector(".pvTrack");
            if (aggregate) {
              aggregate.style.display = "none";
            }

            if (subtrackRow) {
              subtrackRow.style.display = "block";
            }

            firstExpanded[prefix] = true;
          } else if (subtrackRow) {
            subtrackRow.style.display = "none";
          }
        }

        if (resetButton) {
          resetButton.style.display = "none";
        }

        if (this.ctx.hiddenSubtracks[trackData.uuid]) {
          this.resetSection(trackIndex, trackData.uuid, prefix);
        }
      });

    // Reset dynamic sections
    const variationGraph = this.ctx.querySelector(".pvVariantGraphRow");
    const variationPlot = this.ctx.querySelector(".pvVariantPlotRow");

    if (variationGraph) {
      variationGraph.style.display = "table";
      variationGraph.classList.remove("expanded");
    }
    if (variationPlot) {
      variationPlot.style.display = "none";
    }

    const conservationGraph = this.ctx.querySelector(".pvConsHistoRow");
    const conservationPlot = this.ctx.querySelector(".pvConservationPlotRow");

    if (conservationGraph) {
      conservationGraph.style.display = "table";
      conservationGraph.classList.remove("expanded");
    }
    if (conservationPlot) {
      conservationPlot.style.display = "none";
    }

    const boxplotGraph = this.ctx.querySelector(".pvBoxplotGraphRow");
    const boxplotDetail = this.ctx.querySelector(".pvBoxplotDetailRow");

    if (boxplotGraph) {
      boxplotGraph.style.display = "table";
      boxplotGraph.classList.remove("expanded");
    }
    if (boxplotDetail) {
      boxplotDetail.style.display = "none";
    }

    // Re-hide anything the user had hidden
    [...this.ctx.hiddenSections].forEach((key) => {
      if (key.includes(":")) {
        const [prefix, trackUuid] = key.split(":");

        const track = this.ctx.getDataByUuid(trackUuid);
        if (!track) return;

        const row = this.ctx.querySelector(
          `[data-track-for="track-container"][data-track-uuid="${trackUuid}"]`,
        );

        if (!row) return;

        const trackIndex = Number(row.dataset.trackIndex);

        this.hideSection(trackIndex, trackUuid, prefix);
      } else {
        this.hideSection(key);
      }
    });

    this.ctx.hiddenSections = [];
    this.ctx.hiddenSubtracks = {};
  }
}