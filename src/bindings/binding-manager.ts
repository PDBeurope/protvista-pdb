import { BehaviorSubject } from 'rxjs';
import { NewProtvistaFixedHighlights } from '../new-protvista-fixed-highlights';
import { NewProtvistaTooltip } from '../new-protvista-tooltip';
import {
  NewProtvistaColourEvent,
  NewProtvistaDialogEvent,
  NewProtvistaTrackDatum,
  NewProtvistaTrackDatumColourSeqTrack,
  NewProtvistaTrackDatumConsTrack,
  NewProtvistaTrackDatumHeatmapSeqTrack,
  NewProtvistaTrackDatumNestedTrack,
  NewProtvistaTrackDatumVarTrack,
} from '../track-data.model';
import { ProtvistaGenericBinding } from './abstract/generic-obj.bind';
import { ProtvistaActBtnsBinding } from './after-render-binders/action-buttons.binding';
import { ProtvistaDocMouseTracking } from './after-render-binders/doc-mouse-track.binding';
import { ProtvistaOnTrackMouseEvents } from './after-render-binders/doc-on-track-mouse-evts.binding';
import { ProtvistaOnTrackZoom } from './after-render-binders/doc-on-track-zoom.binding';
import { ProtvistaExternalMouseEventsListeners } from './after-render-binders/external-mouse-evts-listeners.binding';
import { HeatmapPatches } from './after-render-binders/heatmap-patch.binding';
import { ProtvistaHelpTooltipsBinding } from './after-render-binders/help-tooltip-icons.binding';
import { ProtvistaOnScrollMovePinTooltip } from './after-render-binders/on-scroll-move-pin-tooltip.binding';
import { ProtvistaToggleTrackExpansion } from './after-render-binders/expand-collapse.binding';
import { ProtvistaConsControllers } from './for-tracks-binders/conservation-controllers.binding';
import { SetTracksDataBinding } from './for-tracks-binders/set-tracks-data.binding';
import { ProtvistaVarControllers } from './for-tracks-binders/variation-controllers.binding';
import { type Feature as NightingaleFeature } from '@nightingale-elements/nightingale-track';
import { ColourIn3DButtonBinding } from './after-render-binders/colour-in-3d-btn.binding';
import { scaleLinear } from 'd3';

export class ProtvistaBindingManager {
  public actionButtonsBinder: ProtvistaActBtnsBinding;
  public helpTooltipsBinder: ProtvistaHelpTooltipsBinding;
  public documentMouseTrackBinder: ProtvistaDocMouseTracking;
  public documentOnTrackZoomBinder: ProtvistaOnTrackZoom;
  public onScrollMovePinTooltipBinder: ProtvistaOnScrollMovePinTooltip;
  public onTrackMouseEventsBinder: ProtvistaOnTrackMouseEvents;
  public toggleTrackExpansionBinder: ProtvistaToggleTrackExpansion;
  public externalEvtsListenersBinder?: ProtvistaExternalMouseEventsListeners;
  public heatmapWidthChangeListener?: HeatmapPatches;
  public colour3DBtnBinder?: ColourIn3DButtonBinding;

  public setTracksDataBinder: SetTracksDataBinding;
  public conservationTrackControllers: ProtvistaConsControllers;
  public variationTrackControllers: ProtvistaVarControllers;

  public boundAfterRender: Array<ProtvistaGenericBinding> = [];

  constructor(
    entryId: string,
    entityId: string,
    chainId: string,
    sequenceLength: number,
    triggerExternal: boolean,
    tooltip: NewProtvistaTooltip,
    highlights: NewProtvistaFixedHighlights,
    private scrollContainer: HTMLElement
  ) {
    this.documentMouseTrackBinder = new ProtvistaDocMouseTracking();
    this.actionButtonsBinder = new ProtvistaActBtnsBinding(tooltip, highlights);
    this.helpTooltipsBinder = new ProtvistaHelpTooltipsBinding(tooltip);
    this.documentOnTrackZoomBinder = new ProtvistaOnTrackZoom(tooltip, highlights, 1, sequenceLength);
    this.onScrollMovePinTooltipBinder = new ProtvistaOnScrollMovePinTooltip(tooltip);
    this.onTrackMouseEventsBinder = new ProtvistaOnTrackMouseEvents(
      entityId,
      chainId,
      tooltip,
      highlights,
      triggerExternal,
      this.documentMouseTrackBinder,
      this.documentOnTrackZoomBinder
    );
    this.toggleTrackExpansionBinder = new ProtvistaToggleTrackExpansion(highlights);
    if (triggerExternal) {
      this.externalEvtsListenersBinder = new ProtvistaExternalMouseEventsListeners(entryId, entityId, chainId, highlights);
    }
    this.setTracksDataBinder = new SetTracksDataBinding(
      this.helpTooltipsBinder,
      highlights,
      tooltip,
      this.onTrackMouseEventsBinder,
      undefined,
      undefined,
      this.scrollContainer
    );
    this.conservationTrackControllers = new ProtvistaConsControllers();
    this.variationTrackControllers = new ProtvistaVarControllers(this.setTracksDataBinder);
  }

