import { BehaviorSubject } from 'rxjs';
import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';
import { NewProtvistaColourEvent } from '../../track-data.model';

export class ColourIn3DButtonBinding extends ProtvistaGenericBinding {
  private activeEventId?: string;

  override bind(container: HTMLElement, eventStream: BehaviorSubject<NewProtvistaColourEvent | null>) {
    const in3DBtns = container.querySelectorAll<HTMLButtonElement>('.in-3d-btn');
    if (!in3DBtns.length) return;
    const btnsArray = Array.from(in3DBtns);

    // if activeEventId doesn't exist in btnsArray anymore, reset it to undefined
    const btnsEventIds = btnsArray.map((btn) => btn.getAttribute('data-event-id') || undefined);
    if (this.activeEventId !== undefined && !btnsEventIds.includes(this.activeEventId)) this.activeEventId = undefined;

    for (let idx = 0; idx < btnsArray.length; idx++) {
      const in3DBtn = btnsArray[idx];
      const eventId = in3DBtn.getAttribute('data-event-id');
      if (!eventId) continue;

      // if activeEventId is undefined, set it to first eventId
      if (idx === 0 && this.activeEventId === undefined) {
        this.activeEventId = eventId;
      }

      // if activeEventId === eventId, set it's class to active
      if (eventId === this.activeEventId) {
        const prevActive = container.querySelector('.in-3d-btn.active');
        if (prevActive) prevActive.classList.remove('active');
        in3DBtn.classList.add('active');
        eventStream.next({ trackId: eventId });
      }

      // skip if click event already bound
      const alreadyBound = this.elementListeners.some((entry) => entry.element === in3DBtn);
      if (alreadyBound) continue;

      // otherwise add a click event listener to button that adds class active
      // and triggers eventStream (BehaviourSubject) with eventId
      const onClickEvStream = () => {
        const prevActive = container.querySelector('.in-3d-btn.active');
        if (prevActive) prevActive.classList.remove('active');
        in3DBtn.classList.add('active');
        eventStream.next({ trackId: eventId });
        this.activeEventId = eventId;
      };
      in3DBtn.addEventListener('click', onClickEvStream);

      // adds track to handler cleanup list when protvista is destroyed
      this.elementListeners.push({ element: in3DBtn, handlers: { type: 'click', listener: onClickEvStream } });
    }
  }
}
