import { html } from "lit";
import { styleMap } from "lit/directives/style-map.js";

const editIcon = html`
<svg 
    class="customTrackEditIcon"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
>
    <path
    d="M15.8766 9.88201C15.9136 9.59401 15.9414 9.30601 15.9414 9.00001C15.9414 8.69401 15.9136 8.40601 15.8766 8.11801L17.8289 6.63301C18.0047 6.49801 18.051 6.25501 17.9399 6.05701L16.0894 2.94302C16.0349 2.85016 15.9481 2.77924 15.8447 2.74295C15.7413 2.70667 15.628 2.7074 15.525 2.74502L13.2212 3.64502C12.74 3.28502 12.2219 2.98802 11.6575 2.76302L11.3059 0.378023C11.2902 0.27229 11.2356 0.17569 11.1522 0.106168C11.0689 0.0366455 10.9624 -0.0010717 10.8525 2.31845e-05H7.15155C6.92024 2.31845e-05 6.72593 0.162023 6.69818 0.378023L6.34658 2.76302C5.78218 2.98802 5.26404 3.29402 4.78291 3.64502L2.47905 2.74502C2.42527 2.72781 2.36911 2.71871 2.3125 2.71802C2.15521 2.71802 1.99792 2.79902 1.91464 2.94302L0.0641489 6.05701C-0.0561333 6.25501 -0.000618345 6.49801 0.175179 6.63301L2.12745 8.11801C2.09044 8.40601 2.06268 8.70301 2.06268 9.00001C2.06268 9.29701 2.09044 9.59401 2.12745 9.88201L0.175179 11.367C-0.000618345 11.502 -0.0468809 11.745 0.0641489 11.943L1.91464 15.057C1.96919 15.1499 2.05595 15.2208 2.15937 15.2571C2.2628 15.2934 2.37613 15.2926 2.47905 15.255L4.78291 14.355C5.26404 14.715 5.78218 15.012 6.34658 15.237L6.69818 17.622C6.72593 17.838 6.92024 18 7.15155 18H10.8525C11.0839 18 11.2782 17.838 11.3059 17.622L11.6575 15.237C12.2219 15.012 12.74 14.706 13.2212 14.355L15.525 15.255C15.5806 15.273 15.6361 15.282 15.6916 15.282C15.8489 15.282 16.0062 15.201 16.0894 15.057L17.9399 11.943C18.051 11.745 18.0047 11.502 17.8289 11.367L15.8766 9.88201ZM14.0446 8.34301C14.0817 8.62201 14.0909 8.81101 14.0909 9.00001C14.0909 9.18901 14.0724 9.38701 14.0446 9.65701L13.9151 10.674L14.7386 11.304L15.7378 12.06L15.0902 13.149L13.9151 12.69L12.9529 12.312L12.1201 12.924C11.7223 13.212 11.3429 13.428 10.9636 13.581L9.98281 13.968L9.83477 14.985L9.64972 16.2H8.35437L8.17857 14.985L8.03053 13.968L7.04977 13.581C6.65191 13.419 6.28181 13.212 5.91172 12.942L5.06974 12.312L4.08898 12.699L2.91391 13.158L2.26624 12.069L3.26551 11.313L4.08898 10.683L3.95944 9.66601C3.93168 9.38701 3.91318 9.18001 3.91318 9.00001C3.91318 8.82001 3.93168 8.61301 3.95944 8.34301L4.08898 7.32601L3.26551 6.69601L2.26624 5.94002L2.91391 4.85102L4.08898 5.31002L5.05123 5.68801L5.88396 5.07602C6.28181 4.78802 6.66117 4.57202 7.04052 4.41902L8.02128 4.03202L8.16932 3.01502L8.35437 1.80002H9.64046L9.81626 3.01502L9.9643 4.03202L10.9451 4.41902C11.3429 4.58102 11.713 4.78802 12.0831 5.05802L12.9251 5.68801L13.9059 5.30102L15.0809 4.84202L15.7286 5.93102L14.7386 6.69601L13.9151 7.32601L14.0446 8.34301ZM9.00204 5.40002C6.95725 5.40002 5.30105 7.01101 5.30105 9.00001C5.30105 10.989 6.95725 12.6 9.00204 12.6C11.0468 12.6 12.703 10.989 12.703 9.00001C12.703 7.01101 11.0468 5.40002 9.00204 5.40002ZM9.00204 10.8C7.98427 10.8 7.15155 9.99001 7.15155 9.00001C7.15155 8.01001 7.98427 7.20001 9.00204 7.20001C10.0198 7.20001 10.8525 8.01001 10.8525 9.00001C10.8525 9.99001 10.0198 10.8 9.00204 10.8Z"
    fill="#3B6FB6"/>
</svg>
`;

function customTrackRow(ctx, track) {
  return html`
    <div
      class="protvistaRow pvCustomTrackRow"
      data-track-uuid=${track.uuid}
    >
      <div
        class="protvistaCol1 track-label"
        style=${styleMap(
          ctx.useTrackStyles && track.labelColor
            ? { backgroundColor: track.labelColor }
            : {}
        )}
      >
        <div class="customTrackLabel">
          ${track.label}
        </div>

        ${track.in3D
          ? html`
              <span
                class="in3DTag"
                @click=${(e) => {
                  e.stopPropagation();
                  ctx.layoutHelper.triggerIn3D(track, track, e.currentTarget);
                }}
              >
                in 3D
              </span>
            `
          : ""}

        <span
          class="icon icon-functional hideLabelIcon"
          data-icon="x"
          title="Remove custom track"
          @click=${() =>
            ctx.layoutHelper.removeCustomTrack(track.uuid)}
        ></span>
      </div>

      <div class="protvistaCol2 track-content">
        <protvista-pdb-track
          class="pvCustomTrack"
          .useDefaultStyles=${ctx.useDefaultStyles}
          .data=${[track]}
          .length=${ctx.viewerData.length}
          .layout=${ctx.layoutHelper.getTrackLayout(track.overlapping)}
          .height=${ctx.layoutHelper.getTrackHeight(
            track.length,
            track.overlapping
          )}
          .display-start=${ctx.viewerData.displayStart || 1}
          .display-end=${ctx.viewerData.displayEnd || ctx.viewerData.length}
          .margin-left=${ctx.pvTrackMargins.left}
          .margin-right=${ctx.pvTrackMargins.right}
        ></protvista-pdb-track>
      </div>
    </div>
  `;
}

export default function PDBePvCustomTracksSection(ctx) {
  return html`
    <div class="customTracksContainer">

      <div class="protvistaRow">

        <div class="protvistaCol1 category-label no-icon">
          Custom tracks

            <button
                class="customTrackEditButton"
                type="button"
                aria-label="Edit custom tracks"
                @click=${(event) => {
                    event.stopPropagation();

                    ctx.layoutHelper.refreshEditCustomTracks(true);
                    ctx.layoutHelper.showCustomTracksDialog(
                    event.currentTarget,
                    "edit-track",
                    );
                }}
                >
                ${editIcon}
            </button>
        </div>

        <div class="protvistaCol2 aggregate-track-content">
          <button
            class="mapYourResiduesButton"
            @click=${(e) => {
              e.stopPropagation();
              ctx.layoutHelper.showCustomTracksDialog(
                e.currentTarget,
                "add-track"
              );
            }}
          >
            + Map your residues
          </button>
        </div>

      </div>

      ${ctx.customTracks.map((track) => customTrackRow(ctx, track))}
      <div class="customTracksList"></div>
    </div>
  `;
}