export interface PanelResidueDatum {
  resId: string;
  resName: string;
  uniprotIdx?: string;
  authorIdx?: string;
}
export interface CustomTrackPayload {
  rawText: string;
  numberingScheme: 'residue' | 'author' | 'uniprot';
  selectedUniProtAccession: string | null;
}
export interface FixedSelectionInput {
  trackName: string;
  trackSegments: string; // e.g. "10-20,25-25,50-51"
  trackTooltip: string;
}
