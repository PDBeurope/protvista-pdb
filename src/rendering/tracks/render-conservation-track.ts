import { NewProtvistaTrackDatumConsTrack } from '../../track-data.model';
import { getConsTrackCanvasHTML } from '../templates-rendering/conservation-track-html';
import { getLoadingDataHTML } from '../templates-rendering/loading-data-track-html';
import { getNoDataHTML } from '../templates-rendering/no-data-track-html';

/**
 * Renders conservation track, status track or no-data track depending on data
 */
export function renderConservationTrack(
  containerElementChild: HTMLElement,
  selector: string,
  consTrackData: NewProtvistaTrackDatumConsTrack,
  sequenceLength: number,
  trackId?: string,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
) {
  const trackContainer = containerElementChild.querySelector(selector);
  if (!trackContainer) return;

  // Find or create the track row element
  let consTrackRow: HTMLElement | null = trackId ? trackContainer.querySelector<HTMLElement>(`#${trackId}`) : null;

  // If it doesn't exist, create it
  if (!consTrackRow) {
    consTrackRow = document.createElement('div');
    if (trackId) consTrackRow.id = trackId;
    trackContainer.appendChild(consTrackRow);
  } else {
    consTrackRow.className = '';
  }
  consTrackRow.classList.add('main-track');

  // Update content depending on status
  switch (consTrackData.status) {
    case 'ready-has-data':
      consTrackRow.classList.add('conservation-container');
      consTrackRow.innerHTML = getConsTrackCanvasHTML(consTrackData.id, consTrackData.name, sequenceLength, extraMarginLeft, extraMarginRight, colourIn3DControl);
      break;

    case 'ready-empty':
      consTrackRow.classList.add('pv-track-row');
      consTrackRow.classList.add('no-data');
      consTrackRow.innerHTML = getNoDataHTML(consTrackData.name);
      break;

    case 'not-loaded':
      consTrackRow.classList.add('pv-track-row');
      consTrackRow.classList.add('no-data');
      consTrackRow.innerHTML = getLoadingDataHTML(consTrackData.name, extraMarginLeft, extraMarginRight);
      break;

    default:
      console.warn(`Unknown track status: ${consTrackData.status}`);
      break;
  }
}
