import { render } from "lit";
import filterData, { keywordMap } from "../custom-pv-components/filters";
class LayoutHelper {
  constructor(ctx) {
    this.ctx = ctx;
  }

  postProcessLayout() {
    this.getScrollbarWidth(); // get scrollbar width for right spacing

    let pvLineGraphSectionEle = this.ctx.querySelectorAll(
      ".pvLineGraphSection",
    )[0];
    if (pvLineGraphSectionEle) {
      pvLineGraphSectionEle.style.paddingRight = this.ctx.scrollbarWidth + "px";
    }

    // bind track data and trigger track render
    this.bindTrackData(this.ctx.scrollbarWidth);
    this.initScrollboxes();

    // lazyload variants
    if (this.ctx.viewerData.displayVariants) {
      if (this.ctx.viewerData.variants) {
        const hideSectionOptions = {
          key: "variationOption",
          index: this.ctx.viewerData.tracks.length + 1,
          label: "Variation",
        };
        this.addDynamicTrackSection(
          this.ctx.viewerData.variants,
          ".pvVariantGraphRow",
          ".pvVariantGraphSection",
          ".pvVariantPlotSection",
          hideSectionOptions,
        );
      } else if (
        !this.ctx.apiNames ||
        this.ctx.apiNames.indexOf("variation") > 1
      ) {
        this.ctx.dataHelper
          .getPDBeApiDataByName("variation")
          .then((resultData) => {
            const hideSectionOptions = {
              key: "variationOption",
              index: this.ctx.viewerData.tracks.length + 1,
              label: "Variation",
            };
            this.addDynamicTrackSection(
              resultData,
              ".pvVariantGraphRow",
              ".pvVariantGraphSection",
              ".pvVariantPlotSection",
              hideSectionOptions,
            );
            // if (!resultData?.variants) {
            //   const emptyState = this.ctx.querySelectorAll('.pvVariantGraphRow .empty-state');
            //   emptyState.forEach(trackEle => trackEle.style.display = "");
            //   const plot1 = this.ctx.querySelector('.pvVariantGraphRow protvista-pdb-variation-graph');
            //   if (plot1) plot1.style.display = "none";
            //   const plot2 = this.ctx.querySelector('.pvVariantGraphRow protvista-pdb-variation');
            //   if (plot2) plot2.style.display = "none";
            // }
          });
      }
    }

    // lazyload sequence conservation
    if (this.ctx.viewerData.displayConservation) {
      if (this.ctx.viewerData.sequenceConservation) {
        const hideSectionOptions = {
          key: "scOption",
          index: this.ctx.viewerData.tracks.length,
          label: "Sequence conservation",
        };
        this.addDynamicTrackSection(
          this.ctx.viewerData.sequenceConservation,
          ".pvConsHistoRow",
          ".pvConservationHistoSection",
          ".pvConservationPlotSection",
          hideSectionOptions,
          true,
        );
      } else if (
        !this.ctx.apiNames ||
        this.ctx.apiNames.indexOf("sequence_conservation") > 1
      ) {
        this.ctx.dataHelper
          .getPDBeApiDataByName("sequence_conservation")
          .then((resultData) => {
            const hideSectionOptions = {
              key: "scOption",
              index: this.ctx.viewerData.tracks.length,
              label: "Sequence conservation",
            };
            this.addDynamicTrackSection(
              resultData,
              ".pvConsHistoRow",
              ".pvConservationHistoSection",
              ".pvConservationPlotSection",
              hideSectionOptions,
              true,
            );
          });
      }
    }

    if (this.ctx.viewerData.displayBoxplot && this.ctx.viewerData.boxplot) {
      this.addBoxplotSection(this.ctx.viewerData.boxplot);
    }

    // subscribe to other PDBe web-component events
    if (this.ctx.subscribeEvents) this.addEventSubscription();
  }

  addDynamicTrackSection(
    resultData,
    rowClass,
    aggregatedTrackClass,
    trackClass,
    sectionOptions,
    borderBottom,
  ) {
    if (resultData && Object.keys(resultData).length > 0) {
      this.ctx.querySelector(rowClass).style.display = "table";
      let trackSectionEle = this.ctx.querySelectorAll(aggregatedTrackClass)[0];
      if (trackSectionEle) {
        trackSectionEle.style.paddingRight = this.ctx.scrollbarWidth + "px";
        if (this.ctx.useDefaultStyles && borderBottom)
          trackSectionEle.style.borderBottom = "1px solid lightgrey";
        trackSectionEle.firstElementChild.data = resultData;
      }

      let trackEle = this.ctx.querySelectorAll(trackClass)[0];
      if (trackEle) {
        trackEle.style.paddingRight = this.ctx.scrollbarWidth + "px";
        if (this.ctx.useDefaultStyles && borderBottom)
          trackEle.style.borderBottom = "1px solid lightgrey";
        trackEle.firstElementChild.data = resultData;
        if (trackClass === ".pvVariantPlotSection") {
          this.updateVariationFilterAvailability(resultData);
        }
      }
    }
  }

