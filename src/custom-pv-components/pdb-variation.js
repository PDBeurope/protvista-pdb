import NightingaleVariation from "@nightingale-elements/nightingale-variation";
import filterData, { _getFilteredDataSet } from "./filters";

function normaliseVariantFilters(filters = []) {
  if (!Array.isArray(filters)) return [];

  return filters.map((filter) => ({
    ...filter,
    options: {
      ...filter.options,
      label:
        filter.options?.label ||
        filter.options?.labels?.join(" / ") ||
        filter.name,
      color: filter.options?.color || filter.options?.colors?.[0] || "#999",
    },
  }));
}

class ProtvistaPdbVariation extends NightingaleVariation {
  constructor() {
    super();
    this.useDefaultStyles = true;
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("change", this._onNightingaleChange);

    const root = this.closest("protvista-pdb") || document;
    root.addEventListener("change", this._onFilterChange);
  }

  disconnectedCallback() {
    this.removeEventListener("change", this._onNightingaleChange);

    const root = this.closest("protvista-pdb") || document;
    root.removeEventListener("change", this._onFilterChange);

    super.disconnectedCallback?.();
  }

  set filters(filters) {
    this._filterConfig = normaliseVariantFilters(
      Array.isArray(filters) && filters.length ? filters : filterData,
    );
  }

  get filters() {
    if (!this._filterConfig || this._filterConfig.length === 0) {
      this._filterConfig = normaliseVariantFilters(filterData);
    }

    return this._filterConfig;
  }

  _onFilterChange = (event) => {
    const detail = event.detail || {};

    if (detail.type !== "filters") return;
    if (detail.for !== this.id) return;

    this.applyActiveFilterNames(detail.value || []);
  };

  applyActiveFilterNames(activeFilterNames) {
    if (!this._completeDataSet) return;

    const activeNameSet = new Set(activeFilterNames || []);

    const activeFilterKeys = filterData
      .filter((filter) => activeNameSet.has(filter.name))
      .map((filter) => `${filter.type.name}:${filter.name}`);

    const activeFiltersAttr = activeFilterKeys.join(",");

    const filteredData = _getFilteredDataSet(
      "activefilters",
      "",
      activeFiltersAttr,
      this._completeDataSet,
    );

    this._rawData = filteredData;
    super.data = filteredData;

    requestAnimationFrame(() => {
      this.createFeatures?.();
      this.zoomRefreshed?.();
    });
  }

  static get observedAttributes() {
    return [...(super.observedAttributes || []), "activefilters"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "activefilters" && oldValue !== newValue) {
      if (this._completeDataSet) {
        this.data = _getFilteredDataSet(
          name,
          oldValue,
          newValue,
          this._completeDataSet,
        );
      }
      return;
    }

    super.attributeChangedCallback?.(name, oldValue, newValue);
  }

  set data(data) {
    if (!this._completeDataSet) {
      this._completeDataSet = data;
    }

    this._rawData = data;
    super.data = data;
  }

  get data() {
    return this._rawData;
  }

  _onNightingaleChange = (event) => {
    const detail = event.detail || {};

    const type = detail.eventType || detail.eventtype || detail.type;

    const value = detail.value || detail;
    const feature = value?.feature || value?.data || value;

    if (type === "mouseover") {
      this._handleMouseover(value, feature);
    }

    if (type === "mouseout") {
      this._handleMouseout();
    }

    if (type === "click") {
      this._handleClick(value, feature);
    }
  };

  _getMouseEvent(value) {
    return (
      value?.parentEvent ||
      value?.event ||
      value?.originalEvent ||
      value?.sourceEvent ||
      null
    );
  }

  _makeTooltipData(feature) {
    if (!feature) return null;

    const start = Number(feature.start);
    const end = Number(feature.end ?? feature.start);

    if (!start) return null;

    return {
      start,
      end,
      feature: {
        ...feature,
        type: "Variant",
      },
    };
  }

