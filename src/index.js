// original Nightingale components
import NightingaleManager from "@nightingale-elements/nightingale-manager";
import NightingaleSequence from "@nightingale-elements/nightingale-sequence";
import NightingaleSequenceHeatmap from "@nightingale-elements/nightingale-sequence-heatmap";
import { NightingaleScrollbox, NightingaleScrollboxItem } from "@nightingale-elements/nightingale-scrollbox";
import NightingaleLinegraphTrack from "@nightingale-elements/nightingale-linegraph-track";
import NightingaleConservationTrack from "@nightingale-elements/nightingale-conservation-track";
import NightingaleVariation from "@nightingale-elements/nightingale-variation";
import NightingaleFilter from "@nightingale-elements/nightingale-filter";
import NightingaleBoxplotTrack from "./vendor/nightingale-boxplot-track/index.js";

// customised PV components
import ProtvistaPdbNavigation from "./custom-pv-components/pdb-navigation";
import ProtvistaPdbLigandsSequence from "./custom-pv-components/pdb-ligand-atoms-seq";
import ProtvistaPdbTrack from './custom-pv-components/pdb-track'
import ProtvistaPdbScHistogram from './custom-pv-components/pdb-sc-histogram'
import ProtvistaPdbSeqConservation from './custom-pv-components/pdb-seq-conservation'
import ProtvistaPdbVariationGraph from './custom-pv-components/pdb-variation-graph'
import ProtvistaPdbVariation from './custom-pv-components/pdb-variation'
import ProtvistaPdbTooltip from './custom-pv-components/pdb-tooltip'
import ProtvistaPdbBoxplotTrack from "./custom-pv-components/pdb-boxplot-track"
import ProtvistaPdbBoxplotLinegraph from "./custom-pv-components/pdb-boxplot-linegraph";
import ProtvistaPDB from './protvista-pdb';
import { loadComponent } from "./loadComponent";

const registerWebComponents = function() {
    loadComponent("nightingale-manager", NightingaleManager);
    loadComponent("nightingale-sequence", NightingaleSequence);
    loadComponent("nightingale-sequence-heatmap", NightingaleSequenceHeatmap);
    loadComponent("nightingale-scrollbox", NightingaleScrollbox);
    loadComponent("nightingale-scrollbox-item", NightingaleScrollboxItem);
    loadComponent("nightingale-conservation-track", NightingaleConservationTrack);
    loadComponent("nightingale-linegraph-track", NightingaleLinegraphTrack);
    loadComponent("nightingale-variation", NightingaleVariation);
    loadComponent("nightingale-filter", NightingaleFilter);
    loadComponent("nightingale-boxplot-track", NightingaleBoxplotTrack);
    loadComponent("protvista-pdb-navigation", ProtvistaPdbNavigation);
    loadComponent("protvista-pdb-ligand-seq", ProtvistaPdbLigandsSequence);
    loadComponent("protvista-pdb-track", ProtvistaPdbTrack);
    loadComponent("protvista-pdb-sc-histogram", ProtvistaPdbScHistogram);
    loadComponent("protvista-pdb-seq-conservation", ProtvistaPdbSeqConservation);
    loadComponent("protvista-pdb-variation-graph", ProtvistaPdbVariationGraph);
    loadComponent("protvista-pdb-variation", ProtvistaPdbVariation);
    loadComponent("protvista-tooltip", ProtvistaPdbTooltip);
    loadComponent("protvista-pdb-boxplot-track", ProtvistaPdbBoxplotTrack);
    loadComponent("protvista-pdb-boxplot-linegraph", ProtvistaPdbBoxplotLinegraph);
    loadComponent('protvista-pdb', ProtvistaPDB);
}

// Conditional loading of polyfill
if (window.customElements) {
    registerWebComponents();
} else {
    document.addEventListener('WebComponentsReady', function() {
        registerWebComponents();
    });
}