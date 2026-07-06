import NightingaleTrackCanvas from "@nightingale-elements/nightingale-track-canvas";
import {
  drawRange,
  drawSymbol,
  drawUnknown,
} from "@nightingale-elements/nightingale-track-canvas/src/utils/draw-shapes";
import { getColorByType } from "@nightingale-elements/nightingale-track";

class ProtvistaPdbTrack extends NightingaleTrackCanvas {
  drawCanvasContent() {
    // Magic number from packages/nightingale-track/src/FeatureShape.ts:
    const SYMBOL_SIZE = 10;
    const SYMBOL_RADIUS = 0.5 * SYMBOL_SIZE;
    const LINE_WIDTH = 1;

    const ctx = this["canvasCtx"];
    if (!ctx) return;
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (!this["fragmentCollection"]) return;

    const scale = this["canvasScale"];
    ctx.lineWidth = scale * LINE_WIDTH;
    const baseWidth = scale * this["getSingleBaseWidth"]();
    const height =
      scale * Math.max(0, this["layoutObj"]?.getFeatureHeight() ?? 0); // Yes, sometimes `getFeatureHeight` returns negative numbers ¯\_(ツ)_/¯
    const optXPadding = Math.min(scale * 1.5, 0.25 * baseWidth); // To avoid overlap/touch for certain shapes (line, bridge, helix, strand)
    const leftEdgeSeq =
      this["getSeqPositionFromX"](0 - SYMBOL_RADIUS - 0.5 * LINE_WIDTH) ??
      -Infinity;
    const rightEdgeSeq =
      this["getSeqPositionFromX"](
        canvasWidth / scale + SYMBOL_RADIUS + 0.5 * LINE_WIDTH,
      ) ?? Infinity;
    // This is better than this["display-start"], this["display-end"]+1, because it considers margins and symbol size

    // Draw features
    const fragments = this["fragmentCollection"].overlappingItems(
      leftEdgeSeq,
      rightEdgeSeq,
    );
    for (const fragment of fragments) {
      const iFeature = fragment.featureIndex;
      let fragmentLength =
        Number(fragment.end ?? fragment.start) - Number(fragment.start) + 1;
      let x = scale * this["getXFromSeqPosition"](fragment.start);
      let width = fragmentLength * baseWidth;
      const y =
        scale *
        (this["layoutObj"]?.getFeatureYPos(this["data"][iFeature]) ?? 0);
      const shape = this["getShape"](this["data"][iFeature]);

      // fix so color can be taken by fragment so colouring behaviour is same as for NightingaleTrack
      const fillColor =
        fragment.color ?? this["getFeatureFillColor"](this["data"][iFeature]);
      const strokeColor =
        fragment.color ?? this["getFeatureColor"](this["data"][iFeature]);

      if (fragment.isResidue) {
        // fragmentLength is 1 for residue. Below logic is to show it prominent for longer proteins until the point where fragmentLength is enough to be visible on itself.
        const optimalWidth = 6;
        const widthDifference = optimalWidth - baseWidth;
        if (baseWidth < optimalWidth && widthDifference > fragmentLength) {
          fragmentLength = widthDifference;
        }
        x += baseWidth / 4; // To place the residue in the middle of a single basewidth
        width = (fragmentLength * baseWidth) / 2; // Halve the width to distinguish between residues if one follows next closely
        ctx.fillStyle = getColorByType("RESIDUE");
      } else {
        ctx.fillStyle = fillColor;
      }

      ctx.strokeStyle = strokeColor;
      ctx.globalAlpha = this["data"][iFeature].opacity ?? 0.9;

      const rangeDrawn = drawRange(
        ctx,
        shape,
        x,
        y,
        width,
        height,
        optXPadding,
        fragmentLength,
      );
      if (!rangeDrawn) {
        const cx = x + 0.5 * width;
        const cy = y + 0.5 * height;
        const r = scale * SYMBOL_RADIUS;
        const symbolDrawn = drawSymbol(ctx, shape, cx, cy, r);
        if (!symbolDrawn) {
          this["printUnknownShapeWarning"](shape);
          drawUnknown(ctx, cx, cy, r);
        }
        if (fragmentLength > 1) {
          drawRange(
            ctx,
            "line",
            x,
            y,
            width,
            height,
            optXPadding,
            fragmentLength,
          );
        }
      }
    }

    // Draw margins
    ctx.globalAlpha = 1;
    ctx.fillStyle = this["margin-color"];
    const marginLeft = this["margin-left"] * scale;
    const marginRight = this["margin-right"] * scale;
    const marginTop = this["margin-top"] * scale;
    const marginBottom = this["margin-bottom"] * scale;
    ctx.fillRect(0, 0, marginLeft, canvasHeight);
    ctx.fillRect(canvasWidth - marginRight, 0, marginRight, canvasHeight);
    ctx.fillRect(
      marginLeft,
      0,
      canvasWidth - marginLeft - marginRight,
      marginTop,
    );
    ctx.fillRect(
      marginLeft,
      canvasHeight - marginBottom,
      canvasWidth - marginLeft - marginRight,
      marginBottom,
    );
  }

