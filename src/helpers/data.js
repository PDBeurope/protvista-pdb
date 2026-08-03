import { g2fid1Memprotmd } from "../mock-data/G2FID1-uniprot-memprotmd"
import { p00918RsaBoxplot } from "../mock-data/P00918-uniprot-rsa";
import { p00918SimRsaBoxplot } from "../mock-data/P00918-uniprot-simulated-rsa";
import { p00918SimRsaClasses } from "../mock-data/P00918-uniprot-simulated-rsa-classes.js";
import { transformSimRsaClassesToTrack } from "./data-processing/process-rsa-data.js";
import { addTrackUuids } from "./data-processing/data-track-uuids.js";
import { process3DBeaconsData } from "./data-processing/process-3dbeacons-data.js";
import { processLigandSequenceData } from "./data-processing/process-ligand-sequence-data.js";
import { processLigandInteractions } from "./data-processing/process-ligand-interactions-data.js";
import { processMemProtMDData, createMemProtMDLegend } from "./data-processing/process-memprotmd-data.js";
import { addIn3DToUniPdbTracks } from "./data-processing/data-track-add-in3d.js";
import { addAlwaysExpandedTracks } from "./data-processing/data-track-add-always-expanded.js";

class DataHelper {
  constructor(
    envAttrValue,
    accession,
    entryId,
    entityId,
    pageSection,
    apiNames = [],
    alwaysExpanded = [],
    ligandId,
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
    this.ligandId = ligandId;
    this.apiNames = Array.isArray(apiNames) ? apiNames : null;
    this.alwaysExpanded = Array.isArray(alwaysExpanded) ? alwaysExpanded : null;

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

      ligand: [
        {
          name: "ligand_sequence",
          url: `https://ftp.ebi.ac.uk/pub/databases/msd/pdbechem_v2/ccd/${this.ligandId ? this.ligandId.charAt(0) : ''}/${this.ligandId}/${this.ligandId}.cif`,
          processor: "ligand_sequence",
          responseType: "text",
        },
        {
          name: "ligands_interactions",
          url: `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/compound/interaction/${this.ligandId}`,
          processor: "ligands_interactions",
        }
      ],
    };

    let configs = [];
    if (this.ligandId) {
      configs = pdbePvApiUrls.ligand;
    } else if (this.accession) {
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
            data: config.responseType === "text"
                ? await response.text()
                : await response.json(),
          };
        } catch (err) {
          console.warn(`API unavailable: ${config.name}`, config.url, err);
          return null;
        }
      }),
    );

    let apiNamesForTracks = [];
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
      if (resultKey === null && this.ligandId) resultKey = this.ligandId;

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

      if (config.processor === "ligand_sequence") {
        result = processLigandSequenceData(result, this.ligandId);
        this.viewerData.displayLigandsMode = true;
        if (!result) return;
      }
      if (config.processor === "ligands_interactions") {
        result = processLigandInteractions(result[this.ligandId], this.viewerData.sequence.split(','));
        this.viewerData.ligIntHeatmap = result;
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
      for (const track of result[resultKey].tracks) {
        apiNamesForTracks.push(config.name);
      }
    });

    // Post-processing
    // 1. Add mock memprotmd as track
    this.addMockMemprotmdData();

    // 1. Add mock RSA data
    this.addMockBoxplotData();
    // 2. Add in3D tag to tracks
    const apiNames = pdbeApiConfigs.map(config => config.name);
    this.viewerData.tracks = addIn3DToUniPdbTracks(this.viewerData.tracks, apiNamesForTracks);
    // 3. Add uuid to tracks and subtracks
    this.viewerData.tracks = addTrackUuids(this.viewerData.tracks);
    // 4. Add alwaysExpanded to tracks
    this.viewerData.tracks = addAlwaysExpandedTracks(this.viewerData.tracks, apiNamesForTracks, this.alwaysExpanded);
    
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

    const legend = createMemProtMDLegend(g2fid1Memprotmd);
    this.addLegendGroup(legend.label, legend.colourMap);
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
      this.addLegendGroup("Average Relative Solvent Accessibility", [
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
