import { BehaviorSubject } from "rxjs";
import { ProtvistaGenericBinding } from "../abstract/generic-obj.bind";
import { NewProtvistaColourEvent } from "../../track-data.model";

export class ColourIn3DButtonBinding extends ProtvistaGenericBinding {
  private activeEventId?: string;
  private pendingFirstChildForParentTrackId?: string;

  public setFirstActive(container: HTMLElement): string | undefined {
    const firstChildEventId = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.in-3d-btn')
    )
      .map((btn) => btn.getAttribute('data-event-id'))
      .find((id): id is string => !!id);

    if (firstChildEventId) {
      this.setActiveWithoutEmit(container, firstChildEventId);
      return firstChildEventId;
    }

    const firstParentBtn = container.querySelector<HTMLButtonElement>(
      '.in-3d-btn-parent[data-parent-track]'
    );
    if (!firstParentBtn) return undefined;

    const parentTrackId = firstParentBtn.getAttribute('data-parent-track');
    if (!parentTrackId) return undefined;

    container.querySelectorAll('.in-3d-btn-parent.active').forEach((btn) => {
      btn.classList.remove('active');
    });

    firstParentBtn.classList.add('active');
    this.pendingFirstChildForParentTrackId = parentTrackId;

    // No child exists yet, so there is no real eventId to return.
    // Do not set activeEventId to "none".
    return undefined;
  }

  public setActiveWithoutEmit(container: HTMLElement, eventId: string): void {
    container.querySelectorAll(".in-3d-btn.active").forEach((btn) => {
      btn.classList.remove("active");
    });

    const activeBtn = container.querySelector<HTMLButtonElement>(
      `.in-3d-btn[data-event-id="${CSS.escape(eventId)}"]`,
    );

    if (activeBtn) {
      activeBtn.classList.add("active");
    }

    this.activeEventId = eventId;
    this.setActiveParentButton(container, eventId);
  }

  private setActiveParentButton(container: HTMLElement, eventId: string) {
    // Remove previous parent active states
    container.querySelectorAll(".in-3d-btn-parent.active").forEach((btn) => {
      btn.classList.remove("active");
    });

    // eventId format: `${trackId}->${trackName}`
    const parentTrackId = eventId.split("->")[0];
    if (!parentTrackId) return;

    const parentBtn = container.querySelector<HTMLButtonElement>(
      `.in-3d-btn-parent[data-parent-track="${CSS.escape(parentTrackId)}"]`,
    );

    if (parentBtn) {
      parentBtn.classList.add("active");
    }
  }

  override bind(
    container: HTMLElement,
    eventStream: BehaviorSubject<NewProtvistaColourEvent | null>,
  ) {
    const in3DBtns =
      container.querySelectorAll<HTMLButtonElement>(".in-3d-btn");
    if (!in3DBtns.length) return;
    const btnsArray = Array.from(in3DBtns);

    // Only choose a default if no selection has ever been made.
    // Do NOT reset activeEventId just because its button is not currently in the DOM.
    if (this.pendingFirstChildForParentTrackId && this.activeEventId === undefined) {
      const firstChildEventId = btnsArray
        .map((btn) => btn.getAttribute('data-event-id'))
        .find(
          (id): id is string =>
            !!id && id.startsWith(`${this.pendingFirstChildForParentTrackId}->`)
        );

      if (firstChildEventId) {
        this.setActiveWithoutEmit(container, firstChildEventId);
        this.pendingFirstChildForParentTrackId = undefined;
      }
    }

    let activeButtonFound = false;

    for (const in3DBtn of btnsArray) {
      const eventId = in3DBtn.getAttribute("data-event-id");
      if (!eventId) continue;

      if (eventId === this.activeEventId) {
        activeButtonFound = true;

        const prevActive = container.querySelector(".in-3d-btn.active");
        if (prevActive && prevActive !== in3DBtn) {
          prevActive.classList.remove("active");
        }

        in3DBtn.classList.add("active");
        this.setActiveParentButton(container, eventId);

        // Optional: avoid re-emitting every time bind() is called.
        // eventStream.next({ trackId: eventId });
      } else {
        in3DBtn.classList.remove("active");
      }

      const alreadyBound = this.elementListeners.some(
        (entry) => entry.element === in3DBtn,
      );
      if (alreadyBound) continue;

      const onClickEvStream = () => {
        const prevActive = container.querySelector(".in-3d-btn.active");
        if (prevActive) prevActive.classList.remove("active");

        in3DBtn.classList.add("active");
        this.activeEventId = eventId;
        this.setActiveParentButton(container, eventId);
        eventStream.next({ trackId: eventId });
      };

      in3DBtn.addEventListener("click", onClickEvStream);
      this.elementListeners.push({
        element: in3DBtn,
        handlers: { type: "click", listener: onClickEvStream },
      });
    }

    // Important: do not pick the first button here.
    // If the active button is not currently rendered, keep activeEventId as-is.
    if (!activeButtonFound) {
      container.querySelectorAll(".in-3d-btn.active").forEach((btn) => {
        btn.classList.remove("active");
      });

      if (this.activeEventId) {
        this.setActiveParentButton(container, this.activeEventId);
      }
    }
  }
}
