export function renderScrollSpaceDiv(containerElementChild: HTMLElement, initScrollHeight: string) {
  const scrollableContainer = containerElementChild.querySelector('#pv-scrollable');
  if (!scrollableContainer) return;
  const containerTrackRow = document.createElement('div');
  containerTrackRow.id = 'pv-scroll-space';
  const scrollSpaceSize = parseFloat(initScrollHeight.split('px')[0]);
  containerTrackRow.style.height = `${scrollSpaceSize - 40}px`;
  scrollableContainer.appendChild(containerTrackRow);
}
