import { insertTrackAtPosition } from '../helpers';
import { renderAddCustomTrackControls } from '../templates-rendering/custom-track-controls-html';

export function renderCustomDataControls(containerElementChild: HTMLElement, customTrackControls?: string, extraMarginLeft?: number, extraMarginRight?: number) {
  if (!customTrackControls) return;

  const customTrackId = 'custom-data-controls';
  const customTrackPosition = customTrackControls.includes('-') ? parseInt(customTrackControls.split('-')[1]) : undefined;
  const customTrackControlsSticky = customTrackControls.includes('sticky');
  const customTrackControlsScrollable = customTrackControls.includes('sticky') === false;
  let parent: Element | null | undefined = undefined;
  if (customTrackControlsSticky) parent = containerElementChild?.querySelector('#pv-sticky');
  if (customTrackControlsScrollable) parent = containerElementChild?.querySelector('#pv-scrollable');
  if (!parent) return;

  // Create a temporary wrapper inside the parent
  const tempId = `temp-${customTrackId}-insertion`;
  const tempWrapper = document.createElement('div');
  tempWrapper.id = tempId;
  tempWrapper.style.display = 'none';
  parent!.appendChild(tempWrapper);

  const childHTML = renderAddCustomTrackControls(customTrackControlsSticky, extraMarginLeft, extraMarginRight);
  tempWrapper.innerHTML = childHTML;

  // Get the rendered element (the new .pv-track-row)
  const newTrack = tempWrapper.firstElementChild as HTMLElement | null;
  if (!newTrack) {
    parent.removeChild(tempWrapper);
    return;
  }

  // Find insertion reference
  insertTrackAtPosition(newTrack, parent!, customTrackPosition);

  // Clean up the temp wrapper
  parent!.removeChild(tempWrapper);
}
