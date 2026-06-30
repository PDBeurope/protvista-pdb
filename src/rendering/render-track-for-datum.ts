import {
  NewProtvistaTrackDatum,
  NewProtvistaTrackDatumColourSeqTrack,
  NewProtvistaTrackDatumConsTrack,
  NewProtvistaTrackDatumHeatmapSeqTrack,
  NewProtvistaTrackDatumNestedTrack,
  NewProtvistaTrackDatumVarTrack,
} from '../track-data.model';
import { renderHeatmapXScale, renderHeatmapYScale } from './others/render-heatmap-scale';
import { renderTrackAsCanvas } from './tracks/render-canvas-track';
import { renderColouredSeqTrack } from './tracks/render-coloured-seq-track';
import { renderConservationTrack } from './tracks/render-conservation-track';
import { renderHeatmapSeqTrack } from './tracks/render-heatmap-track';
import { renderNestedTrackAsCanvas } from './tracks/render-nested-canvas-track';
import { renderVariationTrack } from './tracks/render-variation-track';

export function renderTrackForDatum(
  containerElementChild: HTMLElement,
  selector: string,
  datum: NewProtvistaTrackDatum,
  sequenceLength: number,
  extraMarginLeft: number,
  extraMarginRight: number,
  forceNested?: boolean
) {
  const isNested = forceNested ? true : false;
  const isCustomData = datum.isCustomData ? true : false;
  const colourIn3DControl = datum.colourIn3DControl ? true : false;
  if (datum.type === 'TrackCanvas') {
    renderTrackAsCanvas(
      containerElementChild,
      selector,
      datum,
      isCustomData,
      isNested,
      sequenceLength,
      `${datum.id}-track-container`,
      extraMarginLeft,
      extraMarginRight,
      colourIn3DControl,
      datum.isCustomFixed
    );
  } else if (datum.type === 'NestedTrackCanvas') {
    renderNestedTrackAsCanvas(
      containerElementChild,
      selector,
      datum as NewProtvistaTrackDatumNestedTrack,
      isCustomData,
      sequenceLength,
      `${datum.id}-track-container`,
      extraMarginLeft,
      extraMarginRight,
      colourIn3DControl
    );
  } else if (datum.type === 'TrackConservation') {
    renderConservationTrack(
      containerElementChild,
      selector,
      datum as NewProtvistaTrackDatumConsTrack,
      sequenceLength,
      `${datum.id}-track-container`,
      extraMarginLeft,
      extraMarginRight,
      colourIn3DControl
    );
  } else if (datum.type === 'TrackVariation') {
    renderVariationTrack(
      containerElementChild,
      selector,
      datum as NewProtvistaTrackDatumVarTrack,
      sequenceLength,
      `${datum.id}-track-container`,
      extraMarginLeft,
      extraMarginRight,
      colourIn3DControl
    );
  } else if (datum.type === 'TrackColouredSequence') {
    renderColouredSeqTrack(
      containerElementChild,
      selector,
      datum as NewProtvistaTrackDatumColourSeqTrack,
      sequenceLength,
      `${datum.id}-track-container`,
      extraMarginLeft,
      extraMarginRight,
      colourIn3DControl
    );
  } else if (datum.type === 'TrackHeatmapSequence') {
    const heatmapSeqTrackData = datum as NewProtvistaTrackDatumHeatmapSeqTrack;
    const hasXScale = heatmapSeqTrackData.hasXScale !== undefined ? heatmapSeqTrackData.hasXScale : false;
    const hasYScale = heatmapSeqTrackData.hasYScale !== undefined ? heatmapSeqTrackData.hasYScale : false;
    const mirrorYScale = heatmapSeqTrackData.mirrorYScale !== undefined ? heatmapSeqTrackData.mirrorYScale : false;

    const xScaleText = heatmapSeqTrackData.xScaleText !== undefined ? heatmapSeqTrackData.xScaleText : 'Residues';

    renderHeatmapSeqTrack(
      containerElementChild,
      selector,
      heatmapSeqTrackData,
      sequenceLength,
      hasYScale,
      mirrorYScale,
      `${datum.id}-track-container`,
      extraMarginLeft,
      extraMarginRight,
      colourIn3DControl
    );

    if (hasXScale) {
      renderHeatmapXScale(heatmapSeqTrackData.id, sequenceLength, xScaleText, hasYScale, mirrorYScale);
    }
    if (hasYScale) {
      const yScaleText = heatmapSeqTrackData.yScaleText !== undefined ? heatmapSeqTrackData.yScaleText : 'Amino acids';
      const trackHeight = heatmapSeqTrackData.trackHeight ? heatmapSeqTrackData.trackHeight : 40;
      const mirrorYScale = heatmapSeqTrackData.mirrorYScale ? heatmapSeqTrackData.mirrorYScale : false;
      renderHeatmapYScale(heatmapSeqTrackData.id, heatmapSeqTrackData.yDomain, trackHeight, yScaleText, heatmapSeqTrackData.heatmapType, mirrorYScale);
    }
  }
}
