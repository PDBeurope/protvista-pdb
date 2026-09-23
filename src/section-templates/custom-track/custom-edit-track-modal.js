import { html } from "lit";
import { validateRanges } from "../../helpers/layout/custom-tracks-validation";

const MODAL_TYPE = "edit-track";

const closeIcon = html`
  <svg
    class="customTrackCloseIcon"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10.2624 8.56674C10.1879 8.49243 10.1288 8.40415 10.0885 8.30696C10.0481 8.20976 10.0274 8.10557 10.0274 8.00034C10.0274 7.89511 10.0481 7.79092 10.0885 7.69373C10.1288 7.59653 10.1879 7.50825 10.2624 7.43394L15.648 2.04834C15.86 1.82086 15.9754 1.51999 15.9699 1.2091C15.9644 0.898223 15.8385 0.601606 15.6186 0.381746C15.3987 0.161885 15.1021 0.0359455 14.7912 0.0304604C14.4803 0.0249752 14.1795 0.140372 13.952 0.35234L8.56639 5.73794C8.49208 5.81244 8.4038 5.87155 8.30661 5.91188C8.20942 5.95221 8.10522 5.97297 8 5.97297C7.89477 5.97297 7.79057 5.95221 7.69338 5.91188C7.59619 5.87155 7.50791 5.81244 7.4336 5.73794L2.048 0.35234C1.82052 0.140372 1.51964 0.0249752 1.20876 0.0304604C0.897878 0.0359455 0.601261 0.161885 0.381401 0.381746C0.16154 0.601606 0.0356007 0.898223 0.0301155 1.2091C0.0246304 1.51999 0.140028 1.82086 0.351996 2.04834L5.7376 7.43394C5.8121 7.50825 5.87121 7.59653 5.91154 7.69373C5.95187 7.79092 5.97263 7.89511 5.97263 8.00034C5.97263 8.10557 5.95187 8.20976 5.91154 8.30696C5.87121 8.40415 5.8121 8.49243 5.7376 8.56674L0.351996 13.9523C0.234097 14.0622 0.139533 14.1947 0.0739459 14.3419C0.00835879 14.4891 -0.0269081 14.648 -0.029751 14.8091C-0.0325938 14.9702 -0.00295439 15.1303 0.0573992 15.2797C0.117753 15.4291 0.207584 15.5649 0.321534 15.6788C0.435484 15.7928 0.571218 15.8826 0.720639 15.9429C0.87006 16.0033 1.03011 16.0329 1.19123 16.0301C1.35236 16.0272 1.51126 15.992 1.65846 15.9264C1.80566 15.8608 1.93814 15.7662 2.048 15.6483L7.4336 10.2627C7.50791 10.1882 7.59619 10.1291 7.69338 10.0888C7.79057 10.0485 7.89477 10.0277 8 10.0277C8.10522 10.0277 8.20942 10.0485 8.30661 10.0888C8.4038 10.1291 8.49208 10.1882 8.56639 10.2627L13.952 15.6483C14.1795 15.8603 14.4803 15.9757 14.7912 15.9702C15.1021 15.9647 15.3987 15.8388 15.6186 15.6189C15.8385 15.3991 15.9644 15.1025 15.9699 14.7916C15.9754 14.4807 15.86 14.1798 15.648 13.9523L10.2624 8.56674Z"
      fill="currentColor"
    />
  </svg>
`;

const deleteIcon = html`
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
      fill="currentColor"
    />
  </svg>
`;

function createFragments(trackName, residueRanges) {
  return residueRanges.split(",").map((segment) => {
    const segmentString = segment.trim();
    const [startValue, endValue = startValue] = segmentString.split("-");

    return {
      start: Number.parseInt(startValue.trim(), 10),
      end: Number.parseInt(endValue.trim(), 10),
      tooltipContent: `
        Track name: <b>${trackName}</b><br>
        Residues: <b>${segmentString}</b>
      `,
    };
  });
}

