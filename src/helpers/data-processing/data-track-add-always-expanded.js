export function addAlwaysExpandedTracks(tracks = [], apiNames = [], alwaysExpandedList = []) {
  if (!Array.isArray(tracks)) return [];
  if (!Array.isArray(apiNames)) return [];

  return tracks.map((track, i) => {
    if (!alwaysExpandedList?.includes(apiNames[i]) || !Array.isArray(track.data)) {
      return track;
    }

    return {
      ...track,
      alwaysExpanded: true,
    };
  });
}