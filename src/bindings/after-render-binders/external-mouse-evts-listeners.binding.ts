import { NewProtvistaFixedHighlights } from '../../new-protvista-fixed-highlights';
import { ProtvistaGenericBinding } from '../abstract/generic-obj.bind';

export class ProtvistaExternalMouseEventsListeners extends ProtvistaGenericBinding {
  constructor(
    private entryId: string,
    private entityId: string,
    private chainId: string,
    private highlights: NewProtvistaFixedHighlights
    // TODO
    // private pdbeEvents: boolean,
  ) {
    super();
  }

  private parseExternalEvent(event: Event): {
    entryId?: string;
    entityId?: string;
    chainId?: string;
    resNum?: number;
  } {
    let entryId, entityId, chainId, resNum;
    if (event.type === 'PDB.molstar.mouseover' || event.type === 'PDB.molstar.click') {
      const d = (event as any).eventData;
      entryId = d.entry_id?.toLowerCase();
      entityId = d.entity_id;
      chainId = d.auth_asym_id;
      resNum = d.residueNumber;
    } else if (event.type === 'PDB.topologyViewer.mouseover' || event.type === 'PDB.topologyViewer.click') {
      const d = (event as any).eventData;
      entryId = d.entryId?.toLowerCase();
      entityId = d.entityId;
      chainId = d.chainId;
      resNum = d.residueNumber;
    } else if (event.type === 'smartSeqViewerMouseover' || event.type === 'smartSeqViewerSelect') {
      const d = (event as CustomEvent).detail?.eventData;
      entryId = this.entryId;
      entityId = d?.entityId;
      chainId = d?.chainId;
      resNum = d?.residueNumber;
    }
    return { entryId, entityId, chainId, resNum };
  }

  private isMatchingTarget(entryId?: string, entityId?: string, chainId?: string): boolean {
    if (!entryId || !entityId) return false;
    if (this.entryId !== entryId) return false;
    if (this.entityId !== entityId) return false;
    if (this.chainId && this.chainId !== chainId) return false;
    return true;
  }

  override bind(container: HTMLElement) {
    const onExternalMouseOver = (event: Event) => {
      const { entryId, entityId, chainId, resNum } = this.parseExternalEvent(event);
      const allAny = this.entryId === "any" && this.entityId === "any" && this.chainId === "any";
      const notMatches = !this.isMatchingTarget(entryId, entityId, chainId);
      if (!allAny && notMatches) return;
      const nav = container.querySelector(`nightingale-navigation`);
      if (!nav || !resNum) return;

      const evt = new CustomEvent('change', {
        detail: {
          highlight: `${resNum}:${resNum}`,
          cancelMe: true,
        },
        bubbles: true,
        cancelable: true,
      });
      nav.dispatchEvent(evt);
    };

    const onExternalMouseOut = (event: Event) => {
      const nav = container.querySelector(`nightingale-navigation`);
      if (!nav) return;

      const evt = new CustomEvent('change', {
        detail: {
          highlight: undefined,
          cancelMe: true,
        },
        bubbles: true,
        cancelable: true,
      });
      nav.dispatchEvent(evt);
    };

    const onExternalClick = (event: Event) => {
      const { entryId, entityId, chainId, resNum } = this.parseExternalEvent(event);
      const allAny = this.entryId === "any" && this.entityId === "any" && this.chainId === "any";
      const notMatches = !this.isMatchingTarget(entryId, entityId, chainId);
      if (!allAny && notMatches) return;

      // Set externally selected residues
      const idxOfResidue = this.highlights.selectedFromExternal.indexOf(`Index: ${resNum}`);
      if (idxOfResidue === -1) this.highlights.selectedFromExternal = [`Index: ${resNum}`];
      else this.highlights.selectedFromExternal = [];

      // Add clicked residue index to selection list and apply highlight logic
      const selectedResidues = [...this.highlights.selectedResidues];
      this.highlights.onSelectedResiduesChange(selectedResidues);
    };

    const onExternalUnselect = (_event: Event) => {
      if (this.highlights.selectedFromExternal.length > 0) {
        this.highlights.selectedFromExternal = [];
        const selectedResidues = [...this.highlights.selectedResidues];
        this.highlights.onSelectedResiduesChange(selectedResidues);
      }
    };

    document.addEventListener('PDB.molstar.mouseover', onExternalMouseOver);
    document.addEventListener('PDB.topologyViewer.mouseover', onExternalMouseOver);
    document.addEventListener('smartSeqViewerMouseover', onExternalMouseOver);

    document.addEventListener('PDB.molstar.mouseout', onExternalMouseOut);
    document.addEventListener('PDB.topologyViewer.mouseout', onExternalMouseOut);
    document.addEventListener('smartSeqViewerMouseout', onExternalMouseOut);

    document.addEventListener('PDB.molstar.click', onExternalClick);
    document.addEventListener('PDB.topologyViewer.click', onExternalClick);
    document.addEventListener('smartSeqViewerSelect', onExternalClick);
    document.addEventListener('smartSeqViewerUnselect', onExternalUnselect);

    // For cleanup on unbind
    this.elementListeners.push(
      { element: undefined, handlers: { type: 'PDB.molstar.mouseover', listener: onExternalMouseOver } },
      { element: undefined, handlers: { type: 'PDB.topologyViewer.mouseover', listener: onExternalMouseOver } },
      { element: undefined, handlers: { type: 'smartSeqViewerMouseover', listener: onExternalMouseOver } },

      { element: undefined, handlers: { type: 'PDB.molstar.mouseout', listener: onExternalMouseOut } },
      { element: undefined, handlers: { type: 'PDB.topologyViewer.mouseout', listener: onExternalMouseOut } },
      { element: undefined, handlers: { type: 'smartSeqViewerMouseout', listener: onExternalMouseOut } },

      { element: undefined, handlers: { type: 'PDB.molstar.click', listener: onExternalClick } },
      { element: undefined, handlers: { type: 'PDB.topologyViewer.click', listener: onExternalClick } },
      { element: undefined, handlers: { type: 'smartSeqViewerSelect', listener: onExternalClick } },

      { element: undefined, handlers: { type: 'smartSeqViewerUnselect', listener: onExternalUnselect } }
    );
  }
}
