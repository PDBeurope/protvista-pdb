import ProtvistaPdbTrack from "./pdb-track";
import {
  scaleLinear,
  scalePoint,
  axisLeft,
  axisRight,
  select,
  event as d3Event
} from "d3";

import processVariants from "./processVariants";
import VariationPlot from "./variationPlot";
import "../../styles/protvista-variation.css";
import { _union, _getFilteredDataSet } from "./filters";

const aaList = [
  "G",
  "A",
  "V",
  "L",
  "I",
  "S",
  "T",
  "C",
  "M",
  "D",
  "N",
  "E",
  "Q",
  "R",
  "K",
  "H",
  "F",
  "Y",
  "W",
  "P",
  "d",
  "*"
];



class ProtvistaPdbVariation extends ProtvistaPdbTrack {
  connectedCallback() {
    super.connectedCallback();
    this._accession = this.getAttribute("accession");
    this._height = parseInt(this.getAttribute("height"))
      ? parseInt(this.getAttribute("height"))
      : 430;
    this._width = this._width ? this._width : 0;
    this._yScale = scaleLinear();
    // scale for Amino Acids
    this._yScale = scalePoint()
      .domain(aaList)
      .range([0, this._height - this.margin.top - this.margin.bottom]);
  }

  static get observedAttributes() {
    return super.observedAttributes.concat("activefilters");
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    
    if (oldVal !== newVal && attrName == "activefilters") {
      //copied this from variation-adaptor  
      this.data = _getFilteredDataSet(attrName, oldVal, newVal, this._completeDataSet);
    }else{
      super.attributeChangedCallback(attrName, oldVal, newVal);
      if (!super.svg) {
        return;
      }
    }
    
  }

  _fireEvent(name, detail) {
    this.dispatchEvent(
      new CustomEvent(name, {
        detail: detail,
        bubbles: true,
        cancelable: true
      })
    );
  }

  set data(data) {
    if(typeof this._completeDataSet == 'undefined') this._completeDataSet = data;
    this._data = processVariants(data);
    this._createTrack();
  }

  _createTrack() {
    this._layoutObj.init(this._data);

    d3.select(this)
    .selectAll("svg")
      .remove();
    
    this.svg = d3.select(this)
      .append("div")
      .style("line-height", 0)
      .append("svg")
      .style('width', '100%')
      .attr("height", this._height + 40);

    this.highlighted = this.svg
      .append("rect")
      .attr("class", "highlighted")
      .attr("fill", "rgba(255, 235, 59, 0.8)")
      .attr('stroke', 'black')
      .attr("height", this._height + 40).attr("transform", "translate(1.5,0)");

    // this.trackHighlighter.appendHighlightTo(this.svg);

    this.seq_g = this.svg.append("g").attr("class", "sequence-features").attr("transform", "translate(1.5,30)");

    this._createFeatures();
    this.refresh();
  }

  _createFeatures() {
    this._variationPlot = new VariationPlot();
    // Group for the main chart
    const mainChart = super.svg.select("g.sequence-features");

    this._axisLeft = mainChart.append("g");

    this._axisRight = mainChart.append("g");

    // clip path prevents drawing outside of it
    const chartArea = mainChart
      .append("g")
      .attr("clip-path", "url(#plotAreaClip)");

    let clipWidth = this.getWidthWithMargins();
    
    if(clipWidth == 0){
      try{
        clipWidth = this.parentElement.parentElement.parentElement.previousElementSibling.lastElementChild.clientWidth;
      }catch(e){}
    }

    this._clipPath = mainChart
      .append("clipPath")
      .attr("id", "plotAreaClip")
      .append("rect")
      .attr("width", '100%')
      .attr("height", this._height)
      .attr("transform", `translate(0, -${this.margin.top})`);

    // This is calling the data series render code for each of the items in the data
    this._series = chartArea.datum(this._data);

    this.updateScale();
  }

  // Calling render again
  refresh() {
    if (this._series) {
      // this._clipPath.attr("width", this.getWidthWithMargins());
      this._clipPath.style("width", '100%');
      this.updateScale();
      this._series.call(this._variationPlot.drawVariationPlot, this);
      this._updateHighlight();
    }
  }

  updateScale() {
    this._yAxisLScale = axisLeft()
      .scale(this._yScale)
      .tickSize(-this.getWidthWithMargins());

    this._yAxisRScale = axisRight().scale(this._yScale);

    this._axisLeft
      .attr("class", "variation-y-left axis")
      .attr("transform", `translate(${this.margin.left},0)`)
      .call(this._yAxisLScale);

    this._axisRight
      .attr(
        "transform",
        `translate(${this.getWidthWithMargins() - this.margin.right + 10}, 0)`
      )
      .attr("class", "variation-y-right axis")
      .call(this._yAxisRScale);
  }

  updateData(data) {
    if (this._series) {
      this._series.datum(data);
    }
  }

  reset() {
    // reset zoom, filter and any selections
  }
}

export default ProtvistaPdbVariation;