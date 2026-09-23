export function processLigandSequenceData(ligandCifData, ligandId) {
  const ligandAtomList = parseAtomNames(ligandCifData);
  return {
    [ligandId]: {
      sequence: ligandAtomList.join(','),
      length: ligandAtomList.length,
      tracks: []
    }
  }
}

function parseAtomNames(raw) {
  return raw
      .split('_chem_comp_atom.pdbx_ordinal')[1]
      .split('#')[0]
      .split(/\r?\n/)
      .filter((line) => line.length > 4)
      .map((line) => line.split(/\s+/)[1])
      .map((atom) => atom.replace(/"/g, ''))
      .filter((atom) => atom.charAt(0) !== 'H');
}