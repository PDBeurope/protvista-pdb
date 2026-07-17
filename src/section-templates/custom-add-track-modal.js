import { html } from "lit";
import { validateRanges } from "../helpers/layout/custom-tracks-validation";

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

function PDBePvAddCustomTrackModal(ctx) {
  const sequenceLength = Number(ctx.viewerData.length) || 0;

  const closeDialog = () => {
    ctx.layoutHelper.hideCustomTracksDialog("add-track");
  };

  const getElements = () => ({
    nameInput: ctx.querySelector(".customTrackName"),
    rangesInput: ctx.querySelector(".customTrackRanges"),
    nameError: ctx.querySelector(".customTrackNameError"),
    rangesError: ctx.querySelector(".customTrackRangesError"),
  });

  const setError = (input, errorElement, message) => {
    if (!input || !errorElement) {
      return;
    }

    const hasError = Boolean(message);

    input.classList.toggle("customTrackInputError", hasError);

    if (hasError) {
      input.setAttribute("aria-invalid", "true");
      errorElement.textContent = message;
      errorElement.hidden = false;
    } else {
      input.removeAttribute("aria-invalid");
      errorElement.textContent = "";
      errorElement.hidden = true;
    }
  };

  const validateTrackName = () => {
    const { nameInput, nameError } = getElements();
    const trackName = nameInput?.value.trim() ?? "";

    const message = trackName ? "" : "Please enter track name";

    setError(nameInput, nameError, message);

    return !message;
  };

  const validateResidueRanges = () => {
    const { rangesInput, rangesError } = getElements();
    const residueRanges = rangesInput?.value ?? "";

    const { isValid, messages } = validateRanges(
      {
        start: 1,
        end: sequenceLength,
      },
      residueRanges,
    );

    setError(
      rangesInput,
      rangesError,
      isValid ? "" : messages[0] ?? "Please enter valid residue ranges",
    );

    return {
      isValid,
      messages,
    };
  };

  const handleTrackNameInput = () => {
    const { nameInput, nameError } = getElements();

    if (nameInput?.classList.contains("customTrackInputError")) {
      validateTrackName();
    } else {
      setError(nameInput, nameError, "");
    }
  };

  const handleResidueRangesInput = () => {
    validateResidueRanges();
  };

  const addTrack = () => {
    const { nameInput, rangesInput } = getElements();

    const isTrackNameValid = validateTrackName();
    const rangeValidation = validateResidueRanges();

    if (!isTrackNameValid || !rangeValidation.isValid) {
      ctx.querySelector(".customTrackInputError")?.focus();
      return;
    }

    const trackName = nameInput.value.trim();
    const residueRanges = rangesInput.value.trim();

    const track = ctx.layoutHelper.createCustomTrack(
      trackName,
      residueRanges,
    );
    ctx.layoutHelper.addCustomTrack(track);
    // ctx.dispatchEvent(
    //   new CustomEvent("protvista-pdb-create-custom-track", {
    //     bubbles: true,
    //     composed: true,
    //     detail: {
    //       // Angular-compatible property names
    //       trackName,
    //       residueRanges,

    //       // Optional legacy property names.
    //       // Remove these once all consumers use the names above.
    //       name: trackName,
    //       ranges: residueRanges,
    //     },
    //   }),
    // );

    closeDialog();
  };

  const handleKeydown = (event) => {
    if (event.key === "Escape") {
      closeDialog();
    }

    if (
      event.key === "Enter" &&
      event.target?.classList.contains("customTrackRanges")
    ) {
      event.preventDefault();
      addTrack();
    }
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
        class="addCustomTrack"
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-track-dialog-title"
        @keydown=${handleKeydown}
      >
        <div class="customTrackRowGroup">
          <header class="customTrackDialogHeader">
            <h3
              id="custom-track-dialog-title"
              class="customTrackDialogTitle"
            >
              Add your annotation track
            </h3>

            <button
              class="customTrackCloseButton"
              type="button"
              aria-label="Close dialog"
              @click=${closeDialog}
            >
              ${closeIcon}
            </button>
          </header>

          <div class="customTrackDialogBody">
            <div class="customTrackFields">
              <div class="customTrackTextField">
                <label
                  class="customTrackFieldLabel"
                  for="custom-track-name"
                >
                  Track name
                </label>

                <div class="customTrackDescription">
                  e.g. My track, Important residues
                </div>

                <input
                  id="custom-track-name"
                  class="customTrackInput customTrackName"
                  type="text"
                  name="trackName"
                  placeholder="Track 1"
                  aria-describedby="custom-track-name-error"
                  @input=${handleTrackNameInput}
                />

                <p
                  id="custom-track-name-error"
                  class="customTrackError customTrackNameError"
                  role="alert"
                  hidden
                ></p>
              </div>

              <div class="customTrackTextField">
                <label
                  class="customTrackFieldLabel"
                  for="custom-track-ranges"
                >
                  Residues or ranges
                </label>

                <div class="customTrackDescription">
                  e.g. 1, 56, 24-52, 367-458
                </div>

                <input
                  id="custom-track-ranges"
                  class="customTrackInput customTrackRanges"
                  type="text"
                  name="residueRanges"
                  placeholder="367-458"
                  aria-describedby="custom-track-ranges-error"
                  @input=${handleResidueRangesInput}
                />

                <p
                  id="custom-track-ranges-error"
                  class="customTrackError customTrackRangesError"
                  role="alert"
                  hidden
                ></p>
              </div>
            </div>

            <p class="customTrackPrivacyNotice">
              We do not store this data. This data is kept only in the browser
              and will be deleted when you close the tab.
            </p>
          </div>

          <footer class="customTrackDialogFooter">
            <button
              class="customTrackPrimaryButton"
              type="button"
              @click=${addTrack}
            >
              Add track
            </button>
          </footer>
        </div>
      </section>
    </div>
  `;
}

export default PDBePvAddCustomTrackModal;