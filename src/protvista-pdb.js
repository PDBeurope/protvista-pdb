import { html, render } from "lit";
import "../styles/protvista-pdb.css"; // customised PDBe styling
import "../styles/protvista-pdb-modal.css"; // customised PDBe styling
import "../styles/protvista-pdb-toolbar.css"; // customised PDBe styling
import "../styles/protvista-variation.css"; // customised PDBe styling
import filterData from "./custom-pv-components/filters"; // filter component data for PDBe implementation

// PDBe PV section-wise templates
import PDBePvNavSection from "./section-templates/navigation";
import PDBePvSeqSection from "./section-templates/sequence";
import PDBePvTracksSection from "./section-templates/tracks";
import PDBePvScSection from "./section-templates/seq-conservation";
import PDBePvVariationSection from "./section-templates/variation";
import PDBePvLegendsSection from "./section-templates/legends";
import PDBePvBoxplotSection from "./section-templates/boxplot";
import PDBePvCustomTracksSection from "./section-templates/custom-track/custom-tracks.js";
import PDBePvAddCustomTrackModal from "./section-templates/custom-track/custom-add-track-modal.js";
import PDBePvEditCustomTrackModal from "./section-templates/custom-track/custom-edit-track-modal.js";
import PDBePvZoomHighlightModal from "./section-templates/toolbar/zoom-highlight-modal.js";

