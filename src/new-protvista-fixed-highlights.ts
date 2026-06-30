export class NewProtvistaFixedHighlights {
  public selectedResidues: string[] = [];
  public selectedFromExternal: string[] = [];
  public searchSelections: string[] = [];
  public fixedTooltipSelection = '';
  public selectionHighlight = '';

  constructor(
    private container: HTMLElement,
    private sequenceLength: number
  ) {}

  createHighlightText() {
    let allSelections = [...this.searchSelections, this.fixedTooltipSelection];
    if (this.fixedTooltipSelection) {
      allSelections.push(this.fixedTooltipSelection);
    }
    allSelections = [...new Set(allSelections)];

    let toHighlight = allSelections.join(',');
    if (toHighlight[toHighlight.length - 1] === ',') {
      toHighlight = toHighlight.slice(0, -1);
    }
    this.selectionHighlight = toHighlight;
  }

  triggerFixedHighlight() {
    const toAddHighlightElements = this.container.querySelectorAll('.add-fixed-highlight');
    for (let s = 0; s < toAddHighlightElements.length; s++) {
      const toHighlightElement = toAddHighlightElements[s];
      (toHighlightElement as any).fixedHighlight = this.selectionHighlight;
    }

    // // show reset button if highlight or zoom on
    // const nav = this.container.querySelector<Element>(`nightingale-navigation`);
    // if (!nav) return;
    // const navStart = parseInt(nav.getAttribute('display-start') as string);
    // const navEnd = parseInt(nav.getAttribute('display-end') as string);
    // const hasZoom = navStart !== 1 || navEnd !== this.sequenceLength;
    // const hasHighlight = this.selectionHighlight.length > 0;
    // const resetBtn = this.container.querySelector<HTMLElement>('#pv-reset-btn');
    // if (resetBtn && (hasHighlight || hasZoom)) resetBtn.style.display = '';
    // else if (resetBtn && !hasHighlight && !hasZoom) resetBtn.style.display = 'none';
  }

  onSelectedResiduesChange(newSelection: string[]) {
    // 1 - Update selected residues from search panel or external interactivity
    this.selectedResidues = newSelection;

    const mergedSelections = [...this.selectedResidues];
    mergedSelections.push(...this.selectedFromExternal);

    // 2 - Convert selected strings (e.g. "Index: 15-20") to Nightingale highlight ranges (e.g. "15:20")
    const searchSelections = mergedSelections
      .map((entry) => {
        const indexPart = entry.split('|').find((part) => part.trim().startsWith('Index:'));
        if (!indexPart) return '';

        const indexRange = indexPart.replace('Index:', '').trim();
        const [start, end] = indexRange.split('-').map((v) => v.trim());

        return end ? `${start}:${end}` : `${start}:${start}`;
      })
      .filter(Boolean); // 2.1 - Filter out any invalid or empty results

    // 3 - Apply selections to highlighting service for visual feedback
    this.searchSelections = [...searchSelections];
    this.createHighlightText();
    this.triggerFixedHighlight();
  }
}
