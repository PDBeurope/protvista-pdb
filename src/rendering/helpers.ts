export function insertTrackAtPosition(newTrack: HTMLElement, parent: Element, insertAt?: number) {
  // Find insertion reference
  const mainTracks = parent.querySelectorAll('.main-track');
  const index = insertAt ?? mainTracks.length; // default: end
  const refNode = mainTracks[index] ?? null;

  // Insert the new track at the desired position
  parent.insertBefore(newTrack, refNode);
}
