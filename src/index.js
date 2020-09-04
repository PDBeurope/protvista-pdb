// original PV components
import ProtvistaManager from "protvista-manager";
import ProtvistaSequence from "protvista-sequence";
import ProtvistaFilter from "protvista-filter";

// customised PV components
import ProtvistaPdbNavigation from "./custom-pv-components/pdb-navigation";
import ProtvistaPdbTrack from './custom-pv-components/pdb-track'
import ProtvistaPdbScHistogram from './custom-pv-components/pdb-sc-histogram'
import ProtvistaPdbSeqConservation from './custom-pv-components/pdb-seq-conservation'
import ProtvistaPdbVariationGraph from './custom-pv-components/pdb-variation-graph'
import ProtvistaPdbVariation from './custom-pv-components/pdb-variation'
import ProtvistaPdbTooltip from './custom-pv-components/pdb-tooltip'
import ProtvistaPDB from './protvista-pdb';
import { loadComponent } from "./loadComponent";

const registerWebComponents = function() {
    loadComponent("protvista-manager", ProtvistaManager);
    loadComponent("protvista-sequence", ProtvistaSequence);
    loadComponent("protvista-filter", ProtvistaFilter);
    loadComponent("protvista-pdb-navigation", ProtvistaPdbNavigation);
    loadComponent("protvista-pdb-track", ProtvistaPdbTrack);
    loadComponent("protvista-pdb-sc-histogram", ProtvistaPdbScHistogram);
    loadComponent("protvista-pdb-seq-consevation", ProtvistaPdbSeqConservation);
    loadComponent("protvista-pdb-variation-graph", ProtvistaPdbVariationGraph);
    loadComponent("protvista-pdb-variation", ProtvistaPdbVariation);
    loadComponent("protvista-tooltip", ProtvistaPdbTooltip);
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