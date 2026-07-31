/**
 * helpers/layout/layout.js
 * 
 * In this file: layout/render helpers
 * 
 * postProcessLayout
 * addDynamicTrackSection
 * getScrollbarWidth
 * */

export default {
  postProcessLayout() {
    this.getScrollbarWidth();

    const pvLineGraphSectionEle = this.ctx.querySelector(
      ".pvLineGraphSection",
    );

    if (pvLineGraphSectionEle) {
      pvLineGraphSectionEle.style.paddingRight =
        this.ctx.scrollbarWidth + "px";
    }

    // Bind track data and trigger track render
    this.bindTrackData(this.ctx.scrollbarWidth);
    this.initScrollboxes();

    // Lazy-load variants
    if (this.ctx.viewerData.displayVariants) {
      if (this.ctx.viewerData.variants) {
        this.addDynamicTrackSection(
          this.ctx.viewerData.variants,
          ".pvVariantGraphRow",
          ".pvVariantGraphSection",
          ".pvVariantPlotSection",
          {
            key: "variationOption",
            index: this.ctx.viewerData.tracks.length + 1,
            label: "Variation",
          },
        );
      } else if (
        !this.ctx.apiNames ||
        this.ctx.apiNames.indexOf("variation") > -1
      ) {
        this.ctx.dataHelper
          .getPDBeApiDataByName("variation")
          .then((resultData) => {
            this.addDynamicTrackSection(
              resultData,
              ".pvVariantGraphRow",
              ".pvVariantGraphSection",
              ".pvVariantPlotSection",
              {
                key: "variationOption",
                index: this.ctx.viewerData.tracks.length + 1,
                label: "Variation",
              },
            );
          });
      }
    }

    // Lazy-load sequence conservation
    if (this.ctx.viewerData.displayConservation) {
      if (this.ctx.viewerData.sequenceConservation) {
        this.addDynamicTrackSection(
          this.ctx.viewerData.sequenceConservation,
          ".pvConsHistoRow",
          ".pvConservationHistoSection",
          ".pvConservationPlotSection",
          {
            key: "scOption",
            index: this.ctx.viewerData.tracks.length,
            label: "Sequence conservation",
          },
          true,
        );
      } else if (
        !this.ctx.apiNames ||
        this.ctx.apiNames.indexOf("sequence_conservation") > -1
      ) {
        this.ctx.dataHelper
          .getPDBeApiDataByName("sequence_conservation")
          .then((resultData) => {
            this.addDynamicTrackSection(
              resultData,
              ".pvConsHistoRow",
              ".pvConservationHistoSection",
              ".pvConservationPlotSection",
              {
                key: "scOption",
                index: this.ctx.viewerData.tracks.length,
                label: "Sequence conservation",
              },
              true,
            );
          });
      }
    }

    // Boxplot
    if (this.ctx.viewerData.displayBoxplot && this.ctx.viewerData.boxplot) {
      this.addBoxplotSection(this.ctx.viewerData.boxplot);
    }

    // Ligand Interactions Heatmap
    if (this.ctx.viewerData.displayLigandsMode) {
      this.bindLigIntHeatmapData(this.ctx.viewerData.ligIntHeatmap);
    }

    // Subscribe to events
    if (this.ctx.subscribeEvents) {
      this.addEventSubscription();
    }
  },

  addDynamicTrackSection(
    resultData,
    rowClass,
    aggregatedTrackClass,
    trackClass,
    sectionOptions,
    borderBottom = false,
  ) {
    if (!resultData || Object.keys(resultData).length === 0) {
      return;
    }

    const row = this.ctx.querySelector(rowClass);
    if (row) {
      row.style.display = "table";
    }

    const aggregateTrack =
      this.ctx.querySelector(aggregatedTrackClass);

    if (aggregateTrack) {
      aggregateTrack.style.paddingRight =
        this.ctx.scrollbarWidth + "px";

      if (this.ctx.useDefaultStyles && borderBottom) {
        aggregateTrack.style.borderBottom = "1px solid lightgrey";
      }

      aggregateTrack.firstElementChild.data = resultData;
    }

    const detailTrack = this.ctx.querySelector(trackClass);

    if (detailTrack) {
      detailTrack.style.paddingRight =
        this.ctx.scrollbarWidth + "px";

      if (this.ctx.useDefaultStyles && borderBottom) {
        detailTrack.style.borderBottom = "1px solid lightgrey";
      }

      detailTrack.firstElementChild.data = resultData;

      if (trackClass === ".pvVariantPlotSection") {
        this.updateVariationFilterAvailability(resultData);
      }
    }
  },

  getScrollbarWidth() {
    const divWithScroll = this.ctx.querySelector(".divWithScroll");
    const divWithoutScroll = this.ctx.querySelector(".divWithoutScroll");

    this.ctx.scrollbarWidth =
      divWithoutScroll.clientWidth - divWithScroll.clientWidth;

    divWithScroll.remove();
    divWithoutScroll.remove();
  },
};