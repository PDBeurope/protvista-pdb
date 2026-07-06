import NightingaleLinegraphTrack from "@nightingale-elements/nightingale-linegraph-track";

class ProtvistaPdbVariationGraph extends NightingaleLinegraphTrack {
  connectedCallback() {
    super.connectedCallback();

    this.type = "Variants";
    this["show-label-name"] = false;
  }

  set data(data) {
    this._rawData = data;
    super.data = this._normaliseData(data);
  }

  get data() {
    return this._rawData;
  }

  _normaliseData(data) {
    const variants = data?.variants || [];

    if (!variants.length) {
      return [];
    }

    const totalMap = {};
    const diseaseMap = {};

    variants.forEach((variant) => {
      const position = Number(variant.start);

      if (!totalMap[position]) {
        totalMap[position] = 0;
      }

      if (!diseaseMap[position]) {
        diseaseMap[position] = 0;
      }

      totalMap[position]++;

      if (variant.association) {
        variant.association.forEach((association) => {
          if (association.disease === true) {
            diseaseMap[position]++;
          }
        });
      }
    });

    const positions = Object.keys(totalMap)
      .map(Number)
      .sort((a, b) => a - b);

    const totalValues = positions.map((position) => ({
      position,
      value: totalMap[position],
    }));

    const diseaseValues = positions.map((position) => ({
      position,
      value: diseaseMap[position] || 0,
    }));

    const maxValue = Math.max(
      1,
      ...totalValues.map((item) => item.value),
      ...diseaseValues.map((item) => item.value),
    );

    return [
      {
        name: "Disease-associated variants",
        range: [0, maxValue + 2],
        color: "red",
        fill: "none",
        lineCurve: "curveLinear",
        values: diseaseValues,
      },
      {
        name: "Total variants",
        range: [0, maxValue + 2],
        color: "darkgrey",
        fill: "none",
        lineCurve: "curveLinear",
        values: totalValues,
      },
    ];
  }
}

export default ProtvistaPdbVariationGraph;