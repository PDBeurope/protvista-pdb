// Define amino acid probability keys separately
type AminoAcid = 'A' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'K' | 'L' | 'M' | 'N' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'V' | 'W' | 'Y';

// Mapped type for probability keys
export type AminoAcidProbabilities = {
  [K in `probability_${AminoAcid}`]: number[];
};

// Define the structure for data using the mapped type
export interface ConservationDataDetails extends AminoAcidProbabilities {
  index: number[];
  conservation_score: number[];
}

export interface APIConservationData {
  identifier: string;
  main_track_color: string;
  sub_track_color: string;
  data: ConservationDataDetails;
  length: number;
  seq_id: string;
}