  connectedCallback() {
    super.connectedCallback();

    // Keep the last native mouse event only for tooltip coordinates.
    this.addEventListener("mousemove", this._storeMouseEvent);
    this.addEventListener("click", this._storeMouseEvent);

    // Nightingale-style semantic events.
    this.addEventListener("change", this._onNightingaleChange);
  }

  disconnectedCallback() {
    this.removeEventListener("mousemove", this._storeMouseEvent);
    this.removeEventListener("click", this._storeMouseEvent);
    this.removeEventListener("change", this._onNightingaleChange);

    super.disconnectedCallback?.();
  }

  _storeMouseEvent = (event) => {
    this._lastMouseEvent = event;
  };

  _onNightingaleChange = (event) => {
    const detail = event.detail || {};

    const type = detail.eventType || detail.type;
    const value = detail.value || detail;

    if (type === "mouseover") {
      this._handleFeatureMouseover(event, value);
    }

    if (type === "mouseout") {
      this._handleFeatureMouseout(event, value);
    }

    if (type === "click") {
      this._handleFeatureClick(event, value);
    }
  };

  _getFeatureFromValue(value) {
    return value?.feature || value?.data || value;
  }

  _getRangeFromValue(value, feature) {
    const start =
      value?.start ??
      value?.startPosition ??
      value?.["start"] ??
      feature?.start ??
      feature?.locations?.[0]?.fragments?.[0]?.start;

    const end =
      value?.end ??
      value?.endPosition ??
      value?.["end"] ??
      feature?.end ??
      feature?.locations?.[0]?.fragments?.[0]?.end ??
      start;

    return { start, end };
  }