// Helper modules
import DataHelper from "./helpers/data"
import LayoutHelper from "./helpers/layout"
import { addTrackUuids } from "./helpers/data-processing/data-track-uuids.js";

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

        this.pvTrackMargins = {
            right: 0,
            left: 0,
        }

        // Create layout helper instance
        this.layoutHelper = new LayoutHelper(this);

        this.uuidsToData = new Map();
        this.pinnedTracks = [];

        this.customTracks = [];
        this.customTracksEnabled = false;
        this._editTracksToRemove = [];
    }

    set viewerdata(data) {
        if (!data) return;

        this.displayLoadingMessage();

        this.viewerData = data;
        this.viewerData.tracks = addTrackUuids(this.viewerData.tracks);
        this.registerUuids([...this.viewerData.tracks, ...this.pinnedTracks]);
        this.viewerData.displayNavigation = (typeof data.displayNavigation !== 'undefined') ? data.displayNavigation : true;
        this.viewerData.displaySequence = (typeof data.displaySequence !== 'undefined') ? data.displaySequence : true;

        if(typeof this.viewerData.sequenceConservation !== 'undefined') this.viewerData.displayConservation = true;
        if(typeof this.viewerData.variants !== 'undefined') this.viewerData.displayVariants = true;
        if(typeof this.viewerData.boxplot !== 'undefined') {
            this.viewerData.displayBoxplot = true;
            this.pvTrackMargins.right = 10;
            this.pvTrackMargins.left = 35;
        }
        
        this._render();
    }

    set apinames(value) {
        this.apiNames = this.normaliseApiNames(value);
    }

    get apinames() {
        return this.apiNames;
    }

    set alwaysexpanded(value) {
        this.alwaysExpanded = this.normaliseApiNames(value);
    }

    get alwaysexpanded() {
        return this.alwaysExpanded;
    }

    set pinneddata(data) {
        this.pinnedTracks = Array.isArray(data) ? data : [];

        this.registerUuids([
            ...this.viewerData.tracks,
            ...this.pinnedTracks,
            ...this.customTracks,
        ]);

        this._render();
    }

    normaliseApiNames(value) {
        if (!value) return null;

        if (Array.isArray(value)) {
            return value
                .map(name => String(name).trim())
                .filter(Boolean);
        }

        if (typeof value === "string") {
            return value
                .split(",")
                .map(name => name.trim())
                .filter(Boolean);
        }

        return null;
    }

    registerUuids(listOfTracks) {
        const uuidsToData = new Map();

        for (const track of listOfTracks ?? []) {
            if (!track?.uuid) continue;

            uuidsToData.set(track.uuid, track);

            for (const subtrack of track.data ?? []) {
            if (subtrack?.uuid) {
                uuidsToData.set(subtrack.uuid, subtrack);
            }
            }
        }

        this.uuidsToData = uuidsToData;
    }

    getDataByUuid(uuid) {
        return this.uuidsToData.get(uuid) ?? null;
    }

    getAllTrackCollections() {
        return [
            ...(this.pinnedTracks ?? []).map((trackData, trackIndex) => ({
                prefix: "pinned",
                trackIndex,
                trackData,
            })),
            ...(this.customTracks ?? []).map((trackData, trackIndex) => ({
                prefix: "custom",
                trackIndex,
                trackData,
            })),
            ...(this.viewerData.tracks ?? []).map((trackData, trackIndex) => ({
                prefix: "main",
                trackIndex,
                trackData,
            })),
        ];
    }

    getAllHideableSections() {
        return [
            ...this.getAllTrackCollections().map(({ prefix, trackIndex, trackData }) => ({
                type: "track",
                prefix,
                trackIndex,
                trackUuid: trackData.uuid,
                label: trackData.label,
            })),
            ...(this.viewerData.displayConservation ? [{
                type: "conservation",
                label: "Sequence conservation",
            }] : []),
            ...(this.viewerData.displayVariants ? [{
                type: "variation",
                label: "Variation",
            }] : []),
            ...(this.viewerData.displayBoxplot ? [{
                type: "boxplot",
                label: "Relative solvent accessibility distribution",
            }] : []),
        ];
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
        this.useDefaultStyles = this.getAttribute("no-stylesheet") === null;
        this.useTrackStyles = this.getAttribute("no-track-styles") === null;
        this.apiNames = this.normaliseApiNames(
            this.apiNames || this.getAttribute("api-names")
        );
        this.alwaysExpanded = this.normaliseApiNames(
            this.alwaysExpanded || this.getAttribute("always-expanded")
        );
        this.expandFirst = this.normaliseApiNames(
            this.getAttribute("expand-first") ?? "main",
        );
        this.stickyHeader = this.getAttribute("sticky-header") !== "false";
        this.maxHeight = this.getAttribute("max-height");
        this.enableIn3D = this.getAttribute("enable-in3d") !== null;
        this.triggerFirstIn3D = this.getAttribute("trigger-first-in3d") !== null;
        this.customTracksEnabled = this.getAttribute("add-custom-track") !== null;
        this.useNewToolbar = this.getAttribute("new-toolbar") !== null;
        
        // Default web-component state properties
        this.hiddenSubtracks = {};
        this.hiddenSections = [];
        this.scrollbarWidth = 0;
        this.formattedSubTracks = [];
        this.zoomedTrack = '';
        this.variantFilterAttr = JSON.stringify(filterData);
        this.activeIn3DTrackUuid = null;
        this._firstIn3DTriggered = false;
        
        this.displayLoadingMessage();

        // Create data helper instance
        this.dataHelper = new DataHelper(envAttrValue, this._accession, this._entryId, this._entityId, this.pageSection, this.apiNames, this.alwaysExpanded);

        if(typeof this.customData !== 'undefined' && this.customData !== null) return;

        // Get data from PDBe PV APIs
        this.viewerData = await this.dataHelper.processMutlplePDBeApiData();
        this.registerUuids([...this.viewerData.tracks, ...this.pinnedTracks, ...this.customTracks]);
        this.viewerData.displayConservation = (this.pageSection && this.pageSection == '2') ? false : true;
        this.viewerData.displayVariants = (this.pageSection && this.pageSection == '2') ? false : true;
        this.viewerData.displayBoxplot = false;
        if (typeof this.viewerData.boxplot !== 'undefined') {
            this.viewerData.displayBoxplot = (this.pageSection && this.pageSection == '2') ? false : true;
            this.pvTrackMargins.right = 10;
            this.pvTrackMargins.left = 35;
        }

        this._render();
    }

    _render() {
        if(!this.viewerData.length || this.viewerData.tracks.length == 0){
            this.displayErrorMessage();
            return;
        }
        if(!this.showLegends) delete this.viewerData.legends;

        const mainHtml = () => html`
        <div
            class=${this.useDefaultStyles ? "protvista-pdb default-styles" : "protvista-pdb"}
            style=${this.maxHeight
              ? `max-height:${this.maxHeight};overflow-y:auto;`
              : ""}
        >
            <span class="labelTooltipBox" style="display:none"></span>

            <nightingale-manager reflected-attributes="length display-start display-end highlight activefilters filters">
                
                <div style="display:flex; flex-direction: column;    width: 100%;">
                   <div
                    class=${this.stickyHeader === false ? '' : 'protvistaStickyHeader'}
                    >
                        <div style="line-height: 0">
                        <!-- Navigation section -->
                        ${this.viewerData.displayNavigation ? html`${PDBePvNavSection(this)}` : ``}
                        </div>
                        
                        <div style="line-height: 0">
                        <!-- Sequence section -->
                        ${this.viewerData.displaySequence ? html`${PDBePvSeqSection(this)}` : ``}
                        </div>

                        <!-- Pinned tracks section -->
                        ${this.pinnedTracks?.length
                        ? html`<div style="line-height: 0">
                            ${PDBePvTracksSection(this, this.pinnedTracks, "pinned")}
                        </div>` : ``}                        
                        
                        <!-- Custom annotations tracks section -->
                        <div style="line-height: 0">
                        ${this.customTracksEnabled ? html`${PDBePvCustomTracksSection(this)}` : ``}
                        </div>
                    </div>

                    <div style="line-height: 0">
                    <!-- Tracks section -->
                    ${PDBePvTracksSection(this)}
                    </div>

                    <div style="line-height: 0">
                    <!-- RSA Distribuition section -->
                    ${this.viewerData.displayBoxplot ? html`${PDBePvBoxplotSection(this)}` : ``}
                    </div>
                
                    <div style="line-height: 0">
                    <!-- Sequence conservation section -->
                    ${this.viewerData.displayConservation ? html`${PDBePvScSection(this)}` : ``}
                    </div>

                    <div style="line-height: 0">
                    <!-- Variations section -->
                    ${this.viewerData.displayVariants ? html`${PDBePvVariationSection(this)}` : ``}
                    </div>

                    <!-- Legends section -->
                    ${this.viewerData.legends ? html`${PDBePvLegendsSection(this)}` : ``}
                </div>

            </nightingale-manager>
        </div>
        <!-- div to measure scrollbar width for padding -->
        <div class="divWithScroll">
            <div style="height: 60px;width:80%"></div>
        </div>
        <div class="divWithoutScroll">&nbsp;</div>
        <div class=${this.useDefaultStyles ? "protvista-pv-modal default-styles" : "protvista-pv-modal"}>
            <div class="customTrackModalContainer addTrack" style="display: none;">${PDBePvAddCustomTrackModal(this)}</div>
            <div class="customTrackModalContainer editTrack" style="display: none;">${PDBePvEditCustomTrackModal(this)}</div>
            <div class="customTrackModalContainer zoomHighlight" style="display: none;">${PDBePvZoomHighlightModal(this)}</div>
        </div>
        `;

        render(mainHtml(), this);

        // Post process layout to add scrollbar spacing and track data
        this.layoutHelper.postProcessLayout();
        this.layoutHelper.postProcessIn3D();
    }

    displayLoadingMessage() {
        render(html`<div class=${this.useDefaultStyles ? "protvista-pdb default-styles" : "protvista-pdb"} style="text-align:center;">Loading Protvista...</div>`, this);
    }

    displayErrorMessage() {
        render('', this);
    }

    disconnectedCallback() {
        this.layoutHelper.removeEventSubscription();
    }

  
}

export default ProtvistaPDB;