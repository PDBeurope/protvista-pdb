import NightingaleTrackCanvas from "@nightingale-elements/nightingale-track-canvas";

class ProtvistaPdbTrack extends NightingaleTrackCanvas {
  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("mouseover", this._onNightingaleMouseover);
    this.addEventListener("mouseout", this._onNightingaleMouseout);
    this.addEventListener("click", this._onNightingaleClick);
  }

  disconnectedCallback() {
    this.removeEventListener("mouseover", this._onNightingaleMouseover);
    this.removeEventListener("mouseout", this._onNightingaleMouseout);
    this.removeEventListener("click", this._onNightingaleClick);

    super.disconnectedCallback?.();
  }

  _onNightingaleMouseover = (event) => {
    console.log("Nightingale mouseover detail", event.detail);
    const detail = event.detail;
    const feature = detail?.feature || detail?.data || detail;

    if (!feature) return;

    const start = detail?.start ?? feature.start;
    const end = detail?.end ?? feature.end ?? start;

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlightstart: start,
          highlightend: end,
        },
        bubbles: true,
        cancelable: true,
      })
    );

    this.dispatchEvent(
      new CustomEvent("protvista-mouseover", {
        detail: feature,
        bubbles: true,
        cancelable: true,
      })
    );
  };

  _onNightingaleMouseout = () => {
    this.removeAllTooltips?.();

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlightstart: null,
          highlightend: null,
        },
        bubbles: true,
        cancelable: true,
      })
    );

    this.dispatchEvent(
      new CustomEvent("protvista-mouseout", {
        detail: null,
        bubbles: true,
        cancelable: true,
      })
    );
  };

  _onNightingaleClick = (event) => {
    const detail = event.detail;
    const feature = detail?.feature || detail?.data || detail;

    if (!feature) return;

    this.dispatchEvent(
      new CustomEvent("protvista-click", {
        detail: feature,
        bubbles: true,
        cancelable: true,
      })
    );
  };
}

export default ProtvistaPdbTrack;