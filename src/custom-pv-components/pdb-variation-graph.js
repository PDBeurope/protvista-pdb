import NightingaleLinegraphTrack from "@nightingale-elements/nightingale-linegraph-track";

class ProtvistaPdbVariationGraph extends NightingaleLinegraphTrack {
  constructor() {
    super();
    this.useDefaultStyles = true;
  }

  connectedCallback() {
    super.connectedCallback();

    this.type = "Variants";
    this["show-label-name"] = false;

    this.addEventListener("change", this._onNightingaleChange, true);

    requestAnimationFrame(() => {
      this._installPdbeMouseOverlay();
    });
  }

  disconnectedCallback() {
    this.removeEventListener("change", this._onNightingaleChange, true);
    this._removePdbeMouseOverlay();
    super.disconnectedCallback?.();
  }

  set data(data) {
    this._rawData = data;
    this._normalisedData = this._normaliseData(data);
    super.data = this._normalisedData;
  }

  get data() {
    return this._rawData;
  }

  _normaliseData(data) {
    const variants = data?.variants || [];
    const length = Number(this.length || data?.length || this._rawData?.length);

    if (!variants.length || !Number.isFinite(length)) {
      return [];
    }

    const totalMap = {};
    const diseaseMap = {};

    variants.forEach((variant) => {
      const position = Number(variant.start);

      if (!Number.isFinite(position)) return;

      if (!totalMap[position]) totalMap[position] = 0;
      if (!diseaseMap[position]) diseaseMap[position] = 0;

      totalMap[position]++;

      if (variant.association) {
        variant.association.forEach((association) => {
          if (association.disease === true) {
            diseaseMap[position]++;
          }
        });
      }
    });

    const positions = Array.from({ length }, (_, index) => index + 1);

    const totalValues = positions.map((position) => ({
      position,
      value: totalMap[position] || 0,
    }));

    const diseaseValues = positions.map((position) => ({
      position,
      value: diseaseMap[position] || 0,
    }));

    const maxValue = Math.max(
      1,
      ...totalValues.map((item) => item.value),
      ...diseaseValues.map((item) => item.value),
    );

    return [
      {
        name: "Disease-associated variants",
        range: [0, maxValue + 2],
        color: "red",
        fill: "none",
        lineCurve: "curveLinear",
        values: diseaseValues,
      },
      {
        name: "Total variants",
        range: [0, maxValue + 2],
        color: "darkgrey",
        fill: "none",
        lineCurve: "curveLinear",
        values: totalValues,
      },
    ];
  }

