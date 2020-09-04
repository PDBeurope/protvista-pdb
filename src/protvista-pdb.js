import { html, render } from "lit-html";
import "../styles/protvista-pdb.css"; // customised PDBe styling
import filterData from "./custom-pv-components/filters"; // filter component data for PDBe implementation

// PDBe PV section-wise templates
import PDBePvNavSection from "./section-templates/navigation";
import PDBePvSeqSection from "./section-templates/sequence";
import PDBePvTracksSection from "./section-templates/tracks";
import PDBePvScSection from "./section-templates/seq-conservation";
import PDBePvVariationSection from "./section-templates/variation";
import PDBePvLegendsSection from "./section-templates/legends";

// Helper modules
import DataHelper from "./helpers/data"
import LayoutHelper from "./helpers/layout"

class ProtvistaPDB extends HTMLElement {
    constructor() {
        super();

        // Initial Viewer Data
        this.viewerData = {
            displayNavigation: true,
            displaySequence: true,
            displayConservation: false,
            displayVariants: false,
            sequence: undefined,
            length: undefined,
            tracks: [],
            legends: {
                alignment: 'right',
                data: {}
            }
        };

        // Create layout helper instance
        this.layoutHelper = new LayoutHelper(this);
    }

    set viewerdata(data) {
        if (!data) return;

        this.displayLoadingMessage();

        this.viewerData = data;
        this.viewerData.displayNavigation = (typeof data.displayNavigation !== 'undefined') ? data.displayNavigation : true;
        this.viewerData.displaySequence = (typeof data.displaySequence !== 'undefined') ? data.displaySequence : true;

        if(typeof this.viewerData.sequenceConservation !== 'undefined') this.viewerData.displayConservation = true;
        if(typeof this.viewerData.variants !== 'undefined') this.viewerData.displayVariants = true;
        
        this._render();
    }

    async connectedCallback() {

        // Attribute values
        this._accession = this.getAttribute("accession");
        this._entityId = this.getAttribute("entity-id");
        this._entryId = this.getAttribute("entry-id");
        this.customData = this.getAttribute("custom-data");
        this.pageSection = this.getAttribute("page-section");
        let envAttrValue = this.getAttribute("env");
        this.subscribeEvents = (this.getAttribute("subscribe-events") === 'false') ? false : true;
        this.showLegends = (this.getAttribute("legends") === 'false') ? false : true;
        
        // Default web-component state properties
        this.hiddenSubtracks = {};
        this.hiddenSections = [];
        this.scrollbarWidth = 0;
        this.formattedSubTracks = [];
        this.zoomedTrack = '';
        this.variantFilterAttr = JSON.stringify(filterData);
        
        this.displayLoadingMessage();

        if(typeof this.customData !== 'undefined' && this.customData !== null) return;

        // Create data helper instance and get data from PDBe PV APIs
        this.dataHelper = new DataHelper(envAttrValue, this._accession, this._entryId, this._entityId, this.pageSection);
        this.viewerData = await this.dataHelper.processMutlplePDBeApiData();
        this.viewerData.displayConservation = (this.pageSection && this.pageSection == '2') ? false : true;
        this.viewerData.displayVariants = (this.pageSection && this.pageSection == '2') ? false : true;

        this._render();
    }

    _render() {

        if(!this.viewerData.length || this.viewerData.tracks.length == 0){
            this.displayErrorMessage();
            return;
        }

        if(!this.showLegends) delete this.viewerData.legends;

        const mainHtml = () => html`
        <div class="protvista-pdb">
            <span class="labelTooltipBox" style="display:none"></span>
            <protvista-manager attributes="length displaystart displayend highlightstart highlightend activefilters filters">
                
                <!-- Navigation section -->
                ${this.viewerData.displayNavigation ? html`${PDBePvNavSection(this)}` : ``}
                
                <!-- Sequence section -->
                ${this.viewerData.displaySequence ? html`${PDBePvSeqSection(this)}` : ``}
                
                <!-- Tracks section -->
                ${PDBePvTracksSection(this)}
                
                <!-- Sequence conservation section -->
                ${this.viewerData.displayConservation ? html`${PDBePvScSection(this)}` : ``}
                
                <!-- Variations section -->
                ${this.viewerData.displayVariants ? html`${PDBePvVariationSection(this)}` : ``}
                
                <!-- Legends section -->
                ${this.viewerData.legends ? html`${PDBePvLegendsSection(this)}` : ``}

            </protvista-manager>
        </div>

        <!-- div to measure scrollbar width for padding -->
        <div class="divWithScroll">
            <div style="height: 60px;width:80%"></div>
        </div>
        <div class="divWithoutScroll">&nbsp;</div>`;

        render(mainHtml(), this);

        // Post process layout to add scrollbar spacing and track data
        this.layoutHelper.postProcessLayout();
    }

    displayLoadingMessage() {
        render(html`<div class="protvista-pdb" style="text-align:center;">Loading Protvista...</div>`, this);
    }

    displayErrorMessage() {
        render(html`<div class="protvista-pdb" style="text-align:center;">Invalid data!</div>`, this);
    }

    disconnectedCallback() {
        this.layoutHelper.removeEventSubscription();
    }

  
}

export default ProtvistaPDB;