# ProtVista PDB

> Important: Version 4.0.0 is the final release of ProtVista PDB. This package is no longer under active development.
> 
> For future development and sequence feature visualisation, users should use Nightingale.

PDB ProtVista is the PDBe implementation of the sequence feature viewer [ProtVista (Nightingale)](https://github.com/ebi-webcomponents/nightingale).

It provides a reusable web component for displaying sequence features and structural annotations from PDBe and related resources.

## Publication

**PDB ProtVista: A reusable and open-source sequence feature viewer**

Mandar Deshpande, Mihaly Varadi, Typhaine Paysan-Lafosse, Sreenath Nair, Damiano Piovesan, Saqib Mir, Aleksandras Gutmanas, Silvio C. E. Tosatto, Sameer Velankar

22 July 2022, bioRxiv  
https://doi.org/10.1101/2022.07.22.500790

For detailed documentation and examples, see the [PDBe ProtVista Wiki](https://github.com/PDBeurope/protvista-pdb/wiki).

## Getting started

### Install dependencies

```bash
npm install
```

### Run locally

Start the Vite development server:

```bash
npm run dev
```

The development server runs on:

```text
http://localhost:1339
```

Vite will automatically reload the page when source files change.

### Build

Create the production library bundles:

```bash
npm run build
```

The generated files are written to `dist/` and include:

```text
protvista-pdb-<version>.min.mjs
protvista-pdb-<version>.min.js
protvista-pdb-<version>.min.css
```

The `.mjs` file is the ES module build and the `.js` file is the UMD build.

### Preview the production build

```bash
npm run preview
```

The preview server runs on port `1339`.

## Usage

Import the component:

```js
import "protvista-pdb";
```

Then use the web component in your HTML:

```html
<protvista-pdb accession="P24666"></protvista-pdb>
```

### Styles

The bundled stylesheet is also exported by the package:

```js
import "protvista-pdb/style.css";
```

## Examples

### UniProt accession

```html
<protvista-pdb accession="P24666"></protvista-pdb>
```

### PDB entry and entity

```html
<protvista-pdb
  entry-id="1trn"
  entity-id="1"
></protvista-pdb>
```

### Ligand

```html
<protvista-pdb ligand-id="STI"></protvista-pdb>
```

### Selected API tracks

```html
<protvista-pdb
  accession="P01178"
  api-names="unipdb,secondary_structure_variation,ligand_sites,interface_residues,annotations,rsa_distribution"
  always-expanded="rsa_distribution"
></protvista-pdb>
```

## Development

The project uses:

- [Vite](https://vite.dev/) for development and library builds
- [Lit](https://lit.dev/) for web components
- [Nightingale](https://github.com/ebi-webcomponents/nightingale) components for sequence visualisation
- [D3](https://d3js.org/) for data visualisation

Available npm scripts:

```bash
npm run dev      # Start the development server
npm run build    # Build the distributable library
npm run preview  # Preview the production build
```

## License

Apache-2.0