  public bindAfterRender(
    container: HTMLElement,
    sequenceLength: number,
    tooltipsData: { [key: string]: string },
    hasHeatmapTracks: boolean,
    extraMarginLeft: number,
    extraMarginRight: number,
    eventStreams: {
      addCustomTrack$?: BehaviorSubject<NewProtvistaDialogEvent | null>;
      editCustomTracks$?: BehaviorSubject<NewProtvistaDialogEvent | null>;
      openSearchHighlight$?: BehaviorSubject<NewProtvistaDialogEvent | null>;
    },
    colourBy3DEventStream?: BehaviorSubject<NewProtvistaColourEvent | null>
  ) {
    /** Bind mouse position tracking for tooltips */
    this.documentMouseTrackBinder.bind(container);
    this.boundAfterRender.push(this.documentMouseTrackBinder);

    /** Bind track mouse events tracking for tooltips */
    this.onTrackMouseEventsBinder.bind(container);
    this.boundAfterRender.push(this.onTrackMouseEventsBinder);

    /** Bind mouse tracking for showing navigation text help and
     * hiding fixed tooltips when zooming */
    this.documentOnTrackZoomBinder.bind(container, sequenceLength);
    this.boundAfterRender.push(this.documentOnTrackZoomBinder);

    /** Bind scroll tracking for moving pinned tooltip */
    this.onScrollMovePinTooltipBinder.bind(container);
    this.boundAfterRender.push(this.onScrollMovePinTooltipBinder);

    /** Bind action buttons */
    this.actionButtonsBinder.bind(container, sequenceLength, eventStreams);
    this.boundAfterRender.push(this.actionButtonsBinder);

    /** Bind Help icons */
    this.helpTooltipsBinder.bind(container, tooltipsData);
    this.boundAfterRender.push(this.helpTooltipsBinder);

    /** Bind events for track expand and collapse behaviour */
    this.toggleTrackExpansionBinder.bind(container);
    this.boundAfterRender.push(this.toggleTrackExpansionBinder);

    /** Trigger highlight, unhighlight, select, unselect behaviours
     * after external mouse events are triggered by sending 'change' events
     * or directly manipulating shown highlights */
    if (this.externalEvtsListenersBinder) {
      this.externalEvtsListenersBinder.bind(container);
      this.boundAfterRender.push(this.externalEvtsListenersBinder);
    }

    /** If any Heatmap tracks exist in Protvista we need to detect container width changes
     * and manually set width parameter in all nightingale-sequence-heatmap element
     */
    if (hasHeatmapTracks) {
      this.heatmapWidthChangeListener = new HeatmapPatches();
      this.heatmapWidthChangeListener.bind(container, extraMarginLeft, extraMarginRight);
      this.boundAfterRender.push(this.heatmapWidthChangeListener);
    }

    if (colourBy3DEventStream) {
      this.setTracksDataBinder.colourBy3DEventStream = colourBy3DEventStream;
      this.colour3DBtnBinder = new ColourIn3DButtonBinding();
      this.colour3DBtnBinder.bind(container, colourBy3DEventStream);
      this.boundAfterRender.push(this.colour3DBtnBinder);
      this.setTracksDataBinder.colour3DBtnBinder = this.colour3DBtnBinder;
    }
  }

