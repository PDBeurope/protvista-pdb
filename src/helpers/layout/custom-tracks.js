
import { validateRanges } from "./custom-tracks-validation";

/**
 * helpers/layout/custom-tracks.js
 *
 * In this file: everything related to custom tracks
 *
 * getCustomTracksLabel()
 * getCustomTracksSettingsIcon()
 * showCustomTracksDialog()
 * hideCustomTracksDialog()
 * createCustomTrack()
 * parseRanges()
 * */

export default {
  showCustomTracksDialog(anchor, modalType) {
    const modalTypeCamel = modalType.replace(/-./g, (x) => x[1].toUpperCase());
    const modal = this.ctx.querySelector(
      `.customTrackModalContainer.${modalTypeCamel}`,
    );

    modal.style.display = "block";

    const rect = anchor.getBoundingClientRect();

    modal.style.left = `${rect.left}px`;
    modal.style.top = `${rect.bottom + 8}px`;
    this.ctx.dispatchEvent(
      new CustomEvent(`protvista-pdb-open-${modalType}-custom-tracks`, {
        bubbles: true,
        composed: true,
      }),
    );
  },

  hideCustomTracksDialog(modalType) {
    const modalTypeCamel = modalType.replace(/-./g, (x) => x[1].toUpperCase());
    const modal = this.ctx.querySelector(
      `.customTrackModalContainer.${modalTypeCamel}`,
    );

    modal.style.display = "none";
    this.ctx.dispatchEvent(
      new CustomEvent(`protvista-pdb-close-${modalType}-custom-tracks`, {
        bubbles: true,
        composed: true,
      }),
    );
  },

  createCustomTrack(name, residues) {
    const fragments = this.parseRanges(residues);
    const idx = this.ctx.customTracks[0]?.data?.length ?? 0;

    return {
      uuid: `custom-${Date.now()}-${idx}`,
      accession: "Custom",
      labelType: "text",
      label: name,
      color: "rgb(59,111,182)",
      labelColor: "rgb(211,211,211)",
      type: "UniProt range",
      labelTooltip: "User annotation",
      locations: [
        {
          fragments: fragments.map((fragment) => ({
            ...fragment,
            tooltipContent: `${name}: ${fragment.start}-${fragment.end}`,
          })),
        },
      ],
    };
  },

  parseRanges(text) {
    if (!text) return [];

    return text
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean)
      .map((token) => {
        const [start, end] = token.split("-").map((v) => Number(v.trim()));

        return {
          start,
          end: Number.isFinite(end) ? end : start,
        };
      })
      .filter(
        ({ start, end }) =>
          Number.isFinite(start) &&
          Number.isFinite(end) &&
          start > 0 &&
          end >= start,
      );
  },

  addCustomTrack(track) {
    this.ctx.customTracks.push(track);

    this.ctx.registerUuids([
      ...this.ctx.viewerData.tracks,
      ...this.ctx.pinnedTracks,
      ...this.ctx.customTracks,
    ]);

    this.appendCustomTrack(track);
  },

  removeCustomTrack(uuid) {
    this.ctx.customTracks = this.ctx.customTracks.filter(
      (track) => track.uuid !== uuid,
    );

    this.ctx.registerUuids([
      ...this.ctx.viewerData.tracks,
      ...this.ctx.pinnedTracks,
      ...this.ctx.customTracks,
    ]);

    this.ctx.querySelector(`[data-track-uuid="${uuid}"]`)?.remove();
  },

  appendCustomTrack(track) {
    const container = this.ctx.querySelector(".customTracksList");
    if (!container) return;

    const row = document.createElement("div");
    row.className = "protvistaRow pvCustomTrackRow";
    row.dataset.trackUuid = track.uuid;

    row.innerHTML = `
      <div class="protvistaCol1 track-label">
        <div class="customTrackLabel">${track.label}</div>

        <span
          class="icon icon-functional hideLabelIcon"
          data-icon="x"
          title="Remove custom track"
        ></span>
      </div>

      <div class="protvistaCol2 track-content"></div>
    `;

    const trackElement = document.createElement("protvista-pdb-track");

    trackElement.useDefaultStyles = this.ctx.useDefaultStyles;
    trackElement.data = [track];
    trackElement.length = this.ctx.viewerData.length;
    trackElement.layout = this.getTrackLayout(track.overlapping);
    trackElement.height = this.getTrackHeight(track.length, track.overlapping);
    trackElement.displayStart = this.ctx.viewerData.displayStart || 1;
    trackElement.displayEnd =
      this.ctx.viewerData.displayEnd || this.ctx.viewerData.length;
    trackElement.marginLeft = this.ctx.pvTrackMargins.left;
    trackElement.marginRight = this.ctx.pvTrackMargins.right;

    row.querySelector(".track-content").appendChild(trackElement);

    row.querySelector(".hideLabelIcon").addEventListener("click", () => {
      this.removeCustomTrack(track.uuid);
    });

    container.appendChild(row);
  },

  editCustomTrack(track) {
    const container = this.ctx.querySelector(".customTracksList");
    if (!container) return;

    const row = container.querySelector(
      `[data-track-uuid="${CSS.escape(track.uuid)}"]`,
    );
    if (!row) return;

    const trackElement = row.querySelector("protvista-pdb-track");
    if (!trackElement) return;

    trackElement.data = [track];
    trackElement.requestUpdate?.();

    const label = row.querySelector(".customTrackLabel");
    if (label) {
      label.textContent = track.label;
    }
  },

  refreshEditCustomTracks(open) {
    const container = this.ctx.querySelector(
      ".customTrackModalContainer.editTrack .editCustomTracksList",
    );
    if (!container) return;

    if (open) this.ctx._editTracksToRemove = [];

    const sequenceLength =
      Number(this.ctx.viewerData?.length ?? this.ctx.sequenceLength) || 0;

    const validateNameInput = (input) => {
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

    container.innerHTML = "";

    if (!this.ctx.customTracks.length) {
      container.innerHTML = `
      <p class="customTracksEmptyMessage">
        There are no custom tracks to edit.
      </p>
    `;
      return;
    }

    this.ctx.customTracks.forEach((track) => {
      const row = document.createElement("div");
      row.className = "editCustomTrackRow";
      row.dataset.trackUuid = track.uuid;

      const residueRanges = track.locations?.[0]?.fragments?.map(({ start, end }) => start === end ? `${start}` : `${start}-${end}`).join(", ") ?? "";

      row.innerHTML = `
      <div class="customTrackTextField">
        <input
          class="customTrackInput customTrackEditName"
          type="text"
          name="trackName_${track.uuid}"
          value="${track.label ?? ""}"
          placeholder="Track 1"
          aria-label="Track name"
          aria-invalid="false"
        />

        <p class="customTrackError" role="alert" hidden></p>
      </div>

      <div class="customTrackTextField">
        <input
          class="customTrackInput customTrackEditRanges"
          type="text"
          name="residueRanges_${track.uuid}"
          value="${residueRanges ?? ""}"
          placeholder="${residueRanges ?? ""}"
          aria-label="Residues or ranges"
          aria-invalid="false"
        />

        <p class="customTrackError" role="alert" hidden></p>
      </div>

      <button
        class="customTrackDeleteButton"
        type="button"
        aria-label="Delete ${track.label ?? "custom track"}"
      >
        <span>Delete</span>

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
      </button>
    `;

      const nameInput = row.querySelector(".customTrackEditName");
      const rangesInput = row.querySelector(".customTrackEditRanges");
      const deleteButton = row.querySelector(".customTrackDeleteButton");

      nameInput.addEventListener("input", () => {
        validateNameInput(nameInput);
      });

      rangesInput.addEventListener("input", () => {
        validateResiduesInput(rangesInput);
      });

      deleteButton.addEventListener("click", () => {
        if (!this.ctx._editTracksToRemove.includes(track.uuid)) {
          this.ctx._editTracksToRemove.push(track.uuid);
        }

        row.remove();

        if (!container.querySelector(".editCustomTrackRow")) {
          container.innerHTML = `
            <p class="customTracksEmptyMessage">
              There are no custom tracks to edit.
            </p>
          `;
        }
      });

      container.appendChild(row);
    });
  },
};