  _onNightingaleChange = (event) => {
    const detail = event.detail || {};
    const type = detail.eventtype || detail.eventType || detail.type;

    if (detail._pdbeCompatHighlightEvent) {
      return;
    }

    // Native Nightingale linegraph hover can miss residues near the left edge.
    // The overlay handles hover/click directly, so suppress native mouse events.
    if (type === "mouseover" || type === "mouseout" || type === "click") {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };

  _installPdbeMouseOverlay() {
    if (this._pdbeMouseOverlay) return;

    const parent = this.parentElement || this;
    const parentStyle = window.getComputedStyle(parent);

    if (parentStyle.position === "static") {
      parent.style.position = "relative";
    }

    const overlay = document.createElement("div");
    overlay.className = "pdbe-linegraph-hover-overlay";

    Object.assign(overlay.style, {
      position: "absolute",
      left: "0",
      top: "0",
      right: "0",
      bottom: "0",
      zIndex: "20",
      background: "transparent",
      cursor: "crosshair",
    });

    overlay.addEventListener("mousemove", this._onPdbeOverlayMousemove);
    overlay.addEventListener("mouseleave", this._onPdbeOverlayMouseleave);
    overlay.addEventListener("click", this._onPdbeOverlayClick);

    parent.appendChild(overlay);
    this._pdbeMouseOverlay = overlay;
  }

  _removePdbeMouseOverlay() {
    if (!this._pdbeMouseOverlay) return;

    this._pdbeMouseOverlay.removeEventListener(
      "mousemove",
      this._onPdbeOverlayMousemove,
    );
    this._pdbeMouseOverlay.removeEventListener(
      "mouseleave",
      this._onPdbeOverlayMouseleave,
    );
    this._pdbeMouseOverlay.removeEventListener(
      "click",
      this._onPdbeOverlayClick,
    );

    this._pdbeMouseOverlay.remove();
    this._pdbeMouseOverlay = null;
  }

  _onPdbeOverlayMousemove = (mouseEvent) => {
    const position = this._getPositionFromNativeMouse(mouseEvent);

    if (!Number.isFinite(position)) {
      this._lastPdbeHoverPosition = null;
      this._handleMouseout();
      return;
    }

    const existingTooltip = document.querySelector("protvista-tooltip");

    if (
      position === this._lastPdbeHoverPosition &&
      existingTooltip &&
      existingTooltip.className !== "click-open"
    ) {
      return;
    }

    this._lastPdbeHoverPosition = position;

    this._handleMouseover({
      parentEvent: mouseEvent,
      highlight: `${position}:${position}`,
    });
  };

  _onPdbeOverlayMouseleave = () => {
    this._lastPdbeHoverPosition = null;
    this._handleMouseout();
  };

  _onPdbeOverlayClick = (mouseEvent) => {
    const position = this._getPositionFromNativeMouse(mouseEvent);

    if (!Number.isFinite(position)) return;

    this._handleClick({
      parentEvent: mouseEvent,
      highlight: `${position}:${position}`,
    });
  };

  _getPositionFromNativeMouse(mouseEvent) {
    const rect = this.getBoundingClientRect();
    const mouseX = mouseEvent.clientX - rect.left;

    const marginLeft = Number(this["margin-left"] || 0);
    const marginRight = Number(this["margin-right"] || 0);

    const displayStart = Number(this["display-start"] || 1);
    const displayEnd = Number(
      this["display-end"] || this.length || displayStart,
    );

    const plotLeft = marginLeft;
    const plotRight = rect.width - marginRight;
    const plotWidth = plotRight - plotLeft;
    const tolerance = 8;

    if (
      plotWidth <= 0 ||
      mouseX < plotLeft - tolerance ||
      mouseX > plotRight + tolerance
    ) {
      return undefined;
    }

    const clampedMouseX = Math.min(Math.max(mouseX, plotLeft), plotRight);
    const ratio = (clampedMouseX - plotLeft) / plotWidth;
    const visibleLength = displayEnd - displayStart + 1;

    const position = Math.round(displayStart + ratio * (visibleLength - 1));

    return Math.min(Math.max(position, displayStart), displayEnd);
  }

  _getPositionFromDetail(detail) {
    const highlight = detail.highlight;

    if (typeof highlight === "string" && highlight.indexOf(":") > -1) {
      return Number(highlight.split(":")[0]);
    }

    return undefined;
  }

  _getValueAtPosition(lineName, position) {
    const line = (this._normalisedData || []).find(
      (dataset) => dataset.name === lineName,
    );

    const point = line?.values?.find(
      (item) => Number(item.position) === Number(position),
    );

    return point?.value || 0;
  }

  _makeTooltipContent(position) {
    if (!Number.isFinite(position)) return "";

    const diseaseCount = this._getValueAtPosition(
      "Disease-associated variants",
      position,
    );

    const totalCount = this._getValueAtPosition("Total variants", position);

    return `
      <table>
        <tbody>
          <tr>
            <td style="padding:3px;">Residue</td>
            <td style="text-align:right; padding:3px;">${position}</td>
          </tr>
          <tr>
            <td style="padding:3px;">
              <strong style="color:red">Disease-associated variants</strong>
            </td>
            <td style="text-align:right; padding:3px;">${diseaseCount}</td>
          </tr>
          <tr>
            <td style="padding:3px;">
              <strong style="color:darkgrey">Total variants</strong>
            </td>
            <td style="text-align:right; padding:3px;">${totalCount}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  _handleMouseover(detail) {
    const position = this._getPositionFromDetail(detail);
    const tooltipContent = this._makeTooltipContent(position);

    if (!tooltipContent) return;

    this._pdbeMouseIsOut = false;

    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!oldTooltip?.classList.contains("click-open")) {
      this.createTooltipFromDetail(detail, tooltipContent);
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlight: `${position}:${position}`,
          highlightstart: position,
          highlightend: position,
          "highlight-start": position,
          "highlight-end": position,
          _pdbeCompatHighlightEvent: true,
        },
        bubbles: true,
        cancelable: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent("protvista-mouseover", {
        detail: {
          ...detail,
          start: position,
          end: position,
          tooltipContent,
        },
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _handleMouseout() {
    if (this._pdbeMouseIsOut) return;

    this._pdbeMouseIsOut = true;

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
          _pdbeCompatHighlightEvent: true,
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

  _handleClick(detail) {
    const position = this._getPositionFromDetail(detail);
    const tooltipContent = this._makeTooltipContent(position);

    if (!tooltipContent) return;

    this._pdbeMouseIsOut = false;

    window.setTimeout(() => {
      this.createTooltipFromDetail(detail, tooltipContent, true);
    }, 0);

    this.dispatchEvent(
      new CustomEvent("protvista-click", {
        detail: {
          ...detail,
          start: position,
          end: position,
          tooltipContent,
        },
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

  createTooltipFromDetail(detail, tooltipContent, closeable = false) {
    const mouseEvent = detail.parentEvent;

    if (!mouseEvent || typeof mouseEvent.pageX === "undefined") return;

    this.removeAllTooltips();

    const position = this._getPositionFromDetail(detail);
    const tooltip = document.createElement("protvista-tooltip");

    if (this.useDefaultStyles) {
      tooltip.classList.add("default-styles");
    }

    tooltip.title = `Variants residue ${position}`;
    tooltip.closeable = closeable;
    tooltip.content = tooltipContent;

    tooltip.left = mouseEvent.pageX + 15;
    tooltip.top = mouseEvent.pageY + 5;

    tooltip.style.position = "absolute";
    tooltip.style.left = mouseEvent.pageX + 15 + "px";
    tooltip.style.top = mouseEvent.pageY + 5 + "px";
    tooltip.style.marginLeft = "0";
    tooltip.style.marginTop = "0";

    if (closeable) {
      tooltip.classList.add("click-open");
    }

    document.body.appendChild(tooltip);

    const tooltipBox = tooltip.getBoundingClientRect();
    const bottomSpace = window.innerHeight - mouseEvent.clientY;
    const rightSpace = window.innerWidth - mouseEvent.clientX;

    if (bottomSpace < tooltipBox.height + 20) {
      tooltip.style.top = mouseEvent.pageY - tooltipBox.height - 20 + "px";
    }

    if (rightSpace < tooltipBox.width + 20) {
      tooltip.style.left = mouseEvent.pageX - tooltipBox.width - 20 + "px";
    }
  }
}

export default ProtvistaPdbVariationGraph;