  _handleFeatureMouseover(event, value) {
    const feature = this._getFeatureFromValue(value);
    if (!feature) return;

    const { fragment, start, end } = this._getFragmentFromValue(value, feature);

    const mouseEvent =
      value?.parentEvent ||
      value?.event ||
      value?.originalEvent ||
      value?.sourceEvent ||
      this._lastMouseEvent;

    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!(oldTooltip && oldTooltip.className === "click-open")) {
      window.setTimeout(() => {
        this.createTooltipFromFeature(
          mouseEvent,
          feature,
          start,
          end,
          false,
          fragment,
        );
      }, 50);
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlight: `${start}:${end}`,
        },
        bubbles: true,
        cancelable: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent("protvista-mouseover", {
        detail: {
          start,
          end,
          feature,
          fragment,
        },
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _handleFeatureMouseout() {
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

  _handleFeatureClick(event, value) {
    const feature = this._getFeatureFromValue(value);
    if (!feature) return;

    const { fragment, start, end } = this._getFragmentFromValue(value, feature);

    const mouseEvent =
      value?.parentEvent ||
      value?.event ||
      value?.originalEvent ||
      value?.sourceEvent ||
      this._lastMouseEvent;

    window.setTimeout(() => {
      this.createTooltipFromFeature(
        mouseEvent,
        feature,
        start,
        end,
        true,
        fragment,
      );
    }, 0);

    this.dispatchEvent(
      new CustomEvent("protvista-click", {
        detail: {
          start,
          end,
          feature,
          fragment,
        },
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _getFragmentFromValue(value, feature) {
    const fragments =
      feature?.locations?.flatMap((location) => location.fragments || []) || [];

    // 1. Prefer explicit Nightingale highlight if present.
    if (value?.highlight && typeof value.highlight === "string") {
      const [highlightStart, highlightEnd] = value.highlight.split(":");
      const start = Number(highlightStart);
      const end = Number(highlightEnd);

      const matchingFragments = fragments
        .filter((fragment) => {
          const start = Number(fragment.start);
          const end = Number(fragment.end ?? fragment.start);
          return start <= residue && residue <= end;
        })
        .sort((a, b) => {
          const aStart = Number(a.start);
          const aEnd = Number(a.end ?? a.start);
          const bStart = Number(b.start);
          const bEnd = Number(b.end ?? b.start);

          const aLength = aEnd - aStart + 1;
          const bLength = bEnd - bStart + 1;

          return aLength - bLength;
        });

      return { fragment, start, end };
    }

    // 2. Canvas track: infer residue from mouse X coordinate.
    const offsetX =
      value?.parentEvent?.offsetX ??
      value?.event?.offsetX ??
      value?.originalEvent?.offsetX ??
      value?.sourceEvent?.offsetX ??
      this._lastMouseEvent?.offsetX;

    if (
      typeof offsetX === "number" &&
      typeof this.getSeqPositionFromX === "function"
    ) {
      const residue = Math.floor(this.getSeqPositionFromX(offsetX));

      const matchingFragments = fragments
        .filter((fragment) => {
          const start = Number(fragment.start);
          const end = Number(fragment.end ?? fragment.start);
          return start <= residue && residue <= end;
        })
        .sort((a, b) => {
          const aStart = Number(a.start);
          const aEnd = Number(a.end ?? a.start);
          const bStart = Number(b.start);
          const bEnd = Number(b.end ?? b.start);

          const aLength = aEnd - aStart + 1;
          const bLength = bEnd - bStart + 1;

          return aLength - bLength;
        });
      const fragment = matchingFragments[0];

      if (fragment) {
        return {
          fragment,
          start: Number(fragment.start),
          end: Number(fragment.end ?? fragment.start),
        };
      }
    }

    // 3. Last-resort fallback.
    const range = this._getRangeFromValue(value, feature);
    return {
      fragment: undefined,
      start: Number(range.start),
      end: Number(range.end),
    };
  }

  removeAllTooltips() {
    document.querySelectorAll("protvista-tooltip").forEach((tooltip) => {
      tooltip.remove();
    });
  }

  createTooltipFromFeature(
    mouseEvent,
    feature,
    start,
    end,
    closeable = false,
    fragment,
  ) {
    if (!mouseEvent || typeof mouseEvent.pageX === "undefined") return;

    this.removeAllTooltips();

    const tooltip = document.createElement("protvista-tooltip");

    tooltip.left = mouseEvent.pageX + 15;
    tooltip.top = mouseEvent.pageY + 5;
    tooltip.style.marginLeft = 0;
    tooltip.style.marginTop = 0;

    const type = feature?.type || feature?.label || "Feature";

    tooltip.title = `${type} ${start}-${end}`;
    if (start === end) {
      tooltip.title = `${type} residue ${start}`;
    }

    tooltip.closeable = closeable;
    tooltip.content =
      fragment?.tooltipContent ||
      fragment?.tooltip ||
      fragment?.description ||
      feature?.tooltipContent ||
      feature?.tooltip ||
      feature?.description ||
      "";

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

export default ProtvistaPdbTrack;
