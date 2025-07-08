class DataHelper {

    constructor(envAttrValue, accession, entryId, entityId, pageSection) {
        // Set Env property
        if(envAttrValue) {
            this.appUrlEnv = envAttrValue;
        } else {
            this.appUrlEnv = new RegExp('wwwdev').test(window.location.href) ? 'dev' : new RegExp('wwwint').test(window.location.href) ? 'int' : '';
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
            sequence: undefined,
            length: undefined,
            tracks: [],
            legends: {
                alignment: 'right',
                data: {}
            }
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
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/protvista/annotations/${this.accession}`
            ],
            entry: [
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/uniprot_mapping/${this.entryId}/${this.entityId}`,
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/chains/${this.entryId}/${this.entityId}`,
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/domains/${this.entryId}/${this.entityId}`,
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/rfam/${this.entryId}/${this.entityId}`,
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/secondary_structure/${this.entryId}/${this.entityId}`,
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/binding_sites/${this.entryId}/${this.entityId}`,
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/interfaces/${this.entryId}/${this.entityId}`,
                `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/pdb/entry/protvista/annotations/${this.entryId}/${this.entityId}`
            ]
        }

        let urls = [];
        if(this.accession){
            urls = pdbePvApiUrls.uniport;
        } else if (this.entryId && this.entityId && !this.pageSection) {
            urls = pdbePvApiUrls.entry;
        } else if (this.entryId && this.entityId && this.pageSection) {
            urls = (this.pageSection === '2') ? [pdbePvApiUrls.entry.pop()] : pdbePvApiUrls.entry.slice(0, -1);
        }

        return urls;

    }

    async processMutlplePDBeApiData() {
        let pdbeApiUrls = this.getPDBePVApiUrls();
        await Promise.all(pdbeApiUrls.map(url => fetch(url)))
        .then(resp => Promise.all( resp.map((r) => { return r.json();}) ))
        .then(results => {
            results.forEach((result, resultIndex) => {
                if(typeof result == 'undefined' || result == null || Object.keys(result).length === 0){
                    //skip result    
                }else{
                 
                    let resultKey = this.entryId ? this.entryId : this.accession;
                    if(pdbeApiUrls[resultIndex].split('/').indexOf('uniprot_mapping') > -1){
                        if(result[resultKey].tracks && result[resultKey].tracks.length == 1){
                            this.accession = result[resultKey].tracks[0].data[0].label;
                        }
                    }

                    if (!result[resultKey]) return;
                    if (result[resultKey].displayNavigation && result[resultKey].displayNavigation == false) this.viewerData.displayNavigation = false;
                    if (result[resultKey].displaySequence && result[resultKey].displaySequence == false) this.viewerData.displaySequence = false;
                    if (result[resultKey].sequence) this.viewerData.sequence = result[resultKey].sequence;
                    if (result[resultKey].length) this.viewerData.length = result[resultKey].length;
                    if (result[resultKey].tracks) this.viewerData.tracks = this.viewerData.tracks.concat(result[resultKey].tracks);
                    if (result[resultKey].legends){
                        if (result[resultKey].legends.alignment) this.viewerData.legends.alignment = result[resultKey].legends.alignment;
                        
                        if (result[resultKey].legends.data){ 
                            for(let legendKey in result[resultKey].legends.data){
                                this.viewerData.legends.data[legendKey] = result[resultKey].legends.data[legendKey];
                            }
                        }

                    }
                    
                }

            });
        
        }, err => {
            console.log(`API unavailable!`, e);
        });

        return this.viewerData;
    }

    async getPDBeApiDataByName(apiName) {
        try {
            let apiUrl = `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/uniprot/${(apiName === 'sequence_conservation') ? '' : 'protvista/'}${apiName}/${this.accession}`;
            if(this.entryId && this.entityId){
                apiUrl = `https://www${this.appUrlEnv}.ebi.ac.uk/pdbe/api/v2/${(apiName === 'sequence_conservation') ? 'pdb' : 'pdb/entry/protvista'}/${apiName}/${this.entryId}/${this.entityId}`;
            }
            
            return await (await fetch(apiUrl)).json();
  
          } catch (e) {
            console.log(`API ${apiName} unavailable!`, e);
          }
    }
}

export default DataHelper;