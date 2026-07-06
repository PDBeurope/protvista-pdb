import { NewProtvistaRenderer } from './new-protvista-renderer';
import { NewProtvistaTooltip } from './new-protvista-tooltip';
import { processEntityConservationDataFromAPI, processEntityConservationLineChartDataFromAPI } from './processing/pv-conservation-api-processing';
import { filterEntityVariationData, processEntityVariationDataFromAPI, processEntityVariationLineChartDataFromAPI } from './processing/pv-variation-api-processing';
import { NewProtvistaFixedHighlights } from './new-protvista-fixed-highlights';
import {
  NewProtvistaColourEvent,
  NewProtvistaDialogEvent,
  NewProtvistaTrackDatum,
  NewProtvistaTrackDatumConsTrack,
  NewProtvistaTrackDatumHeatmapSeqTrack,
  NewProtvistaTrackDatumVarTrack,
} from './track-data.model';
import { APIConservationData } from './models/pv-api-conservation-track-data.model';
import { APIVariationData } from './models/pv-api-variation-track-data.model';
import { ProtvistaBindingManager } from './bindings/binding-manager';
import { renderCustomData } from './rendering/tracks/render-custom-data-track';
import { BehaviorSubject } from 'rxjs';

export class NewProtvistaVisualisation {
  private renderer = new NewProtvistaRenderer();
  public tooltip: NewProtvistaTooltip | null = null;
  private highlights: NewProtvistaFixedHighlights | null = null;
  public containerElement: HTMLElement | null = null;

  /** Status and processing state */
  private trackStatusMap: Map<string, string> = new Map();
  private processedCons = false;
  private processedVar = false;
  private hasHeatmapTracks = false;
  private hasHeatmapYScale = false;
  private mirrorYScale = false;
  private extraMarginLeft = 0;
  private extraMarginRight = 0;
  private hasIn3DBtn = false;

  /** Inputs */
  private data: NewProtvistaTrackDatum[];
  private customData: NewProtvistaTrackDatum[] = [];
  private tooltipsData: { [key: string]: string };

  /** outputs */
  public addCustomTrack$ = new BehaviorSubject<NewProtvistaDialogEvent | null>(null);
  public editCustomTracks$ = new BehaviorSubject<NewProtvistaDialogEvent | null>(null);
  public openSearchHighlight$ = new BehaviorSubject<NewProtvistaDialogEvent | null>(null);
  public colourIn3D$ = new BehaviorSubject<NewProtvistaColourEvent | null>(null);

  /** Custom data event listener */
  private setCustomTrackEvt: EventListener | null = null;
  private bindingDataAndEvents: ProtvistaBindingManager | null = null;

  constructor(
    private containerId: string,
    private sequence: string,
    data: NewProtvistaTrackDatum[],
    private entryId: string,
    private entityId: string,
    private chainId: string,
    tooltipsData: { [key: string]: string },
    private maxHeight: string,
    private externalEvents: boolean,
    private customTrackControls?: string,
    private sequenceForLigands?: boolean
    // private pdbeEvents?: boolean, // TODO
  ) {
    this.data = data;
    this.tooltipsData = tooltipsData;
    this.processData(data);
  }

  public async reprocessData(data: NewProtvistaTrackDatum[], tooltipsData: { [key: string]: string }) {
    this.data = data;
    this.tooltipsData = tooltipsData;
    await this.processData(data);
  }

