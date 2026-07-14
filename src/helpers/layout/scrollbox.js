import { render } from "lit";

/**
 * helpers/layout/scrollbox.js
 * 
 * In this file: lazy rendering
 * 
 * initScrollboxes
 * */
export default {

  initScrollboxes() {
    const scrollboxes = this.ctx.querySelectorAll("nightingale-scrollbox");

    scrollboxes.forEach((scrollbox) => {
      if (scrollbox._pdbeCallbacksInitialised) return;
      scrollbox._pdbeCallbacksInitialised = true;

      const getRenderContainer = (item) => {
        let container = item.querySelector(
          ":scope > .pdbe-scrollbox-render-root",
        );

        if (!container) {
          item.replaceChildren();

          container = document.createElement("div");
          container.className = "pdbe-scrollbox-render-root";

          item.appendChild(container);
        }

        return container;
      };

      scrollbox.onEnter((item) => {
        if (!item.data?.renderVisible) return;

        const container = getRenderContainer(item);
        render(item.data.renderVisible(), container);

        const trackIndex = item.getAttribute("data-track-index");
        const subtrackIndex = item.getAttribute("data-subtrack-index");
        const subTrackUuid = item.getAttribute("data-subtrack-uuid");
        const prefix = item.getAttribute("data-track-prefix");
        this.bindSingleSubtrackData(trackIndex, subtrackIndex, subTrackUuid, prefix);
      });

      scrollbox.onExit((item) => {
        if (!item.data?.renderHidden) return;

        const container = getRenderContainer(item);
        render(item.data.renderHidden(), container);
      });
    });
  }
}