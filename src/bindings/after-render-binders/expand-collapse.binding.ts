import { NewProtvistaFixedHighlights } from '../../new-protvista-fixed-highlights';
import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';

export class ProtvistaToggleTrackExpansion extends ProtvistaGenericBinding {
  constructor(private highlights: NewProtvistaFixedHighlights) {
    super();
  }

  /**
   * Expands a track section.
   */
  private expandTrack(
    toggleEl: Element,
    collapsedIcon: HTMLSpanElement | null,
    expandedIcon: HTMLSpanElement | null,
    collapsedTrack: HTMLDivElement | null,
    placeholder: HTMLDivElement | null,
    expandedTrack: HTMLDivElement | null,
    doNotCollapse: boolean
  ): void {
    // swap icons
    if (collapsedIcon) collapsedIcon.style.display = 'none';
    if (expandedIcon) expandedIcon.style.display = '';

    // toggle visibility
    if (collapsedTrack && !doNotCollapse) collapsedTrack.style.display = 'none';
    if (placeholder) placeholder.style.display = '';
    if (expandedTrack) expandedTrack.style.display = '';

    // update CSS classes
    toggleEl.classList.remove('collapsed');
    toggleEl.classList.add('expanded');
    this.highlights.triggerFixedHighlight();
  }

  /**
   * Collapses a track section.
   */
  private collapseTrack(
    toggleEl: Element,
    collapsedIcon: HTMLSpanElement | null,
    expandedIcon: HTMLSpanElement | null,
    collapsedTrack: HTMLDivElement | null,
    placeholder: HTMLDivElement | null,
    expandedTrack: HTMLDivElement | null
  ): void {
    // swap icons
    if (collapsedIcon) collapsedIcon.style.display = '';
    if (expandedIcon) expandedIcon.style.display = 'none';

    // toggle visibility
    if (collapsedTrack) collapsedTrack.style.display = '';
    if (placeholder) placeholder.style.display = 'none';
    if (expandedTrack) expandedTrack.style.display = 'none';

    // update CSS classes
    toggleEl.classList.add('collapsed');
    toggleEl.classList.remove('expanded');
    this.highlights.triggerFixedHighlight();
  }

  override bind(container: HTMLElement) {
    const toggleExpandElements = container.querySelectorAll<HTMLElement>('.toggle-expansion');
    if (!toggleExpandElements.length) return;

    for (const toggleExpandElement of Array.from(toggleExpandElements)) {
      const trackId = toggleExpandElement.getAttribute('track-id');
      if (!trackId) continue;

      // Skip if already bound
      const alreadyBound = this.elementListeners.some((entry) => entry.element === toggleExpandElement);
      if (alreadyBound) continue;

      const toggleExpansionHandler = () => {
        const trackId = toggleExpandElement.getAttribute('track-id');
        if (!trackId) return;

        const isCollapsed = toggleExpandElement.classList.contains('collapsed');
        const isExpanded = toggleExpandElement.classList.contains('expanded');
        const doNotCollapse = toggleExpandElement.classList.contains('not-collapse');

        const collapsedIcon = toggleExpandElement.querySelector('.expand-icon.collapsed') as HTMLSpanElement | null;
        const expandedIcon = toggleExpandElement.querySelector('.expand-icon.expanded') as HTMLSpanElement | null;

        const collapsedTrack = container.querySelector(`.for-collapsed-${trackId}`) as HTMLDivElement | null;
        const collapsedPlaceholder = container.querySelector(`.for-collapsed-${trackId}-placeholder`) as HTMLDivElement | null;
        const expandedTrack = container.querySelector(`.for-expanded-${trackId}`) as HTMLDivElement | null;

        if (isCollapsed) {
          this.expandTrack(toggleExpandElement, collapsedIcon, expandedIcon, collapsedTrack, collapsedPlaceholder, expandedTrack, doNotCollapse);
        } else if (isExpanded) {
          this.collapseTrack(toggleExpandElement, collapsedIcon, expandedIcon, collapsedTrack, collapsedPlaceholder, expandedTrack);
        }
      };

      // Bind and store reference
      toggleExpandElement.addEventListener('click', toggleExpansionHandler);

      this.elementListeners.push({ element: toggleExpandElement, handlers: { type: 'click', listener: toggleExpansionHandler } });
    }
  }
}
