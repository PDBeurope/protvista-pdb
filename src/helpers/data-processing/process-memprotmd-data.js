// const MEMPROTMD_COLOURS = [
//   "#ff7f00",
//   "#984ea3",
//   "#e41a1c",
//   "#377eb8",
//   "#4daf4a",
//   "#a65628",
//   "#f781bf",
//   "#999999",
// ];

// function createAnnotationColourMap(data) {
//   const labels = [
//     ...new Set(
//       data.flatMap(residue =>
//         (residue.annotations ?? []).map(a => a.label),
//       ),
//     ),
//   ].sort();

//   return Object.fromEntries(
//     labels.map((label, i) => [
//       label,
//       MEMPROTMD_COLOURS[i % MEMPROTMD_COLOURS.length],
//     ]),
//   );
// }

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

  // const colourMap = createAnnotationColourMap(entry.data);

  return {
    labelType: "text",
    label: "Predicted membrane binding sites",
    labelColor: "rgb(128,128,128)",
    length: entry.length,
    data: [
      {
        accession: "MemProtMD",
        labelType: "text",
        label: makeMemProtMDLabel(),
        color: "rgb(128,128,128)",
        labelColor: "rgb(211,211,211)",
        type: "UniProt range",
        tooltipContent: "MemProtMD",
        labelTooltip:
          "Molecular dynamics simulations of membrane protein interactions",
        // locations: entry.data.map((segment) => makeLocation(segment, colourMap)),
        locations: entry.data.map((segment) => makeLocation(segment)),
      },
    ],
  };
  return {
    track: track,
    // legend: createMemProtMDLegend(colourMap),
  };
}

function makeLocation(segment, colourMap) {
  const annotation = segment.annotations?.[0];

  return {
    fragments: [
      {
        start: segment.startIndex,
        end: segment.endIndex,
        // color: colourMap[annotation?.label],
        tooltipContent: makeTooltip(segment),
        annotations: segment.annotations,
      },
    ],
  };
}

function makeTooltip(segment) {
  const annotation = segment.annotations?.[0];

  const residue =
    segment.startIndex === segment.endIndex
      ? `${segment.startCode} ${segment.startIndex}`
      : `${segment.startCode} ${segment.startIndex} - ${segment.endCode} ${segment.endIndex}`;

  return [
    `Type: Simulated residue membrane interaction`,
    `Residue${segment.startIndex === segment.endIndex ? "" : "s"}: ${residue}`,
    annotation
      ? `<b>Label: ${annotation.label}</b>`
      : null,
    annotation?.observed_entries != null
      ? `Observed entries: ${annotation.observed_entries}`
      : null,
    annotation?.example_pdb
      ? `Example PDB: <a target="_blank" href="https://www.ebi.ac.uk/pdbe/entry/pdb/${annotation.example_pdb}">${annotation.example_pdb}</a>`
      : null,
    annotation?.raw_score != null
      ? `Raw score: ${annotation.raw_score}`
      : null,
  ]
    .filter(Boolean)
    .join("<br>");
}

function makeMemProtMDLabel() {
  return `<a target="_blank" href="https://memprotmd.bioch.ox.ac.uk/">MemProtMD <i class="icon icon-generic" style="font-size:75%" data-icon="x"></i></a>`;
}

// export function createMemProtMDLegend(result) {
//   if (!result || typeof result !== "object") {
//     return null;
//   }

//   const accession = Object.keys(result)[0];
//   if (!accession) {
//     return null;
//   }

//   const entry = result[accession];

//   if (!Array.isArray(entry.data) || !entry.data.length) {
//     return null;
//   }
//   const colourMap = createAnnotationColourMap(entry.data);

//   return {
//     label: "Predicted membrane binding sites",
//     colourMap: Object.entries(colourMap).map(
//       ([text, color]) => ({
//         color,
//         text,
//       }),
//     ),
//   };
// }