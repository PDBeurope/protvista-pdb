import NightingaleLinegraphTrack from "@nightingale-elements/nightingale-linegraph-track";

const LINE_COLORS = {
  rsa: "#4169e1",
  simulatedRsa: "#d95f02",
};

function mean(values = []) {
  const numericValues = values.map(Number).filter(Number.isFinite);

  if (!numericValues.length) return undefined;

  return (
    numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
  );
}

function datasetToLine(dataset, fallbackColor, length) {
  const values = (dataset.positions || [])
    .map((positionDatum) => ({
      position: Number(positionDatum.position),
      value: mean(positionDatum.values),
    }))
    .filter((point) => Number.isFinite(point.position));

  const hasPosition = (position) =>
    values.some((point) => Number(point.position) === Number(position));

  if (!hasPosition(1)) {
    values.unshift({
      position: 1,
      value: null,
      _pdbePadding: true,
    });
  }

  if (length && !hasPosition(length)) {
    values.push({
      position: Number(length),
      value: null,
      _pdbePadding: true,
    });
  }

  return {
    name: dataset.name || dataset.dataType || "Dataset",
    range: [0, 100],
    color: dataset.color || fallbackColor,
    fill: "none",
    lineCurve: "curveLinear",
    values,
  };
}

function normaliseAverageLinegraphData(input, length) {
  const source = input?.data || input;

  if (!source) return [];

  if (source.rsa || source.simulatedRsa) {
    const lines = [];

    const rsaDataset = source.rsa?.data?.[0];
    const simulatedDataset = source.simulatedRsa?.data?.[0];

    if (rsaDataset) {
      lines.push(
        datasetToLine(
          {
            ...rsaDataset,
            name: "PDB RSA average",
            color: LINE_COLORS.rsa,
          },
          LINE_COLORS.rsa,
          length,
        ),
      );
    }

    if (simulatedDataset) {
      lines.push(
        datasetToLine(
          {
            ...simulatedDataset,
            name: "Simulated RSA average",
            color: LINE_COLORS.simulatedRsa,
          },
          LINE_COLORS.simulatedRsa,
          length,
        ),
      );
    }

    return lines;
  }

  if (Array.isArray(source.data)) {
    return source.data.map((dataset, index) =>
      datasetToLine(
        dataset,
        index === 0 ? LINE_COLORS.rsa : LINE_COLORS.simulatedRsa,
        length,
      ),
    );
  }

  return [];
}

class ProtvistaPdbBoxplotLinegraph extends NightingaleLinegraphTrack {
  connectedCallback() {
    super.connectedCallback();

    this.type = "Relative solvent accessibility";
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
    this._normalisedData = normaliseAverageLinegraphData(
      data,
      this.length || data?.rsa?.length || data?.simulatedRsa?.length,
    );

    super.data = this._normalisedData;
  }

  get data() {
    return this._rawData;
  }

  _onNightingaleChange = (event) => {
    const detail = event.detail || {};
    const type = detail.eventtype || detail.eventType || detail.type;

    if (!detail._pdbeCorrectedLinegraphEvent) {
      if (type === "mouseover" || type === "mouseout" || type === "click") {
        event.stopImmediatePropagation();
        event.preventDefault();
      }

      return;
    }

    if (type === "mouseover") this._handleMouseover(detail);
    if (type === "mouseout") this._handleMouseout();
    if (type === "click") this._handleClick(detail);
  };

