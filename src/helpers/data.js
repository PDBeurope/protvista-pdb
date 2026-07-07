import { p00918RsaBoxplot } from "../mock-data/P00918-uniprot-rsa";
import { p00918SimRsaBoxplot } from "../mock-data/P00918-uniprot-simulated-rsa";
import { p00918SimRsaClasses } from "../mock-data/P00918-uniprot-simulated-rsa-classes.js";
import { transformSimRsaClassesToTrack } from "../mock-data/transformRsaClasses.js";
class DataHelper {
  constructor(envAttrValue, accession, entryId, entityId, pageSection) {
    // Set Env property
    if (envAttrValue) {
      this.appUrlEnv = envAttrValue;
    } else {
      this.appUrlEnv = new RegExp("wwwdev").test(window.location.href)
        ? "dev"
        : new RegExp("wwwint").test(window.location.href)
          ? "int"
          : "";
    }

    this.accession = accession;
    this.entryId = entryId;
    this.entityId = entityId;
    this.pageSection = pageSection;

    // Initial Viewer Data
    this.viewerData = {
      displayNavigation: true,
      displaySequence: true,
      displayConservation: true,
      displayVariants: true,
      displayBoxplot: true,
      sequence: undefined,
      length: undefined,
      boxplot: undefined,
      tracks: [],
      legends: {
        alignment: "right",
        data: {},
      },
    };
  }

  getPDBePVApiUrls() {
    // Default PDBe ProtVista API Urls
    let pdbePvApiUrls = {
      uniport: [
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/unipdb/${this.accession}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/domains/${this.accession}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/secondary_structures/protvista/variation/${this.accession}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/ligand_sites/${this.accession}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/interface_residues/${this.accession}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/annotations/${this.accession}`,
      ],
      entry: [
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/uniprot_mapping/${this.entryId}/${this.entityId}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/chains/${this.entryId}/${this.entityId}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/domains/${this.entryId}/${this.entityId}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/rfam/${this.entryId}/${this.entityId}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/secondary_structure/${this.entryId}/${this.entityId}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/binding_sites/${this.entryId}/${this.entityId}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/interfaces/${this.entryId}/${this.entityId}`,
        `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/annotations/${this.entryId}/${this.entityId}`,
      ],
    };

    let urls = [];
    if (this.accession) {
      urls = pdbePvApiUrls.uniport;
    } else if (this.entryId && this.entityId && !this.pageSection) {
      urls = pdbePvApiUrls.entry;
    } else if (this.entryId && this.entityId && this.pageSection) {
      urls =
        this.pageSection === "2"
          ? [pdbePvApiUrls.entry.pop()]
          : pdbePvApiUrls.entry.slice(0, -1);
    }

    return urls;
  }

  async processMutlplePDBeApiData() {
    const pdbeApiUrls = this.getPDBePVApiUrls();

    const results = await Promise.all(
      pdbeApiUrls.map(async (url) => {
        try {
          const response = await fetch(url);

          if (!response.ok) {
            console.warn(
              `API unavailable: ${url}`,
              response.status,
              response.statusText,
            );
            return null;
          }

          return await response.json();
        } catch (err) {
          console.warn(`API unavailable: ${url}`, err);
          return null;
        }
      }),
    );

    results.forEach((result, resultIndex) => {
      if (!result || Object.keys(result).length === 0) {
        return;
      }

      let resultKey = this.entryId ? this.entryId : this.accession;

      if (pdbeApiUrls[resultIndex].split("/").indexOf("uniprot_mapping") > -1) {
        if (
          result[resultKey]?.tracks &&
          result[resultKey].tracks.length === 1
        ) {
          this.accession = result[resultKey].tracks[0].data[0].label;
          resultKey = this.accession;
        }
      }

      if (!result[resultKey]) return;

      if (result[resultKey].displayNavigation === false) {
        this.viewerData.displayNavigation = false;
      }

      if (result[resultKey].displaySequence === false) {
        this.viewerData.displaySequence = false;
      }

      if (result[resultKey].sequence) {
        this.viewerData.sequence = result[resultKey].sequence;
      }

      if (result[resultKey].length) {
        this.viewerData.length = result[resultKey].length;
      }

      if (result[resultKey].tracks) {
        this.viewerData.tracks = this.viewerData.tracks.concat(
          result[resultKey].tracks,
        );
      }

      if (result[resultKey].legends) {
        if (result[resultKey].legends.alignment) {
          this.viewerData.legends.alignment =
            result[resultKey].legends.alignment;
        }

        if (result[resultKey].legends.data) {
          for (const legendKey in result[resultKey].legends.data) {
            this.viewerData.legends.data[legendKey] =
              result[resultKey].legends.data[legendKey];
          }
        }
      }
    });
   this.addMockBoxplotData();

    return this.viewerData;
  }

  async getPDBeApiDataByName(apiName) {
    try {
      let apiUrl = `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/${apiName === "sequence_conservation" ? "" : "protvista/"}${apiName}/${this.accession}`;
      if (this.entryId && this.entityId) {
        apiUrl = `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/${apiName === "sequence_conservation" ? "pdb" : "pdb/entry/protvista"}/${apiName}/${this.entryId}/${this.entityId}`;
      }

      return await (await fetch(apiUrl)).json();
    } catch (e) {
      console.log(`API ${apiName} unavailable!`, e);
    }
  }

  addMockBoxplotData() {
    if (this.accession !== "P00918") return;

    const rsaEntry = p00918RsaBoxplot[this.accession];
    const simulatedRsaEntry = p00918SimRsaBoxplot?.[this.accession];
    const simulatedRsaClassesEntry = p00918SimRsaClasses?.[this.accession];

    if (rsaEntry || simulatedRsaEntry) {
      this.viewerData.displayBoxplot = true;
      this.viewerData.boxplot = {
        rsa: rsaEntry,
        simulatedRsa: simulatedRsaEntry,
      };

      const sourceEntry = rsaEntry || simulatedRsaEntry;

      if (!this.viewerData.sequence && sourceEntry.sequence) {
        this.viewerData.sequence = sourceEntry.sequence;
      }

      if (!this.viewerData.length && sourceEntry.length) {
        this.viewerData.length = sourceEntry.length;
      }
      this.addLegendGroup("Relative solvent accessibility", [
          {
            color: "#4169e1",
            text: "PDB RSA",
          },
          {
            color: "#d95f02",
            text: "Simulated RSA",
          },
      ]);
    }

    if (simulatedRsaClassesEntry) {
      const simRsaTrack = transformSimRsaClassesToTrack(this.accession, simulatedRsaClassesEntry);

      if (simRsaTrack) {
        this.viewerData.tracks.push(simRsaTrack);

        this.addLegendGroup("Simulated RSA Classes", [
          {
            color: "#ffbf00",
            text: "Switching",
          },
          {
            color: "#e6e600",
            text: "Buried",
          },
          {
            color: "#ff1a00",
            text: "Exposed",
          },
        ]);
      }
    }
  }

  addLegendGroup(groupName, items) {
    if (!this.viewerData.legends) {
      this.viewerData.legends = {
        alignment: "right",
        data: {},
      };
    }

    if (!this.viewerData.legends.data) {
      this.viewerData.legends.data = {};
    }

    this.viewerData.legends.data[groupName] = items;
  }
}

export default DataHelper;
