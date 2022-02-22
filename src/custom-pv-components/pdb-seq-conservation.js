import ProtvistaPdbTrack from "./pdb-track";
import { scaleLinear } from "d3";

class ProtvistaPdbSeqConservation extends ProtvistaPdbTrack {

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this._accession = this.getAttribute("accession");
        this._displayOrder = this.getAttribute('sc-display-order');
        this._data = undefined;
        this._height = parseInt(this.getAttribute("height")) || 430;
        this.aaYvalue = 20;
        this.displayOrder = this._displayOrder || 'property';
        this.aaList = ['H', 'Y', 'Q', 'S', 'T', 'N', 'M', 'L', 'I', 'V', 'A', 'F', 'W', 'D', 'E', 'P', 'K', 'R', 'C', 'G'];
        this.aaDetails = {
            'G': { name: 'Glycine', code: 'GLY', color: '#f09048' }, 
            'C': { name: 'Cysteine', code: 'CYS', color: '#f08080' }, 
            'R': { name: 'Arginine', code: 'ARG', color: '#f01505' }, 
            'K': { name: 'Lysine', code: 'LYS', color: '#f01505' }, 
            'P': { name: 'Proline', code: 'PRO', color: '#c0c000' }, 
            'E': { name: 'Glutamic acid', code: 'GLU', color: '#c048c0' }, 
            'D': { name: 'Aspartic acid', code: 'ASP', color: '#c048c0' }, 
            'W': { name: 'Tryptophan', code: 'TRP', color: '#80a0f0' }, 
            'M': { name: 'Methionine', code: 'MET', color: '#80a0f0' }, 
            'F': { name: 'Phenylalanine', code: 'PHE', color: '#80a0f0' }, 
            'I': { name: 'Isoleucine', code: 'ILE', color: '#80a0f0' }, 
            'V': { name: 'Valine', code: 'VAL', color: '#80a0f0' }, 
            'L': { name: 'Leucine', code: 'LEU', color: '#80a0f0' }, 
            'A': { name: 'Alanine', code: 'ALA', color: '#80a0f0' }, 
            'T': { name: 'Threonine', code: 'THR', color: '#15c015' }, 
            'Q': { name: 'Glutamine', code: 'GLN', color: '#15c015' }, 
            'S': { name: 'Serine', code: 'SER', color: '#15c015' }, 
            'N': { name: 'Asparagine', code: 'ASN', color: '#15c015' }, 
            'Y': { name: 'Tyrosine', code: 'TYR', color: '#15a4a4' }, 
            'H': { name: 'Histidine', code: 'HIS', color: '#15a4a4' }
        }
        this.propertySortedData = [];
        this.probabilitySortedData = [];
    }

    static get observedAttributes() {
        return super.observedAttributes.concat("sc-display-order");
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (oldVal !== newVal && attrName == 'sc-display-order') {
            if(oldVal !== null) this.resetDisplayData(newVal);
        }else{
          super.attributeChangedCallback(attrName, oldVal, newVal);
          if (!super.svg) {
            return;
          }
        }
    }

    set data(data) {
        this._data = data;
        this._createTrack();
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
        this._yScale = scaleLinear().domain([0, 1]).range([0, 400]);
    }

    _aaYPosition(aaIndex, aaProbability) {
        if(aaIndex === 0) this.aaYvalue = 20;
        let yPos = this.aaYvalue;
        this.aaYvalue += this._yScale(aaProbability);
        return yPos;
    }

    refresh() {
        if (this.xScale && this.seq_g) {

            this.svg.selectAll("foreignObject").remove();
            this.seq_g.selectAll("g.location-group").remove();

            const singleBaseWidth = this.getSingleBaseWidth();

            if (singleBaseWidth < 9.40) {

                this.foreign = this.svg.append("foreignObject").attr("width", '100%').attr("height", this._height);

                this.commentdiv = this.foreign.append("xhtml:div").attr("class", "zoomout").attr("style", "text-align: center; height: " + this._height + "px");

                this.span = this.commentdiv.append("span").attr("style", "line-height:" + this._height + "px");

                this.span.append("i").attr("class", "icon icon-functional").attr("data-icon", "3");
                this.span.append("text").text("Please zoom in (until 150 or fewer residues are shown) to see the probabilities");

            } else {
                this.featuresG = this.seq_g.selectAll("g.location-group").data(this._data.data.index);
                this.svg.attr("height", this._height);

                // create residue group
                this.locations = this.featuresG
                    .enter()
                    .filter(d => (d - 1) > this._displaystart - 3 && (d - 1) < this._displayend + 3)
                    .append("g")
                    .attr("class", "location-group")
                    .attr("height", this._height);

                // create aa group and rectangle shape depending on probability score
                this.aminorect = this.locations.selectAll(".aminogroup")
                    .data(d => this.getAaList(d))
                    .enter()
                    .filter((d, i, ele) => {
                        const residueNumber = ele[i]._parent.__data__;
                        return this._data.data[`probability_${d}`][residueNumber - 1] > 0;
                    })
                    .append("g")
                        .attr("class", "aminogroup")
                        .append("rect")
                            .attr("class", "rectamino")
                            .style("fill", d => this.aaDetails[d].color)
                            .attr("y", (d, i, ele) => {
                                const residueNumber = ele[i].parentElement.parentElement.__data__;
                                return this._aaYPosition(i, this._data.data[`probability_${d}`][residueNumber - 1]);
                            })
                            .attr("height", (d, i, ele) => {
                                const residueNumber = ele[i].parentElement.parentElement.__data__;
                                return this._yScale(this._data.data[`probability_${d}`][residueNumber - 1]);
                            })
                            .attr("width", singleBaseWidth)
                            .style("stroke-width", "0.5")
                            .style("stroke", "rgb(211,211,211)")
                            .attr("x", (d, i, ele) => {
                                const residueNumber = ele[i].parentElement.parentElement.__data__;
                                return this.getXFromSeqPosition(residueNumber);
                            })
                            .attr("data-res-details", (d, i, ele) => {
                                const residueNumber = ele[i].parentElement.parentElement.__data__;
                                return `${residueNumber}-${d}-${this._data.data[`probability_${d}`][residueNumber - 1]}`;
                            });

                // add text with AA letter to rectangle
                this.locations.selectAll(".aminogroup")
                    .append("text")
                        .attr("class", "textamino")
                        .style("cursor", "default")
                        .attr("y", (d, i, ele) => {
                            const residueNumber = ele[i].parentElement.parentElement.__data__;
                            const resProb = this._data.data[`probability_${d}`][residueNumber - 1];
                            const yPos = this._aaYPosition(i, resProb);
                            return yPos + (this._yScale(resProb) / 2 + 5);
                        })
                        .attr("color", "black")
                        .text(d => d)
                        .attr("text-anchor", "middle")
                        .attr("x", (d, i, ele) => {
                            const residueNumber = ele[i].parentElement.parentElement.__data__;
                            return this.getXFromSeqPosition(residueNumber) + singleBaseWidth / 2;
                        })
                        .attr("font-size", (d, i, ele) => {
                            const residueNumber = ele[i].parentElement.parentElement.__data__;
                            const resProb = this._data.data[`probability_${d}`][residueNumber - 1];
                            return this.adaptLabelFontSize(singleBaseWidth, this._yScale(resProb))
                        });

                
                //highlight change
                this.locations
                .on("click", () => {
                    const e = d3.event;
                    const targetEle = e.target;
                    const aaValue = targetEle.__data__;
                    const residueNumber = targetEle.parentElement.parentElement.__data__;
                    const resProb = this._data.data[`probability_${aaValue}`][residueNumber - 1];

                    const tooltipData = {
                        start: residueNumber,
                        end: residueNumber,
                        feature: {
                            tooltipContent: `Amino acid: ${this.aaDetails[aaValue].name} (${this.aaDetails[aaValue].code})<br/>Probability: ${(resProb * 100).toFixed(2)}%`,
                            type: "Sequence conservation"
                        }
                    };
                    
                    window.setTimeout(() => { this.createTooltip(e, tooltipData, true); }, 50);

                    this.dispatchEvent(
                        new CustomEvent("protvista-click", {
                            detail: tooltipData,
                            bubbles: false,
                            cancelable: true
                        })
                    );

                })
                .on("mouseover", () => {
                    const e = d3.event;
                    const targetEle = e.target;
                    const aaValue = targetEle.__data__;
                    const residueNumber = targetEle.parentElement.parentElement.__data__;
                    const resProb = this._data.data[`probability_${aaValue}`][residueNumber - 1];

                    const tooltipData = {
                        start: residueNumber,
                        end: residueNumber,
                        feature: {
                            tooltipContent: `Amino acid: ${this.aaDetails[aaValue].name} (${this.aaDetails[aaValue].code})<br/>Probability: ${(resProb * 100).toFixed(2)}%`,
                            type: "Sequence conservation"
                        }
                    };
                    
                    const oldToolip = document.querySelectorAll("protvista-tooltip");
                    if (oldToolip && oldToolip[0] && oldToolip[0].className == 'click-open') {
                        //do nothing
                    } else {
                        window.setTimeout(() => { this.createTooltip(e, tooltipData); }, 50);
                    }

                    this.dispatchEvent(
                        new CustomEvent("change", {
                            detail: {
                                highlightend: residueNumber,
                                highlightstart: residueNumber
                            },
                            bubbles: true,
                            cancelable: true
                        })
                    );

                    this.dispatchEvent(
                        new CustomEvent("protvista-mouseover", {
                            detail: tooltipData,
                            bubbles: false,
                            cancelable: true
                        })
                    );

                })
                .on("mouseout", () => {
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

                    const oldToolip = document.querySelectorAll("protvista-tooltip");
                    if (oldToolip && oldToolip[0] && oldToolip[0].className == 'click-open') {
                        //do nothing
                    } else {
                        window.setTimeout(() => { this.removeAllTooltips(); }, 50);
                    }

                    this.dispatchEvent(
                        new CustomEvent("protvista-mouseout", {
                            detail: null,
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

    getAaList(residueNumber) {

        // check in cache
        if(this[`${this.displayOrder}SortedData`][residueNumber - 1]) {
            return this[`${this.displayOrder}SortedData`][residueNumber - 1].split(',');
        }

        // generate sorted array
        let aaValuesList = [];
        this.aaList.forEach(aa => {
            aaValuesList.push({ aa: aa, value: this._data.data[`probability_${aa}`][residueNumber - 1], color: this.aaDetails[aa].color })
        });

        let sortedAAList = [];
        aaValuesList.sort((a, b) => {
            if(this.displayOrder === 'property') {
                if (a.color === b.color) return b.value - a.value;
                return a.color < b.color ? -1 : 1;
            } else {
                return b.value - a.value;
            }
        });
        sortedAAList = aaValuesList.map(aaVal => aaVal.aa);

        // add to cache
        this[`${this.displayOrder}SortedData`][residueNumber - 1] = sortedAAList.join(',');
        
        return sortedAAList;

    }

    resetDisplayData(orderType) {
        this.displayOrder = orderType;
        this.refresh();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.manager) {
            this.manager.unregister(this);
        }
    }
}
export default ProtvistaPdbSeqConservation;