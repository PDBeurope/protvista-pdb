const RSA_CLASS_CONFIG = {
  Switching: {
    color: "#ffbf00",
    order: 0,
  },
  Buried: {
    color: "#e6e600",
    order: 1,
  },
  Exposed: {
    color: "#ff1a00",
    order: 2,
  },
};

function makeRsaClassTooltip(className, residue) {
  const start = residue.startIndex;
  const end = residue.endIndex ?? residue.startIndex;

  const range =
    start === end
      ? `${residue.startCode || ""}${start}`
      : `${residue.startCode || ""}${start}-${residue.endCode || ""}${end}`;

  const entries = residue.mddbEntries || [];

  const entryList = entries.length
    ? `<br>MDDB entries:<br>
      ${entries
        .slice(0, 5)
        .map((entry) => {
          const chains = entry.chainIds?.length
            ? ` chain ${entry.chainIds.join(",")}`
            : "";

          return `${entry.pdbId || ""} / ${entry.mddbId || ""}${chains}`;
        })
        .join("<br>")}${entries.length > 5 ? `<br>+${entries.length - 5} more` : ""}`
    : "";

  return [
    `Type: Simulated relative solvent accessibility`,
    `Class: ${className}`,
    `Range: ${range}`,
    `Count: ${entries.length}`,
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
      "Residues classified as buried based on the summary of relative solvent accessible surface area during the simulation.",
    Exposed:
      "Residues classified as exposed based on the summary of relative solvent accessible surface area during the simulation.",
    Switching:
      "Residues that switch between buried and exposed states during the simulation.",
  };

  return [
    `<strong>${className}</strong>`,
    descriptions[className] ||
      "Residues annotated based on the summary of relative solvent accessible surface area during the simulation.",
    `Residues: ${residueCount}`,
    `MDDB observations: ${entryCount}`,
  ].join("<br>");
}

export function transformSimRsaClassesToTrack(mockEntry) {
  if (!mockEntry?.data) return null;

  const rows = mockEntry.data
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

  return {
    labelType: "text",
    label: "Simulated RSA classes (MDDB)",
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
      end: mockEntry.length,
      locations: residues.map((residue) => ({
        fragments: [
          {
            start: Number(residue.startIndex),
            end: Number(residue.endIndex ?? residue.startIndex),
            color: config.color,
            tooltipContent: makeRsaClassTooltip(className, residue),
            rsaClass: className,
            mddbEntries: residue.mddbEntries || [],
          },
        ],
      })),
    }))
  };
}