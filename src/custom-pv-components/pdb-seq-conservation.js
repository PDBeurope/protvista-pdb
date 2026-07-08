import NightingaleConservationTrack from "@nightingale-elements/nightingale-conservation-track";

const AA_LIST = [
  "A",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "K",
  "L",
  "M",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "V",
  "W",
  "Y",
];

const AA_DETAILS = {
  G: { name: "Glycine", code: "GLY" },
  C: { name: "Cysteine", code: "CYS" },
  R: { name: "Arginine", code: "ARG" },
  K: { name: "Lysine", code: "LYS" },
  P: { name: "Proline", code: "PRO" },
  E: { name: "Glutamic acid", code: "GLU" },
  D: { name: "Aspartic acid", code: "ASP" },
  W: { name: "Tryptophan", code: "TRP" },
  M: { name: "Methionine", code: "MET" },
  F: { name: "Phenylalanine", code: "PHE" },
  I: { name: "Isoleucine", code: "ILE" },
  V: { name: "Valine", code: "VAL" },
  L: { name: "Leucine", code: "LEU" },
  A: { name: "Alanine", code: "ALA" },
  T: { name: "Threonine", code: "THR" },
  Q: { name: "Glutamine", code: "GLN" },
  S: { name: "Serine", code: "SER" },
  N: { name: "Asparagine", code: "ASN" },
  Y: { name: "Tyrosine", code: "TYR" },
  H: { name: "Histidine", code: "HIS" },
};

// function normaliseConservationData(input) {
//   const source = input?.data || input;

//   if (!source?.index) {
//     return undefined;
//   }

//   const probabilities = {};

//   AA_LIST.forEach((aa) => {
//     probabilities[aa] = source[`probability_${aa}`] || [];
//   });

//   return {
//     index: source.index,
//     probabilities,
//   };
// }

function normaliseConservationData(input) {
  const source = input?.data || input;

  if (!source?.index) {
    return undefined;
  }

  // Already Nightingale format.
  // This happens when Nightingale internally does: this.data = this.data
  // after letter-order changes.
  if (source.probabilities) {
    return {
      index: source.index,
      probabilities: source.probabilities,
    };
  }

  const probabilities = {};

  AA_LIST.forEach((aa) => {
    probabilities[aa] = source[`probability_${aa}`] || [];
  });

  return {
    index: source.index,
    probabilities,
  };
}

class ProtvistaPdbSeqConservation extends NightingaleConservationTrack {
  constructor() {
    super();
    this.useDefaultStyles = true;
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("change", this._onNightingaleChange);
  }

  disconnectedCallback() {
    this.removeEventListener("change", this._onNightingaleChange);
    super.disconnectedCallback?.();
  }

  static get observedAttributes() {
    return [...(super.observedAttributes || []), "sc-display-order"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "sc-display-order" && oldValue !== newValue) {
      const letterOrder =
        newValue === "probability" ? "probability" : "default";

      if (this.getAttribute("letter-order") !== letterOrder) {
        this.setAttribute("letter-order", letterOrder);
      }

      return;
    }

    super.attributeChangedCallback?.(name, oldValue, newValue);
  }

  set data(data) {
    this._rawData = data;
    this._normalisedData = normaliseConservationData(data);
    super.data = this._normalisedData;
  }

  get data() {
    return super.data;
  }

  _onNightingaleChange = (event) => {
    const detail = event.detail || {};
    const type = detail.eventType || detail.type;
    const value = detail.value || detail;
    const pointed = value?.feature || value?.data || value;

    if (!type) return;

    if (type === "mouseover") {
      this._handleMouseover(value, pointed);
    }

    if (type === "mouseout") {
      this._handleMouseout();
    }

    if (type === "click") {
      this._handleClick(value, pointed);
    }
  };

  _getMouseEvent(value) {
    return (
      value?.parentEvent ||
      value?.event ||
      value?.originalEvent ||
      value?.sourceEvent ||
      null
    );
  }

  _makeTooltipData(pointed) {
    if (!pointed) return null;

    const aa = pointed.aa;
    const position = pointed.position;
    const probability = Number(pointed.probability || 0);
    const aaDetails = AA_DETAILS[aa] || { name: aa, code: aa };

    return {
      start: position,
      end: position,
      feature: {
        tooltipContent:
          `Amino acid: ${aaDetails.name} (${aaDetails.code})<br/>` +
          `Probability: ${(probability * 100).toFixed(2)}%`,
        type: "Sequence conservation",
      },
      probability,
      aa,
      position,
    };
  }

  _handleMouseover(value, pointed) {
    const tooltipData = this._makeTooltipData(pointed);
    if (!tooltipData) return;

    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!oldTooltip?.classList.contains("click-open")) {
      window.setTimeout(() => {
        this.createTooltipFromTooltipData(
          this._getMouseEvent(value),
          tooltipData,
          false,
        );
      }, 50);
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlight: `${tooltipData.start}:${tooltipData.end}`,
          highlightstart: tooltipData.start,
          highlightend: tooltipData.end,
          "highlight-start": tooltipData.start,
          "highlight-end": tooltipData.end,
        },
        bubbles: true,
        cancelable: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent("protvista-mouseover", {
        detail: tooltipData,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _handleMouseout() {
    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!oldTooltip?.classList.contains("click-open")) {
      window.setTimeout(() => {
        this.removeAllTooltips();
      }, 50);
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlight: null,
          highlightstart: null,
          highlightend: null,
          "highlight-start": null,
          "highlight-end": null,
        },
        bubbles: true,
        cancelable: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent("protvista-mouseout", {
        detail: null,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _handleClick(value, pointed) {
    const tooltipData = this._makeTooltipData(pointed);
    if (!tooltipData) return;

    window.setTimeout(() => {
      this.createTooltipFromTooltipData(
        this._getMouseEvent(value),
        tooltipData,
        true,
      );
    }, 0);

    this.dispatchEvent(
      new CustomEvent("protvista-click", {
        detail: tooltipData,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  removeAllTooltips() {
    document.querySelectorAll("protvista-tooltip").forEach((tooltip) => {
      tooltip.remove();
    });
  }

  createTooltipFromTooltipData(mouseEvent, tooltipData, closeable = false) {
    if (!mouseEvent || typeof mouseEvent.pageX === "undefined") return;

    this.removeAllTooltips();

    const tooltip = document.createElement("protvista-tooltip");
    
    if (this.useDefaultStyles) {
      tooltip.classList.add("default-styles");
    }

    tooltip.left = mouseEvent.pageX + 15;
    tooltip.top = mouseEvent.pageY + 5;
    tooltip.style.marginLeft = 0;
    tooltip.style.marginTop = 0;

    tooltip.title =
      tooltipData.start === tooltipData.end
        ? `${tooltipData.feature.type} residue ${tooltipData.start}`
        : `${tooltipData.feature.type} ${tooltipData.start}-${tooltipData.end}`;

    tooltip.closeable = closeable;
    tooltip.content = tooltipData.feature.tooltipContent;

    if (closeable) {
      tooltip.classList.add("click-open");
    }

    document.body.appendChild(tooltip);

    const tooltipDom = tooltip.getBoundingClientRect();
    const bottomSpace = window.innerHeight - mouseEvent.clientY;
    const rightSpace = window.innerWidth - mouseEvent.clientX;

    if (bottomSpace < 130) {
      tooltip.style.top = mouseEvent.pageY - (tooltipDom.height + 20) + "px";
    }

    if (rightSpace < 300) {
      tooltip.style.left = "";
      tooltip.style.right = rightSpace - 10 + "px";
    }
  }
}

export default ProtvistaPdbSeqConservation;
