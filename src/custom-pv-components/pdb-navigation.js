import {
  scaleLinear,
  axisBottom,
  brushX,
  format,
  select,
  event as d3Event
} from 'd3';
import ProtvistaNavigation from "protvista-navigation";

const height = 40,
  padding = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  };

class ProtvistaPdbNavigation extends ProtvistaNavigation {
  
  connectedCallback() {
    this.style.display = 'block';
    this.style.width = '100%';
    this.width = this.offsetWidth;

    this._offset = parseFloat(this.getAttribute('offset')) || 0;

    this._length = parseFloat(this.getAttribute('length'));
    this._displaystart = parseFloat(this.getAttribute('displaystart')) || (this._offset > 0) ? this._offset : 1;
    this._displayend = parseFloat(this.getAttribute('displayend')) || (this._offset > 0) ? (this._length + this._offset - 1) : this._length;
    this._highlightStart = parseFloat(this.getAttribute('highlightStart'));
    this._highlightEnd = parseFloat(this.getAttribute('highlightEnd'));

    this._onResize = this._onResize.bind(this);

    this._createNavRuler();
  }

  _createNavRuler() {

    let scaleStart = (this._offset > 0) ? this._offset : 1;
    let scaleEnd = (this._offset > 0) ? (this._length + this._offset - 1) : this._length;

    this._x = scaleLinear().range([padding.left, this.width - padding.right]);
    this._x.domain([scaleStart, scaleEnd]);

    this._svg = select(this)
      .append('div')
      .attr('class', '')
      .append('svg')
      .attr('id', '')
      .attr('width', this.width)
      .attr('height', (height));

    this._xAxis = axisBottom(this._x);

    this._displaystartLabel = this._svg.append("text")
                        .attr('class', 'start-label')
                        .attr('x', 0)
                        .attr('y', height - padding.bottom);

    this._displayendLabel = this._svg.append("text")
                      .attr('class', 'end-label')
                      .attr('x', this.width)
                      .attr('y', height - padding.bottom)
                      .attr('text-anchor', 'end');
    this._axis = this._svg.append('g')
      .attr('class', 'x axis')
      .call(this._xAxis);

    this._viewport = brushX().extent([
        [padding.left, 0],
        [(this.width - padding.right), height*0.51]
      ])
      .on("brush", () => {
        if (d3Event.selection){
          this._displaystart = format("d")(this._x.invert(d3Event.selection[0]));
          this._displayend = format("d")(this._x.invert(d3Event.selection[1]));
          if (!this.dontDispatch)
            this.dispatchEvent(new CustomEvent("change", {
              detail: {
                displayend: this._displayend, displaystart: this._displaystart,
                extra: {transform: d3Event.transform}
              }, bubbles:true, cancelable: true
            }));
          this._updateLabels();
          this._updatePolygon();
        }
      });

    this._brushG = this._svg.append("g")
      .attr("class", "brush")
      .call(this._viewport);

    this._brushG
      .call(this._viewport.move, [this._x(this._displaystart), this._x(this._displayend)]);

    this.polygon = this._svg.append("polygon")
      .attr('class', 'zoom-polygon')
      .attr('fill', '#777')
      .attr('fill-opacity','0.3');
    this._updateNavRuler();

    if ('ResizeObserver' in window) {
      this._ro = new ResizeObserver(this._onResize);
      this._ro.observe(this);
    }
    window.addEventListener("resize", this._onResize);
  }
}

export default ProtvistaPdbNavigation;
