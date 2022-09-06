import ProtvistaPdbTrack from "./pdb-track";
import { render } from "lit-html";
import {
    scaleLinear,
} from "d3";

class ProtvistaPdbScHistogram extends ProtvistaPdbTrack {

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        this._accession = this.getAttribute("accession");

        this._data = undefined;

        this._height = parseInt(this.getAttribute("height")) || 44;
    }

    set data(data) {
        this._data = data;
        this._createTrack();
    }

    getFeatureShape(totalHeight, width, height) {
        return (
            "M0," + totalHeight +
            "L0," + (totalHeight - height) +
            "L" + width + "," + (totalHeight - height) +
            "L" + width + "," + totalHeight +
            "Z"
        );
    }

    _createFeatures() {
        this._yScale = scaleLinear()
            .domain([0, 10])
            .range([0, 30]);

        this.featuresG = this.seq_g.selectAll("g.location-group").data(this._data.data.index);

        this.locations = this.featuresG
            .enter()
            .filter(d => this._data.data.conservation_score[d- 1] > 0)
            .append("g")
            .attr("class", "location-group");

        // create aa group and rectangle shape depending on probability score
        this.locations
            .append("path")
            .attr("class", "feature")
            .attr("tooltip-trigger", "true")
            .attr("id", d => "hsc_" + d)
            .attr("fill", "rgb(128, 128, 128)")
            .on("mouseover", d => {
                const self = this;
                const e = d3.event;

                const oldToolip = document.querySelectorAll("protvista-tooltip");
                if (oldToolip && oldToolip[0] && oldToolip[0].className === 'click-open') {
                    //do nothing
                } else {
                    window.setTimeout(function() {
                        const tooltipData = {
                            start: d,
                            end: d,
                            feature: {
                                tooltipContent: `Conservation score: ${self._data.data.conservation_score[d- 1]}`,
                                labelColor: 'rgb(211,211,211)',
                                type: "Sequence conservation"
                            }
                        };
                        self.createTooltip(e, tooltipData);

                    }, 50);
                }

                this.dispatchEvent(
                    new CustomEvent("change", {
                        detail: {
                            highlightend: d,
                            highlightstart: d
                        },
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

                self.dispatchEvent(
                    new CustomEvent("change", {
                        detail: {
                            highlightend: null,
                            highlightstart: null
                        },
                        bubbles: true,
                        cancelable: true
                    })
                );
                self.dispatchEvent(
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
                    start: d,
                    end: d,
                    feature: {
                        tooltipContent: `Conservation score: ${self._data.data.conservation_score[d- 1]}`,
                        labelColor: 'rgb(211,211,211)',
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

    refresh() {
        if (this.xScale && this.seq_g) {
            let singleBasedwidth = this.getSingleBaseWidth();

            this.features = this.seq_g.selectAll("path.feature").data(
                this._data.data.index.filter(d => this._data.data.conservation_score[d- 1] > 0));

            this.features
                .attr("d", d => {
                    return this.getFeatureShape(
                        this._height,
                        singleBasedwidth,
                        this._yScale(this._data.data.conservation_score[d- 1])
                    )
                })
                .attr("transform", (d, i) => {
                    return `translate(${this.getXFromSeqPosition(d)}, 0)`
                })
                .attr("fill", "rgb(128, 128, 128)");

            this._updateHighlight();
        }

    }
}

export default ProtvistaPdbScHistogram;