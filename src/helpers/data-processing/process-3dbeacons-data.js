export function process3DBeaconsData(result, accession) {
  if (!result?.structures || !Array.isArray(result.structures)) {
    return null;
  }

  const structures = result.structures
    .map((structure) => structure?.summary)
    .filter(
      (summary) =>
        summary &&
        Number.isFinite(Number(summary.uniprot_start)) &&
        Number.isFinite(Number(summary.uniprot_end)),
    );

  if (!structures.length) {
    return null;
  }

  const track = {
    label: `Predicted structures (${structures.length})`,
    labelColor: "rgb(128,128,128)",
    labelType: "text",
    data: structures.map((summary) => {
      const provider = summary.provider || "Unknown provider";
      const modelIdentifier = summary.model_identifier || "unknown model";

      return {
        accession: provider,
        color: "rgb(128,128,128)",
        label: makeModelLabel(summary),
        labelColor: "rgb(211,211,211)",
        labelType: "text",
        labelTooltip: provider,
        type: "UniProt range",
        in3D: true,
        locations: [
          {
            fragments: [
              {
                start: Number(summary.uniprot_start),
                end: Number(summary.uniprot_end),
                tooltipContent: makeModelTooltip(summary),
                type: "Predicted Structures",
                modelUrl: summary.model_url,
                modelFormat: summary.model_format,
                pageUrl: summary.model_page_url,
                identifier: `${provider} (${modelIdentifier})`,
              },
            ],
          },
        ],
      };
    }),
  };

  return {
    [accession]: {
      tracks: [track],
      legends: {
        data: {
          "Predicted structures": [
            {
              color: "rgb(128,128,128)",
              text: "Predicted / external model",
            },
          ],
        },
      },
    },
    url: result.url,
  };
}

function makeModelLabel(summary) {
  const provider = summary.provider || "Unknown provider";
  const modelIdentifier = summary.model_identifier || "unknown model";

  if (!summary.model_page_url) {
    return `${provider} (${modelIdentifier})`;
  }

  return `<a href="${summary.model_page_url}" target="_blank">${provider} (${modelIdentifier}) <i class="icon icon-generic" style="font-size:75%" data-icon="x"></i></a>`;
}

function makeModelTooltip(summary) {
  const provider = summary.provider || "Unknown provider";
  const modelCategory = summary.model_category || "Unknown";
  const start = summary.uniprot_start;
  const end = summary.uniprot_end;
  const modelFormat = summary.model_format || "Unknown";

  const modelUrl = summary.model_url
    ? `<a href="${summary.model_url}" target="_blank">${provider} <i class="icon icon-generic" style="font-size:75%" data-icon="x"></i></a>`
    : "Unavailable";

  return [
    `Type: ${provider}`,
    `Model category: ${modelCategory}`,
    `Range: ${start} - ${end}`,
    `Model URL: ${modelUrl}`,
    `Model format: ${modelFormat}`,
  ].join("<br>");
}
