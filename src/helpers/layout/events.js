/**
 * helpers/layout/events.js
 * 
 * In this file: event subscription
 * 
 * handleExtEvents
 * addEventSubscription
 * removeEventSubscription
 * */
export default {

  handleExtEvents(e) {
    if (
      typeof e.eventData !== "undefined" &&
      typeof e.eventData.residueNumber !== "undefined"
    ) {
      let protvistaParam = {
        start: e.eventData.residueNumber,
        end: e.eventData.residueNumber,
        highlight: true,
      };
      this.resetZoom(protvistaParam);
    }
  },

  addEventSubscription() {
    document.addEventListener("PDB.topologyViewer.click", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.topologyViewer.mouseover", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.topologyViewer.mouseout", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.litemol.click", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.litemol.mouseover", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.molstar.click", (e) => {
      this.handleExtEvents(e);
    });

    document.addEventListener("PDB.molstar.mouseover", (e) => {
      this.handleExtEvents(e);
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
    if (this.ctx.subscribeEvents) {
      document.removeEventListener("PDB.topologyViewer.click");
      document.removeEventListener("PDB.topologyViewer.mouseover");
      document.removeEventListener("PDB.topologyViewer.mouseout");
      document.removeEventListener("PDB.litemol.click");
      document.removeEventListener("PDB.litemol.mouseover");
      document.removeEventListener("PDB.molstar.click");
      document.removeEventListener("PDB.molstar.mouseover");
    }
  }
}