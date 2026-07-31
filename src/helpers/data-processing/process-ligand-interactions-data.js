import { scaleLinear } from "d3";

export const AMINOACIDS = [
  'ALA',
  'CYS',
  'ASP',
  'GLU',
  'PHE',
  'GLY',
  'HIS',
  'ILE',
  'LYS',
  'LEU',
  'MET',
  'ASN',
  'PRO',
  'GLN',
  'ARG',
  'SER',
  'THR',
  'VAL',
  'TRP',
  'TYR',
];

const INTX_NAME_STANDARDIZER = {
  clash: 'Covalent clashes',
  covalent: 'Covalent interactions',
  vdw_clash: 'Van der Waals clashes',
  vdw: 'Van der Waals interactions',
  hbond: 'Hydrogen bonds',
  xbond: 'Halogen bonds',
  ionic: 'Ionic interactions',
  metal_complex: 'Metal complex interactions',
  aromatic: 'Aromatic interactions',
  hydrophobic: 'Hydrophobic interactions',
  carbonyl: 'Carbonyl interactions',
  polar: 'Polar interactions',
  CARBONPI: 'Carbon-pi interactions',
  CATIONPI: 'Cation-pi interactions',
  DONORPI: 'Hydrogen bond donor-pi interactions',
  HALOGENPI: 'Halogen-pi interactions',
  METSULPHURPI: 'Methionine sulphur-pi interactions',
  plane_plane: 'Plane-Plane interactions',
  AMIDEAMIDE: 'Amide-Amide interactions',
  AMIDERING: 'Amide-Ring interactions',
}

export const AATHREETOONE = {
  ALA: 'A',
  CYS: 'C',
  ASP: 'D',
  GLU: 'E',
  PHE: 'F',
  GLY: 'G',
  HIS: 'H',
  ILE: 'I',
  LYS: 'K',
  LEU: 'L',
  MET: 'M',
  ASN: 'N',
  PRO: 'P',
  GLN: 'Q',
  ARG: 'R',
  SER: 'S',
  THR: 'T',
  VAL: 'V',
  TRP: 'W',
  TYR: 'Y',
};

export function processLigandInteractions(data, atomNamesList) {
  console.log({data, atomNamesList})
  const viewerData = processInitialData(data, atomNamesList);
  const aminoAcidsLegend = viewerData.yDomain.map((aa) => AATHREETOONE[aa]);

  const { atomDomainMap, atomColorMap, atomColorScale } = createAtomColourScale(viewerData);
  const { residDomainMap, residColorMap, residColorScale } = createResidsColourScale(viewerData);
  return {
    viewerData,
    aminoAcidsLegend,
    atomDomainMap,
    atomColorMap,
    atomColorScale,
    residDomainMap,
    residColorMap,
    residColorScale
  }
}

export function createAtomColourScale(viewerData) {
  const score = viewerData['averages'].map((v) => v.score);
  const maxScore = Math.max(...score);
  const atomDomainMap = [0, 0.01, maxScore];
  const atomColorMap = ['#ffffff', '#a0bb9e', '#505d50'];
  const atomColorScale = scaleLinear(atomDomainMap, atomColorMap);
  return {
    atomDomainMap,
    atomColorMap,
    atomColorScale
  }
}
export function createResidsColourScale(viewerData) {
  const residScore = viewerData['heatmap'].map((v) => v.score);
  const maxResidScore = Math.max(...residScore);
  const residDomainMap = [0, 0.01, maxResidScore];
  const residColorMap = ['#FFFFFF', '#B99EBB', '#2b232b'];
  const residColorScale = scaleLinear(residDomainMap, residColorMap);
  return {
    residDomainMap,
    residColorMap,
    residColorScale
  }
}

export function filterDataForLigIntHeatmap(viewerData) {
  const filtered = viewerData['toFilter'].filter((eachItem) => {
    if (eachItem['interactionType'] === 'default' || viewerData['filters'].length === 0) {
      return true;
    }
    return viewerData['filters'].indexOf(eachItem['interactionType']) > -1;
  });

  const perAtomSum = {};
  const perAminoSum = {};
  let newTotal = 0;

  const newCountDict = filtered.reduce((newDict, eachItem) => {
    if (!Object.prototype.hasOwnProperty.call(newDict, eachItem['atomName'])) {
      newDict[eachItem['atomName']] = {};
      perAtomSum[eachItem['atomName']] = 0;
    }
    if (!Object.prototype.hasOwnProperty.call(perAminoSum, eachItem['aminoAcid'])) {
      perAminoSum[eachItem['aminoAcid']] = 0;
    }

    if (!Object.prototype.hasOwnProperty.call(newDict[eachItem['atomName']], eachItem['aminoAcid'])) {
      newDict[eachItem['atomName']][eachItem['aminoAcid']] = 0;
    }
    newDict[eachItem['atomName']][eachItem['aminoAcid']] += eachItem['aminoAcidNumber'];
    perAtomSum[eachItem['atomName']] += eachItem['aminoAcidNumber'];
    perAminoSum[eachItem['aminoAcid']] += eachItem['aminoAcidNumber'];

    newTotal += eachItem['aminoAcidNumber'];
    return newDict;
  }, {});
  viewerData['averages'] = viewerData['atomNames'].map((eachName, i) => {
    return {
      xValue: i + 1,
      yValue: 'ATM',
      score: (perAtomSum[eachName] / newTotal) * 100,
      start: i + 1,
      atomName: eachName,
    };
  });
  for (let i_heatmap = 0; i_heatmap < viewerData['heatmap'].length; i_heatmap++) {
    const element = viewerData['heatmap'][i_heatmap];
    let perAtomDivide = perAminoSum[element['residue']];
    perAtomDivide = perAtomDivide ? perAtomDivide : 0;
    let newCount = 0;
    if (Object.prototype.hasOwnProperty.call(newCountDict[element['atomName']], element['residue'])) {
      newCount = newCountDict[element['atomName']][element['residue']];
      newCount = newCount ? newCount : 0;
    }
    viewerData['heatmap'][i_heatmap]['score'] = (newCount / Math.max(perAtomDivide, 1)) * 100;
  }
  return viewerData;
}

