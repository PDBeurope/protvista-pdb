import { NewProtvistaNestedChild, NewProtvistaTrackDatum } from '../../track-data.model';
import { getTrackCanvasHTML } from '../templates-rendering/canvas-track-html';
import { getLoadingDataHTML } from '../templates-rendering/loading-data-track-html';
import { getNoDataHTML } from '../templates-rendering/no-data-track-html';
import { type Feature as NightingaleFeature } from '@nightingale-elements/nightingale-track';

/**
 * Renders tracks as track canvas, status track or no-data track depending on data
 */
export function renderTrackAsCanvas(
  containerElementChild: HTMLElement,
  selector: string,
  trackData: NewProtvistaNestedChild | NewProtvistaTrackDatum,
  isCustomData: boolean,
  isNested: boolean,
  sequenceLength: number,
  trackId?: string,
  extraMarginLeft?: number,
  extraMarginRight?: number,
  colourIn3DControl?: boolean,
  isCustomFixed?: boolean
) {
  const trackContainer = containerElementChild?.querySelector(selector);
  if (!trackContainer) return;

  // Find or create the track row element
  let trackRow: HTMLElement | null = trackId ? trackContainer.querySelector<HTMLElement>(`#${trackId}`) : null;

  // If it doesn't exist, create it
  if (!trackRow) {
    trackRow = document.createElement('div');
    trackRow.classList.add('pv-track-row');
    if (trackId) trackRow.id = trackId;
    if (isCustomData) trackRow.classList.add('custom-row');
    trackContainer.appendChild(trackRow);
  } else {
    trackRow.className = '';
    trackRow.classList.add('pv-track-row');
    if (trackId) trackRow.id = trackId;
    if (isCustomData) trackRow.classList.add('custom-row');
  }
  if (!isNested) trackRow.classList.add('main-track');
  if (isCustomFixed) trackRow.classList.add('custom-fixed');

  if (trackData.status === 'ready-has-data' && trackData.data && (trackData.data as NightingaleFeature[]).length > 0) {
    const trackHeight = trackData.trackHeight !== undefined ? trackData.trackHeight : 40;
    const isExpandable = trackData.isExpandable !== undefined ? trackData.isExpandable : true;
    trackRow.innerHTML = getTrackCanvasHTML(
      trackData.id,
      trackData.name,
      trackHeight,
      isCustomData,
      isNested,
      sequenceLength,
      isExpandable,
      extraMarginLeft,
      extraMarginRight,
      colourIn3DControl
    );
  } else if (trackData.status === 'ready-empty') {
    trackRow.classList.add('no-data');
    trackRow.innerHTML = getNoDataHTML(trackData.name);
  } else if (trackData.status === 'not-loaded') {
    trackRow.classList.add('no-data');
    trackRow.innerHTML = getLoadingDataHTML(trackData.name, extraMarginLeft, extraMarginRight);
  } else {
    console.warn(`Unknown track status: ${trackData.status}`);
    trackRow.classList.add('no-data');
    trackRow.innerHTML = getNoDataHTML(trackData.name);
  }
}
