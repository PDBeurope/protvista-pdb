import { NewProtvistaTrackDatum } from './track-data.model';
import { renderStickyHeaderContent } from './rendering/templates-rendering/sticky-nav-sequence-header.html';
import { renderTooltipsDiv } from './rendering/others/render-tooltips-div';
import { renderCustomDataControls } from './rendering/others/render-custom-data-controls';
import { renderTrackForDatum } from './rendering/render-track-for-datum';
import { renderScrollSpaceDiv } from './rendering/others/render-scroll-space-div';

/**
 * Handles all DOM and markup generation for the NewProtvista visualisation.
 * Responsible for building and inserting the Nightingale components structure.
 */
export class NewProtvistaRenderer {
  public containerElementChild: HTMLElement | null = null;

  /**
   * Main entry: render everything into the container.
   */
  public initialRender(
    container: HTMLElement,
    sequence: string,
    data: NewProtvistaTrackDatum[],
    maxHeight: string,
    customTrackControls: string | undefined,
    extraMarginLeft: number,
    extraMarginRight: number,
    sequenceForLigands: boolean
  ): void {
    const sequenceLength = sequenceForLigands ? sequence.split(',').length : sequence.length;
    this.containerElementChild = document.createElement('div');
    this.containerElementChild.innerHTML = `
      <nightingale-manager>
        <div class="pv-protvista elements-container">
          <div id="pv-sticky" class="always-on-top">
            ${renderStickyHeaderContent(sequence, sequenceLength, sequenceForLigands, extraMarginLeft, extraMarginRight)}
          </div>
          <div id="pv-scrollable" class="scrollable" style="max-height: ${maxHeight};"></div>
        </div>
      </nightingale-manager>
    `;
    container.appendChild(this.containerElementChild);

    // append to pv-sticky or pv-scrollable according to data type
    for (const datum of data) {
      const containerSelector = datum.isSticky ? '#pv-sticky' : '#pv-scrollable';
      renderTrackForDatum(this.containerElementChild, containerSelector, datum, sequenceLength, extraMarginLeft, extraMarginRight);
    }
    renderCustomDataControls(this.containerElementChild, customTrackControls, extraMarginLeft, extraMarginRight);
    renderTooltipsDiv(this.containerElementChild, maxHeight);
    if (maxHeight !== 'none') {
      renderScrollSpaceDiv(this.containerElementChild, maxHeight);
    }
  }

  /**
   * Re-render track when data is updated
   */
  public reRenderTrack(containerId: string, datum: NewProtvistaTrackDatum, sequenceLength: number, extraMarginLeft: number, extraMarginRight: number) {
    if (!this.containerElementChild) return;
    const existing = this.containerElementChild.querySelector<HTMLElement>(`#${containerId}`);
    if (!existing) return;

    const parent = existing.parentElement;
    if (!parent) return;

    // Record position before removal
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(existing);

    // Remove old element
    parent.removeChild(existing);

    // Render new one to a temporary container
    // const tempWrapper = document.createElement('div');
    renderTrackForDatum(this.containerElementChild, `#${parent.id}`, datum, sequenceLength, extraMarginLeft, extraMarginRight);

    // Find the newly created element inside the parent
    const newElement = parent.querySelector<HTMLElement>(`#${containerId}`);
    if (!newElement) return;

    // Move it to the original position if it’s not already there
    if (index < parent.children.length) {
      parent.insertBefore(newElement, parent.children[index]);
    } else {
      parent.appendChild(newElement);
    }
  }

  /**
   * Removes the rendered subtree from the container.
   */
  public cleanup(container: HTMLElement | null): void {
    if (container && this.containerElementChild) {
      container.removeChild(this.containerElementChild);
      this.containerElementChild = null;
    }
  }
}
