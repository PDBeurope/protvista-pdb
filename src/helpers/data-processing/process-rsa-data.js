const RSA_CLASS_CONFIG = {
  Buried: {
    color: "#E69F00", // blue
    order: 0,
  },
  Switching: {
    color: "#7b3294", // purple
    order: 1,
  },
  Exposed: {
    color: "#2166ac", // orange/red
    order: 2,
  },
};
function makeRsaClassTooltip(className, residue, classes = []) {
  const start = residue.startIndex;
  const end = residue.endIndex ?? residue.startIndex;

  const range =
    start === end
      ? `${residue.startCode || ""}${start}`
      : `${residue.startCode || ""}${start}-${residue.endCode || ""}${end}`;

  const entries = residue.mddbEntries || [];

  const entryList = entries.length
    ? `MDposit (${entries.length} entries):<br>
      ${entries
        .map((entry, idx) => {
          const chains = entry.chainIds?.length
            ? ` chain ${entry.chainIds.join(",")}`
            : "";

          return `${idx + 1}. <a href="https://mdposit.mddbr.eu/#/pointer?ref=pdbs&id=${entry.pdbId || ""}" target="_blank">${entry.pdbId || ""}</a> / ${chains}`;
        })
        .join("<br>")}`
    : "";
  
  const otherClasses = classes.filter(c => c !== className);
  const otherClassesNote = otherClasses.length ? ` (Residues also classified as "${otherClasses.join(", ")}" in other MDposit entries)` : '';

  return [
    `Type: Simulated relative solvent accessibility`,
    `Class: ${className}${otherClassesNote}`,
    `Range: ${range}`,
    entryList,
  ]
    .filter(Boolean)
    .join("<br>");
}

function makeRsaClassLabelTooltip(className, residues = []) {
  const residueCount = residues.length;

  const entryCount = residues.reduce(
    (sum, residue) => sum + (residue.mddbEntries?.length || 0),
    0,
  );

  const descriptions = {
    Buried:
      "Residues classified as buried based on the calculated relative solvent accessible surface area of the simulations.",
    Exposed:
      "Residues classified as exposed based on the calculated relative solvent accessible surface area of the simulations.",
    Switching:
      "Residues that switch between buried and exposed states during the simulation.",
  };

  return [
    `<strong>${className}</strong>`,
    descriptions[className] ||
      "Residues annotated based on the summary of relative solvent accessible surface area during the simulation.",
    `Annotated residues: ${residueCount}`,
    `N. of MDposit entries: ${entryCount}`,
  ].join("<br>");
}

export function transformSimRsaClassesToTrack(proteinsId, entry) {
  if (!entry?.data) return null;

  const rows = entry.data
    .map((classData) => {
      const className = classData.name;
      const config = RSA_CLASS_CONFIG[className] || {
        color: "#999999",
        order: 99,
      };

      return {
        className,
        config,
        residues: classData.residues || [],
      };
    })
    .sort((a, b) => a.config.order - b.config.order);

  const residueClasses = new Map();
  for (const classData of entry.data) {
    for (const residue of classData.residues || []) {
      const key = `${residue.startIndex}-${residue.endIndex ?? residue.startIndex}`;

      if (!residueClasses.has(key)) {
        residueClasses.set(key, new Set());
      }

      residueClasses.get(key).add(classData.name);
    }
  }
  return {
    labelType: "text",
    uniProtId: proteinsId,
    label: "Simulated RSA classes (MDposit)",
    type: "Simulated relative solvent accessibility",
    overlapping: false,
    labelColor: "rgb(128,128,128)",
    data: rows.map(({ className, config, residues }) => ({
      accession: className,
      type: className,
      label: className,
      labelTooltip: makeRsaClassLabelTooltip(className, residues),
      labelType: "text",
      labelColor: "rgb(211,211,211)",
      color: "rgb(128,128,128)",
      start: 1,
      end: entry.length,
      locations: residues.map((residue, idx) => {
        const key = `${residue.startIndex}-${residue.endIndex ?? residue.startIndex}`;
        const classes = [...(residueClasses.get(key) ?? [])];
        return {
          fragments: [
            {
              start: Number(residue.startIndex),
              end: Number(residue.endIndex ?? residue.startIndex),
              color: config.color,
              tooltipContent: makeRsaClassTooltip(className, residue, classes),
              rsaClass: className,
              mddbEntries: residue.mddbEntries || [],
            },
          ],
        };
      }),
    })),
  };
}
