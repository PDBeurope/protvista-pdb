const MEMPROTMD_TRACKS = {
  "membrane lipid acyl-tail interacting residue": {
    colour: "#E69F00", // Amber/yellow (hydrophobic lipid tails)
    label: "Lipid acyl-tail",
  },
  "membrane lipid head-group interacting residue": {
    colour: "#D55E00", // Orange-red (polar/charged head groups)
    label: "Lipid head-group",
  },
  "solvent interacting residue": {
    colour: "#0072B2", // Blue (water/solvent)
    label: "Solvent",
  },
  "pore-facing residue": {
    colour: "#7B3294", // Purple (distinct from solvent and lipids)
    label: "Pore-facing",
  },
};

export function processMemProtMDData(result) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const accession = Object.keys(result)[0];
  if (!accession) {
    return null;
  }

  const entry = result[accession];

  if (!Array.isArray(entry.data) || !entry.data.length) {
    return null;
  }

  const tracks = Object.entries(MEMPROTMD_TRACKS)
    .map(([annotationLabel, config]) => ({
      accession: `MemProtMD - ${config.label}`,
      labelType: "text",
      label: config.label,
      color: config.colour,
      labelColor: "rgb(211,211,211)",
      type: "UniProt range",
      tooltipContent: "MemProtMD",
      labelTooltip: `${annotationLabel.charAt(0).toUpperCase()}${annotationLabel.slice(1)}s in molecular dynamics simulations of membrane protein interactions`,
      locations: entry.data
        .map((segment) => makeLocation(segment, annotationLabel))
        .filter(Boolean),
    }))
    .filter((track) => track.locations.length);

  return {
    labelType: "text",
    label: "Predicted membrane binding sites",
    labelColor: "rgb(128,128,128)",
    length: entry.length,
    data: tracks,
  };
}

function makeLocation(segment, annotationLabel) {
  const annotation = segment.annotations?.find(
    (a) => a.label === annotationLabel,
  );

  if (!annotation) {
    return null;
  }

  return {
    fragments: [
      {
        start: segment.startIndex,
        end: segment.endIndex,
        color: MEMPROTMD_TRACKS[annotationLabel].colour,
        tooltipContent: makeTooltip(segment, annotationLabel),
        annotations: segment.annotations,
      },
    ],
  };
}

function makeTooltip(segment, annotationLabel) {
  const residue =
    segment.startIndex === segment.endIndex
      ? `${segment.startCode} ${segment.startIndex}`
      : `${segment.startCode} ${segment.startIndex} - ${segment.endCode} ${segment.endIndex}`;

  const annotation = segment.annotations?.find(
    (a) => a.label === annotationLabel,
  );

  if (!annotation) {
    return null;
  }

  return [
    "Type: Simulated residue membrane interaction",
    `Residue${segment.startIndex === segment.endIndex ? "" : "s"}: ${residue}`,
    `Label: ${annotation.label}`,
    annotation.raw_score != null
      ? `Raw score: ${annotation.raw_score}`
      : null,
    annotation.observed_entries != null
      ? `Observed entries: ${annotation.observed_entries}`
      : null,
    annotation.example_pdb
      ? `Example PDB: <a target="_blank" href="https://memprotmd.bioch.ox.ac.uk/_ref/PDB/${annotation.example_pdb}/">${annotation.example_pdb}</a>`
      : null,
    `Source: <a target="_blank" href="https://memprotmd.bioch.ox.ac.uk/">MemProtMD</a>`,
  ]
    .filter(Boolean)
    .join("<br>");
}

function makeMemProtMDLabel() {
  return `<a target="_blank" href="https://memprotmd.bioch.ox.ac.uk/">MemProtMD <i class="icon icon-generic" style="font-size:75%" data-icon="x"></i></a>`;
}

export function createMemProtMDLegend(result) {
  if (!result || typeof result !== "object") {
    return null;
  }

  const accession = Object.keys(result)[0];
  if (!accession) {
    return null;
  }

  const entry = result[accession];

  if (!Array.isArray(entry.data) || !entry.data.length) {
    return null;
  }

  return {
    label: "Predicted membrane binding sites (MemProtMD)",
    colourMap: Object.entries(MEMPROTMD_TRACKS).map(([text, data]) => ({
      color: data.colour,
      text: data.label,
    })),
  };
}
