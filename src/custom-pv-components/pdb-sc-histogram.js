import NightingaleLinegraphTrack from "@nightingale-elements/nightingale-linegraph-track";

class ProtvistaPdbScHistogram extends NightingaleLinegraphTrack {
  constructor() {
    super();
    this.useDefaultStyles = true;
  }

  connectedCallback() {
    super.connectedCallback();

    this.type = "Sequence conservation";
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
    const source = data?.data || data;

    if (!source?.index || !source?.conservation_score) {
      return undefined;
    }

    return [
      {
        name: "Conservation score",
        range: [0, 10],
        color: "rgb(128, 128, 128)",
        fill: "rgba(128, 128, 128, 0.35)",
        lineCurve: "curveStep",
        values: source.index.map((position) => ({
          position: Number(position),
          value: source.conservation_score[position - 1] || 0,
        })),
      },
    ];
  }

  _onNightingaleChange = (event) => {
    const detail = event.detail || {};
    const type = detail.eventtype || detail.eventType || detail.type;

    if (detail._pdbeCompatHighlightEvent) {
      return;
    }

    // Native Nightingale linegraph hover is unreliable at the left edge.
    // The overlay handles hover/click directly, so suppress native mouse events.
    if (type === "mouseover" || type === "mouseout" || type === "click") {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };

  // Nightingale linegraph's native hover can miss residues near the left edge
  // under some zoom/margin combinations. This overlay emits corrected
  // ProtVista-compatible hover/click events using rendered track coordinates.
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

    this._lastPdbeHoverPosition = position;

    this._handleMouseover({
      parentEvent: mouseEvent,
      highlight: `${position}:${position}`
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
      highlight: `${position}:${position}`
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

    const feature = detail.feature || {};
    const firstValue = Object.keys(feature)
      .map((key) => feature[key])
      .find((value) => value && Number.isFinite(Number(value.position)));

    return firstValue ? Number(firstValue.position) : undefined;
  }

  _getScore(position) {
    const source = this._rawData?.data || this._rawData;
    return source?.conservation_score?.[position - 1];
  }

  _makeTooltipData(position) {
    const score = this._getScore(position);

    if (position == null || score == null) {
      return null;
    }

    return {
      start: position,
      end: position,
      feature: {
        tooltipContent: `Conservation score: ${score}`,
        labelColor: "rgb(211,211,211)",
        type: "Sequence conservation",
      },
    };
  }

  _handleMouseover(detail) {
    const position = this._getPositionFromDetail(detail);
    const tooltipData = this._makeTooltipData(position);

    if (!tooltipData) return;

    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!oldTooltip?.classList.contains("click-open")) {
      this.createTooltipFromTooltipData(detail.parentEvent, tooltipData);
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

  _handleClick(detail) {
    const position = this._getPositionFromDetail(detail);
    const tooltipData = this._makeTooltipData(position);

    if (!tooltipData) return;

    window.setTimeout(() => {
      this.createTooltipFromTooltipData(detail.parentEvent, tooltipData, true);
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

    tooltip.title = `${tooltipData.feature.type} residue ${tooltipData.start}`;
    tooltip.closeable = closeable;
    tooltip.content = tooltipData.feature.tooltipContent;

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

export default ProtvistaPdbScHistogram;
