import ProtvistaPdbTrack from "./pdb-track";
import { scaleLinear } from "d3";

class ProtvistaPdbSeqConservation extends ProtvistaPdbTrack {

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this._accession = this.getAttribute("accession");

        this._data = undefined;

        this._height = parseInt(this.getAttribute("height")) || 430;

        document.addEventListener("sc-change", (e) => {
            this.filterData(e.detail.type);
        });

    }

    set data(data) {
        this._seqid = (this._accession && this._accession !== 'null') ? data[this._accession]['seqId'] : undefined;
        this._data = (this._accession && this._accession !== 'null') ? data[this._accession]['data'] : data;
        this.add_download_link();
        this._createTrack();
    }

    add_download_link() {
        if (this._seqid) {
            const filelocation = "/nfs/msd/release/data/conserved_residues/all/sto";
            const filename = filelocation + '/' + this._seqid + ".sto";
        } else {
            return false;
        }
    }

    _createTrack() {
        this._layoutObj.init(this._data);

        d3.select(this)
            .selectAll("svg")
            .remove();

        this.svg = d3.select(this)
            .append("div")
            .append("svg")
            .style('width', '100%')
            .attr("height", this._height);

        this.highlighted = this.svg
            .append("rect")
            .attr("class", "highlighted")
            .attr("fill", "rgba(255, 235, 59, 0.8)")
            .attr("height", this._height);

        this.seq_g = this.svg.append("g").attr("class", "sequence-features").attr("transform", "translate(0,-5)");

        this._createFeatures();
        this.refresh();
    }

    _createFeatures() {
        // scale for Amino Acids
        this._yScale = scaleLinear()
            .domain([0, 1])
            .range([0, 400]);

        this._data.forEach(residue => {
            let y = 20;
            residue.amino.forEach(aa => {
                aa.ypos = y;
                y += this._yScale(aa.probability);

            })
        });

    }

    refresh() {
        if (this.xScale && this.seq_g) {

            this.svg.selectAll("foreignObject").remove();
            this.seq_g.selectAll("g.location-group").remove();

            if (this.getSingleBaseWidth() < 9.40) {

                this.foreign = this.svg
                    .append("foreignObject")
                    .attr("width", '100%')
                    .attr("height", this._height);

                this.commentdiv = this.foreign
                    .append("xhtml:div")
                    .attr("class", "zoomout")
                    .attr("style", "text-align: center; height: " + this._height + "px");

                this.span = this.commentdiv
                    .append("span")
                    .attr("style", "line-height:" + this._height + "px");

                this.span
                    .append("i")
                    .attr("class", "icon icon-functional")
                    .attr("data-icon", "3");
                this.span
                    .append("text")
                    .text("Please zoom in (until 150 or fewer residues are shown) to see the probabilities")

            } else {
                this.featuresG = this.seq_g.selectAll("g.location-group").data(this._data);
                this.svg
                    .attr("height", this._height);
                // create residue group
                this.locations = this.featuresG
                    .enter()
                    .filter(d => d.start > this._displaystart - 3 && d.start < this._displayend + 3)
                    .append("g")
                    .attr("class", "location-group")
                    .attr("height", this._height);

                // create aa group and rectangle shape depending on probability score
                this.aminorect = this.locations.selectAll(".aminogroup")
                    .data(d => d.amino)
                    .enter()
                    .filter(d => d.probability > 0)
                    .append("g")
                    .attr("class", "aminogroup")
                    .append("rect")
                    .attr("class", "rectamino")
                    .style("fill", d => d.color)
                    .attr("y", d => d.ypos)
                    .attr("height", d => this._yScale(d.probability))
                    .attr("width", this.getSingleBaseWidth())
                    .style("stroke-width", "0.5")
                    .style("stroke", "rgb(211,211,211)")
                    .attr("x", d => this.getXFromSeqPosition(d.start));

                // add text with AA letter to rectangle
                this.locations.selectAll(".aminogroup")
                    .append("text")
                    .attr("class", "textamino")
                    .attr("y", d => d.ypos + (this._yScale(d.probability) / 2 + 5))
                    .attr("color", "black")
                    .text(d => d.oneLetterCode)
                    .attr("text-anchor", "middle")
                    .attr("x", d => this.getXFromSeqPosition(d.start) + this.getSingleBaseWidth() / 2)
                    .attr("font-size", d => this.adaptLabelFontSize(this.getSingleBaseWidth(), this._yScale(d.probability)));

                //highlight change
                this.locations
                    .on("mouseover", d => {
                        const self = this;
                        const e = d3.event;

                        this.dispatchEvent(
                            new CustomEvent("change", {
                                detail: {
                                    highlightend: d.end,
                                    highlightstart: d.start
                                },
                                bubbles: true,
                                cancelable: true
                            })
                        );
                    })
                    .on("mouseout", () => {
                        const self = this;
                        this.dispatchEvent(
                            new CustomEvent("change", {
                                detail: {
                                    highlightend: null,
                                    highlightstart: null
                                },
                                bubbles: true,
                                cancelable: true
                            })
                        );
                    })


                // add tooltip
                this.aminorect
                    .attr("tooltip-trigger", "true")
                    .on("mouseover", d => {
                        const self = this;
                        const e = d3.event;

                        const oldToolip = document.querySelectorAll("protvista-tooltip");
                        if (oldToolip && oldToolip[0] && oldToolip[0].className == 'click-open') {
                            //do nothing
                        } else {
                            window.setTimeout(function() {
                                const tooltipData = {
                                    start: d.start,
                                    end: d.end,
                                    feature: {
                                        ...d,
                                        type: "Amino acid probability"
                                    }
                                };
                                self.createTooltip(e, tooltipData);

                            }, 50);
                        }

                        this.dispatchEvent(
                            new CustomEvent("protvista-mouseover", {
                                detail: d,
                                bubbles: true,
                                cancelable: true
                            })
                        );
                    })
                    .on("mouseout", () => {
                        const self = this;

                        const oldToolip = document.querySelectorAll("protvista-tooltip");
                        if (oldToolip && oldToolip[0] && oldToolip[0].className == 'click-open') {
                            //do nothing
                        } else {
                            window.setTimeout(function() {
                                self.removeAllTooltips();
                            }, 50);
                        }

                        this.dispatchEvent(
                            new CustomEvent("protvista-mouseout", {
                                detail: null,
                                bubbles: true,
                                cancelable: true
                            })
                        );
                    })
                    .on("click", d => {
                        const self = this;
                        const tooltipData = {
                            start: d.start,
                            end: d.start,
                            feature: {
                                ...d,
                                type: "Sequence conservation"
                            }
                        };
                        self.createTooltip(d3.event, tooltipData, true);
                        self.dispatchEvent(
                            new CustomEvent("protvista-click", {
                                detail: tooltipData,
                                bubbles: true,
                                cancelable: true
                            })
                        );
                    });
            }

            this._updateHighlight();
        }
    }

    adaptLabelFontSize(rectwidth, rectheight) {
        const letterWidth = 9.40;

        // There is not enough space for the label so don't show it
        if (letterWidth > rectwidth || letterWidth > rectheight) {
            return 0 + 'em';
        }

        return 10 + 'px';
    }

    filterData(type) {
        if (type == 'probability') {
            this._data.forEach(residue => {
                residue.amino = residue.amino.sort(function(first, second) {
                    return second.probability - first.probability;
                });
            })
        } else {
            this._data.forEach(residue => {
                residue.amino = residue.amino.sort(function(first, second) {
                    return first.color.localeCompare(second.color);
                });
            })
        }
        this._createFeatures()
        this.refresh();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.manager) {
            this.manager.unregister(this);
        }
        document.removeEventListener("sc-change");
    }
}
export default ProtvistaPdbSeqConservation;