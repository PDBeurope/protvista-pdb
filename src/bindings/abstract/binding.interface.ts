export interface IBindable {
  elementListeners: Array<{
    element?: HTMLElement;
    handlers: { type: string; listener: EventListener };
  }>;

  bind(container: HTMLElement, ...args: any[]): void;
  unbind(container: HTMLElement): void;
}
