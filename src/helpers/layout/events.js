/**
 * helpers/layout/events.js
 *
 * In this file: event subscription
 *
 * handleExtEvents
 * addEventSubscription
 * removeEventSubscription
 */
export default {
  handleExtEvents(e) {
    if (
      typeof e.eventData !== "undefined" &&
      typeof e.eventData.residueNumber !== "undefined"
    ) {
      const protvistaParam = {
        start: e.eventData.residueNumber,
        end: e.eventData.residueNumber,
        highlight: true,
      };

      this.resetZoom(protvistaParam);
    }
  },

  addEventSubscription() {
    this.evtListeners ??= [];

    const addListener = (target, eventName, handler) => {
      target.addEventListener(eventName, handler);

      this.evtListeners.push({
        target,
        eventName,
        handler,
      });
    };

    const externalEventHandler = (e) => {
      this.handleExtEvents(e);
    };

    [
      "PDB.topologyViewer.click",
      "PDB.topologyViewer.mouseover",
      "PDB.topologyViewer.mouseout",
      "PDB.litemol.click",
      "PDB.litemol.mouseover",
      "PDB.molstar.click",
      "PDB.molstar.mouseover",
    ].forEach((eventName) => {
      addListener(document, eventName, externalEventHandler);
    });

    addListener(document, "change", (e) => {
      const detail = e.detail;
      if (!detail) return;

      const hasDisplayRange =
        detail["display-start"] !== undefined &&
        detail["display-end"] !== undefined;

      if (!hasDisplayRange) return;

      const displayStart = Number(detail["display-start"]);
      const displayEnd = Number(detail["display-end"]);

      const isZoomed =
        displayStart !== 1 ||
        displayEnd !== Number(this.ctx.viewerData.length);

      const resetZoomButton = this.ctx.querySelector(
        ".protvistaResetZoomBtn",
      );

      if (!resetZoomButton) return;

      resetZoomButton.style.display = isZoomed ? "" : "none";
    });

    // document.addEventListener(
    //   "protvista-pdb-open-custom-track-dialog",
    //   () => {
    //     const button = this.ctx.querySelector(".mapYourResiduesButton");
    //     this.showCustomTracksDialog(button);
    //   },
    // );

    // document.addEventListener(
    //   "protvista-pdb-create-custom-track",
    //   (e) => {
    //     const track = this.createCustomTrack(
    //       e.detail.name,
    //       e.detail.ranges,
    //     );
    //     this.addCustomTrack(track);
    //   },
    // );
  },

  removeEventSubscription() {
    if (!this.evtListeners?.length) return;

    this.evtListeners.forEach(({ target, eventName, handler }) => {
      target.removeEventListener(eventName, handler);
    });

    this.evtListeners = [];
  },
};