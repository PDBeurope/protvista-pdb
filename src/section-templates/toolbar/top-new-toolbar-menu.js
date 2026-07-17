import { html } from "lit";

const zoomIcon = html`
  <svg
    class="protvistaToolbarSvgIcon"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M17.5611 15.4476L14.0795 11.9641C15.1396 10.3763 15.5715 8.45079 15.2913 6.56204C15.011 4.67329 14.0386 2.95637 12.5633 1.74523C11.0879 0.534091 9.21499 -0.0846606 7.3089 0.00933101C5.40281 0.103323 3.59981 0.903337 2.2506 2.25376C0.901397 3.60418 0.102459 5.40845 0.00919252 7.31562C-0.0840737 9.22278 0.535001 11.0965 1.746 12.5722C2.95699 14.048 4.67332 15.0203 6.56114 15.3C8.44895 15.5798 10.3733 15.1469 11.9598 14.0857L15.4414 17.5684C15.7249 17.8451 16.1052 18 16.5012 18C16.8973 18 17.2776 17.8451 17.5611 17.5684C17.8421 17.2872 18 16.9057 18 16.508C18 16.1103 17.8421 15.7289 17.5611 15.4476ZM7.69413 2.25893C8.76891 2.25893 9.81955 2.57782 10.7132 3.17526C11.6068 3.7727 12.3034 4.62187 12.7147 5.61538C13.126 6.60889 13.2336 7.70212 13.0239 8.75682C12.8142 9.81152 12.2967 10.7803 11.5367 11.5407C10.7767 12.3011 9.80841 12.819 8.75428 13.0288C7.70016 13.2386 6.60753 13.1309 5.61456 12.7194C4.6216 12.3078 3.77289 11.6109 3.17578 10.7168C2.57866 9.82267 2.25996 8.77145 2.25996 7.69608C2.26154 6.25455 2.83458 4.87251 3.85334 3.85319C4.8721 2.83387 6.25338 2.26052 7.69413 2.25893Z"
      fill="#3B6FB6"
    />
  </svg>
`;

const resetZoomIcon = html`
  <svg
    class="protvistaToolbarSvgIcon"
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M15.3562 2.64375C14.5236 1.80555 13.5332 1.14042 12.4423 0.686683C11.3514 0.232944 10.1815 -0.000432899 9 6.02819e-07C6.61305 6.02819e-07 4.32387 0.948212 2.63604 2.63604C0.948212 4.32387 0 6.61305 0 9C0 11.3869 0.948212 13.6761 2.63604 15.364C4.32387 17.0518 6.61305 18 9 18C13.1962 18 16.695 15.1313 17.6962 11.25H15.3562C14.8928 12.5657 14.0325 13.7052 12.894 14.5112C11.7555 15.3172 10.3949 15.7501 9 15.75C7.20979 15.75 5.4929 15.0388 4.22703 13.773C2.96116 12.5071 2.25 10.7902 2.25 9C2.25 7.20979 2.96116 5.4929 4.22703 4.22703C5.4929 2.96116 7.20979 2.25 9 2.25C10.8675 2.25 12.5325 3.02625 13.7475 4.2525L10.125 7.875H18V6.02819e-07L15.3562 2.64375Z"
      fill="#3B6FB6"
    />
  </svg>
`;

export function PDBePvNewToolbar(ctx) {
  return html`
    <button
      class="protvistaToolbarNewIcon protvistaToolbarButton protvistaResetZoomBtn"
      type="button"
      title="Reset zoom"
      aria-label="Reset zoom"
      style="display: none;"
      @click=${(event) => {
        event.stopPropagation();
        ctx.layoutHelper.resetZoom({ start: 1, end: null });
      }}
    >
      ${resetZoomIcon}
    </button>

    <button
      class="protvistaToolbarNewIcon protvistaToolbarButton"
      type="button"
      title="View / highlight region"
      aria-label="View or highlight region"
      @click=${(event) => {
        event.stopPropagation();
        ctx.layoutHelper.showZoomHighlightDialog(event.currentTarget);
      }}
    >
      ${zoomIcon}
    </button>
  `;
}