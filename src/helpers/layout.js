import layout from "./layout/layout.js";
import tracks from "./layout/tracks.js";
import zoom from "./layout/zoom.js";
import navigation from "./layout/navigation.js";
import scrollbox from "./layout/scrollbox.js";
import in3d from "./layout/in3d.js";
import dynamicSections from "./layout/dynamic-sections.js";
import labels from "./layout/labels.js";
import events from "./layout/events.js";

class LayoutHelper {
  constructor(ctx) {
    this.ctx = ctx;
  }
}

Object.assign(
  LayoutHelper.prototype,
  layout,
  tracks,
  zoom,
  navigation,
  scrollbox,
  in3d,
  dynamicSections,
  labels,
  events,
);

export default LayoutHelper;