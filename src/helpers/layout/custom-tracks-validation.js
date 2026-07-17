export function validateResidue(validRange, text) {
  const messages = [];
  const trimmed = text.trim();

  // 1. Check if it's a valid number
  if (!/^\d+$/.test(trimmed)) {
    messages.push("Residues must include only numbers");
    return { isValid: false, messages };
  }

  const residue = Number(trimmed);
  const { start: min, end: max } = validRange;

  // 2. Check if residue is within valid range
  if (residue < min || residue > max) {
    messages.push(
      `Residue number ${residue} is outside the valid range (${min}–${max})`,
    );
  }

  return {
    isValid: messages.length === 0,
    messages,
  };
}

export function validateRanges(validRange, text) {
  const messages = [];
  const validRanges = [];
  const trimmed = text.trim();

  // 1. Check empty input
  if (!trimmed) {
    messages.push("Please enter at least one residue or range");
    return { isValid: false, messages, validRanges };
  }

  // 2. Basic format cleanup: check for invalid characters
  const formatPattern = /^(\d+(-\d+)?)(\s*,\s*(\d+(-\d+)?))*$/;
  if (!formatPattern.test(trimmed)) {
    messages.push(
      "Check formatting: delete extra spaces, use commas between residues and hyphens for ranges",
    );
  }

  // 3. Parse valid numeric parts
  const segments = trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const { start: min, end: max } = validRange;
  let formatError = false;
  let rangeError = false;
  let outOfBounds = false;

  for (const seg of segments) {
    const match = seg.match(/^(\d+)(-(\d+))?$/);
    if (!match) {
      formatError = true;
      continue;
    }

    const start = Number(match[1]);
    const end = match[3] ? Number(match[3]) : start;

    if (start > end) {
      rangeError = true;
      continue;
    }
    if (start < min || end > max) {
      outOfBounds = true;
      continue;
    }

    // Only push valid ranges
    validRanges.push({ start, end });
  }

  if (formatError) {
    messages.push(
      "Check formatting: delete extra spaces, use commas between residues and hyphens for ranges",
    );
  }
  if (rangeError) {
    messages.push(
      "Ranges must go from lower to higher residue number (e.g. 45-60)",
    );
  }
  if (outOfBounds) {
    messages.push(`Residue number is outside the valid range (${min}–${max})`);
  }

  return {
    isValid: messages.length === 0,
    messages,
    validRanges,
  };
}

export function triggerNightingaleZoom(start, end) {
  const nightingaleNavigation = document.querySelector(
    "nightingale-navigation",
  );
  if (nightingaleNavigation) {
    const eventObj = new CustomEvent("change", {
      detail: {
        "display-start": start,
        "display-end": end,
        cancelMe: true,
      },
      bubbles: true,
      cancelable: true,
    });
    nightingaleNavigation.dispatchEvent(eventObj);
  }
}

export function triggerNightingaleHighlight(start, end) {
  const nightingaleNavigation = document.querySelector(
    "nightingale-navigation",
  );
  if (nightingaleNavigation) {
    const eventObj = new CustomEvent("change", {
      detail: {
        highlight: `${start}:${end}`,
        cancelMe: true,
      },
      bubbles: true,
      cancelable: true,
    });
    nightingaleNavigation.dispatchEvent(eventObj);
  }
}