export function filterRescaleDataForLigIntHeatmap(viewerData) {
  viewerData = filterDataForLigIntHeatmap(viewerData);
  viewerData['originalHeatmap'] = JSON.parse(JSON.stringify(viewerData['heatmap']));
  if (viewerData['sortType'] === 'AAProp') {
    viewerData = sortAAsByTypeForLigIntHeatmap(viewerData);
  } else {
    viewerData = sortAAsByIntFreqForLigIntHeatmap(viewerData);
  }
  return viewerData;
}

export function sortAAsByTypeForLigIntHeatmap(viewerData) {
  const results = [
    'HIS',
    'ARG',
    'LYS', // positive
    'GLU',
    'ASP', // negative
    'THR',
    'SER',
    'ASN',
    'GLN', // polar
    'LEU',
    'ALA',
    'ILE',
    'MET',
    'VAL', // hydrophobic
    'TYR',
    'PHE',
    'TRP', // aromatic
    'GLY', // glycine
    'CYS', // cysteine
    'PRO', // proline
  ];

  viewerData['sortType'] = 'AAProp';
  viewerData['yDomain'] = results;
  viewerData['heatmap'] = viewerData['originalHeatmap'].filter((eachDatum) => results.indexOf(eachDatum.residue) > -1);
  return viewerData;
}

export function sortAAsByIntFreqForLigIntHeatmap(viewerData) {
  const freqDict = {};
  for (let j = 0; j < AMINOACIDS.length; j++) {
    const aminoAcid = AMINOACIDS[j];
    freqDict[aminoAcid] = 0.0;
  }
  for (let i = 0; i < viewerData['heatmap'].length; i++) {
    const datum = viewerData['heatmap'][i];
    freqDict[datum['residue']] += datum['score'];
  }
  const results = Object.entries(freqDict)
    .reduce((previous, [k, v]) => {
      previous.push({ aa: k, avgScore: v });
      return previous;
    }, [])
    .sort((a, b) => {
      return b.avgScore - a.avgScore;
    })
    .map((eachObj) => eachObj.aa);

  viewerData['sortType'] = 'IntFreq';
  viewerData['yDomain'] = results;
  viewerData['heatmap'] = viewerData['originalHeatmap'].filter((eachDatum) => results.indexOf(eachDatum.residue) > -1);
  return viewerData;
}

function processAPIData(atomList, apiData) {
  let totalInteractions = 0;

  const toFilterData = [];

  const interactionsByAtomName = {};

  // Init all aminoAcids for all atoms with 0 count
  for (const atomName of atomList) {
    interactionsByAtomName[atomName] = 0;
    for (const aminoAcid of AMINOACIDS) {
      toFilterData.push({
        atomName: atomName,
        interactionType: 'default',
        aminoAcid: aminoAcid,
        aminoAcidNumber: 0,
      });
    }
  }
  const interactionKeys = Object.keys(INTX_NAME_STANDARDIZER);
  // add actual interactions data to it
  for (const interactionKey of interactionKeys) {
    if (Object.prototype.hasOwnProperty.call(apiData, interactionKey)) {
      const interactionsList = apiData[interactionKey];
      for (const interaction of interactionsList) {
        toFilterData.push({
          atomName: interaction.atom,
          interactionType: interactionKey,
          aminoAcid: interaction.residue,
          aminoAcidNumber: interaction.count,
        });
        totalInteractions += interaction.count;
        interactionsByAtomName[interaction.atom] += interaction.count;
      }
    }
  }

  return {
    // filteredAtomNames: filteredAtomNames,
    totalInteractions: totalInteractions,
    toFilter: toFilterData,
  };
}


function processInitialData(resultIntDataAcc, atomNamesList) {
  const processedData= [];
  const dataKeyToIdx = {};

  let k = 0;
  const xDomain = [];
  for (let i = 0; i < atomNamesList.length; i++) {
    const atomName = atomNamesList[i];
    const atomNum = parseInt(atomName.substring(1));
    for (let j = 0; j < AMINOACIDS.length; j++) {
      const aminoAcid = AMINOACIDS[j];
      processedData.push({
        xValue: i + 1,
        yValue: aminoAcid,
        score: 0.0,
        start: i + 1,
        residue: aminoAcid,
        atomName: atomName,
      });
      dataKeyToIdx[`${atomNum}-${aminoAcid}`] = k;
      k += 1;
    }
    xDomain.push(i + 1);
  }

  const generatedData = processAPIData(atomNamesList, resultIntDataAcc);
  const totalInteractions = generatedData['totalInteractions'];
  const toFilter = generatedData['toFilter'];

  const initialSortType = 'AAProp';
  const viewerData = {
    atomNames: atomNamesList,
    length: atomNamesList.length,
    averages: [],
    xDomain: xDomain,
    yDomain: JSON.parse(JSON.stringify(AMINOACIDS)),
    // fix this with filteredAtomNames from generatedData
    heatmap: processedData,
    originalHeatmap: JSON.parse(JSON.stringify(processedData)),
    sortType: initialSortType,
    validFilters: Object.keys(resultIntDataAcc),
    filters: [],
    toFilter: toFilter,
    dataKeyToIdx: dataKeyToIdx,
    totalInteractions: totalInteractions,
  };
  return filterRescaleDataForLigIntHeatmap(viewerData);
}