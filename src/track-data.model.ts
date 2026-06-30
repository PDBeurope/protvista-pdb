import { type Feature as NightingaleFeature } from '@nightingale-elements/nightingale-track';
import { APIConservationData } from './models/pv-api-conservation-track-data.model';
import { APIVariationData } from './models/pv-api-variation-track-data.model';
import { type LineData as NightingaleLineData } from '@nightingale-elements/nightingale-linegraph-track';
import { NightingaleSequenceConservation } from './processing/pv-conservation-api-processing';
import { type VariationData } from '@nightingale-elements/nightingale-variation';

type CommonParams = {
  id: string;
  type: string;
  name: string;
  status: string;
  isExpandable?: boolean;
  isSticky?: boolean;
  isCustomFixed?: boolean;
  isCustomData?: boolean;
  positionIndex?: number;
  trackHeight?: number;
  colourIn3DControl?: boolean;
};
export interface NewProtvistaTrackDatumTrack extends CommonParams {
  data: NightingaleFeature[] | null;
}

export interface NewProtvistaNestedChild extends CommonParams {
  data: NightingaleFeature[];
}

export interface NewProtvistaTrackDatumNestedTrack extends CommonParams {
  data: NightingaleFeature[];
  childData: NewProtvistaNestedChild[];
}

export interface NewProtvistaTrackDatumConsTrack extends CommonParams {
  data: APIConservationData | NightingaleSequenceConservation | undefined;
  aggChartData?: NightingaleLineData[];
}

export interface NewProtvistaTrackDatumVarTrack extends CommonParams {
  data: APIVariationData | VariationData | undefined;
  srcData?: APIVariationData;
  aggChartData?: NightingaleLineData[];
}

export interface NewProtvistaTrackDatumColourSeqTrack extends CommonParams {
  data: string;
  dataScale: string;
  dataRange: string;
}

export interface NewProtvistaTrackDatumHeatmapSeqTrack extends CommonParams {
  data: any;
  heatmapId: string;
  xDomain: number[];
  yDomain: string[];
  checkpoints: number[];
  colours: string[];
  heatmapType?: 'AFdbAlphaMissense' | 'PDBeLigands';
  hasXScale?: boolean;
  xScaleText?: string;
  hasYScale?: boolean;
  yScaleText?: string;
  mirrorYScale?: boolean;
  tooltipContentFn?: (d: any) => string;
  customColourScale?: (d: any) => string;
}

export type NewProtvistaTrackDatum =
  | NewProtvistaTrackDatumTrack
  | NewProtvistaTrackDatumNestedTrack
  | NewProtvistaTrackDatumConsTrack
  | NewProtvistaTrackDatumVarTrack
  | NewProtvistaTrackDatumColourSeqTrack
  | NewProtvistaTrackDatumHeatmapSeqTrack;

export interface NewProtvistaDialogEvent {
  open: boolean;
  position?: DOMRect | { x: number; y: number; width: number; height: number };
}

export interface NewProtvistaColourEvent {
  trackId: string;
}
