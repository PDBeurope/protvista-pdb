import filterData, { keywordMap } from "../../custom-pv-components/filters";
/**
 * helpers/layout/dynamic-sections.js
 *
 * In this file: variation/conservation/boxplot
 *
 * addBoxplotSection
 * showBoxplotSection
 * showConservationPlot
 * showVariantPlot
 * updateVariationFilterAvailability
 * filterSc
 * getMSADownloadUrl
 * */
export default {
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
  },

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
  },

  showVariantPlot() {
    let variantPlotRowEle = this.ctx.querySelector(".pvVariantPlotRow");
    if (variantPlotRowEle.style.display == "none") {
      variantPlotRowEle.style.display = "block";
      variantPlotRowEle.previousElementSibling.classList.add("expanded");
    } else {
      variantPlotRowEle.style.display = "none";
      variantPlotRowEle.previousElementSibling.classList.remove("expanded");
    }
  },

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
  },

  filterSc(orderValue) {
    const scTrack = this.ctx.querySelector(
      ".pvConservationPlotSection protvista-pdb-seq-conservation",
    );

    if (!scTrack) return;

    scTrack.setAttribute("sc-display-order", orderValue);
  },

  getMSADownloadUrl() {
    let baseUrl = "https://www.ebi.ac.uk/pdbe/static/alignments/";
    if (this.ctx._accession) {
      return baseUrl + this.ctx._accession + ".sto.gz";
    } else {
      return "";
    }
  },

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
  },

  async bindLigIntHeatmapData(data) {
    // 1 - Assign data to tracks
    const atomsTrack = this.ctx.querySelector("#atoms-hm-heatmap-track");
    const heatmapTrack = this.ctx.querySelector("#resids-hm-heatmap-track");
    if (!atomsTrack) return;
    if (!heatmapTrack) return;

    // Assign data
    const xDomain = data.viewerData.xDomain;
    const yDomain = data.viewerData.yDomain;
    const atomsData = data.viewerData.averages;
    const heatmapData = data.viewerData.heatmap;
    atomsTrack.setHeatmapData(xDomain, ["ATM"], atomsData);
    heatmapTrack.setHeatmapData(xDomain, yDomain, heatmapData);

    const atomsColorScale = data.atomColorScale;
    const heatmapColorScale = data.residColorScale;

    // Wait for Lit render
    await atomsTrack.updateComplete;
    await heatmapTrack.updateComplete;

    // Apply heatmap color scale
    atomsTrack.heatmapInstance.setColor((d) => atomsColorScale(d.score));
    heatmapTrack.heatmapInstance.setColor((d) => heatmapColorScale(d.score));

    const atomsTooltipContentFn = (d, x, y) => {
      if (!d) return "";
      let tooltipContent = `
        <div class="tooltip-data" data-trackid="atoms-hm" style="display: none"></div>
        Ligand atom: <b>${d["atomName"]}</b><br>
        Atom-wise interactions: <b>${d["score"].toFixed(2)}%</b><br>
      `;
      return tooltipContent;
    };
    atomsTrack.heatmapInstance.setTooltip((d, x, y, xIndex, yIndex) => {
      const tooltipContent = atomsTooltipContentFn(d, x, y, xIndex, yIndex);
      return tooltipContent;
    });

    const residsTooltipContentFn = (d, x, y) => {
      if (!d) return "";
      // eslint-disable-next-line prefer-const
      let tooltipContent = `
        <div class="tooltip-data" data-trackid="resids-hm" style="display: none"></div>
        Ligand atom: <b>${d["atomName"]}</b><br>
        Amino acid: <b>${d["residue"]}</b><br>
        Pairwise interactions: <b>${d["score"].toFixed(2)}%</b><br>
      `;
      return tooltipContent;
    };
    heatmapTrack.heatmapInstance.setTooltip((d, x, y, xIndex, yIndex) => {
      const tooltipContent = residsTooltipContentFn(d, x, y, xIndex, yIndex);
      return tooltipContent;
    });

    // Set our tooltips from hover events
    atomsTrack.heatmapInstance.events.hover.subscribe((d) => {
      // if (d.cell) {
      this.adjustTooltipElements('heatmap-atoms');
        // this.mouseEvents.triggerExternalMouseOverEvents(d.cell.x, d.cell.x);
      // } else {
      //   // this.mouseEvents.triggerExternalMouseOutEvents();
      // }
    });
    heatmapTrack.heatmapInstance.events.hover.subscribe((d) => {
      // if (d.cell) {
      this.adjustTooltipElements('heatmap-resids');
        // this.mouseEvents.triggerExternalMouseOverEvents(d.cell.x, d.cell.x);
      // } else {
      //   // this.mouseEvents.triggerExternalMouseOutEvents();
      // }
    });

  },

  adjustTooltipElements(elementId) {
    const boundsElement = this.ctx.querySelector(`#${elementId}`);
    if (!boundsElement) return;

    const scrollBounds = boundsElement.getBoundingClientRect();
    // const leftEdge = scrollBounds.left;
    const rightEdge = scrollBounds.right - 30; // padding from the right edge
    const topEdge = scrollBounds.top;
    // const bottomEdge = scrollBounds.bottom - 10; // optional padding from bottom

    const selectors = ['.heatmap-pinned-tooltip-box', '.heatmap-tooltip-box'];

    for (const selector of selectors) {
      const el1 = boundsElement.querySelector(selector);
      if (el1 !== null) {
        el1.style.translate = '0px 0px';
        el1.classList.remove('flipped-x', 'flipped-y');
        el1.style.zIndex = '5';

        const bounds = el1.getBoundingClientRect();
        const elX = bounds.x;
        const elY = bounds.y;
        const elWidth = bounds.width;
        const elHeight = bounds.height;

        const pin = el1.querySelector('.heatmap-pinned-tooltip-pin');
        if (pin) {
          pin.style.translate = '0px 0px';
          pin.style.transform = 'none';
        }
        // Compute distances to container edges
        // const distLeft = elX - leftEdge;
        const distRight = rightEdge - (elX + elWidth);
        const distTop = elY - topEdge;
        // const distBottom = bottomEdge - (elY + elHeight);

        // final translate offsets
        let translateX = 0;
        let translateY = 0;
        let translatePinX = 0;
        let translatePinY = 0;
        let pinTransform = '';

        // ---- X FLIP ----
        if (distRight < 0) {
          translateX = -elWidth;
          el1.classList.add('flipped-x');
          translatePinX = elWidth - 5;
          pinTransform += ' rotateY(180deg)';
        }

        // ---- Y FLIP ----
        if (distTop < 0) {
          translateY = elHeight + 5;
          el1.classList.add('flipped-y');
          translatePinY = -(elHeight - 5); // move pin visually to bottom edge
          pinTransform += ' rotateX(180deg)';
        }

        // apply combined translation
        el1.style.translate = `${translateX}px ${translateY}px`;
        if (pin) {
          pin.style.translate = `${translatePinX}px ${translatePinY}px`;
          pin.style.transform = pinTransform.trim();
        }
      }
    }
  }
};
