export interface APITrackData {
  sequence: string;
  length: number;
  largeLabels?: boolean;
  tracks: APITrackDatum[];
  legends?: APITrackLegends;
}

export interface APITrackDatum {
  label: string;
  labelType: string;
  data: APITrackItem[];
  // attrs for secondary_structures https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/protvista/secondary_structure/1trn/1;
  overlapping?: string; // true or false
  labelColor?: string; // Secondary structure has Flexibility predictions and Early folding residue predictions
}

export interface APITrackItem {
  color: string;
  type: string;
  labelType: string;
  tooltipContent: string;
  accession: string;
  label: string;
  labelTooltip: string;
  entityId: number;
  bestChainId: string;
  locations: APITrackLocation[];
  // attrs for chains https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/protvista/chains/1trn/1
  shape?: string;
  chainId?: string;
  // attrs for binding_sites https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/protvista/binding_sites/1trn/1
  scaffold_id?: string;
  cofactor_id?: string;
  residue_count?: number;
}

interface APITrackLocation {
  fragments: APITrackFragment[];
}

export interface APITrackFragment {
  fill?: string;
  color?: string;
  start: number;
  end: number;
  unp_start?: number;
  unp_end?: number;
  tooltipContent: string;
  // attrs for annotations https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/protvista/annotations/1trn/1
  siteId: number;
  shape: string;
}

interface APITrackLegends {
  data: {
    [key: string]: APITrackLegendColors[];
  };
  alignment: string;
}

interface APITrackLegendColors {
  color: string | string[] /** "rgb(141,151,195)", "rgb(120,133,192)", "rgb(98,115,189)", */;
  text: string;
}