export default function PDBePvEditCustomTracksModal(ctx) {
  const sequenceLength =
    Number(ctx.viewerData?.length ?? ctx.sequenceLength) || 0;

  const closeDialog = () => {
    ctx.layoutHelper.hideCustomTracksDialog(MODAL_TYPE);
  };

  const validateNameInput = (input) => {
    if (!input) return false;

    const error = input
      .closest(".customTrackTextField")
      ?.querySelector(".customTrackError");

    const message = input.value.trim() ? "" : "Please enter track name";

    input.classList.toggle("customTrackInputError", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");

    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }

    return !message;
  };

  const validateResiduesInput = (input) => {
    if (!input) return false;

    const error = input
      .closest(".customTrackTextField")
      ?.querySelector(".customTrackError");

    const { isValid, messages } = validateRanges(
      {
        start: 1,
        end: sequenceLength,
      },
      input.value,
    );

    const message = isValid ? "" : messages[0];

    input.classList.toggle("customTrackInputError", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");

    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }

    return isValid;
  };

  const saveChanges = () => {
    const rows = Array.from(
      ctx.querySelectorAll(
        ".customTrackModalContainer.editTrack .editCustomTrackRow",
      ),
    );

    let isValid = true;

    rows.forEach((row) => {
      const nameInput = row.querySelector(".customTrackEditName");
      const rangesInput = row.querySelector(".customTrackEditRanges");

      const validName = validateNameInput(nameInput);
      const validResidues = validateResiduesInput(rangesInput);

      if (!validName || !validResidues) {
        isValid = false;
      }
    });

    if (!isValid) return;

    const tracksToRemove = ctx._editTracksToRemove ?? [];

    tracksToRemove.forEach((uuid) => {
      ctx.layoutHelper.removeCustomTrack(uuid);
    });

    rows.forEach((row) => {
      const uuid = row.dataset.trackUuid;

      const trackIndex = ctx.customTracks.findIndex(
        (track) => track.uuid === uuid,
      );

      if (trackIndex === -1) return;

      const currentTrack = ctx.customTracks[trackIndex];

      const trackName = row
        .querySelector(".customTrackEditName")
        .value.trim();

      const residueRanges = row
        .querySelector(".customTrackEditRanges")
        .value.trim();

      const editedTrack = {
        ...currentTrack,
        label: trackName,
        locations: [
          {
            fragments: createFragments(trackName, residueRanges),
          },
        ],
      };

      ctx.customTracks[trackIndex] = editedTrack;
      ctx.layoutHelper.editCustomTrack(editedTrack);
    });

    ctx._editTracksToRemove = [];
    ctx.layoutHelper.hideCustomTracksDialog(MODAL_TYPE);
  };

  return html`
    <div
      class="customTrackModalBackdrop"
      @click=${(event) => {
        if (event.target === event.currentTarget) {
          closeDialog();
        }
      }}
    >
      <section
        class="editCustomTrack"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-custom-tracks-title"
        @keydown=${(event) => {
          if (event.key === "Escape") {
            closeDialog();
          }
        }}
      >
        <div class="customTrackRowGroup">
          <header class="customTrackDialogHeader">
            <h3 id="edit-custom-tracks-title" class="customTrackDialogTitle">
              Edit custom tracks
            </h3>

            <button
              class="customTrackCloseButton"
              type="button"
              aria-label="Close edit custom tracks dialog"
              @click=${closeDialog}
            >
              ${closeIcon}
            </button>
          </header>

          <div class="customTrackDialogBody">
            <div class="editCustomTracksList"></div>

            <p class="customTrackPrivacyNotice">
              We do not store this data. This data is kept only in the browser
              and will be deleted when you close the tab.
            </p>
          </div>

          <footer class="customTrackDialogFooter">
            <div class="customTrackFooterActions">
              <button
                class="customTrackCancelButton"
                type="button"
                @click=${closeDialog}
              >
                Cancel changes
              </button>

              <button
                class="customTrackPrimaryButton"
                type="button"
                @click=${saveChanges}
              >
                Save changes
              </button>
            </div>
          </footer>
        </div>
      </section>
    </div>
  `;
}