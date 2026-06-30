import { NewProtvistaFixedHighlights } from './new-protvista-fixed-highlights';

export class NewProtvistaTooltip {
  tooltipElement: HTMLDivElement | null = null;
  pinnedTooltipElement: HTMLDivElement | null = null;

  pinnedTooltipInitialTop = 0;
  pinnedTooltipLastLeft = 0;
  pinnedTooltipResidueApprox?: number;
  pinnedTooltipZoomRange?: { start: number; end: number };
  tooltipVisible = false;
  tooltipFadeOutTimeout: number | null = null;
  pinnedTooltipFadeOutTimeout: number | null = null;
  lastScrollTop = 0;

  private lastHoverTarget?: Element;
  private hoverTooltipLeaveHandler?: (e: Event) => void;

  private lastClickedResPos?: number;
  private lastClickedResPosFrom?: number;
  private lastPinnedCloseBtn?: Element;
  private pinnedTooltipCloseHandler?: EventListener;

  constructor(
    private relativeElement: HTMLElement,
    private container: HTMLElement,
    private scrollContainer: HTMLElement,
    private highlights: NewProtvistaFixedHighlights
  ) {}

  /**
   * Displays a hover-based tooltip near the target element
   */
  async showHoverTooltip(target: HTMLElement, message: string, coords: { x: number; y: number }, _hoveredResPos: number, customData?: boolean) {
    if (!this.container) return;

    if (!this.tooltipElement) {
      const tooltip = document.createElement('div');
      tooltip.classList.add('manual-tooltip');
      if (customData) tooltip.classList.add('custom-row');
      this.container.appendChild(tooltip);
      this.tooltipElement = tooltip;
    }

    // Avoid duplicate render
    if (this.tooltipVisible && this.tooltipElement.innerHTML === message) return;

    if (this.tooltipFadeOutTimeout) {
      clearTimeout(this.tooltipFadeOutTimeout);
      this.tooltipFadeOutTimeout = null;
    }

    this.tooltipElement.innerHTML = message;
    this.tooltipElement.style.opacity = '0';

    const { coordX, coordY } = this.getTooltipCoords(coords);
    let zIndex = customData ? '4' : '2';
    if (target.classList.contains('help-icon')) zIndex = '9';

    Object.assign(this.tooltipElement.style, {
      position: 'absolute',
      top: `${coordY}px`,
      left: `${coordX}px`,
      zIndex,
      pointerEvents: 'none',
      transition: 'opacity 0.15s ease-in-out',
    });

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        if (this.tooltipElement) this.tooltipElement.style.opacity = '1';
        this.tooltipVisible = true;
        resolve();
      });
    });

    this.hoverTooltipLeaveHandler = () => this.hideHoverTooltip();
    this.lastHoverTarget = target;

    target.addEventListener('mouseleave', this.hoverTooltipLeaveHandler);
    if (!target.matches(':hover')) this.hideHoverTooltip();
  }

  /**
   * Fades out hover-based tooltip
   */
  hideHoverTooltip() {
    if (!this.container || !this.tooltipElement || !this.tooltipVisible) return;

    this.tooltipElement.style.opacity = '0';
    this.tooltipVisible = false;

    this.tooltipFadeOutTimeout = window.setTimeout(() => {
      this.tooltipElement?.remove();
      this.tooltipElement = null;

      // Clean up listener after fade-out
      if (this.hoverTooltipLeaveHandler) {
        if (this.lastHoverTarget) this.lastHoverTarget.removeEventListener('mouseleave', this.hoverTooltipLeaveHandler);
        this.hoverTooltipLeaveHandler = undefined;
        this.lastHoverTarget = undefined;
      }
    }, 150);
  }

  /**
   * Displays a pinned tooltip (persistent, e.g. click)
   */
  showPinnedTooltip(
    target: HTMLElement,
    message: string,
    coords: { x: number; y: number },
    clickedResPos: number,
    customData?: boolean,
    zoomStart?: number,
    zoomEnd?: number
  ) {
    if (!this.container) return;

    // Remove old pinned tooltip
    this.pinnedTooltipElement?.remove();
    if (this.pinnedTooltipFadeOutTimeout) {
      clearTimeout(this.pinnedTooltipFadeOutTimeout);
      this.pinnedTooltipFadeOutTimeout = null;
    }

    const tooltip = document.createElement('div');
    tooltip.classList.add('manual-tooltip', 'pinned-tooltip');
    if (customData) tooltip.classList.add('custom-row');

    tooltip.innerHTML = `
      <div class="tooltip-header">
        <button class="close-btn">✖</button>
      </div>
      ${message}
    `;

    const { coordX, coordY } = this.getTooltipCoords(coords);
    const trackRect = this.relativeElement.getBoundingClientRect();
    const fractionAcrossVisible = (coords.x - trackRect.left) / trackRect.width;
    if (zoomStart != null && zoomEnd != null) {
      this.pinnedTooltipZoomRange = { start: zoomStart, end: zoomEnd };
      this.pinnedTooltipResidueApprox = zoomStart + fractionAcrossVisible * (zoomEnd - zoomStart);
    }

    const zIndex = customData ? '5' : '1';

    this.pinnedTooltipInitialTop = coordY;
    this.pinnedTooltipLastLeft = coordX;
    this.lastScrollTop = this.scrollContainer?.scrollTop ?? 0;

    Object.assign(tooltip.style, {
      position: 'absolute',
      top: `${coordY}px`,
      left: `${coordX}px`,
      zIndex,
    });

    this.lastClickedResPos = clickedResPos;
    const seqTrack = this.relativeElement.querySelector('nightingale-sequence') as any;
    this.lastClickedResPosFrom = seqTrack.getXFromSeqPosition(clickedResPos);

    this.container.appendChild(tooltip);
    this.pinnedTooltipElement = tooltip;

    const closeBtn = tooltip.querySelector('.close-btn');
    if (closeBtn) {
      this.pinnedTooltipCloseHandler = () => {
        this.highlights.fixedTooltipSelection = '';
        this.highlights.createHighlightText();
        this.highlights.triggerFixedHighlight();
        this.hidePinnedTooltip();
      };

      closeBtn.addEventListener('click', this.pinnedTooltipCloseHandler);
      this.lastPinnedCloseBtn = closeBtn;
    }
  }

  /**
   * Tooltip coordinate calculation (auto-flip if overflowing)
   */
  getTooltipCoords(coords: { x: number; y: number }) {
    const hostRect = this.relativeElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
    let coordX = coords.x + 2 - hostRect.left;
    let coordY = coords.y + 2 - hostRect.top + 6;

    const tooltipEl = this.tooltipElement ?? this.pinnedTooltipElement;
    if (!tooltipEl) return { coordX, coordY };

    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;
    const containerWidth = this.scrollContainer?.clientWidth ?? window.innerWidth;
    const containerHeight = this.scrollContainer?.clientHeight ?? window.innerHeight;

    // Flip horizontally if overflowing right
    if (coordX + tooltipWidth > containerWidth) coordX = Math.max(2, coordX - tooltipWidth - 10);
    // Flip vertically if overflowing bottom
    if (coordY + tooltipHeight > containerHeight) coordY = Math.max(2, coordY - tooltipHeight - 10);

    return { coordX, coordY };
  }

  /**
   * Moves pinned tooltip during scroll
   */
  movePinnedTooltipVertical() {
    if (!this.scrollContainer || !this.pinnedTooltipElement) return;
    if (this.pinnedTooltipElement.classList.contains('custom-row')) return;

    const scrollTop = this.scrollContainer.scrollTop;
    const scrollDelta = scrollTop - this.lastScrollTop;
    const newTop = this.pinnedTooltipInitialTop - scrollDelta;

    Object.assign(this.pinnedTooltipElement.style, {
      top: `${newTop}px`,
      left: `${this.pinnedTooltipLastLeft}px`,
    });
  }

  /**
   * Moves pinned tooltip during scroll
   */
  movePinnedTooltipHorizontal() {
    if (!this.pinnedTooltipElement || this.lastClickedResPos === undefined || this.lastClickedResPosFrom === undefined) return;
    // use nightingale functions to get delta
    let seqTrack = this.relativeElement.querySelector('nightingale-sequence') as any;
    if (!seqTrack) seqTrack = this.relativeElement.querySelector('nightingale-sequence-patched') as any;
    if (!seqTrack) return;
    const lastPos = this.lastClickedResPos;
    const newPosX = seqTrack.getXFromSeqPosition(lastPos);
    const deltaX = this.lastClickedResPosFrom - newPosX;
    // save state and move tooltip
    this.lastClickedResPosFrom = newPosX + 0;
    this.pinnedTooltipLastLeft -= deltaX;
    this.pinnedTooltipElement.style.left = `${this.pinnedTooltipLastLeft}px`;
  }

  /**
   * Hides pinned tooltip + resets highlights
   */
  hidePinnedTooltip() {
    if (!this.pinnedTooltipElement) return;

    // Remove the close handler if any
    if (this.lastPinnedCloseBtn && this.pinnedTooltipCloseHandler) {
      this.lastPinnedCloseBtn.removeEventListener('click', this.pinnedTooltipCloseHandler);
      this.pinnedTooltipCloseHandler = undefined;
      this.lastPinnedCloseBtn = undefined;
    }

    this.pinnedTooltipFadeOutTimeout = window.setTimeout(() => {
      this.pinnedTooltipElement?.remove();
      this.pinnedTooltipElement = null;

      document.dispatchEvent(new CustomEvent('protvista-close-pin'));
    }, 150);
  }

  hideHeatmapTooltip(container: HTMLElement, trackId?: string) {
    const closeBtns = container.querySelectorAll('.heatmap-pinned-tooltip-close');
    for (const closeBtn of Array.from(closeBtns)) {
      const btnEl = closeBtn as HTMLElement;

      if (!trackId) {
        btnEl.click();
        continue;
      }
      // Try to find the tooltip-data element within the sibling `.heatmap-pinned-tooltip-content`
      const tooltipContent = btnEl.parentElement?.querySelector('.heatmap-pinned-tooltip-content');
      const tooltipDataEl = tooltipContent?.querySelector('.tooltip-data') as HTMLElement | null;

      const tooltipTrackId = tooltipDataEl?.getAttribute('data-trackid');

      // Close tooltips that do NOT match the provided trackId
      if (tooltipTrackId !== trackId) {
        btnEl.click();
      }
    }
  }
}
