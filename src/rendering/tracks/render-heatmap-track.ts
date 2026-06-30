import { NewProtvistaTrackDatumHeatmapSeqTrack } from '../../track-data.model';
import { getHeatmapSeqTrackHTML } from '../templates-rendering/heatmap-track-html';
import { getLoadingDataHTML } from '../templates-rendering/loading-data-track-html';
import { getNoDataHTML } from '../templates-rendering/no-data-track-html';

/**
 * Renders coloured sequence track, status track or no-data track depending on data
 */
export function renderHeatmapSeqTrack(
  containerElementChild: HTMLElement,
  selector: string,
  heatmapSeqTrackData: NewProtvistaTrackDatumHeatmapSeqTrack,
  sequenceLength: number,
  hasYScale: boolean,
  mirrorYScale: boolean,
  trackId?: string,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
) {
  const trackContainer = containerElementChild.querySelector(selector);
  if (!trackContainer) return;

  // Find or create the track row element
  let heatmapSeqTrackRow: HTMLElement | null = trackId ? trackContainer.querySelector<HTMLElement>(`#${trackId}`) : null;

  // If it doesn't exist, create it
  if (!heatmapSeqTrackRow) {
    heatmapSeqTrackRow = document.createElement('div');
    heatmapSeqTrackRow.classList.add('pv-track-row');
    if (trackId) heatmapSeqTrackRow.id = trackId;
    trackContainer.appendChild(heatmapSeqTrackRow);
  } else {
    heatmapSeqTrackRow.className = '';
    heatmapSeqTrackRow.classList.add('pv-track-row');
    heatmapSeqTrackRow.className = '';
  }
  heatmapSeqTrackRow.classList.add('main-track');

  const trackHeight = heatmapSeqTrackData.trackHeight !== undefined ? heatmapSeqTrackData.trackHeight : 40;
  const isExpandable = heatmapSeqTrackData.isExpandable !== undefined ? heatmapSeqTrackData.isExpandable : true;

  // Update content depending on status
  switch (heatmapSeqTrackData.status) {
    case 'ready-has-data':
      heatmapSeqTrackRow.innerHTML = getHeatmapSeqTrackHTML(
        heatmapSeqTrackData.id,
        heatmapSeqTrackData.name,
        trackHeight,
        sequenceLength,
        heatmapSeqTrackData.heatmapId,
        isExpandable,
        mirrorYScale,
        hasYScale,
        extraMarginLeft,
        extraMarginRight,
        colourIn3DControl
      );
      break;

    case 'ready-empty':
      heatmapSeqTrackRow.classList.add('no-data');
      heatmapSeqTrackRow.innerHTML = getNoDataHTML(heatmapSeqTrackData.name);
      break;

    case 'not-loaded':
      heatmapSeqTrackRow.classList.add('no-data');
      heatmapSeqTrackRow.innerHTML = getLoadingDataHTML(heatmapSeqTrackData.name, extraMarginLeft, extraMarginRight, trackHeight);
      break;

    default:
      console.warn(`Unknown track status: ${heatmapSeqTrackData.status}`);
      break;
  }
}
