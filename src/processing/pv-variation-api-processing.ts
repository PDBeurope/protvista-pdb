import { VariationData, VariationDatum } from '@nightingale-elements/nightingale-variation';
import { LineData as NightingaleLineData } from '@nightingale-elements/nightingale-linegraph-track';
import { APIVariant, APIVariationData } from './../models/pv-api-variation-track-data.model';

export const PDBE_VARIATION_CONSEQUENCE_FILTERS = [
  {
    keyword: 'likely_disease',
    displayName: 'Likely disease',
  },
  {
    keyword: 'predicted',
    displayName: 'Predicted deleterious or benign',
  },
  {
    keyword: 'likely_benign',
    displayName: 'Likely benign',
  },
  {
    keyword: 'uncertain',
    displayName: 'Uncertain',
  },
];

export const PDBE_VARIATION_PROVENANCE_FILTERS = [
  {
    keyword: 'UniProt',
    displayName: 'UniProt reviewed',
  },
  {
    keyword: 'ClinVar',
    displayName: 'ClinVar reviewed',
  },
  {
    // keyword: 'LSS',
    keyword: 'large_scale_studies',
    displayName: 'Large scale studies',
  },
  {
    keyword: 'foldx',
    displayName: 'Foldx analysis',
  },
  {
    keyword: 'missense3d',
    displayName: 'Missense 3D',
  },
  {
    keyword: 'PDB',
    displayName: 'Observed in PDB',
  },
  {
    keyword: 'SKEMPI',
    displayName: 'SKEMPI',
  },
  {
    keyword: 'fireprotdb',
    displayName: 'FireProtDB',
  },
  {
    keyword: 'frustratometer',
    displayName: 'Frustatometer',
  },
  {
    keyword: 'nextprot',
    displayName: 'neXtProt',
  },
];

/**
 * Verifies whether a given filter inside consequenceFilters and provenanceFilters lists
 * is enabled or not according to its presence in API data keywords
 * @param filterName
 * @returns
 */
export function hasAnyVariantsForFilter(filterName: string, data?: APIVariationData): boolean {
  if (!data) return false;
  return data.variants.some((v: APIVariant) => v.keywords?.includes(filterName));
}

export function filterEntityVariationData(apiData: APIVariationData, chainId?: string) {
  const filteredAPIVariants: APIVariant[] = [];
  const parsedVariants: string[] = [];
  for (const apiVariant of apiData.variants) {
    // filter by other chains
    if (chainId && apiVariant.pdbChain && apiVariant.pdbChain !== chainId) continue;

    // filter by unique variant accession id
    const accessionId = apiVariant.pdbChain ? `${apiVariant.accession!}_${apiVariant.pdbChain}` : apiVariant.accession!;
    if (parsedVariants.indexOf(accessionId) > -1) continue;
    parsedVariants.push(accessionId);

    filteredAPIVariants.push(apiVariant);
  }
  const newApiData: APIVariationData = JSON.parse(JSON.stringify(apiData));
  newApiData.variants = filteredAPIVariants;
  return newApiData;
}

export function processEntityVariationDataFromAPI(apiData: APIVariationData, keywordsToRemove: string[]): VariationData {
  const convertedData: VariationData = {
    sequence: apiData.sequence,
    variants: [],
  };

  for (const apiVariant of apiData.variants) {
    // filter by keyword if necessary
    const hasKeywordToRemove = apiVariant.keywords && keywordsToRemove.some((item) => apiVariant.keywords!.includes(item));
    if (hasKeywordToRemove) continue;

    /**
        apiVariant interface:

        accession: string | null;
        association: AssociationItem[] | null;
        color: string | null;
        end: string | null;
        sourceType: string | null;
        start: string | null;
        tooltipContent: string | null;
        variant: string | null;
        xrefNames: string[] | null;
        keywords: string[] | null;
        clinicalSignificances: string | null;
        polyphenScore: number | null;
        siftScore: number | null;
       */
    const startResNum = parseInt(apiVariant.start!);
    const endResNum = parseInt(apiVariant.end!);
    const wildType = apiData.sequence.slice(startResNum - 1, endResNum);
    const apiVariantLength = endResNum - startResNum + 1;
    if (apiVariantLength > 1) {
      console.warn(`WARN: mutation has length bigger than one. skipping ${wildType}${startResNum}:${endResNum}${apiVariant.variant}`);
      continue;
    }

    // Not sure which is best
    // const apiVariantHasPredictions = apiVariant.keywords!.indexOf('predicted') > -1;
    const apiVariantHasPredictions = apiVariant.sourceType! === 'prediction';

    const convertedVariant: VariationDatum & { keywords: string[] | undefined } = {
      accession: apiVariant.accession!,
      variant: apiVariant.variant!,
      start: startResNum,
      size: 5,
      xrefNames: apiVariant.xrefNames || [],
      hasPredictions: apiVariantHasPredictions,
      tooltipContent: apiVariant.tooltipContent,
      keywords: apiVariant.keywords,
      // alternativeSequence?: string;
      // internalId?: string;
      // wildType?: string;
      color: apiVariant.color,
      consequenceType: '', // see https://github.com/ebi-webcomponents/nightingale/blob/cbbcca575772ca742442fe70cc5a7f69425a3674/packages/nightingale-variation/src/proteinAPI.ts#L145
    };
    convertedData.variants.push(convertedVariant);
  }
  return convertedData;
}

export function processEntityVariationLineChartDataFromAPI(apiData: APIVariationData, keywordsToRemove: string[]): NightingaleLineData[] {
  // Step 1: Count occurrences
  const variantCountPerPosMap: Record<number, number> = {};

  for (const apiVariant of apiData.variants) {
    // filter by keyword if necessary
    const hasKeywordToRemove = apiVariant.keywords && keywordsToRemove.some((item) => apiVariant.keywords!.includes(item));
    if (hasKeywordToRemove) continue;

    if (!apiVariant.start) continue;
    const startResNum = parseInt(apiVariant.start!);
    variantCountPerPosMap[startResNum] = (variantCountPerPosMap[startResNum] || 0) + 1;
  }

  // Step 2: Build full result from 1 to length, calculating max
  const valuesList = [];
  let maxVariantsPerRes = 0;
  const sequenceLength = apiData.sequence.length;

  for (let pos = 1; pos <= sequenceLength; pos++) {
    const value = variantCountPerPosMap[pos] || 0;
    valuesList.push({ position: pos, value });
    if (value > maxVariantsPerRes) maxVariantsPerRes = value;
  }

  // Step 3: Creat and return data in Nightingale compatible type
  const lineData: NightingaleLineData = {
    name: 'variationCount',
    color: '#0000ee',
    range: [0, maxVariantsPerRes * 1.5],
    lineCurve: 'curveStep',
    values: valuesList,
  };
  return [lineData];
}
