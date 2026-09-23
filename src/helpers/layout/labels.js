/**
 * helpers/layout/labels.js
 * 
 * In this file: getLabel(), tooltips
 * 
 * showLabelTooltip
 * hideLabelTooltip
 * getLabel
 * getTrackHeight (or make pure)
 * getTrackLayout (or make pure)
 * */
export default {

  showLabelTooltip(e) {
    let tooltipContentEle = e.currentTarget.lastElementChild;
    if (
      !tooltipContentEle ||
      tooltipContentEle.className != "labelTooltipContent"
    )
      return;

    let toolTipText = tooltipContentEle.innerText;

    let labelToolTipEle = this.ctx.querySelector(".labelTooltipBox");

    labelToolTipEle.innerHTML = toolTipText;

    let labelCoordinates = e.currentTarget.getBoundingClientRect();

    labelToolTipEle.style.left =
      labelCoordinates.x + labelCoordinates.width + 5 + "px";

    labelToolTipEle.style.top = labelCoordinates.y + 10 + "px";

    labelToolTipEle.style.display = "block";
  },

  hideLabelTooltip() {
    this.ctx.querySelector(".labelTooltipBox").style.display = "none";
  },

  getLabel(type, value) {
    if (type !== "pdbIcons") {
      return value;
    } else {
      let iconCode = {
        experiments: { class: "icon icon-generic", dataIcon: ";" },
        complex: { class: "icon icon-conceptual", dataIcon: "y" },
        nucleicAcids: { class: "icon icon-conceptual", dataIcon: "d" },
        ligands: { class: "icon icon-conceptual", dataIcon: "b" },
        literature: { class: "icon icon-generic", dataIcon: "P" },
      };
      let labelElements = [];
      labelElements.push(
        '<span style="display:inline-block;min-width:38px;"><strong><a class="pdbIconsId" href="' +
          value.url +
          '" target="_blank">' +
          value.id +
          '</a></strong></span><span class="pdbIconsWrapper">',
      );
      value.icons.forEach((iconData) => {
        let rotateClass = "";
        if (iconData.type == "nucleicAcids") rotateClass = ""; //rotateClass = ' rotate';

        const iconStyle = this.ctx.useTrackStyles
          ? ` style="background-color:${iconData.background}"`
          : "";

        const innerIconStyle = this.ctx.useTrackStyles
          ? ` style="color:#fff;"`
          : "";

        let iconHtml =
          '<span class="pdbIconslogo"' +
          iconStyle +
          ' title="' +
          iconData.tooltipContent +
          '" ><i class="' +
          iconCode[iconData.type].class +
          '" data-icon="' +
          iconCode[iconData.type].dataIcon +
          '"' +
          innerIconStyle +
          "></i></span>";

        if (typeof iconData.url != "undefined" && iconData.url != "")
          iconHtml =
            '<a class="pdbIconslogoA" href="' +
            iconData.url +
            '" target="_blank">' +
            iconHtml +
            "</a>";
        labelElements.push(iconHtml);
      });

      if (value.resolution) {
        const resolutionStyle = this.ctx.useTrackStyles
          ? ' style="color:#555"'
          : "";

        labelElements.push(
          "<strong" +
            resolutionStyle +
            ">" +
            value.resolution +
            "&Aring;</strong></span>",
        );
      }
      return labelElements.join(" ");
    }
  },

  getTrackLayout(isOverlapping) {
    let layout = isOverlapping ? "overlapping" : "non-overlapping";
    return layout;
  },

  getTrackHeight(trackDataLength, isOverlapping) {
    let eleHt = trackDataLength > 1 ? 60 : 44;
    return eleHt;
  }
}