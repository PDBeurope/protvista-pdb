import NightingaleLinegraphTrack from "@nightingale-elements/nightingale-linegraph-track";

function mean(values = []) {
  const numericValues = values.map(Number).filter(Number.isFinite);

  if (!numericValues.length) return undefined;

  return (
    numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length
  );
}

function datasetToLine(dataset, fallbackColor) {
  return {
    name: dataset.name || dataset.dataType || "Dataset",
    range: [0, 100],
    color: dataset.color || fallbackColor,
    fill: "none",
    lineCurve: "curveLinear",
    values: (dataset.positions || [])
      .map((positionDatum) => {
        const value = mean(positionDatum.values);

        return {
          position: Number(positionDatum.position),
          value,
        };
      })
      .filter(
        (point) =>
          Number.isFinite(point.position) && Number.isFinite(point.value),
      ),
  };
}

function normaliseAverageLinegraphData(input) {
  const source = input?.data || input;

  if (!source) return [];

  // Expected combined shape:
  // {
  //   rsa: { data: [{ name, positions }] },
  //   simulatedRsa: { data: [{ name, positions }] }
  // }
  if (source.rsa || source.simulatedRsa) {
    const lines = [];

    const rsaDataset = source.rsa?.data?.[0];
    const simulatedDataset = source.simulatedRsa?.data?.[0];

    if (rsaDataset) {
      lines.push(
        datasetToLine(
          {
            ...rsaDataset,
            name: "RSA average",
            color: "#4169e1",
          },
          "#4169e1",
        ),
      );
    }

    if (simulatedDataset) {
      lines.push(
        datasetToLine(
          {
            ...simulatedDataset,
            name: "Simulated RSA average",
            color: "#d95f02",
          },
          "#d95f02",
        ),
      );
    }

    return lines;
  }

  // Fallback: single old boxplot payload
  if (Array.isArray(source.data)) {
    return source.data.map((dataset, index) =>
      datasetToLine(
        dataset,
        index === 0 ? "#4169e1" : "#d95f02",
      ),
    );
  }

  return [];
}

class ProtvistaPdbBoxplotLinegraph extends NightingaleLinegraphTrack {
  connectedCallback() {
    super.connectedCallback();

    this.type = "Relative solvent accessibility";
    this["show-label-name"] = false;
  }

  set data(data) {
    this._rawData = data;
    super.data = normaliseAverageLinegraphData(data);
  }

  get data() {
    return this._rawData;
  }
}

export default ProtvistaPdbBoxplotLinegraph;