import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';

export class ProtvistaDocMouseTracking extends ProtvistaGenericBinding {
  public latestMouseX = 0;
  public latestMouseY = 0;

  override bind(_container: HTMLElement) {
    const mousemoveEvt = (e: Event) => {
      this.latestMouseX = (e as MouseEvent).clientX;
      this.latestMouseY = (e as MouseEvent).clientY;
    };
    const touchmoveEvt = (event: Event) => {
      if ((event as TouchEvent).touches.length > 0) {
        this.latestMouseX = (event as TouchEvent).touches[0].clientX;
        this.latestMouseY = (event as TouchEvent).touches[0].clientY;
      }
    };
    const touchstartEvt = (event: Event) => {
      if ((event as TouchEvent).touches.length > 0) {
        this.latestMouseX = (event as TouchEvent).touches[0].clientX;
        this.latestMouseY = (event as TouchEvent).touches[0].clientY;
      }
    };

    document.addEventListener('mousemove', mousemoveEvt);
    document.addEventListener('touchmove', touchmoveEvt, { passive: true }); // 1.1 use passive to prevent scrolling jank
    document.addEventListener('touchstart', touchstartEvt, { passive: true }); // 1.1 use passive to prevent scrolling jank

    this.elementListeners.push(
      { element: undefined, handlers: { type: 'mousemove', listener: mousemoveEvt } },
      { element: undefined, handlers: { type: 'touchmove', listener: touchmoveEvt } },
      { element: undefined, handlers: { type: 'touchstart', listener: touchstartEvt } }
    );
  }
}
