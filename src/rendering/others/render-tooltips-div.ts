export function renderTooltipsDiv(containerElementChild: HTMLElement, maxHeight: string) {
  const scrollableContainer = containerElementChild.querySelector('#pv-scrollable');
  if (!scrollableContainer) return;
  const containerTrackRow = document.createElement('div');
  containerTrackRow.id = 'pv-tooltips-container';
  if (maxHeight === 'none') {
    scrollableContainer.insertBefore(containerTrackRow, scrollableContainer.firstChild);
  } else {
    scrollableContainer.appendChild(containerTrackRow);
  }
}