  getScrollbarWidth() {
    let divWithScroll = this.ctx.querySelectorAll(".divWithScroll")[0];
    let divWithoutScroll = this.ctx.querySelectorAll(".divWithoutScroll")[0];
    this.ctx.scrollbarWidth =
      divWithoutScroll.clientWidth - divWithScroll.clientWidth;

    divWithScroll.remove();
    divWithoutScroll.remove();
  }

  getTrackLayout(isOverlapping) {
    let layout = isOverlapping ? "overlapping" : "non-overlapping";
    return layout;
  }

  getTrackHeight(trackDataLength, isOverlapping) {
    let eleHt = trackDataLength > 1 ? 60 : 44;
    return eleHt;
  }

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
  }

  handleExtEvents(e) {
    if (
      typeof e.eventData !== "undefined" &&
      typeof e.eventData.residueNumber !== "undefined"
    ) {
      let protvistaParam = {
        start: e.eventData.residueNumber,
        end: e.eventData.residueNumber,
        highlight: true,
      };
      this.resetZoom(protvistaParam);
    }
  }

  bindTrackData(scrollbarWidthVal) {
    let trackSelector = ".pvTrack";
    let trackEles = this.ctx.querySelectorAll(trackSelector);

    if (trackEles && trackEles.length > 0) {
      trackEles.forEach((trackEle, _) => {
        const trackBoundData = trackEle?.data;
        const trackUuid = trackBoundData?.[0].uuid.split("_item_")?.[0];

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
  }

  getLabel(type, value) {
    if (type !== "pdbIcons") {
      return value;
    } else {
      let iconCode = {
        experiments: { class: "icon icon-generic", dataIcon: ";" },
        complex: { class: "icon icon-conceptual", dataIcon: "y" },
        nucleicAcids: { class: "icon icon-conceptual", dataIcon: "d" },
        ligands: { class: "icon icon-conceptual", dataIcon: "b" },
        literature: { class: "icon icon-generic", dataIcon: "P" },
      };
      let labelElements = [];
      labelElements.push(
        '<span style="display:inline-block;min-width:38px;"><strong><a class="pdbIconsId" href="' +
          value.url +
          '" target="_blank">' +
          value.id +
          '</a></strong></span><span class="pdbIconsWrapper">',
      );
      value.icons.forEach((iconData) => {
        let rotateClass = "";
        if (iconData.type == "nucleicAcids") rotateClass = ""; //rotateClass = ' rotate';

        const iconStyle = this.ctx.useTrackStyles
          ? ` style="background-color:${iconData.background}"`
          : "";

        const innerIconStyle = this.ctx.useTrackStyles
          ? ` style="color:#fff;"`
          : "";

        let iconHtml =
          '<span class="pdbIconslogo"' +
          iconStyle +
          ' title="' +
          iconData.tooltipContent +
          '" ><i class="' +
          iconCode[iconData.type].class +
          '" data-icon="' +
          iconCode[iconData.type].dataIcon +
          '"' +
          innerIconStyle +
          "></i></span>";

        if (typeof iconData.url != "undefined" && iconData.url != "")
          iconHtml =
            '<a class="pdbIconslogoA" href="' +
            iconData.url +
            '" target="_blank">' +
            iconHtml +
            "</a>";
        labelElements.push(iconHtml);
      });

      if (value.resolution) {
        const resolutionStyle = this.ctx.useTrackStyles
          ? ' style="color:#555"'
          : "";

        labelElements.push(
          "<strong" +
            resolutionStyle +
            ">" +
            value.resolution +
            "&Aring;</strong></span>",
        );
      }
      return labelElements.join(" ");
    }
  }

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
  }

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
  }

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
  }

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
  }

  resetZoom(param) {
    let currentStartVal = null;
    let currentEndVal = null;
    let navEle = this.ctx.querySelectorAll(".pvTrack")[0];
    if (!navEle) return;

    if (typeof param === "undefined") {
      currentStartVal = navEle.getAttribute("display-start");
      currentEndVal = navEle.getAttribute("display-end");
    } else if (typeof param.trackData != "undefined") {
      if (param.trackData.start && param.trackData.end) {
        currentStartVal = param.trackData.start;
        currentEndVal = param.trackData.end;
      } else if (
        param.trackData.locations &&
        param.trackData.locations.length > 0
      ) {
        currentStartVal = param.trackData.locations[0].fragments[0].start;
        let lastLocationIndex = param.trackData.locations.length - 1;
        let lastFragmentIndex =
          param.trackData.locations[lastLocationIndex].fragments.length - 1;
        currentEndVal =
          param.trackData.locations[lastLocationIndex].fragments[
            lastFragmentIndex
          ].end;
      }
    } else {
      currentStartVal = param.start;
      currentEndVal = param.end;
    }

    if (param && param.start == null && param.end == null) {
    } else {
      if (currentStartVal == null) currentStartVal = "1";
      if (currentEndVal == null) currentEndVal = this.ctx.viewerData.length;
    }

    if (
      typeof param !== "undefined" &&
      typeof param.highlight !== "undefined" &&
      param.highlight
    ) {
      navEle.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            highlight: `${currentStartVal}:${currentEndVal}`,
          },
          bubbles: true,
          cancelable: true,
        }),
      );
    } else {
      navEle.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            "display-start": currentStartVal,
            "display-end": currentEndVal,
          },
          bubbles: true,
          cancelable: true,
        }),
      );

      navEle.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            highlight: null,
          },
          bubbles: true,
          cancelable: true,
        }),
      );
    }
  }

  zoomTrack(data, currentZoomTrack) {
    if (this.ctx.zoomedTrack != "") {
      let prevZoomIconEle = this.ctx.querySelector(
        ".pvZoomIcon_" + this.ctx.zoomedTrack,
      );
      prevZoomIconEle.classList.remove("active");
    }

    if (this.ctx.zoomedTrack != currentZoomTrack) {
      let zoomIconEle = this.ctx.querySelector(
        ".pvZoomIcon_" + currentZoomTrack,
      );
      zoomIconEle.classList.add("active");

      this.ctx.zoomedTrack = currentZoomTrack;
      this.resetZoom(data);
    } else {
      this.ctx.zoomedTrack = "";
      this.resetZoom({ start: 1, end: null });
    }
  }

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
  }

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
  }

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
  }

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
  }

  showLabelTooltip(e) {
    let tooltipContentEle = e.currentTarget.lastElementChild;
    if (
      !tooltipContentEle ||
      tooltipContentEle.className != "labelTooltipContent"
    )
      return;

    let toolTipText = tooltipContentEle.innerText;

    let labelToolTipEle = this.ctx.querySelector(".labelTooltipBox");

    labelToolTipEle.innerHTML = toolTipText;

    let labelCoordinates = e.currentTarget.getBoundingClientRect();

    labelToolTipEle.style.left =
      labelCoordinates.x + labelCoordinates.width + 5 + "px";

    labelToolTipEle.style.top = labelCoordinates.y + 10 + "px";

    labelToolTipEle.style.display = "block";
  }

  hideLabelTooltip() {
    this.ctx.querySelector(".labelTooltipBox").style.display = "none";
  }

  showVariantPlot() {
    let variantPlotRowEle = this.ctx.querySelector(".pvVariantPlotRow");
    if (variantPlotRowEle.style.display == "none") {
      variantPlotRowEle.style.display = "block";
      variantPlotRowEle.previousElementSibling.classList.add("expanded");
    } else {
      variantPlotRowEle.style.display = "none";
      variantPlotRowEle.previousElementSibling.classList.remove("expanded");
    }
  }

  showConservationPlot() {
    let conservationPlotRowEle = this.ctx.querySelector(
      ".pvConservationPlotRow",
    );
    if (conservationPlotRowEle.style.display == "none") {
      conservationPlotRowEle.style.display = "block";
      conservationPlotRowEle.previousElementSibling.classList.add("expanded");
    } else {
      conservationPlotRowEle.style.display = "none";
      conservationPlotRowEle.previousElementSibling.classList.remove(
        "expanded",
      );
    }
  }

  filterSc(orderValue) {
    const scTrack = this.ctx.querySelector(
      ".pvConservationPlotSection protvista-pdb-seq-conservation",
    );

    if (!scTrack) return;

    scTrack.setAttribute("sc-display-order", orderValue);
  }

  getMSADownloadUrl() {
    let baseUrl = "https://www.ebi.ac.uk/pdbe/static/alignments/";
    if (this.ctx._accession) {
      return baseUrl + this.ctx._accession + ".sto.gz";
    } else {
      return "";
    }
  }

  initScrollboxes() {
    const scrollboxes = this.ctx.querySelectorAll("nightingale-scrollbox");

    scrollboxes.forEach((scrollbox) => {
      if (scrollbox._pdbeCallbacksInitialised) return;
      scrollbox._pdbeCallbacksInitialised = true;

      const getRenderContainer = (item) => {
        let container = item.querySelector(
          ":scope > .pdbe-scrollbox-render-root",
        );

        if (!container) {
          item.replaceChildren();

          container = document.createElement("div");
          container.className = "pdbe-scrollbox-render-root";

          item.appendChild(container);
        }

        return container;
      };

      scrollbox.onEnter((item) => {
        if (!item.data?.renderVisible) return;

        const container = getRenderContainer(item);
        render(item.data.renderVisible(), container);

        const trackIndex = item.getAttribute("data-track-index");
        const subtrackIndex = item.getAttribute("data-subtrack-index");
        const subTrackUuid = item.getAttribute("data-subtrack-uuid");
        const prefix = item.getAttribute("data-track-prefix");
        this.bindSingleSubtrackData(trackIndex, subtrackIndex, subTrackUuid, prefix);
      });

      scrollbox.onExit((item) => {
        if (!item.data?.renderHidden) return;

        const container = getRenderContainer(item);
        render(item.data.renderHidden(), container);
      });
    });
  }

  updateVariationFilterAvailability(resultData) {
    const variants = resultData?.variants || [];

    const filterElement = this.ctx.querySelector(
      'nightingale-filter[for="pdbe-variation-track"]',
    );

    if (!filterElement || !variants.length) return;

    const unavailableFilterNames = new Set(
      filterData
        .filter((filter) => {
          const keyword = keywordMap[filter.name];

          if (!keyword) return false;

          return !variants.some((variant) =>
            variant.keywords?.includes(keyword),
          );
        })
        .map((filter) => filter.name),
    );

    requestAnimationFrame(() => {
      filterElement
        .querySelectorAll("input.protvista_checkbox_input")
        .forEach((input) => {
          const isUnavailable = unavailableFilterNames.has(input.value);

          input.disabled = isUnavailable;

          if (isUnavailable) {
            input.checked = false;
          }

          const label = input.closest("label");

          if (label) {
            label.classList.toggle("disabled", isUnavailable);
          }
        });
    });
  }

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
  }

  addBoxplotSection(resultData) {
    if (!resultData) return;

    const graphRow = this.ctx.querySelector(".pvBoxplotGraphRow");
    const detailRow = this.ctx.querySelector(".pvBoxplotDetailRow");

    const graphTrack = this.ctx.querySelector(
      ".pvBoxplotGraphSection protvista-pdb-boxplot-linegraph",
    );

    const rsaTrack = this.ctx.querySelector(
      ".pvBoxplotRsaSection protvista-pdb-boxplot-track",
    );

    if (graphRow) {
      graphRow.style.display = "table";
    }

    if (graphTrack) {
      graphTrack.data = resultData;
    }

    const dataForDistribution = [];
    if (rsaTrack && resultData.rsa) {
      dataForDistribution.push({
        name: "PDB RSA",
        color: "#4169e1",
        positions: resultData.rsa?.data?.[0]?.positions,
      });
    }
    if (rsaTrack && resultData.simulatedRsa) {
      dataForDistribution.push({
        name: "Simulated RSA",
        color: "#d95f02",
        positions: resultData.simulatedRsa?.data?.[0]?.positions,
      });
    }
    rsaTrack.data = dataForDistribution;
  }

  showBoxplotSection() {
    const detailRow = this.ctx.querySelector(".pvBoxplotDetailRow");
    const graphRow = this.ctx.querySelector(".pvBoxplotGraphRow");

    if (!detailRow || !graphRow) return;

    if (detailRow.style.display === "none") {
      detailRow.style.display = "block";
      graphRow.classList.add("expanded");
    } else {
      detailRow.style.display = "none";
      graphRow.classList.remove("expanded");
    }
  }

  triggerFirstIn3DForTrack(trackData, sourceElement) {
    const firstIn3DSubtrack = trackData?.data?.find((item) => item?.in3D);

    if (!firstIn3DSubtrack) return;

    this.triggerIn3D(trackData, firstIn3DSubtrack, sourceElement);
  }

  triggerFirstIn3DForTrack(trackData, sourceElement) {
    const firstIn3DSubtrack = trackData?.data?.find((item) => item?.in3D);

    if (!firstIn3DSubtrack) return;

    this.triggerIn3D(trackData, firstIn3DSubtrack, sourceElement);
  }

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
  }

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
  }

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
  }

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

  addEventSubscription() {
    document.addEventListener("PDB.topologyViewer.click", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.topologyViewer.mouseover", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.topologyViewer.mouseout", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.litemol.click", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.litemol.mouseover", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.molstar.click", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.molstar.mouseover", (e) => {
      this.handleExtEvents(e);
    });
  }

  removeEventSubscription() {
    if (this.ctx.subscribeEvents) {
      document.removeEventListener("PDB.topologyViewer.click");
      document.removeEventListener("PDB.topologyViewer.mouseover");
      document.removeEventListener("PDB.topologyViewer.mouseout");
      document.removeEventListener("PDB.litemol.click");
      document.removeEventListener("PDB.litemol.mouseover");
      document.removeEventListener("PDB.molstar.click");
      document.removeEventListener("PDB.molstar.mouseover");
    }
  }
}

export default LayoutHelper;
