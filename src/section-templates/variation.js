import { html } from "lit";
import filterData from "../custom-pv-components/filters";

function getRawVariantFilters(ctx) {
  if (Array.isArray(ctx.variantFilterAttr) && ctx.variantFilterAttr.length) {
    return ctx.variantFilterAttr;
  }

  if (typeof ctx.variantFilterAttr === "string") {
    try {
      const parsed = JSON.parse(ctx.variantFilterAttr);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    } catch {
      // Old attr string is not useful for nightingale-filter.
    }
  }

  return filterData;
}

function normaliseVariantFilters(filters = []) {
  return filters.map((filter) => ({
    ...filter,
    options: {
      ...filter.options,
      label:
        filter.options?.label ||
        filter.options?.labels?.join(" / ") ||
        filter.name,
      color:
        filter.options?.color ||
        filter.options?.colors?.[0] ||
        "#999",
    },
  }));
}

function isAlwaysExpanded(ctx) {
    return ctx.alwaysExpanded.includes('variation') === true;
}

function PDBePvVariationSection(ctx) {
  const variantFilters = normaliseVariantFilters(getRawVariantFilters(ctx));
  return html`
    <div class="protvistaRow pvVariantGraphRow" style="display:${isAlwaysExpanded(ctx) ? "table" : "none"}">
      <div
        class="protvistaCol1 category-label ${isAlwaysExpanded(ctx) ? "no-icon" : ""}"
        @click=${() => {
          if (!isAlwaysExpanded(ctx)) {
            ctx.layoutHelper.showVariantPlot();
          }
        }}
      >
        Variants
      </div>

      <div class="protvistaCol2 aggregate-track-content aggregate-track-border pvVariantGraphSection">
        <protvista-pdb-variation-graph
          .useDefaultStyles=${ctx.useDefaultStyles}
          .length=${ctx.viewerData.length}
          .height=${40}
          .display-start=${ctx.viewerData.displayStart || 1}
          .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
          .margin-left=${ctx.pvTrackMargins.left}
          .margin-right=${ctx.pvTrackMargins.right}
        ></protvista-pdb-variation-graph>
      </div>
    </div>

    <div class="pvVariantPlotRow" style="display:${isAlwaysExpanded(ctx) ? "block" : "none"}">
      <div class="protvistaRow">
        <div class="protvistaCol1 track-label">
          <nightingale-filter
            .filters=${variantFilters}
            for="pdbe-variation-track"
          ></nightingale-filter>
        </div>

        <div class="protvistaCol2 track-content pvVariantPlotSection">
          <protvista-pdb-variation
            id="pdbe-variation-track"
            .useDefaultStyles=${ctx.useDefaultStyles}
            .filters=${variantFilters}
            .length=${ctx.viewerData.length}
            .height=${430}
            .display-start=${ctx.viewerData.displayStart || 1}
            .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
            .margin-left=${ctx.pvTrackMargins.left}
            .margin-right=${ctx.pvTrackMargins.right}
          ></protvista-pdb-variation>
        </div>
      </div>
    </div>
  `;
}

export default PDBePvVariationSection;