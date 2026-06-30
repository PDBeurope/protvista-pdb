import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';
import {
  filterEntityVariationData,
  processEntityVariationDataFromAPI,
  processEntityVariationLineChartDataFromAPI,
} from '../../processing/pv-variation-api-processing';
import { SetTracksDataBinding } from './set-tracks-data.binding';

export class ProtvistaVarControllers extends ProtvistaGenericBinding {
  constructor(private setTracksDataBinder: SetTracksDataBinding) {
    super();
  }

  public bindOrRebind(container: HTMLElement, currentChain: string, trackId: string, srcVariationData: any) {
    this.bind(container, currentChain, trackId, srcVariationData);
  }

  override bind(container: HTMLElement, currentChain: string, trackId: string, srcVariationData: any) {
    const checkBoxes = container.querySelectorAll<HTMLInputElement>('.variant-filter');
    if (!checkBoxes.length) return;

    // Maintain internal active filters (just like Angular's currentKeywordFilters)
    const activeFilters = new Set<string>();

    for (const checkBox of Array.from(checkBoxes)) {
      const variationCheckBoxHandler = (event: Event) => {
        const input = event.target as HTMLInputElement;
        const keyword = input.value;

        // Update internal active filter list
        if (input.checked) activeFilters.delete(keyword);
        else activeFilters.add(keyword);

        // Apply filters to variation data
        const freshCopy = JSON.parse(JSON.stringify(srcVariationData));
        const filtered = filterEntityVariationData(freshCopy, currentChain);
        const processedData = processEntityVariationDataFromAPI(filtered, Array.from(activeFilters));
        const lineData = processEntityVariationLineChartDataFromAPI(filtered, Array.from(activeFilters));

        // Rebind track + line data
        this.setTracksDataBinder.setTrackVariationData(container, trackId, processedData, lineData);
      };

      checkBox.addEventListener('change', variationCheckBoxHandler);
      this.elementListeners.push({ element: checkBox, handlers: { type: 'change', listener: variationCheckBoxHandler } });
    }
  }
}
