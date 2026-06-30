import { NewProtvistaTrackDatumColourSeqTrack } from '../../track-data.model';
import { getColouredSeqTrackHTML } from '../templates-rendering/coloured-seq-track-html';
import { getLoadingDataHTML } from '../templates-rendering/loading-data-track-html';
import { getNoDataHTML } from '../templates-rendering/no-data-track-html';

/**
 * Renders coloured sequence track, status track or no-data track depending on data
 */
export function renderColouredSeqTrack(
  containerElementChild: HTMLElement,
  selector: string,
  colourSeqTrackData: NewProtvistaTrackDatumColourSeqTrack,
  sequenceLength: number,
  trackId?: string,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
) {
  const trackContainer = containerElementChild.querySelector(selector);
  if (!trackContainer) return;

  // Find or create the track row element
  let colourSeqTrackRow: HTMLElement | null = trackId ? trackContainer.querySelector<HTMLElement>(`#${trackId}`) : null;

  // If it doesn't exist, create it
  if (!colourSeqTrackRow) {
    colourSeqTrackRow = document.createElement('div');
    colourSeqTrackRow.classList.add('pv-track-row');
    if (trackId) colourSeqTrackRow.id = trackId;
    trackContainer.appendChild(colourSeqTrackRow);
  } else {
    colourSeqTrackRow.className = '';
    colourSeqTrackRow.classList.add('pv-track-row');
    colourSeqTrackRow.className = '';
  }
  colourSeqTrackRow.classList.add('main-track');

  // Update content depending on status
  switch (colourSeqTrackData.status) {
    case 'ready-has-data': {
      const trackHeight = colourSeqTrackData.trackHeight !== undefined ? colourSeqTrackData.trackHeight : 40;
      const isExpandable = colourSeqTrackData.isExpandable !== undefined ? colourSeqTrackData.isExpandable : true;
      colourSeqTrackRow.innerHTML = getColouredSeqTrackHTML(
        colourSeqTrackData.id,
        colourSeqTrackData.name,
        trackHeight,
        sequenceLength,
        colourSeqTrackData.dataScale,
        colourSeqTrackData.dataRange,
        isExpandable,
        extraMarginLeft,
        extraMarginRight,
        colourIn3DControl
      );
      break;
    }
    case 'ready-empty': {
      colourSeqTrackRow.classList.add('no-data');
      colourSeqTrackRow.innerHTML = getNoDataHTML(colourSeqTrackData.name);
      break;
    }
    case 'not-loaded': {
      colourSeqTrackRow.classList.add('no-data');
      colourSeqTrackRow.innerHTML = getLoadingDataHTML(colourSeqTrackData.name, extraMarginLeft, extraMarginRight);
      break;
    }
    default: {
      console.warn(`Unknown track status: ${colourSeqTrackData.status}`);
      break;
    }
  }
}
