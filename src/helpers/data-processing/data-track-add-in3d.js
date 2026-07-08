export function addIn3DToUniPdbTracks(tracks = [], apiNames = []) {
  if (!Array.isArray(tracks)) return [];
  if (!Array.isArray(apiNames)) return [];

  return tracks.map((track, i) => {
    if (apiNames[i] !== "unipdb" || !Array.isArray(track.data)) {
      return track;
    }

    return {
      ...track,
      in3D: true,
      data: track.data.map((subtrack) => ({
        ...subtrack,
        in3D: true,
      })),
    };
  });
}