// helpers/track_uuids.js

export function slugifyIdPart(value, fallback = "item") {
  return (
    String(value || fallback)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

export function getTrackLabel(track, fallback = "track") {
  return (
    track?.id ||
    track?.uuid ||
    track?.accession ||
    track?.label ||
    track?.name ||
    track?.type ||
    track?.tooltip ||
    fallback
  );
}

export function addItemUuid(item, parentUuid, itemIndex) {
  const itemLabel = slugifyIdPart(
    getTrackLabel(item, `item-${itemIndex}`),
    `item-${itemIndex}`,
  );

  const itemUuid = item?.uuid || `${parentUuid}_item_${itemLabel}_${itemIndex}`;

  const normalisedItem = {
    ...item,
    uuid: itemUuid,
  };

  if (Array.isArray(item?.data)) {
    normalisedItem.data = item.data.map((childItem, childIndex) =>
      addItemUuid(childItem, itemUuid, childIndex),
    );
  }

  return normalisedItem;
}

export function addTrackUuids(tracks = []) {
  if (!Array.isArray(tracks)) return [];

  return tracks.map((track, trackIndex) => {
    const trackLabel = slugifyIdPart(
      getTrackLabel(track, `track-${trackIndex}`),
      `track-${trackIndex}`,
    );

    const trackUuid = track.uuid || `track_${trackLabel}_${trackIndex}`;

    const normalisedTrack = {
      ...track,
      uuid: trackUuid,
    };

    if (Array.isArray(track.data)) {
      normalisedTrack.data = track.data.map((item, itemIndex) =>
        addItemUuid(item, trackUuid, itemIndex),
      );
    }

    return normalisedTrack;
  });
}