import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';

export class ProtvistaConsControllers extends ProtvistaGenericBinding {
  public bindOrRebind(container: HTMLElement) {
    this.bind(container);
  }

  override bind(container: HTMLElement) {
    const radioButtons = container.querySelectorAll<HTMLInputElement>('.cons-radio-btn');
    if (!radioButtons.length) return;

    for (const radioBtn of Array.from(radioButtons)) {
      const radioHandler = (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (!input.checked) return;

        // Find which group this belongs to
        const group = input.closest('.pv-radio-group');
        if (!group) return;

        const trackId = group.getAttribute('data-track-id');
        if (!trackId) return;

        // Find the corresponding conservation track element
        const track = container.querySelector<HTMLElement>(`#${trackId}-conservation-track`);
        if (!track) return;

        // Update the attribute dynamically
        const newOrder = input.value; // "default" or "probability"
        track.setAttribute('letter-order', newOrder);
      };

      radioBtn.addEventListener('change', radioHandler);

      this.elementListeners.push({ element: radioBtn, handlers: { type: 'change', listener: radioHandler } });
    }
  }
}
