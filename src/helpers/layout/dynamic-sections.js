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
  }

}