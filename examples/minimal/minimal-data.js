export const minimalExample = {
  containerId: 'viewer',

  sequence: 'ACDEFGHIKLMNPQRSTVWY',

  entryId: 'example',
  entityId: '1',
  chainId: 'A',

  data: [
    {
      id: 'example-track',
      type: 'TrackCanvas',
      name: 'Example Track',
      status: 'ready-has-data',
      isSticky: true,

      data: [
        {
          accession: 'example',
          label: 'Binding site',
          color: '#4CAF50',

          locations: [
            {
              fragments: [
                {
                  start: 3,
                  end: 8,
                  tooltipContent:
                    '<b>Binding site</b><br>Residues 3–8',
                },
                {
                  start: 14,
                  end: 16,
                  tooltipContent:
                    '<b>Binding site</b><br>Residues 14–16',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'example-track-2',
      type: 'TrackCanvas',
      name: 'Predicted Interface',
      status: 'ready-has-data',

      data: [
        {
          accession: 'example-2',
          label: 'Interface',
          color: '#D81B60',

          locations: [
            {
              fragments: [
                {
                  start: 10,
                  end: 12,
                  tooltipContent:
                    '<b>Predicted interface</b><br>Residues 10–12',
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  tooltips: {
    'Example Track-Binding site':
      'Example annotation rendered using a TrackCanvas.',

    'Predicted Interface-Interface':
      'A second track demonstrating multiple independent annotations.',
  },
};