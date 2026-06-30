import { IBindable } from './binding.interface';

export class ProtvistaGenericBinding implements IBindable {
  elementListeners: Array<{
    element?: HTMLElement;
    handlers: { type: string; listener: EventListener };
  }> = [];

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  bind(_container: HTMLElement, ..._args: any[]): void {}

  unbind(_container: HTMLElement): void {
    for (const { element, handlers } of this.elementListeners) {
      if (element) element.removeEventListener(handlers.type, handlers.listener);
      else document.removeEventListener(handlers.type, handlers.listener);
    }
    this.elementListeners = [];
  }
}
