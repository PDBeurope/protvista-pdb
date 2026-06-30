# ProtVista PDB

A browser library that provides the PDBe implementation of the ProtVista sequence feature viewer, built on top of Nightingale web components.

> **Version 4.0.0** is a major and more performant rewrite of ProtVista PDB using [HTML Canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/canvas) and is **not backwards compatible** with the previous implementation.
>
> The original implementation described in the publication below is preserved in the **[v3.5.0](https://github.com/PDBeurope/protvista-pdb/releases/tag/v3.5.0)** tag and the **[legacy-v3](https://github.com/PDBeurope/protvista-pdb/tree/legacy-v3)** branch.

## Publication

The following publication describes the **original ProtVista PDB (v3)** implementation.

**PDB ProtVista: A reusable and open-source sequence feature viewer**, [Mandar Deshpande](https://github.com/mandarsd),  [Mihaly Varadi](https://github.com/mvaradi),  [Typhaine Paysan-Lafosse](https://github.com/typhainepl),  [Sreenath Nair](https://github.com/sreenathnair),  Damiano Piovesan,  Saqib Mir,  Aleksandras Gutmanas,  Silvio C. E. Tosatto,  Sameer Velankar<br>22 July 2022; BioRxiv; https://doi.org/10.1101/2022.07.22.500790

## Documentation

For detailed documentation, examples and API reference, see the **[PDBe ProtVista Wiki](https://github.com/PDBeurope/protvista-pdb/wiki)**.

## Development

Install dependencies:

```bash
npm install
```

Run the development example:

```bash
npm run dev
```

Build the library:

```bash
npm run build
```

Verify the built package using the example application:

```bash
npm run test:build
```

## Basic usage

```js
import {
  ProtvistaWrapper,
  NewProtvistaVisualisation,
} from 'protvista-pdb';

const wrapper = new ProtvistaWrapper({
  ...example,
  NewProtvistaVisualisation,
});

await wrapper.init();
```

## Examples

Example applications can be found under the `examples/` directory.

## License

Apache 2.0
