import { updateHeatmapXScale } from '../../rendering/others/render-heatmap-scale';
import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';

export class HeatmapPatches extends ProtvistaGenericBinding {
  private observers: ResizeObserver[] = [];

  override bind(container: HTMLElement, extraMarginLeft?: number, extraMarginRight?: number) {
    const heatmaps = container.querySelectorAll<any>('.sequence-heatmap-vis');
    if (!heatmaps.length) return;

    for (const heatmapTrack of Array.from(heatmaps)) {
      /** add width listener observer */
      const parent = heatmapTrack.parentElement;
      if (!parent) continue;

      const updateWidth = () => {
        // Get the parent’s computed width
        let parentWidth = parent.getBoundingClientRect().width;
        if (!parentWidth) return;

        if (extraMarginLeft) parentWidth -= extraMarginLeft;
        if (extraMarginRight) parentWidth -= extraMarginRight;

        // Apply it as a number (no 'px') if possible
        (heatmapTrack as any).width = parentWidth - 10;
        heatmapTrack.style.width = `${parentWidth}px`;

        const trackId = heatmapTrack.getAttribute('id').split('-heatmap-track')[0];
        const trackWrapper = document.getElementById(`${trackId}-heatmap-track-parent`);
        const stored = (trackWrapper as any)?.__heatmapXScale;
        if (stored && stored.start && stored.end) {
          // Reapply same domain to trigger axis redraw with new width
          updateHeatmapXScale(trackId, [stored.start, stored.end]);
        }
      };

      // Initial sizing
      updateWidth();

      // Watch parent resize dynamically
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(parent);
      this.observers.push(observer);
    }
  }

  override unbind(container: HTMLElement) {
    // Disconnect all active observers to avoid memory leaks
    for (const observer of this.observers) observer.disconnect();
    this.observers = [];

    // Remove registered element listeners (generic base cleanup)
    for (const { element, handlers } of this.elementListeners) {
      if (element) element.removeEventListener(handlers.type, handlers.listener);
      else document.removeEventListener(handlers.type, handlers.listener);
    }
    this.elementListeners = [];
  }
}