  private async processData(data: NewProtvistaTrackDatum[]) {
    for (let i = 0; i < data.length; i++) {
      // eslint-disable-next-line prefer-const
      let datum = data[i];
      // eslint-disable-next-line prefer-const
      let plotData = data[i].data;

      // Save the old status (if any)
      const previousStatus = this.trackStatusMap.get(datum.id);

      if (datum.type === 'TrackConservation' && datum.status === 'ready-has-data' && plotData && this.processedCons === false) {
        data[i].data = processEntityConservationDataFromAPI(plotData as APIConservationData);
        (data[i] as NewProtvistaTrackDatumConsTrack).aggChartData = processEntityConservationLineChartDataFromAPI(plotData as APIConservationData);
        this.processedCons = true;
      }
      if (datum.type === 'TrackVariation' && datum.status === 'ready-has-data' && plotData && this.processedVar === false) {
        (data[i] as NewProtvistaTrackDatumVarTrack).srcData = JSON.parse(JSON.stringify(plotData));
        // eslint-disable-next-line prefer-const
        let processedData = filterEntityVariationData(plotData as APIVariationData, this.chainId);
        (data[i] as NewProtvistaTrackDatumVarTrack).data = processEntityVariationDataFromAPI(processedData, []);
        (data[i] as NewProtvistaTrackDatumVarTrack).aggChartData = processEntityVariationLineChartDataFromAPI(plotData as APIVariationData, []);
        this.processedVar = true;
      }

      // --- Detect status changes ---
      const currentStatus = datum.status;
      this.trackStatusMap.set(datum.id, currentStatus);

      if (previousStatus && previousStatus !== currentStatus) {
        // console.log(`Track ${datum.id} status changed: ${previousStatus} → ${currentStatus}`);
        await this.updateDatum(datum);
      }
    }
    this.data = data;
  }

  public async start() {
    this.trackStatusMap = new Map(this.data.map((d) => [d.id, d.status]));

    const heatmapTracks = this.data.filter((datum) => datum.type === 'TrackHeatmapSequence') as NewProtvistaTrackDatumHeatmapSeqTrack[];
    this.hasHeatmapTracks = heatmapTracks.length > 0; // this.data.map((datum) => datum.type).includes('TrackHeatmapSequence');
    this.hasHeatmapYScale = this.hasHeatmapTracks && heatmapTracks.some((datum) => datum.yScaleText !== undefined);
    this.mirrorYScale = this.hasHeatmapYScale && heatmapTracks.some((datum) => datum.mirrorYScale !== undefined);
    this.extraMarginLeft = this.hasHeatmapYScale ? 20 : 0;
    this.extraMarginRight = this.mirrorYScale ? 10 : 0;
    this.hasIn3DBtn = this.data.some((datum) => datum.colourIn3DControl !== undefined);
    const sequenceForLigands = this.sequenceForLigands ? true : false;

    this.containerElement = document.getElementById(this.containerId);
    if (!this.containerElement) throw new Error('Invalid container');

    this.renderer.initialRender(
      this.containerElement,
      this.sequence,
      this.data,
      this.maxHeight,
      this.customTrackControls,
      this.extraMarginLeft,
      this.extraMarginRight,
      sequenceForLigands
    );
    const scrollContainer = this.containerElement.querySelector(`#pv-scrollable`) as HTMLElement;
    const tooltipContainer = this.containerElement.querySelector(`#pv-tooltips-container`) as HTMLElement;

    const sequenceLength = this.sequenceForLigands ? this.sequence.split(',').length : this.sequence.length;

    this.highlights = new NewProtvistaFixedHighlights(this.containerElement, sequenceLength);
    this.tooltip = new NewProtvistaTooltip(this.containerElement, tooltipContainer, scrollContainer, this.highlights);
    this.bindingDataAndEvents = new ProtvistaBindingManager(
      this.entryId,
      this.entityId,
      this.chainId,
      sequenceLength,
      this.externalEvents ?? false,
      this.tooltip,
      this.highlights,
      scrollContainer
    );

    this.bindingDataAndEvents.bindAfterRender(
      this.containerElement,
      sequenceLength,
      this.tooltipsData,
      this.hasHeatmapTracks,
      this.extraMarginLeft,
      this.extraMarginRight,
      {
        addCustomTrack$: this.addCustomTrack$,
        editCustomTracks$: this.editCustomTracks$,
        openSearchHighlight$: this.openSearchHighlight$,
      },
      this.hasIn3DBtn ? this.colourIn3D$ : undefined
    );

    for (const datum of this.data) {
      await this.bindingDataAndEvents.bindAnyTrackDatum(datum, this.containerElement, this.chainId, this.tooltipsData, this.extraMarginLeft, this.extraMarginRight);
    }
    this.setupCustomData();
  }

