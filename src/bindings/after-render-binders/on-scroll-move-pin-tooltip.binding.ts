import { NewProtvistaTooltip } from '../../new-protvista-tooltip';
import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';

export class ProtvistaOnScrollMovePinTooltip extends ProtvistaGenericBinding {
  constructor(private tooltip: NewProtvistaTooltip) {
    super();
  }

  override bind(container: HTMLElement) {
    const scrollContainer = container.querySelector(`#pv-scrollable`) as HTMLElement;
    if (!scrollContainer) throw 'scroll container not found';

    const onScrollEvt = (event: Event) => {
      this.tooltip.hideHoverTooltip();
      // 2 - reposition pinned (clicked) tooltips so they remain aligned to host (absolute positioned)
      if (!this.tooltip.pinnedTooltipElement) return;
      // 2.1 - repositioning does NOT happen for tooltips of custom data tracks (fixed in host)
      const tooltipContent = this.tooltip.pinnedTooltipElement.innerHTML;
      if (!tooltipContent.includes('Custom data track:')) {
        this.tooltip.movePinnedTooltipVertical();
      }
    };

    scrollContainer.addEventListener('scroll', onScrollEvt);
    this.elementListeners.push({ element: scrollContainer, handlers: { type: 'change', listener: onScrollEvt } });
  }
}
