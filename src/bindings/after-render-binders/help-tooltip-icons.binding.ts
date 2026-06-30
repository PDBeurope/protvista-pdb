import { NewProtvistaTooltip } from '../../new-protvista-tooltip';
import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';

export class ProtvistaHelpTooltipsBinding extends ProtvistaGenericBinding {
  constructor(private tooltip: NewProtvistaTooltip) {
    super();
  }

  override bind(container: HTMLElement, tooltipsData: { [key: string]: string }) {
    const helpIcons = container.querySelectorAll<HTMLImageElement>('.help-icon');
    if (!helpIcons.length) return;

    for (const icon of Array.from(helpIcons)) {
      // The tooltip key can come from a `data-help-id` attribute or fallback to the icon's name/alt
      const tooltipKey = icon.getAttribute('data-help-id');
      if (!tooltipKey) continue;
      const isCustomData = icon.classList.contains('custom-row');
      const tooltipContent = isCustomData ? tooltipKey : tooltipsData[tooltipKey] || undefined;
      if (!tooltipContent) continue;

      const alreadyBound = this.elementListeners.some((entry) => entry.element === icon);
      if (alreadyBound) continue; // skip duplicate binding

      const onMouseEnter = (event: Event) => {
        // const coords = [this.latestMouseX, this.latestMouseY];
        const mouseEvent = event as MouseEvent;
        const coords = { x: mouseEvent.clientX, y: mouseEvent.clientY };
        this.tooltip.showHoverTooltip(icon, tooltipContent, coords, -1, isCustomData);
      };

      const onMouseLeave = () => this.tooltip.hideHoverTooltip();

      const onTouchStart = (event: Event) => {
        const touchEvent = event as TouchEvent;
        if (touchEvent.touches.length > 0) {
          // const coords = [this.latestMouseX, this.latestMouseY];
          const coords = { x: touchEvent.touches[0].clientX, y: touchEvent.touches[0].clientY };
          this.tooltip.showHoverTooltip(icon, tooltipContent, coords, -1, isCustomData);
        }
      };

      const onTouchEnd = () => this.tooltip.hideHoverTooltip();

      // Add listeners
      icon.addEventListener('mouseenter', onMouseEnter);
      icon.addEventListener('mouseleave', onMouseLeave);
      icon.addEventListener('touchstart', onTouchStart, { passive: true });
      icon.addEventListener('touchend', onTouchEnd);

      // Track for cleanup
      this.elementListeners.push(
        { element: icon, handlers: { type: 'mouseenter', listener: onMouseEnter } },
        { element: icon, handlers: { type: 'mouseleave', listener: onMouseLeave } },
        { element: icon, handlers: { type: 'touchstart', listener: onTouchStart } },
        { element: icon, handlers: { type: 'touchend', listener: onTouchEnd } }
      );
    }
  }
}
