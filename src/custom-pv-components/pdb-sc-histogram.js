import NightingaleLinegraphTrack from "@nightingale-elements/nightingale-linegraph-track";

class ProtvistaPdbScHistogram extends NightingaleLinegraphTrack {
  connectedCallback() {
    super.connectedCallback();

    this.type = "Sequence conservation";
    this["show-label-name"] = false;

    this.addEventListener("change", this._onNightingaleChange);
  }

  disconnectedCallback() {
    this.removeEventListener("change", this._onNightingaleChange);
    super.disconnectedCallback?.();
  }

  set data(data) {
    this._rawData = data;
    super.data = this._normaliseData(data);
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
          position,
          value: source.conservation_score[position - 1] || 0,
        })),
      },
    ];
  }

  _onNightingaleChange = (event) => {
    const detail = event.detail || {};
    const type = detail.eventtype || detail.eventType || detail.type;

    if (type === "mouseover") {
      this._handleMouseover(detail);
    }

    if (type === "mouseout") {
      this._handleMouseout(detail);
    }

    if (type === "click") {
      this._handleClick(detail);
    }
  };

  _getPositionFromDetail(detail) {
    const highlight = detail.highlight;

    if (typeof highlight === "string" && highlight.includes(":")) {
      return Number(highlight.split(":")[0]);
    }

    const mouseEvent = detail.parentEvent;
    if (
      mouseEvent &&
      typeof mouseEvent.offsetX === "number" &&
      typeof this.getSeqPositionFromX === "function"
    ) {
      return Math.floor(this.getSeqPositionFromX(mouseEvent.offsetX));
    }

    return undefined;
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

    if (!(oldTooltip && oldTooltip.className === "click-open")) {
      window.setTimeout(() => {
        this.createTooltipFromTooltipData(detail.parentEvent, tooltipData);
      }, 50);
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlight: `${position}:${position}`,
          highlightstart: position,
          highlightend: position,
          "highlight-start": position,
          "highlight-end": position,
        },
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _handleMouseout() {
    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!(oldTooltip && oldTooltip.className === "click-open")) {
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

    tooltip.left = mouseEvent.pageX + 15;
    tooltip.top = mouseEvent.pageY + 5;
    tooltip.style.marginLeft = 0;
    tooltip.style.marginTop = 0;
    tooltip.title = `${tooltipData.feature.type} residue ${tooltipData.start}`;
    tooltip.closeable = closeable;
    tooltip.content = tooltipData.feature.tooltipContent;

    if (closeable) {
      tooltip.classList.add("click-open");
    }

    document.body.appendChild(tooltip);
  }
}

export default ProtvistaPdbScHistogram;