import { NewProtvistaNestedChild, NewProtvistaTrackDatumNestedTrack } from '../../track-data.model';
import { getLoadingDataHTML } from '../templates-rendering/loading-data-track-html';
import { getNestedTrackCanvasHTML } from '../templates-rendering/nested-canvas-track-html';
import { getNoDataHTML } from '../templates-rendering/no-data-track-html';
import { renderTrackAsCanvas } from './render-canvas-track';

/**
 * Renders nested tracks as track canvas, status track or no-data track depending on data
 */
export function renderNestedTrackAsCanvas(
  containerElementChild: HTMLElement,
  selector: string,
  nestedTrackData: NewProtvistaTrackDatumNestedTrack,
  isCustomData: boolean,
  sequenceLength: number,
  trackId?: string,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean
) {
  const trackContainer = containerElementChild?.querySelector(selector);
  if (!trackContainer) return;

  // Find or create the track row element
  let nestedTrackRow: HTMLElement | null = trackId ? trackContainer.querySelector<HTMLElement>(`#${trackId}`) : null;

  // If it doesn't exist, create it
  if (!nestedTrackRow) {
    nestedTrackRow = document.createElement('div');
    nestedTrackRow.classList.add('pv-track-row');
    if (trackId) nestedTrackRow.id = trackId;
    if (isCustomData) nestedTrackRow.classList.add('custom-row');
    trackContainer.appendChild(nestedTrackRow);
  } else {
    nestedTrackRow.className = '';
    nestedTrackRow.classList.add('pv-track-row');
    if (trackId) nestedTrackRow.id = trackId;
    if (isCustomData) nestedTrackRow.classList.add('custom-row');
  }
  nestedTrackRow.classList.add('main-track');

  // Update content depending on status
  if (
    nestedTrackData.status === 'ready-has-data' &&
    nestedTrackData.data.length > 0 &&
    nestedTrackData.childData.length > 0 &&
    nestedTrackData.childData.every((child: NewProtvistaNestedChild) => child.data.length > 0)
  ) {
    const trackHeight = nestedTrackData.trackHeight !== undefined ? nestedTrackData.trackHeight : 40;
    nestedTrackRow.innerHTML = getNestedTrackCanvasHTML(
      nestedTrackData.id,
      nestedTrackData.name,
      trackHeight,
      isCustomData,
      sequenceLength,
      extraMarginLeft,
      extraMarginRight
    );
    for (const trackData of nestedTrackData.childData) {
      renderTrackAsCanvas(
        containerElementChild,
        `.for-expanded-${nestedTrackData.id}`,
        trackData,
        isCustomData,
        true,
        sequenceLength,
        undefined,
        extraMarginLeft,
        extraMarginRight,
        colourIn3DControl
      );
    }
  } else if (nestedTrackData.status === 'ready-empty') {
    nestedTrackRow.classList.add('no-data');
    nestedTrackRow.innerHTML = getNoDataHTML(nestedTrackData.name);
  } else if (nestedTrackData.status === 'not-loaded') {
    nestedTrackRow.classList.add('no-data');
    nestedTrackRow.innerHTML = getLoadingDataHTML(nestedTrackData.name, extraMarginLeft, extraMarginRight);
  } else {
    console.warn(`Unknown track status: ${nestedTrackData.status}`);
    nestedTrackRow.classList.add('no-data');
    nestedTrackRow.innerHTML = getNoDataHTML(nestedTrackData.name);
  }
}
