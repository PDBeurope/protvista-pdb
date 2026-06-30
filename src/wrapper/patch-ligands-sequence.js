/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { axisBottom, select } from "d3"
import { bindEvents } from "@nightingale-elements/nightingale-new-core"

const DEFAULT_NUMBER_OF_TICKS = 3

export async function patchLigandsSequence() {
  // Ensure base class is defined
  const OriginalSequence = customElements.get("nightingale-sequence")
  if (!OriginalSequence) {
    console.warn(
      "⚠️ nightingale-sequence not yet loaded — patchLigandsSequence deferred"
    )
    return
  }

  // Avoid redefining if already done
  if (customElements.get("nightingale-sequence-patched")) return

  class PatchedLigandsSequence extends OriginalSequence {
    #seq_bg
    #axis
    #bases

    connectedCallback() {
      super.connectedCallback?.()
      const ticks = parseInt(this["getAttribute"]("numberofticks") || "", 10)
      this.numberOfTicks = Number.isInteger(ticks)
        ? ticks
        : DEFAULT_NUMBER_OF_TICKS
      this["addEventListener"]("load", e => {
        this.data = e.detail.payload
      })
      this["style"].display = "block"
      this["style"].lineHeight = "0"
      //   this['style'].width = `${this['width']}px`;
      // --- measure parent width dynamically ---
      const parentEl = this["parentElement"]
      let widthPx

      if (parentEl) {
        // Use getBoundingClientRect for final layout size
        const rect = parentEl.getBoundingClientRect()
        widthPx = rect.width
      }

      // Fallback to element’s own width attribute or offsetWidth
      if (!widthPx || widthPx <= 0) {
        widthPx = this["width"] || this["offsetWidth"] || 0
      }

      this["style"].width = `${widthPx}px`

      // Optional: update on window resize so it stays synced
      const resizeObserver = new ResizeObserver(() => {
        const newWidth = parentEl?.getBoundingClientRect().width ?? widthPx
        this["style"].width = `${newWidth}px`
      })
      if (parentEl) resizeObserver.observe(parentEl)
    }

    get data() {
      return this["sequence"] || ""
    }

    set data(data) {
      if (typeof data === "string") {
        this["sequence"] = data
        this.sequenceData = data.split(",")
      } else if (typeof data?.["sequence"] === "string") {
        this["sequence"] = data["sequence"]
        this["sequenceData"] = data["sequence"].split(",")
      }

      if (this["svg"]) {
        this["updateScaleDomain"]()
        this["applyZoomTranslation"]()
      }
    }

    checkSeqData() {
      if (!this.sequenceData && this["sequence"]) {
        this.sequenceData = this["sequence"].split(",")
      }
    }

    getCharSize() {
      if (!this.seq_g) return
      const xratio = 0.8
      const yratio = 1.6
      const tempNode = this.seq_g
        .append("text")
        .attr("class", "base")
        .text("T")
      this.chWidth = (tempNode.node()?.getBBox().width || 0) * xratio
      this.chHeight = (tempNode.node()?.getBBox().height || 0) * yratio
      tempNode.remove()
      this.chWidth = 3 * this.chWidth
    }

    createSequence() {
      this["svg"] = select(this)
        .selectAll("svg")
        .attr("id", "")
        .attr("width", this["width"])
        .attr("height", this["height"])

      this.#seq_bg = this["svg"]?.append("g").attr("class", "background")
      this.#axis = this["svg"]?.append("g").attr("class", "x axis")

      this.seq_g = this["svg"]
        ?.append("g")
        .attr("class", "sequence")
        .attr(
          "transform",
          `translate(0,${this["margin-top"] +
            0.75 * this["getHeightWithMargins"]()})`
        )

      this.highlighted = this["svg"].append("g").attr("class", "highlighted")
      this.margins = this["svg"].append("g").attr("class", "margin")
      this.checkSeqData()
      if (this["sequence"]) {
        this["updateScaleDomain"]()
        this["applyZoomTranslation"]()
      }
    }

    firstUpdated() {
      this.checkSeqData()
      this.createSequence()
    }

    zoomRefreshed() {
      this.checkSeqData()
      this.renderD3()
    }

    renderD3() {
      this.getCharSize()
      this["svg"]?.attr("width", this["width"]).attr("height", this["height"])

      if (this.#axis) {
        const ftWidth = this["getSingleBaseWidth"]()
        const space = ftWidth - (this.chWidth || 0)
        const half = ftWidth / 2
        const first = Math.floor(Math.max(0, this["getStart"]() - 1))
        const last = Math.ceil(
          Math.min(this.sequenceData?.length || 0, this["getEnd"]())
        )

        const bases =
          space < 0
            ? []
            : this.sequenceData?.slice(first, last)?.map((s, i) => ({
                position: 1 + first + i,
                atomName: s
              })) || []

        if (this["height"] > (this.chWidth || 0) && this["xScale"]) {
          const xAxis = axisBottom(this["xScale"])
            .tickFormat(d => `${Number.isInteger(d) ? d : ""}`)
            .ticks(this.numberOfTicks, "s")
          this.#axis.call(xAxis)
        }

        this.#axis.attr(
          "transform",
          `translate(${this["margin-left"] + half},${this["margin-top"]})`
        )
        this.#axis.select(".domain").remove()
        this.#axis.selectAll(".tick line").remove()
        this.#axis
          .selectAll(".tick text")
          .attr("y", 2)
          .attr("font-size", "10px")

        if (this.seq_g) {
          this.seq_g.attr(
            "transform",
            `translate(0,${this["margin-top"] +
              0.75 * this["getHeightWithMargins"]()})`
          )
          this.#bases = this.seq_g.selectAll("text.base")

          const textElements = this.#bases.data(bases, d => d.position)

          textElements
            .enter()
            .append("text")
            .attr("class", "base")
            .attr("text-anchor", "middle")
            .text(d => d.atomName)
            .attr("x", d => this["getXFromSeqPosition"](d.position) + half)
            .attr("font-size", "10px")
            .style("pointer-events", "none")
            .style("font-family", "monospace")

          textElements.exit().remove()
          textElements
            .attr("font-size", "10px")

            .attr("x", d => this["getXFromSeqPosition"](d.position) + half)
          if (this.#seq_bg) {
            const background = this.#seq_bg
              .selectAll("rect.base_bg")
              .data(bases, d => d.position)
            background
              .enter()
              .append("rect")
              .attr("class", "base_bg feature")
              .attr("height", this["getHeightWithMargins"]())
              .attr("width", ftWidth)
              .attr("fill", d => (Math.round(d.position) % 2 ? "#ccc" : "#eee"))
              .attr("x", d => this["getXFromSeqPosition"](d.position))
              .attr("y", this["margin-top"])
              .style("opacity", Math.min(1, space))
              .call(bindEvents, this)

            background
              .attr("width", ftWidth)
              .attr("fill", d => (Math.round(d.position) % 2 ? "#ccc" : "#eee"))
              .attr("height", this["getHeightWithMargins"]())
              .attr("x", d => this["getXFromSeqPosition"](d.position))
              .attr("y", this["margin-top"])

            background.exit().remove()

            this.seq_g.style("opacity", Math.min(1, space))
            background.style("opacity", Math.min(1, space))
          }
        }

        this["updateHighlight"]()
        this["renderMarginOnGroup"](this.margins)
      }
    }
  }

  customElements.define("nightingale-sequence-patched", PatchedLigandsSequence)
}
