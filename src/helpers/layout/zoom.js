/**
 * helpers/layout/zoom.js
 * 
 * In this file: zoom/reset zoom
 * 
 * zoomTrack
 * resetZoom
 * */

export default {

  zoomTrack(data, currentZoomTrack) {
    if (this.ctx.zoomedTrack != "") {
      let prevZoomIconEle = this.ctx.querySelector(
        ".pvZoomIcon_" + this.ctx.zoomedTrack,
      );
      prevZoomIconEle.classList.remove("active");
    }

    if (this.ctx.zoomedTrack != currentZoomTrack) {
      let zoomIconEle = this.ctx.querySelector(
        ".pvZoomIcon_" + currentZoomTrack,
      );
      zoomIconEle.classList.add("active");

      this.ctx.zoomedTrack = currentZoomTrack;
      this.resetZoom(data);
    } else {
      this.ctx.zoomedTrack = "";
      this.resetZoom({ start: 1, end: null });
    }
  },

  resetZoom(param) {
    let currentStartVal = null;
    let currentEndVal = null;
    let navEle = this.ctx.querySelectorAll(".pvTrack")[0];
    if (!navEle) return;

    if (typeof param === "undefined") {
      currentStartVal = navEle.getAttribute("display-start");
      currentEndVal = navEle.getAttribute("display-end");
    } else if (typeof param.trackData != "undefined") {
      if (param.trackData.start && param.trackData.end) {
        currentStartVal = param.trackData.start;
        currentEndVal = param.trackData.end;
      } else if (
        param.trackData.locations &&
        param.trackData.locations.length > 0
      ) {
        currentStartVal = param.trackData.locations[0].fragments[0].start;
        let lastLocationIndex = param.trackData.locations.length - 1;
        let lastFragmentIndex =
          param.trackData.locations[lastLocationIndex].fragments.length - 1;
        currentEndVal =
          param.trackData.locations[lastLocationIndex].fragments[
            lastFragmentIndex
          ].end;
      }
    } else {
      currentStartVal = param.start;
      currentEndVal = param.end;
    }
    if (param && param.start == null && param.end == null) {
    } else {
      if (currentStartVal == null) currentStartVal = "1";
      if (currentEndVal == null) currentEndVal = this.ctx.viewerData.length;
    }

    if (
      typeof param !== "undefined" &&
      typeof param.highlight !== "undefined" &&
      param.highlight
    ) {
      navEle.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            highlight: `${currentStartVal}:${currentEndVal}`,
          },
          bubbles: true,
          cancelable: true,
        }),
      );
    } else {
      navEle.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            "display-start": currentStartVal,
            "display-end": currentEndVal,
          },
          bubbles: true,
          cancelable: true,
        }),
      );

      navEle.dispatchEvent(
        new CustomEvent("change", {
          detail: {
            highlight: null,
          },
          bubbles: true,
          cancelable: true,
        }),
      );
    }
  }

}