  public async bindAnyTrackDatum(
    datum: NewProtvistaTrackDatum,
    containerElement: HTMLElement,
    chainId: string,
    tooltipsData: { [key: string]: string },
    extraMarginLeft: number,
    extraMarginRight: number
  ) {
    if (!this.setTracksDataBinder) throw new Error('Invalid bindings object');
    const isCustomData = datum.isCustomData ? true : false;
    if (datum.type === 'TrackCanvas' && datum.data) {
      this.setTracksDataBinder.setTrackCanvasData(
        containerElement,
        datum.name,
        datum.id,
        datum,
        datum.data as NightingaleFeature[],
        tooltipsData,
        false,
        isCustomData,
        extraMarginLeft,
        extraMarginRight
      );
    } else if (datum.type === 'NestedTrackCanvas' && datum.data) {
      // eslint-disable-next-line prefer-const
      let nestedTrackData = datum as NewProtvistaTrackDatumNestedTrack;
      this.setTracksDataBinder.setTrackCanvasData(
        containerElement,
        nestedTrackData.name,
        nestedTrackData.id,
        nestedTrackData,
        nestedTrackData.data,
        tooltipsData,
        false,
        isCustomData,
        extraMarginLeft,
        extraMarginRight
      );
      for (const childDatum of nestedTrackData.childData) {
        this.setTracksDataBinder.setTrackCanvasData(
          containerElement,
          childDatum.name,
          childDatum.id,
          childDatum,
          childDatum.data,
          tooltipsData,
          true,
          isCustomData,
          extraMarginLeft,
          extraMarginRight
        );
      }
    } else if (datum.type === 'TrackConservation') {
      // eslint-disable-next-line prefer-const
      let conservationData = datum as NewProtvistaTrackDatumConsTrack;
      this.setTracksDataBinder.setTrackConservationData(containerElement, conservationData.id, conservationData.data, conservationData.aggChartData);
      this.conservationTrackControllers.bindOrRebind(containerElement);
    } else if (datum.type === 'TrackVariation') {
      // eslint-disable-next-line prefer-const
      let variationData = datum as NewProtvistaTrackDatumVarTrack;
      this.setTracksDataBinder.setTrackVariationData(containerElement, variationData.id, variationData.data, variationData.aggChartData);
      this.variationTrackControllers.bindOrRebind(containerElement, chainId, variationData.id, variationData.srcData);
    } else if (datum.type === 'TrackColouredSequence') {
      // eslint-disable-next-line prefer-const
      let colouredSeqData = datum as NewProtvistaTrackDatumColourSeqTrack;
      this.setTracksDataBinder.setTrackColouredSequenceData(containerElement, colouredSeqData.id, colouredSeqData.data);
    } else if (datum.type === 'TrackHeatmapSequence') {
      // eslint-disable-next-line prefer-const
      let heatmapData = datum as NewProtvistaTrackDatumHeatmapSeqTrack;
      const trackTooltipFn =
        heatmapData.tooltipContentFn !== undefined
          ? heatmapData.tooltipContentFn
          : (d: any, x: number, y: number, xIndex: number, yIndex: number) => {
              return `x: ${JSON.stringify(x)} (index ${xIndex}) <br> y: ${JSON.stringify(y)} (index ${yIndex}) <br> score: ${JSON.stringify(d.score)}`;
            };
      const customColourScale =
        heatmapData.customColourScale !== undefined ? heatmapData.customColourScale : scaleLinear(heatmapData.checkpoints, heatmapData.colours);

      await this.setTracksDataBinder.setTrackHeatmapSequenceData(
        containerElement,
        heatmapData.id,
        heatmapData.data,
        heatmapData.xDomain,
        heatmapData.yDomain,
        heatmapData.checkpoints,
        heatmapData.colours,
        trackTooltipFn,
        customColourScale
      );
    }
  }

  public rebindTooltips(container: HTMLElement, tooltipsData: { [key: string]: string }) {
    this.helpTooltipsBinder.bind(container, tooltipsData);
  }

  public rebindExpansion(container: HTMLElement) {
    this.toggleTrackExpansionBinder.bind(container);
  }

  public rebindIn3DColouring(container: HTMLElement, colourBy3DEventStream: BehaviorSubject<NewProtvistaColourEvent | null>) {
    if (this.colour3DBtnBinder) {
      this.colour3DBtnBinder.bind(container, colourBy3DEventStream);
    }
  }

  public unbindAll(container: HTMLElement) {
    for (const bound of this.boundAfterRender) {
      bound.unbind(container);
    }
  }
}
