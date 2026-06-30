import { NewProtvistaTrackDatum } from '../../track-data.model';
import { insertTrackAtPosition } from '../helpers';
import { renderTrackForDatum } from '../render-track-for-datum';

export function renderCustomData(
  containerElementChild: HTMLElement,
  customData: NewProtvistaTrackDatum[],
  sequenceLength: number,
  extraMarginLeft: number,
  extraMarginRight: number
) {
  for (const datum of customData) {
    let parent = containerElementChild?.querySelector('#custom-data-controls');
    if (!parent) {
      const containerSelector = datum.isSticky ? '#pv-sticky' : '#pv-scrollable';
      parent = containerElementChild?.querySelector(containerSelector);
    }
    if (!parent) continue;

    // Create a temporary wrapper inside the parent
    const tempId = `temp-${datum.id}-insertion`;
    const tempWrapper = document.createElement('div');
    tempWrapper.id = tempId;
    tempWrapper.style.display = 'none';
    parent.appendChild(tempWrapper);

    // Render into the temp wrapper (must pass selector string)
    renderTrackForDatum(containerElementChild, `#${tempId}`, datum, sequenceLength, extraMarginLeft, extraMarginRight, true);

    // Get the rendered element (the new .pv-track-row)
    const newTrack = tempWrapper.firstElementChild as HTMLElement | null;
    if (!newTrack) {
      parent.removeChild(tempWrapper);
      continue;
    }

    // Find insertion reference
    insertTrackAtPosition(newTrack, parent, datum.positionIndex);

    // Clean up the temp wrapper
    parent.removeChild(tempWrapper);
  }
}