  _handleMouseover(value, feature) {
    const tooltipData = this._makeTooltipData(feature);
    if (!tooltipData) return;

    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!oldTooltip?.classList.contains("click-open")) {
      window.setTimeout(() => {
        this.createTooltipFromTooltipData(
          this._getMouseEvent(value),
          tooltipData,
          false,
        );
      }, 50);
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlight: `${tooltipData.start}:${tooltipData.end}`,
          highlightstart: tooltipData.start,
          highlightend: tooltipData.end,
          "highlight-start": tooltipData.start,
          "highlight-end": tooltipData.end,
        },
        bubbles: true,
        cancelable: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent("protvista-mouseover", {
        detail: tooltipData.feature,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _handleMouseout() {
    const oldTooltip = document.querySelector("protvista-tooltip");

    if (!oldTooltip?.classList.contains("click-open")) {
      window.setTimeout(() => {
        this.removeAllTooltips();
      }, 50);
    }

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          highlight: null,
          highlightstart: null,
          highlightend: null,
          "highlight-start": null,
          "highlight-end": null,
        },
        bubbles: true,
        cancelable: true,
      }),
    );

    this.dispatchEvent(
      new CustomEvent("protvista-mouseout", {
        detail: null,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  _handleClick(value, feature) {
    const tooltipData = this._makeTooltipData(feature);
    if (!tooltipData) return;

    window.setTimeout(() => {
      this.createTooltipFromTooltipData(
        this._getMouseEvent(value),
        tooltipData,
        true,
      );
    }, 0);

    this.dispatchEvent(
      new CustomEvent("protvista-click", {
        detail: tooltipData,
        bubbles: true,
        cancelable: true,
      }),
    );
  }

  removeAllTooltips() {
    document.querySelectorAll("protvista-tooltip").forEach((tooltip) => {
      tooltip.remove();
    });
  }

  createTooltipFromTooltipData(mouseEvent, tooltipData, closeable = false) {
    if (!mouseEvent || typeof mouseEvent.pageX === "undefined") return;

    this.removeAllTooltips();

    const tooltip = document.createElement("protvista-tooltip");

    if (this.useDefaultStyles) {
      tooltip.classList.add("default-styles");
    }

    tooltip.left = mouseEvent.pageX + 15;
    tooltip.top = mouseEvent.pageY + 5;
    tooltip.style.marginLeft = 0;
    tooltip.style.marginTop = 0;

    tooltip.title =
      tooltipData.start === tooltipData.end
        ? `Variant residue ${tooltipData.start}`
        : `Variant ${tooltipData.start}-${tooltipData.end}`;

    tooltip.closeable = closeable;

    tooltip.content =
      tooltipData.feature.tooltipContent ||
      tooltipData.feature.tooltip ||
      tooltipData.feature.description ||
      this._fallbackTooltipContent(tooltipData.feature);

    if (closeable) {
      tooltip.classList.add("click-open");
    }

    document.body.appendChild(tooltip);

    const tooltipDom = tooltip.getBoundingClientRect();
    const bottomSpace = window.innerHeight - mouseEvent.clientY;
    const rightSpace = window.innerWidth - mouseEvent.clientX;

    if (bottomSpace < 130) {
      tooltip.style.top = mouseEvent.pageY - (tooltipDom.height + 20) + "px";
    }

    if (rightSpace < 300) {
      tooltip.style.left = "";
      tooltip.style.right = rightSpace - 10 + "px";
    }
  }

  _fallbackTooltipContent(feature) {
    const mutation = feature.variant || feature.alternativeSequence || "";

    const consequence = feature.consequenceType
      ? `<br/>Consequence: ${feature.consequenceType}`
      : "";

    const xrefs = feature.xrefNames?.length
      ? `<br/>Sources: ${feature.xrefNames.join(", ")}`
      : "";

    return `Variant: ${mutation}${consequence}${xrefs}`;
  }
}

export default ProtvistaPdbVariation;
