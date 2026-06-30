/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { drawRange, drawSymbol, drawUnknown } from "./draw-shapes"
import { getColorByType } from "@nightingale-elements/nightingale-track"

export function patchTrackCanvas() {
  // Ensure base class is defined
  const OriginalTrackCanvas = customElements.get("nightingale-track-canvas")
  if (!OriginalTrackCanvas) {
    console.warn(
      "⚠️ nightingale-track-canvas not yet loaded — patchTrackCanvas deferred"
    )
    return
  }

  // Avoid redefining if already done
  if (customElements.get("nightingale-track-canvas-patched")) return

  class PatchedTrackCanvas extends OriginalTrackCanvas {
    drawCanvasContent() {
      // Magic number from packages/nightingale-track/src/FeatureShape.ts:
      const SYMBOL_SIZE = 10
      const SYMBOL_RADIUS = 0.5 * SYMBOL_SIZE
      const LINE_WIDTH = 1

      const ctx = this["canvasCtx"]
      if (!ctx) return
      const canvasWidth = ctx.canvas.width
      const canvasHeight = ctx.canvas.height
      ctx.clearRect(0, 0, canvasWidth, canvasHeight)
      if (!this["fragmentCollection"]) return

      const scale = this["canvasScale"]
      ctx.lineWidth = scale * LINE_WIDTH
      const baseWidth = scale * this["getSingleBaseWidth"]()
      const height =
        scale * Math.max(0, this["layoutObj"]?.getFeatureHeight() ?? 0) // Yes, sometimes `getFeatureHeight` returns negative numbers ¯\_(ツ)_/¯
      const optXPadding = Math.min(scale * 1.5, 0.25 * baseWidth) // To avoid overlap/touch for certain shapes (line, bridge, helix, strand)
      const leftEdgeSeq =
        this["getSeqPositionFromX"](0 - SYMBOL_RADIUS - 0.5 * LINE_WIDTH) ??
        -Infinity
      const rightEdgeSeq =
        this["getSeqPositionFromX"](
          canvasWidth / scale + SYMBOL_RADIUS + 0.5 * LINE_WIDTH
        ) ?? Infinity
      // This is better than this["display-start"], this["display-end"]+1, because it considers margins and symbol size

      // Draw features
      const fragments = this["fragmentCollection"].overlappingItems(
        leftEdgeSeq,
        rightEdgeSeq
      )
      for (const fragment of fragments) {
        const iFeature = fragment.featureIndex
        let fragmentLength =
          Number(fragment.end ?? fragment.start) - Number(fragment.start) + 1
        let x = scale * this["getXFromSeqPosition"](fragment.start)
        let width = fragmentLength * baseWidth
        const y =
          scale *
          (this["layoutObj"]?.getFeatureYPos(this["data"][iFeature]) ?? 0)
        const shape = this["getShape"](this["data"][iFeature])

        // fix so color can be taken by fragment so colouring behaviour is same as for NightingaleTrack
        const fillColor =
          fragment.color ?? this["getFeatureFillColor"](this["data"][iFeature])
        const strokeColor =
          fragment.color ?? this["getFeatureColor"](this["data"][iFeature])

        if (fragment.isResidue) {
          // fragmentLength is 1 for residue. Below logic is to show it prominent for longer proteins until the point where fragmentLength is enough to be visible on itself.
          const optimalWidth = 6
          const widthDifference = optimalWidth - baseWidth
          if (baseWidth < optimalWidth && widthDifference > fragmentLength) {
            fragmentLength = widthDifference
          }
          x += baseWidth / 4 // To place the residue in the middle of a single basewidth
          width = (fragmentLength * baseWidth) / 2 // Halve the width to distinguish between residues if one follows next closely
          ctx.fillStyle = getColorByType("RESIDUE")
        } else {
          ctx.fillStyle = fillColor
        }

        ctx.strokeStyle = strokeColor
        ctx.globalAlpha = this["data"][iFeature].opacity ?? 0.9

        const rangeDrawn = drawRange(
          ctx,
          shape,
          x,
          y,
          width,
          height,
          optXPadding,
          fragmentLength
        )
        if (!rangeDrawn) {
          const cx = x + 0.5 * width
          const cy = y + 0.5 * height
          const r = scale * SYMBOL_RADIUS
          const symbolDrawn = drawSymbol(ctx, shape, cx, cy, r)
          if (!symbolDrawn) {
            this["printUnknownShapeWarning"](shape)
            drawUnknown(ctx, cx, cy, r)
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
              fragmentLength
            )
          }
        }
      }

      // Draw margins
      ctx.globalAlpha = 1
      ctx.fillStyle = this["margin-color"]
      const marginLeft = this["margin-left"] * scale
      const marginRight = this["margin-right"] * scale
      const marginTop = this["margin-top"] * scale
      const marginBottom = this["margin-bottom"] * scale
      ctx.fillRect(0, 0, marginLeft, canvasHeight)
      ctx.fillRect(canvasWidth - marginRight, 0, marginRight, canvasHeight)
      ctx.fillRect(
        marginLeft,
        0,
        canvasWidth - marginLeft - marginRight,
        marginTop
      )
      ctx.fillRect(
        marginLeft,
        canvasHeight - marginBottom,
        canvasWidth - marginLeft - marginRight,
        marginBottom
      )
    }
  }
  customElements.define("nightingale-track-canvas-patched", PatchedTrackCanvas)
}