  // Nightingale linegraph's native hover region misses the left edge under some
  // zoom/margin combinations. This overlay creates corrected ProtVista-compatible
  // hover/click events using the actual rendered track coordinates.
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
      this._dispatchCorrectedLinegraphEvent("mouseout", mouseEvent, null);
      return;
    }

    if (position === this._lastPdbeHoverPosition) return;

    this._lastPdbeHoverPosition = position;
    this._dispatchCorrectedLinegraphEvent("mouseover", mouseEvent, position);
  };

  _onPdbeOverlayMouseleave = (mouseEvent) => {
    this._lastPdbeHoverPosition = null;
    this._dispatchCorrectedLinegraphEvent("mouseout", mouseEvent, null);
  };

  _onPdbeOverlayClick = (mouseEvent) => {
    const position = this._getPositionFromNativeMouse(mouseEvent);

    if (!Number.isFinite(position)) return;

    this._dispatchCorrectedLinegraphEvent("click", mouseEvent, position);
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
    const tolerance = 8;

    if (mouseX < plotLeft - tolerance || mouseX > plotRight + tolerance) {
      return undefined;
    }

    const visiblePositions = this._getAvailablePositions().filter(
      (position) => position >= displayStart && position <= displayEnd,
    );

    if (
      !visiblePositions.length ||
      typeof this.getXFromSeqPosition !== "function"
    ) {
      return undefined;
    }

    let bestPosition = visiblePositions[0];
    let bestDistance = Infinity;

    visiblePositions.forEach((position) => {
      const xRaw = this.getXFromSeqPosition(position);
      const xPlus1 = this.getXFromSeqPosition(position + 1);
      const xMiddle = (xRaw + xPlus1) / 2;

      const distance = Math.min(
        Math.abs(xRaw - mouseX),
        Math.abs(xPlus1 - mouseX),
        Math.abs(xMiddle - mouseX),
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestPosition = position;
      }
    });

    return bestPosition;
  }

  _dispatchCorrectedLinegraphEvent(type, mouseEvent, position) {
    const hasPosition = Number.isFinite(position);

    const detail = {
      eventtype: type,
      eventType: type,
      type: this.type,
      target: this,
      parentEvent: mouseEvent,
      feature: hasPosition ? this._getFeatureAtPosition(position) : undefined,
      highlight: hasPosition ? `${position}:${position}` : "",
      _pdbeCorrectedLinegraphEvent: true,
    };

    this.dispatchEvent(
      new CustomEvent("change", {
        detail,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _getAvailablePositions() {
    const seen = new Set();
    const positions = [];

    (this._normalisedData || []).forEach((dataset) => {
      (dataset.values || []).forEach((point) => {
        const position = Number(point.position);

        if (Number.isFinite(position) && !seen.has(position)) {
          seen.add(position);
          positions.push(position);
        }
      });
    });

    return positions.sort((a, b) => a - b);
  }

  _getFeatureAtPosition(position) {
    const feature = {};

    (this._normalisedData || []).forEach((dataset) => {
      feature[dataset.name] = (dataset.values || []).find(
        (point) => Number(point.position) === Number(position),
      );
    });

    return feature;
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

  _makeTooltipContent(detail) {
    const position = this._getPositionFromDetail(detail);
    const feature = detail.feature || {};

    if (!Number.isFinite(position)) return "";

    const rows = Object.keys(feature)
      .map((name) => {
        const item = feature[name];

        if (
          !item ||
          item._pdbePadding ||
          !Number.isFinite(Number(item.value))
        ) {
          return "";
        }

        const line = (this._normalisedData || []).find(
          (dataset) => dataset.name === name,
        );

        const color = line?.color || "#555";

        return `
          <tr>
            <td style="padding:3px;">
              <strong style="color:${color}">${name}</strong>
            </td>
            <td style="text-align:right; padding:3px;">
              ${Number(item.value).toFixed(2)}
            </td>
          </tr>
        `;
      })
      .filter(Boolean)
      .join("");

    if (!rows) {
      return `
        <table>
          <tbody>
            <tr>
              <td style="padding:3px;">Residue</td>
              <td style="text-align:right; padding:3px;">${position}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:3px;">No RSA data</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    return `
      <table>
        <tbody>
          <tr>
            <td style="padding:3px;">Residue</td>
            <td style="text-align:right; padding:3px;">${position}</td>
          </tr>
          ${rows}
        </tbody>
      </table>
    `;
  }

  _handleMouseover(detail) {
    const position = this._getPositionFromDetail(detail);
    const tooltipContent = this._makeTooltipContent(detail);

    if (!tooltipContent) return;

    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!(oldTooltip && oldTooltip.className === "click-open")) {
      window.setTimeout(() => {
        this.createTooltipFromDetail(detail, tooltipContent);
      }, 50);
    }

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
    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!(oldTooltip && oldTooltip.className === "click-open")) {
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
    const position = this._getPositionFromDetail(detail);
    const tooltipContent = this._makeTooltipContent(detail);

    if (!tooltipContent) return;

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

    tooltip.title = `RSA residue ${position}`;
    tooltip.closeable = closeable;
    tooltip.content = tooltipContent;

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

export default ProtvistaPdbBoxplotLinegraph;