  private async updateDatum(datum: NewProtvistaTrackDatum) {
    if (!this.containerElement) return;
    if (!this.bindingDataAndEvents) return;

    const containerId = `${datum.id}-track-container`;
    const sequenceLength = this.sequenceForLigands ? this.sequence.split(',').length : this.sequence.length;

    // Re-render the track in place
    this.renderer.reRenderTrack(containerId, datum, sequenceLength, this.extraMarginLeft, this.extraMarginRight);

    // Re-bind events for this specific datum
    await this.bindingDataAndEvents.bindAnyTrackDatum(datum, this.containerElement, this.chainId, this.tooltipsData, this.extraMarginLeft, this.extraMarginRight);
    this.bindingDataAndEvents.rebindTooltips(this.containerElement, this.tooltipsData);
    this.bindingDataAndEvents.rebindExpansion(this.containerElement);
  }

  private setupCustomData() {
    this.setCustomTrackEvt = async (event: Event) => {
      if (!this.containerElement) return;
      if (!this.bindingDataAndEvents) return;
      if (!this.renderer.containerElementChild) return;

      // Remove old custom tracks first
      const oldCustomRows = this.renderer.containerElementChild.querySelectorAll('.pv-track-row.custom-row');
      oldCustomRows.forEach((el) => {
        if (!el.classList.contains('controls') && !el.classList.contains('custom-fixed')) el.remove();
      });

      // render new custom data
      this.customData = (event as CustomEvent).detail.data;

      // show/hide edit button based on data presense/absence
      const editCustomBtn = this.renderer.containerElementChild.querySelector<HTMLElement>(`#pv-edit-custom-btn`);
      if (editCustomBtn && this.customData.length > 0) {
        editCustomBtn.style.display = '';
      } else if (editCustomBtn) {
        editCustomBtn.style.display = 'none';
      }
      const sequenceLength = this.sequenceForLigands ? this.sequence.split(',').length : this.sequence.length;
      renderCustomData(this.renderer.containerElementChild, this.customData, sequenceLength, this.extraMarginLeft, this.extraMarginRight);
      for (const datum of this.customData) {
        await this.bindingDataAndEvents.bindAnyTrackDatum(datum, this.containerElement, this.chainId, this.tooltipsData, this.extraMarginLeft, this.extraMarginRight);
      }
      this.bindingDataAndEvents.rebindTooltips(this.containerElement, this.tooltipsData);
      this.bindingDataAndEvents.rebindExpansion(this.containerElement);
      if (this.hasIn3DBtn) {
        this.bindingDataAndEvents.rebindIn3DColouring(this.containerElement, this.colourIn3D$);
      }
    };

    document.addEventListener('PDBe.NewProtvista.SetCustomData', this.setCustomTrackEvt);
  }

  public destroy() {
    this.trackStatusMap = new Map();
    this.tooltipsData = {};
    this.processedCons = false;
    this.processedVar = false;

    if (this.containerElement && this.bindingDataAndEvents) this.bindingDataAndEvents.unbindAll(this.containerElement);
    if (this.setCustomTrackEvt) document.removeEventListener('PDBe.NewProtvista.SetCustomData', this.setCustomTrackEvt);

    this.renderer.cleanup(this.containerElement);

    this.tooltip = null;
    this.highlights = null;
    this.containerElement = null;
    this.bindingDataAndEvents = null;
  }

  public setFirstIn3DActive(): string | undefined {
    if (!this.containerElement || !this.bindingDataAndEvents) return undefined;
    return this.bindingDataAndEvents.setFirstIn3DActive(this.containerElement);
  }

  public setIn3DActiveWithoutEmit(eventId: string): void {
    if (!this.containerElement || !this.bindingDataAndEvents) return;

    this.bindingDataAndEvents.setIn3DActiveWithoutEmit(this.containerElement, eventId);
  }
}
