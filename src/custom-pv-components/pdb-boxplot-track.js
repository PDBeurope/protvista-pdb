import NightingaleBoxplotTrack from "@nightingale-elements/nightingale-boxplot-track";

function normaliseBoxplotData(input) {
  const source = input?.data || input;

  if (!source) return [];

  // Mock API shape:
  // {
  //   sequence,
  //   length,
  //   dataType,
  //   data: [{ name, positions }]
  // }
  if (Array.isArray(source)) {
    return source.map(normaliseDataset);
  }

  if (Array.isArray(source.data)) {
    return source.data.map(normaliseDataset);
  }

  return [];
}

function normaliseDataset(dataset) {
  return {
    name: dataset.name || dataset.accession || dataset.dataType || "Dataset",
    color: dataset.color || "#4169e1",
    positions: (dataset.positions || [])
      .map((positionDatum) => ({
        position: Number(positionDatum.position),
        values: (positionDatum.values || [])
          .map(Number)
          .filter((value) => Number.isFinite(value)),
      }))
      .filter(
        (positionDatum) =>
          Number.isFinite(positionDatum.position) &&
          positionDatum.values.length > 0,
      ),
  };
}

class ProtvistaPdbBoxplotTrack extends NightingaleBoxplotTrack {
  constructor() {
    super();
    this.useDefaultStyles = true;
  }

  connectedCallback() {
    super.connectedCallback();

    this["show-axis"] = true;
    this["show-nested-highlights"] = true;
    this["zoomed-out-outline"] = "whiskers";

    this["margin-left"] = this["margin-left"] || 0;
    this["margin-right"] = this["margin-right"] || 0;
    this["margin-top"] = this["margin-top"] || 0;
    this["margin-bottom"] = this["margin-bottom"] || 0;

    this.addEventListener("change", this._onNightingaleChange);
  }

  disconnectedCallback() {
    this.removeEventListener("change", this._onNightingaleChange);
    super.disconnectedCallback?.();
  }

  set data(data) {
    this._rawData = data;

    const source = data?.data || data;

    if (source?.length && !this.length) {
      this.length = source.length;
    }

    super.data = normaliseBoxplotData(data);
  }

  get data() {
    return this._rawData;
  }

  _onNightingaleChange = (event) => {
    const detail = event.detail || {};
    const type = detail.eventType || detail.eventtype || detail.type;

    if (type === "mouseover") {
      this._handleMouseover(detail);
    }

    if (type === "mouseout") {
      this._handleMouseout();
    }

    if (type === "click") {
      this._handleClick(detail);
    }
  };

  _handleMouseover(detail) {
    const feature = detail.feature;

    if (!feature || feature.type !== "boxplot") return;

    const tooltipContent = this._makeTooltipContent(feature);
    if (!tooltipContent) return;

    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!oldTooltip?.classList.contains("click-open")) {
      window.setTimeout(() => {
        this.createTooltipFromBoxplotDetail(detail, tooltipContent, false);
      }, 50);
    }

    this._dispatchCompatEvent("protvista-mouseover", detail, tooltipContent);
  }

  _handleMouseout() {
    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!oldTooltip?.classList.contains("click-open")) {
      window.setTimeout(() => {
        this.removeAllTooltips();
      }, 50);
    }

    this.dispatchEvent(
      new CustomEvent("protvista-mouseout", {
        detail: null,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _handleClick(detail) {
    const feature = detail.feature;

    if (!feature || feature.type !== "boxplot") return;

    const tooltipContent = this._makeTooltipContent(feature);
    if (!tooltipContent) return;

    window.setTimeout(() => {
      this.createTooltipFromBoxplotDetail(detail, tooltipContent, true);
    }, 0);

    this._dispatchCompatEvent("protvista-click", detail, tooltipContent);
  }

  removeAllTooltips() {
    document.querySelectorAll("protvista-tooltip").forEach((tooltip) => {
      tooltip.remove();
    });
  }

  createTooltipFromBoxplotDetail(detail, tooltipContent, closeable = false) {
    const mouseEvent = detail.parentEvent;

    if (!mouseEvent || typeof mouseEvent.pageX === "undefined") return;

    this.removeAllTooltips();

    const feature = detail.feature;
    const tooltip = document.createElement("protvista-tooltip");
    
    if (this.useDefaultStyles) {
      tooltip.classList.add("default-styles");
    }

    tooltip.left = mouseEvent.pageX + 15;
    tooltip.top = mouseEvent.pageY + 5;
    tooltip.style.marginLeft = 0;
    tooltip.style.marginTop = 0;

    tooltip.title = `UniProt residue ${feature.position}`;
    tooltip.closeable = closeable;
    tooltip.content = tooltipContent;

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

  _dispatchCompatEvent(name, detail) {
    const feature = detail.feature;
    const position = feature?.position;

    this.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          ...detail,
          start: position,
          end: position,
          feature,
          tooltipContent: this._makeTooltipContent(feature),
        },
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _makeTooltipContent(feature) {
    if (!feature || feature.type !== "boxplot") return "";

    const rows = [
      [
        "",
        ...feature.data.map(
          (item) =>
            `<strong style="color:${item.dataset.color}">${item.dataset.name}</strong>`,
        ),
      ],
      [
        "nDatapoints",
        ...feature.data.map((item) => item.datum?.values?.length ?? "-"),
      ],
      [
        "nOutliers",
        ...feature.data.map((item) => {
          if (!item.datum) return "-";

          const high = item.datum.outliersHigh?.length || 0;
          const low = item.datum.outliersLow?.length || 0;

          return high + low;
        }),
      ],
      [
        "Max",
        ...feature.data.map((item) =>
          item.datum?.maximum != null ? item.datum.maximum.toFixed(2) : "-",
        ),
      ],
      [
        "Median",
        ...feature.data.map((item) =>
          item.datum?.median != null ? item.datum.median.toFixed(2) : "-",
        ),
      ],
      [
        "Min",
        ...feature.data.map((item) =>
          item.datum?.minimum != null ? item.datum.minimum.toFixed(2) : "-",
        ),
      ],
    ];

    const rowsHtml = rows
      .map(
        (row) => `
        <tr>
          ${row
            .map(
              (cell, index) =>
                `<td style="text-align:${index === 0 ? "left" : "right"}; padding:3px;">${cell}</td>`,
            )
            .join("")}
        </tr>
      `,
      )
      .join("");

    return `<table><tbody>${rowsHtml}</tbody></table>`;
  }
}

export default ProtvistaPdbBoxplotTrack;
