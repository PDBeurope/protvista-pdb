export interface APIVariationData {
  sequence: string;
  variants: APIVariant[];
}

interface Source {
  name: string;
  id: string;
}

interface Evidence {
  code: string | null;
  source: Source | null;
  url: string | null;
  alternativeUrl: string | null;
}

interface AssociationItem {
  name: string | null;
  disease: boolean | null;
  evidences: Evidence[] | null;
}

export interface APIVariant {
  accession?: string;
  association?: AssociationItem[];
  color?: string;
  end?: string;
  sourceType?: string;
  start?: string;
  tooltipContent?: string;
  variant?: string;
  xrefNames?: string[];
  keywords?: string[];
  pdbChain?: string;
  clinicalSignificances?: string;
  polyphenScore?: number;
  siftScore?: number;
}
