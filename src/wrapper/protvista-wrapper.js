const PAUL_TOL_COLORBLIND_SCALE = ['#332288', '#117733', '#44AA99', '#88CCEE', '#DDCC77', '#CC6677', '#AA4499', '#882255'];

import { patchLigandsSequence } from "./patch-ligands-sequence";
import { patchTrackCanvas } from "./patch-track-canvas";

function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (typeof obj === 'function') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item));
  }

  const clone = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone((obj)[key]);
    }
  }
  return clone;
}

async function loadScriptOnce(url) {
  const existing = document.querySelector(`script[data-src="${url}"]`);
  if (existing) {
    if (existing.dataset.loaded === 'true') return;
    await new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
    });
    return;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = url;
    script.dataset.src = url;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export class ProtvistaWrapper {
  constructor(options) {
    this.options = {
      container: null,
      containerId: '',
      sequence: '',
      entryId: '',
      entityId: '',
      chainId: '',
      maxHeight: '500px',
      data: [],
      tooltips: {},
      externalEvents: true,
      customTrackControls: '',
      ligandsSeqMode: false,
      NewProtvistaVisualisation: null,
      onAddCustomTrack: null,
      onEditCustomTracks: null,
      onOpenSearchHighlight: null,
      onColourIn3D: null,
      ...options,
    };

    this.visInstance = undefined;
    this.seqLength = undefined;
    this.customTracks = [];
    this.customRawData = [];
    this.customTrackCounter = 0;
    this.hasLoadedNightingale = false;

    this._statusRefreshTimer = null;
    this._currentIdentityKey = '';
    this._currentStatusKey = '';

    if (!this.options.container && !this.options.containerId) {
      throw new Error('Provide either `container` or `containerId`.');
    }

    if (!this.options.NewProtvistaVisualisation) {
      throw new Error('Provide `NewProtvistaVisualisation` in options.');
    }
  }

  get containerElement() {
    if (this.options.container) return this.options.container;
    return document.getElementById(this.options.containerId);
  }

  async init() {
    await this.loadComponents();
    await this.recreateIfNeeded(true);
    this.refreshIfNeeded(true);
  }

  async setOptions(nextOptions = {}) {
    const prevIdentityKey = this.buildIdentityKey();
    const prevStatusKey = this.buildStatusKey();

    this.options = {
      ...this.options,
      ...nextOptions,
    };

    await this.loadComponents();

    const nextIdentityKey = this.buildIdentityKey();
    const nextStatusKey = this.buildStatusKey();

    if (prevIdentityKey !== nextIdentityKey) {
      await this.recreateIfNeeded(true);
      return;
    }

    if (prevStatusKey !== nextStatusKey) {
      this.refreshIfNeeded(true);
    }
  }

  buildIdentityKey() {
    const dataIds = (this.options.data || []).map((x) => x.id).join(',');
    return [
      this.options.containerId,
      this.options.sequence,
      this.options.entryId,
      this.options.entityId,
      this.options.chainId,
      dataIds,
    ].join('|');
  }

  buildStatusKey() {
    const dataStatuses = (this.options.data || []).map((x) => `${x.id}:${x.status}`).join(',');
    const tooltipKeys = Object.keys(this.options.tooltips || {}).sort().join(',');
    return `${dataStatuses}|${tooltipKeys}`;
  }

  async recreateIfNeeded(force = false) {
    const identityKey = this.buildIdentityKey();
    if (!force && identityKey === this._currentIdentityKey) return;

    this._currentIdentityKey = identityKey;

    this.visInstance?.destroy();
    this.visInstance = undefined;
    this.seqLength = undefined;

    const deepCopyData = deepClone(this.options.data || []);
    const deepCopyTooltips = deepClone(this.options.tooltips || {});

    this.visInstance = new this.options.NewProtvistaVisualisation(
      this.options.containerId,
      this.options.sequence,
      deepCopyData,
      this.options.entryId,
      this.options.entityId,
      this.options.chainId,
      deepCopyTooltips,
      this.options.maxHeight,
      this.options.externalEvents,
      this.options.customTrackControls,
      this.options.ligandsSeqMode
    );

    if (this.options.ligandsSeqMode === false) {
      this.seqLength = (this.options.sequence || '').length;
    } else {
      this.seqLength = (this.options.sequence || '').split(',').length;
    }

    await this.visInstance.start();
    this.bindVisEvents();
  }

  refreshIfNeeded(force = false) {
    const statusKey = this.buildStatusKey();
    if (!force && statusKey === this._currentStatusKey) return;
    this._currentStatusKey = statusKey;

    clearTimeout(this._statusRefreshTimer);
    this._statusRefreshTimer = setTimeout(async () => {
      if (!this.visInstance) return;
      const deepCopyData = deepClone(this.options.data || []);
      const deepCopyTooltips = deepClone(this.options.tooltips || {});
      await this.visInstance.reprocessData(deepCopyData, deepCopyTooltips);
    }, 150);
  }

  bindVisEvents() {
    if (!this.visInstance) return;

    const safeHook = (source$, callback) => {
      if (!source$ || typeof source$.subscribe !== 'function') return null;
      return source$.subscribe((evt) => callback(evt));
    };

    this._addCustomTrackSub?.unsubscribe?.();
    this._editCustomTracksSub?.unsubscribe?.();
    this._openSearchHighlightSub?.unsubscribe?.();
    this._colourIn3DSub?.unsubscribe?.();

    this._addCustomTrackSub = safeHook(this.visInstance.addCustomTrack$, (evt) => {
      if (typeof this.options.onAddCustomTrack === 'function') {
        this.options.onAddCustomTrack(evt);
      }
    });

    this._editCustomTracksSub = safeHook(this.visInstance.editCustomTracks$, (evt) => {
      if (typeof this.options.onEditCustomTracks === 'function') {
        this.options.onEditCustomTracks(evt);
      }
    });

    this._openSearchHighlightSub = safeHook(this.visInstance.openSearchHighlight$, (evt) => {
      if (typeof this.options.onOpenSearchHighlight === 'function') {
        this.options.onOpenSearchHighlight(evt);
      }
    });

    this._colourIn3DSub = safeHook(this.visInstance.colourIn3D$, (evt) => {
      if (typeof this.options.onColourIn3D === 'function') {
        this.options.onColourIn3D(evt);
      }
    });
  }

  mapYourData(rawData) {
    this.customRawData.push(rawData);

    const trackName = rawData.trackName.length >= 15 ? `${rawData.trackName.slice(0, 15)}...` : rawData.trackName;
    const trackId = this.customTrackCounter++;
    const trackColor = PAUL_TOL_COLORBLIND_SCALE[trackId % PAUL_TOL_COLORBLIND_SCALE.length];

    const segments = rawData.residueRanges.split(',');
    const fragments = segments.map((segmentString) => {
      let start = segmentString.trim();
      let end = segmentString.trim();

      if (segmentString.includes('-')) {
        start = segmentString.split('-')[0];
        end = segmentString.split('-')[1];
      }

      const tooltipContent = `
        Track name: <b>${rawData.trackName}</b><br>
        Residues: <b>${segmentString}</b>
      `;

      return {
        start: parseInt(start, 10),
        end: parseInt(end, 10),
        tooltipContent,
      };
    });

    const trackData = {
      id: `custom-${trackId}`,
      type: 'TrackCanvas',
      name: trackName,
      status: 'ready-has-data',
      isSticky: true,
      isCustomData: true,
      isExpandable: true,
      colourIn3DControl: false,
      positionIndex: undefined,
      rawData,
      data: [
        {
          accession: `custom-track-${trackId}`,
          label: rawData.trackName,
          color: trackColor,
          locations: [
            {
              fragments,
            },
          ],
        },
      ],
    };

    this.customTracks.push(trackData);

    const eventObj = new CustomEvent('PDBe.NewProtvista.SetCustomData', {
      detail: {
        data: this.customTracks,
      },
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(eventObj);
  }

  async zoomAndHighlightTrack(event) {
    if (!this.visInstance || !this.visInstance.containerElement) return;

    const nightingaleNavigation = this.visInstance.containerElement.querySelector('nightingale-navigation');
    if (!nightingaleNavigation) return;

    if (event.type === 'highlight') {
      const eventObj = new CustomEvent('change', {
        detail: {
          highlight: `${event.start}:${event.end}`,
        },
        bubbles: true,
        cancelable: true,
      });
      nightingaleNavigation.dispatchEvent(eventObj);
    }

    if (event.type === 'zoom') {
      const eventObj = new CustomEvent('change', {
        detail: {
          'display-start': event.start,
          'display-end': event.end,
        },
        bubbles: true,
        cancelable: true,
      });
      nightingaleNavigation.dispatchEvent(eventObj);
    }
  }

  editAnnotationsTrack(event) {
    this.customTracks = event.customTracks;

    const eventObj = new CustomEvent('PDBe.NewProtvista.SetCustomData', {
      detail: {
        data: this.customTracks,
      },
      bubbles: true,
      cancelable: true,
    });

    document.dispatchEvent(eventObj);
  }

  async loadComponents() {
    if (this.hasLoadedNightingale) return;

    const dataTypes = [...new Set((this.options.data || []).map((datum) => datum.type))];

    let componentsToLoadList = [
      'nightingale-manager',
      'nightingale-navigation',
      'nightingale-sequence',
      'nightingale-track-canvas',
      'nightingale-scrollbox',
    ];

    if (dataTypes.includes('TrackConservation')) {
      componentsToLoadList.push('nightingale-conservation-track');
      componentsToLoadList.push('nightingale-linegraph-track');
    }

    if (dataTypes.includes('TrackVariation')) {
      componentsToLoadList.push('nightingale-variation');
      componentsToLoadList.push('nightingale-linegraph-track');
    }

    if (dataTypes.includes('TrackColouredSequence')) {
      componentsToLoadList.push('nightingale-colored-sequence');
    }

    if (dataTypes.includes('TrackHeatmapSequence')) {
      componentsToLoadList.push('nightingale-sequence-heatmap');
    }

    componentsToLoadList = [...new Set(componentsToLoadList)];

    for (const componentName of componentsToLoadList) {
      if (customElements.get(componentName) === undefined) {
        const version = componentName.includes('sequence-heatmap') ? '5.6.2' : '5.6.0';
        const url = `https://cdn.jsdelivr.net/npm/@nightingale-elements/${componentName}@${version}/+esm`;
        await loadScriptOnce(url);
        await customElements.whenDefined(componentName);
      }

      if (componentName === 'nightingale-sequence' && this.options.ligandsSeqMode === true) {
        patchLigandsSequence();
      }

      if (componentName === 'nightingale-track-canvas' && customElements.get('nightingale-track-canvas-patched') === undefined) {
        patchTrackCanvas();
      }
    }

    this.hasLoadedNightingale = true;
  }

  destroy() {
    clearTimeout(this._statusRefreshTimer);

    this._addCustomTrackSub?.unsubscribe?.();
    this._editCustomTracksSub?.unsubscribe?.();
    this._openSearchHighlightSub?.unsubscribe?.();
    this._colourIn3DSub?.unsubscribe?.();

    this.visInstance?.destroy();
    this.visInstance = undefined;
    this.seqLength = undefined;
  }
}