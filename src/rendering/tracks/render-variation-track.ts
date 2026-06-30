import { APIVariationData } from './../../models/pv-api-variation-track-data.model';
import { NewProtvistaTrackDatumVarTrack } from '../../track-data.model';
import { getLoadingDataHTML } from '../templates-rendering/loading-data-track-html';
import { getNoDataHTML } from '../templates-rendering/no-data-track-html';
import { getVarTrackCanvasHTML } from '../templates-rendering/variation-track-html';

/**
 * Renders variation track, status track or no-data track depending on data
 */
export function renderVariationTrack(
  containerElementChild: HTMLElement,
  selector: string,
  varTrackData: NewProtvistaTrackDatumVarTrack,
  sequenceLength: number,
  trackId?: string,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
) {
  const trackContainer = containerElementChild?.querySelector(selector);
  if (!trackContainer) return;

  // Find or create the track row element
  let varTrackRow: HTMLElement | null = trackId ? trackContainer.querySelector<HTMLElement>(`#${trackId}`) : null;

  // If it doesn't exist, create it
  if (!varTrackRow) {
    varTrackRow = document.createElement('div');
    if (trackId) varTrackRow.id = trackId;
    trackContainer.appendChild(varTrackRow);
  } else {
    varTrackRow.className = '';
  }
  varTrackRow.classList.add('main-track');

  // Update content depending on status
  switch (varTrackData.status) {
    case 'ready-has-data':
      varTrackRow.classList.add('variation-container');
      varTrackRow.innerHTML = getVarTrackCanvasHTML(
        varTrackData.id,
        varTrackData.name,
        varTrackData.data as APIVariationData,
        sequenceLength,
        extraMarginLeft,
        extraMarginRight,
        colourIn3DControl
      );
      break;

    case 'ready-empty':
      varTrackRow.classList.add('pv-track-row');
      varTrackRow.classList.add('no-data');
      varTrackRow.innerHTML = getNoDataHTML(varTrackData.name);
      break;

    case 'not-loaded':
      varTrackRow.classList.add('pv-track-row');
      varTrackRow.classList.add('no-data');
      varTrackRow.innerHTML = getLoadingDataHTML(varTrackData.name, extraMarginLeft, extraMarginRight);
      break;

    default:
      console.warn(`Unknown track status: ${varTrackData.status}`);
      break;
  }
}
