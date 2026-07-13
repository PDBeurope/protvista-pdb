import { g2fid1Memprotmd } from "../mock-data/G2FID1-uniprot-memprotmd"
import { p00918RsaBoxplot } from "../mock-data/P00918-uniprot-rsa";
import { p00918SimRsaBoxplot } from "../mock-data/P00918-uniprot-simulated-rsa";
import { p00918SimRsaClasses } from "../mock-data/P00918-uniprot-simulated-rsa-classes.js";
import { transformSimRsaClassesToTrack } from "../mock-data/transformRsaClasses.js";
import { addTrackUuids } from "./data-processing/data-track-uuids.js";
import { process3DBeaconsData } from "./data-processing/process-3dbeacons-data.js";
import { processMemProtMDData } from "./data-processing/process-memprotmd-data.js";
import { addIn3DToUniPdbTracks } from "./data-processing/data-track-add-in3d.js";
class DataHelper {
  constructor(
    envAttrValue,
    accession,
    entryId,
    entityId,
    pageSection,
    apiNames = [],
  ) {
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
    this.apiNames = Array.isArray(apiNames) ? apiNames : null;

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
    const pdbePvApiUrls = {
      uniprot: [
        {
          name: "unipdb",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/unipdb/${this.accession}`,
        },
        {
          name: "domains",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/domains/${this.accession}`,
        },
        {
          name: "secondary_structure_variation",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/secondary_structures/protvista/variation/${this.accession}`,
        },
        {
          name: "ligand_sites",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/ligand_sites/${this.accession}`,
        },
        {
          name: "interface_residues",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/interface_residues/${this.accession}`,
        },
        {
          name: "annotations",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/annotations/${this.accession}`,
        },
        {
          name: "3dbeacons",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/pdbe-kb/3dbeacons/api/uniprot/summary/${this.accession}.json?exclude_provider=pdbe`,
          processor: "3dbeacons",
        },
        // TODO: add memprotmd
        // {
        //   name: "memprotmd",
        //   url: "...",
        //   processor: "memprotmd",
        // }
        // TODO: add RSA APIs
        // {
        //   name: "mddb-rsa",
        //   url: "...",
        //   processor: "mddb-rsa",
        // }
      ],

      entry: [
        {
          name: "uniprot_mapping",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/uniprot_mapping/${this.entryId}/${this.entityId}`,
        },
        {
          name: "chains",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/chains/${this.entryId}/${this.entityId}`,
        },
        {
          name: "domains",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/domains/${this.entryId}/${this.entityId}`,
        },
        {
          name: "rfam",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/rfam/${this.entryId}/${this.entityId}`,
        },
        {
          name: "secondary_structure",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/secondary_structure/${this.entryId}/${this.entityId}`,
        },
        {
          name: "binding_sites",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/binding_sites/${this.entryId}/${this.entityId}`,
        },
        {
          name: "interfaces",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/interfaces/${this.entryId}/${this.entityId}`,
        },
        {
          name: "annotations",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/annotations/${this.entryId}/${this.entityId}`,
        },
      ],
    };

    let configs = [];

    if (this.accession) {
      configs = pdbePvApiUrls.uniprot;
    } else if (this.entryId && this.entityId && !this.pageSection) {
      configs = pdbePvApiUrls.entry;
    } else if (this.entryId && this.entityId && this.pageSection) {
      configs =
        this.pageSection === "2"
          ? pdbePvApiUrls.entry.filter(
              (config) => config.name === "annotations",
            )
          : pdbePvApiUrls.entry.filter(
              (config) => config.name !== "annotations",
            );
    }

    if (this.apiNames?.length) {
      const selectedNames = new Set(this.apiNames);
      configs = configs.filter((config) => selectedNames.has(config.name));
    }

    return configs;
  }

  async processMutlplePDBeApiData() {
    const pdbeApiConfigs = this.getPDBePVApiUrls();

    const results = await Promise.all(
      pdbeApiConfigs.map(async (config) => {
        try {
          const response = await fetch(config.url);

          if (!response.ok) {
            console.warn(
              `API unavailable: ${config.name}`,
              config.url,
              response.status,
              response.statusText,
            );
            return null;
          }

          return {
            config,
            data: await response.json(),
          };
        } catch (err) {
          console.warn(`API unavailable: ${config.name}`, config.url, err);
          return null;
        }
      }),
    );

    results.forEach((resultWrapper) => {
      if (
        !resultWrapper?.data ||
        Object.keys(resultWrapper.data).length === 0
      ) {
        return;
      }

      const { config } = resultWrapper;
      let result = resultWrapper.data;

      let resultKey = this.entryId ? this.entryId : this.accession;

      if (config.name === "uniprot_mapping") {
        if (
          result[resultKey]?.tracks &&
          result[resultKey].tracks.length === 1
        ) {
          this.accession = result[resultKey].tracks[0].data[0].label;
          resultKey = this.accession;
        }
      }

      // processing for 3d beacons API to convert to protvista track
      if (config.processor === "3dbeacons") {
        result = process3DBeaconsData(result, this.accession);
        if (!result) return;
      }

      // TODO: add memprotmd
      // if (config.processor === "memprotmd") {
      //   result = processMemProtMDData(result);
      //   if (!result) return;
      // }

      // TODO: add RSA processing

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

    // Post-processing
    // 1. Add mock memprotmd as track
    this.addMockMemprotmdData();

    // 1. Add mock RSA data
    this.addMockBoxplotData();
    // 2. Add in3D tag to tracks
    const apiNames = pdbeApiConfigs.map(config => config.name);
    this.viewerData.tracks = addIn3DToUniPdbTracks(this.viewerData.tracks, apiNames);
    // 3. Add uuid to tracks and subtracks
    this.viewerData.tracks = addTrackUuids(this.viewerData.tracks);
    
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
  
  addMockMemprotmdData() {
    if (this.accession !== "G2FID1") return;

    const result = processMemProtMDData(g2fid1Memprotmd);
    if (!result) return;
    this.viewerData.tracks.push(result);

    // const legend = createMemProtMDLegend(g2fid1Memprotmd);
    // this.addLegendGroup(legend.label, legend.colourMap);
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
      const simRsaTrack = transformSimRsaClassesToTrack(
        this.accession,
        simulatedRsaClassesEntry,
      );

      if (simRsaTrack) {
        this.viewerData.tracks.push(simRsaTrack);

        this.addLegendGroup("Simulated RSA Classes", [
          {
            color: "#2166ac",
            text: "Buried",
          },
          {
            color: "#7b3294",
            text: "Switching",
          },
          {
            color: "#d6604d",
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
