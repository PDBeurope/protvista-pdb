class LayoutHelper {

    constructor(ctx) {
        this.ctx = ctx;
    }

    postProcessLayout() {
        this.getScrollbarWidth(); // get scrollbar width for right spacing

        // apply padding according to the scollbar width to align tracks with scrollbar
        let navSectionEle = this.ctx.querySelectorAll('.pvNavSection')[0];
        if(navSectionEle){ 
            navSectionEle.style.paddingRight = this.ctx.scrollbarWidth+'px';
            setTimeout(() => {
                let navEle = this.ctx.querySelectorAll('protvista-navigation')[0];
                if(navEle) navEle.firstElementChild.firstElementChild.style.width = '100%';
            },100);
        }
        
        let seqSectionEle = this.ctx.querySelectorAll('.pvSeqSection')[0];
        if(seqSectionEle){ 
            seqSectionEle.style.paddingRight = this.ctx.scrollbarWidth+'px';
            setTimeout(() => {
                let seqEle = this.ctx.querySelectorAll('protvista-sequence')[0];
                if(seqEle) seqEle.firstElementChild.firstElementChild.style.width = '100%';
            },100);
        }

        let pvLineGraphSectionEle = this.ctx.querySelectorAll('.pvLineGraphSection')[0];
        if(pvLineGraphSectionEle){ 
            pvLineGraphSectionEle.style.paddingRight = this.ctx.scrollbarWidth+'px';
        }

        // bind track data and trigger track render
        this.bindTrackData('track', undefined, this.ctx.scrollbarWidth);

        // lazyload variants
        if(this.ctx.viewerData.displayVariants){
            if(this.ctx.viewerData.variants) {
                const hideSectionOptions = { key: 'variationOption', index: this.ctx.viewerData.tracks.length + 1, label: 'Variation' };
                this.addDynamicTrackSection(this.ctx.viewerData.variants, '.pvVariantGraphRow', '.pvVariantGraphSection', '.pvVariantPlotSection', hideSectionOptions);
            } else { 
                this.ctx.dataHelper.getPDBeApiDataByName('variation').then(resultData => {
                    const hideSectionOptions = { key: 'variationOption', index: this.ctx.viewerData.tracks.length + 1, label: 'Variation' };
                    this.addDynamicTrackSection(resultData, '.pvVariantGraphRow', '.pvVariantGraphSection', '.pvVariantPlotSection', hideSectionOptions);
                });
            }
        }

        // lazyload sequence conservation
        if(this.ctx.viewerData.displayConservation){
            if(this.ctx.viewerData.sequenceConservation) {
                const hideSectionOptions = { key: 'scOption', index: this.ctx.viewerData.tracks.length, label: 'Sequence conservation' };
                this.addDynamicTrackSection(this.ctx.viewerData.sequenceConservation, '.pvConsHistoRow', '.pvConservationHistoSection', '.pvConservationPlotSection', hideSectionOptions, true);
            } else {
                this.ctx.dataHelper.getPDBeApiDataByName('sequence_conservation').then(resultData => {
                    const hideSectionOptions = { key: 'scOption', index: this.ctx.viewerData.tracks.length, label: 'Sequence conservation' };
                    this.addDynamicTrackSection(resultData, '.pvConsHistoRow', '.pvConservationHistoSection', '.pvConservationPlotSection', hideSectionOptions, true);
                });
            }
        }

        // subscribe to other PDBe web-component events
        if(this.ctx.subscribeEvents) this.addEventSubscription();
    }

    addDynamicTrackSection(resultData, rowClass, aggregatedTrackClass, trackClass, sectionOptions, borderBottom) {
        if(resultData && Object.keys(resultData).length > 0){
            this.ctx.querySelector(rowClass).style.display = 'table';
            let trackSectionEle = this.ctx.querySelectorAll(aggregatedTrackClass)[0];
            if(trackSectionEle){ 
                trackSectionEle.style.paddingRight = this.ctx.scrollbarWidth+'px';
                if(borderBottom) trackSectionEle.style.borderBottom = '1px solid lightgrey';
                trackSectionEle.firstElementChild.data = resultData;
            }

            let trackEle = this.ctx.querySelectorAll(trackClass)[0];
            if(trackEle){ 
                trackEle.style.paddingRight = this.ctx.scrollbarWidth+'px';
                if(borderBottom) trackEle.style.borderBottom = '1px solid lightgrey';
                trackEle.firstElementChild.data = resultData;
            }

            this.addHideOptions(sectionOptions.key, sectionOptions.index, sectionOptions.label);
        }
    }

    getScrollbarWidth() {
        let divWithScroll = this.ctx.querySelectorAll('.divWithScroll')[0];
        let divWithoutScroll = this.ctx.querySelectorAll('.divWithoutScroll')[0];
        this.ctx.scrollbarWidth = (divWithoutScroll.clientWidth - divWithScroll.clientWidth);

        divWithScroll.remove();
        divWithoutScroll.remove();
    }

    getTrackLayout(isOverlapping){
        let layout = isOverlapping ? 'overlapping' : 'non-overlapping';
        return layout
    }

    getTrackHeight(trackDataLength, isOverlapping){
        let eleHt = (trackDataLength > 1) ? 60 : 44;
        return eleHt;
    }

    showSubtracks(trackIndex){
        let subTrackEle = this.ctx.querySelectorAll('.pvSubtracks_'+trackIndex)[0];
        let trackEle = this.ctx.querySelectorAll('.pvTracks_'+trackIndex)[0];
        if(trackEle.classList.contains('expanded')){
            subTrackEle.style.display = 'none';
            trackEle.querySelectorAll('.pvTrack')[0].style.display = 'block';
            trackEle.classList.remove('expanded');
        }else{
            trackEle.querySelectorAll('.pvTrack')[0].style.display = 'none';
            subTrackEle.style.display = 'block';
            if(this.ctx.formattedSubTracks.indexOf(trackIndex) == -1){
                this.bindTrackData('subtrack', trackIndex, this.ctx.scrollbarWidth);
                this.ctx.formattedSubTracks.push(trackIndex);
            }
            trackEle.classList.add('expanded');
        }
    }

    hideSubtracks(trackIndex){
        this.ctx.querySelectorAll('.pvSubtracks_'+trackIndex)[0].style.display = 'none';
        this.ctx.querySelectorAll('.pvTracks_'+trackIndex)[0].style.display = 'table';
    }

    addHideOptions(optionClass, tIndex, label){
        let optionEle = this.ctx.querySelector('.'+optionClass);
        optionEle.innerHTML =`<tr>
            <td style="width:10%;vertical-align:top;"><input type="checkbox" class="pvSectionChkBox" name="cb_${tIndex}" style="margin:0" /></td>
            <td style="padding-bottom:5px;">${label}</td>
        </tr>`;
        optionEle.style.display = "table-row";
    }

    handleExtEvents(e){
        if(typeof e.eventData !== 'undefined' && typeof e.eventData.residueNumber !== 'undefined'){
            let protvistaParam = {start: e.eventData.residueNumber, end: e.eventData.residueNumber, highlight: true};
            this.resetZoom(protvistaParam);
        }
    }

    bindTrackData(type, mainTrackIndex, scrollbarWidthVal){
        let trackSelector = '.pvTrack';
        if(type == 'subtrack') trackSelector = '.pvSubtrack_'+mainTrackIndex;
    
        let trackEles = this.ctx.querySelectorAll(trackSelector);
        if(trackEles && trackEles.length > 0){
          trackEles.forEach((trackEle, trackIndex) => {

            let trackModel = this.ctx.viewerData.tracks[trackIndex];
            let labelSelector = '.pvTrackLabel_'+trackIndex;
            if(type == 'subtrack'){ 
                labelSelector = '.pvSubtrackLabel_'+mainTrackIndex+'_'+trackIndex;
                trackModel = this.ctx.viewerData.tracks[mainTrackIndex].data[trackIndex];
            }

            //Add label
            let labelDetails = this.getLabel(trackModel.labelType, trackModel.label);
            let labelEle = this.ctx.querySelectorAll(labelSelector)[0];
            labelEle.innerHTML = labelDetails;

            let transform = '';
            let trackData = trackModel.data;
            if(type == 'subtrack'){
              trackData = [trackModel];
              transform = 'transform:translate(0px,-5px)'
            }
            trackEle.data = trackData;

            if(type == 'subtrack'){
                if(this.ctx.viewerData.tracks[mainTrackIndex].data.length > 4){
                    trackEle.parentNode.style.paddingRight = '0px';
                }else{
                    trackEle.parentNode.style.paddingRight = scrollbarWidthVal+'px';
                }
            }else{
                trackEle.parentNode.style.paddingRight = scrollbarWidthVal+'px';
            }
    
            if(type == 'track' && trackIndex == 0){
              this.ctx.querySelectorAll('.pvTracks_0')[0].classList.add("expanded");
              this.ctx.querySelectorAll('.pvTracks_0')[0].querySelectorAll('.pvTrack')[0].style.display = 'none';
              this.ctx.querySelectorAll('.pvSubtracks_0')[0].style.display = 'block';
              this.bindTrackData('subtrack', 0, scrollbarWidthVal);
              this.ctx.formattedSubTracks.push(trackIndex);
            }
    
          });
        }
        
    }

    getLabel(type, value) {
        if (type !== 'pdbIcons') {
            return value;
        } else {
          let iconCode = {
            'experiments': {class: 'icon icon-generic', dataIcon: ';'},
            'complex': {class: 'icon icon-conceptual', dataIcon: 'y'},
            'nucleicAcids': {class: 'icon icon-conceptual', dataIcon: 'd'},
            'ligands': {class: 'icon icon-conceptual', dataIcon: 'b'},
            'literature': {class: 'icon icon-generic', dataIcon: 'P'}
          };
          let labelElements = [];
          labelElements.push('<strong><a class="pdbIconsId" href="' + value.url + '" target="_blank">' + value.id + '</a></strong><span class="pdbIconsWrapper">');
          value.icons.forEach(iconData => {
    
            let rotateClass = '';
            if (iconData.type == 'nucleicAcids') rotateClass = '';//rotateClass = ' rotate';
    
            let iconHtml = '<span class="pdbIconslogo" style="background-color:' + iconData.background + '" title="' + iconData.tooltipContent + '" ><i class="' + iconCode[iconData.type].class + '" data-icon="' + iconCode[iconData.type].dataIcon + '" style="color: #fff;"></i></span>';
            if (typeof iconData.url != 'undefined' && iconData.url != '') iconHtml = '<a class="pdbIconslogoA" href="' + iconData.url + '" target="_blank">' + iconHtml + '</a>';
            labelElements.push(iconHtml);
          });
    
          if (value.resolution) labelElements.push('<strong style="color:#555">' + value.resolution + '&Aring;</strong></span>');
          return labelElements.join(' ');
        }
    }

    resetSection(trackIndex){
        this.ctx.querySelector(`.pvResetSection_${trackIndex}`).style.display = 'none';
        this.ctx.hiddenSubtracks[trackIndex].forEach((subtrackIndex) => {
            this.ctx.querySelector(`.pvSubtrackRow_${trackIndex}_${subtrackIndex}`).style.display = 'table';
        });
        delete this.ctx.hiddenSubtracks[trackIndex];
    }

    hideSection(trackIndex){

        let totalTracks = this.ctx.viewerData.tracks.length;
        let trackClasses = [];
        if(trackIndex < totalTracks){
            trackClasses.push(`.pvTracks_${trackIndex}`, `.pvSubtracks_${trackIndex}`);
        }else{
            if(trackIndex == totalTracks){
                trackClasses.push(`.pvConsHistoRow`, `.pvConservationPlotRow`);
            }else{
                trackClasses.push(`.pvVariantGraphRow`, `.pvVariantPlotRow`);
            }
        }

        for(let trackClass of trackClasses) {
            let trackEle = this.ctx.querySelector(trackClass);
            if(trackEle) trackEle.style.display = 'none';
        }

        this.ctx.hiddenSections.push(trackIndex);
    }

    showSection(trackIndex){

        let totalTracks = this.ctx.viewerData.tracks.length;
        if(trackIndex < totalTracks){
            let pvTracksEle = this.ctx.querySelector(`.pvTracks_${trackIndex}`);
            pvTracksEle.style.display = 'table';

            if(pvTracksEle.classList.contains('expanded')){
                let pvSbTrkEle = this.ctx.querySelector(`.pvSubtracks_${trackIndex}`);
                pvSbTrkEle.style.display = 'block';
                if(typeof this.ctx.hiddenSubtracks[trackIndex] != 'undefined' && this.ctx.hiddenSubtracks[trackIndex].length == pvSbTrkEle.children.length){
                    this.resetSection(trackIndex);
                }
            }
        }else{

            if(trackIndex == totalTracks){
                let consHistoSectionEle = this.ctx.querySelector('.pvConsHistoRow');
                if(consHistoSectionEle) consHistoSectionEle.style.display = 'table';

                if(consHistoSectionEle.classList.contains('expanded')){
                    let pvConservationPlotSectionEle = this.ctx.querySelector('.pvConservationPlotRow');
                    if(pvConservationPlotSectionEle) pvConservationPlotSectionEle.style.display = 'block';
                }
            }else{
                let variantGraphSectionEle = this.ctx.querySelector('.pvVariantGraphRow');
                if(variantGraphSectionEle) variantGraphSectionEle.style.display = 'table';
                if(variantGraphSectionEle.classList.contains('expanded')){
                    let pvVariantPlotSectionEle = this.ctx.querySelector('.pvVariantPlotRow');
                    if(pvVariantPlotSectionEle) pvVariantPlotSectionEle.style.display = 'block';
                }
            }

        }

        this.ctx.hiddenSections.splice(this.ctx.hiddenSections.indexOf(trackIndex),1);
    
    }

    hideSubTrack(trackIndex, subtrackIndex){

        //Add subtrack index details
        if(typeof this.ctx.hiddenSubtracks[trackIndex] == 'undefined'){
            this.ctx.hiddenSubtracks[trackIndex] = [subtrackIndex];
        }else{
            this.ctx.hiddenSubtracks[trackIndex].push(subtrackIndex);
        }

        //hide dom
        this.ctx.querySelector(`.pvSubtrackRow_${trackIndex}_${subtrackIndex}`).style.display = 'none';
        this.ctx.querySelector(`.pvResetSection_${trackIndex}`).style.display = 'inline-block';
        
        if(this.ctx.hiddenSubtracks[trackIndex].length == this.ctx.viewerData.tracks[trackIndex].data.length){
            this.hideSection(trackIndex);
        }
    }

    resetZoom(param){
        let currentStartVal = null;
        let currentEndVal = null;
        let navEle = this.ctx.querySelectorAll('.pvTrack')[0];
        if (!navEle) return;
        
        if(typeof param === 'undefined'){
          currentStartVal = navEle.getAttribute('displaystart');
          currentEndVal = navEle.getAttribute('displayend');
        }else if(typeof param.trackData != 'undefined'){
          if(param.trackData.start && param.trackData.end){
            currentStartVal = param.trackData.start;
            currentEndVal = param.trackData.end;
          }else if(param.trackData.locations && param.trackData.locations.length > 0){
            currentStartVal = param.trackData.locations[0].fragments[0].start;
            let lastLocationIndex = param.trackData.locations.length - 1;
            let lastFragmentIndex = param.trackData.locations[lastLocationIndex].fragments.length - 1;
            currentEndVal = param.trackData.locations[lastLocationIndex].fragments[lastFragmentIndex].end;
          }
        }else{
          currentStartVal = param.start;
          currentEndVal = param.end;
        }
      
        if(param && param.start == null && param.end == null){

        }else{
            if (currentStartVal == null) currentStartVal = '1';
            if (currentEndVal == null) currentEndVal = this.ctx.viewerData.length;
        }
    
        if(typeof param !== 'undefined' && typeof param.highlight !== 'undefined' && param.highlight){
          navEle.dispatchEvent(new CustomEvent('change', {
            detail: {
              highlightstart: currentStartVal,
              highlightend: currentEndVal
            }, bubbles: true, cancelable: true
          }));
          
        }else{

            navEle.dispatchEvent(new CustomEvent('change', {
                detail: {
                  displaystart: currentStartVal,
                  displayend: currentEndVal
                }, bubbles: true, cancelable: true
            }));  
    
          navEle.dispatchEvent(new CustomEvent('change', {
            detail: {
              highlightstart: null,
              highlightend: null
            }, bubbles: true, cancelable: true
          }));

        }
        
    }

    zoomTrack(data, currentZoomTrack){

        if(this.ctx.zoomedTrack != ''){
            let prevZoomIconEle = this.ctx.querySelector('.pvZoomIcon_'+this.ctx.zoomedTrack);
            prevZoomIconEle.classList.remove('active');
        }
        
        if(this.ctx.zoomedTrack != currentZoomTrack){
          
          let zoomIconEle = this.ctx.querySelector('.pvZoomIcon_'+currentZoomTrack);
          zoomIconEle.classList.add('active');

          this.ctx.zoomedTrack = currentZoomTrack;
          this.resetZoom(data);
        }else{
          
          this.ctx.zoomedTrack = '';
          this.resetZoom({start:1, end: null});
        }
          
    }

    resetView(){

        //Close open menus
        this.ctx.querySelector('.settingsMenu').style.display = 'none';
        this.ctx.querySelector('.rangeMenu').style.display = 'none';

        //Reset zoom
        if(this.ctx.zoomedTrack != ''){
            let prevZoomIconEle = this.ctx.querySelector('.pvZoomIcon_'+this.ctx.zoomedTrack);
            prevZoomIconEle.classList.remove('active');
        }

        this.ctx.zoomedTrack = '';
        this.resetZoom({start:1, end: null});

        //Reset expanded tracks
        this.ctx.querySelectorAll(`.expanded`).forEach(trackSection => {
            trackSection.classList.remove('expanded');
            let expTrackEle = trackSection.querySelector(`.pvTrack`);
            if(expTrackEle) expTrackEle.style.display = 'block';
        });
        let firstTrackSection = this.ctx.querySelector(`.pvTracks_0`);
        firstTrackSection.style.display = 'table';
        if(!firstTrackSection.classList.contains('expanded')) firstTrackSection.classList.add('expanded');
        firstTrackSection.querySelector(`.pvTrack`).style.display = 'none';
        this.ctx.querySelectorAll(`.protvistaRowGroup`).forEach((trackSubSection, subSectionIndex) => {
            trackSubSection.style.display = 'none';
            //Reset hidden subtracks
            if(typeof this.ctx.hiddenSubtracks[subSectionIndex] != 'undefined') this.resetSection(subSectionIndex);
        });
        this.ctx.querySelector(`.pvSubtracks_0`).style.display = 'block';
        this.ctx.querySelector(`.pvResetSection_0`).style.display = 'none';

        let variantTrackEle = this.ctx.querySelector(".pvVariantPlotRow");
        if(variantTrackEle) variantTrackEle.style.display = 'none';
        let seqConTrackEle = this.ctx.querySelector(`.pvConservationPlotRow`);
        if(seqConTrackEle) seqConTrackEle.style.display = 'none';
        
        //Display hidden sections
        if(this.ctx.hiddenSections.length > 0){
            let totalTracks = this.ctx.viewerData.tracks.length;
            this.ctx.hiddenSections.forEach(trackIndex => {

                if(trackIndex > 0 && trackIndex < totalTracks){
                    let trackSection = this.ctx.querySelector(`.pvTracks_${trackIndex}`);
                    trackSection.style.display = 'table';
                    if(trackSection.classList.contains('expanded')) trackSection.classList.remove('expanded');
                    trackSection.querySelector(`.pvTrack`).style.display = 'block';
                }else if(trackIndex >= totalTracks){

                    if(trackIndex == totalTracks){

                        let consHistoSectionEle = this.ctx.querySelector('.pvConsHistoRow');
                        if(consHistoSectionEle) consHistoSectionEle.style.display = 'table';
        
                        if(consHistoSectionEle.classList.contains('expanded')) consHistoSectionEle.classList.remove('expanded');
                        let pvConservationPlotSectionEle = this.ctx.querySelector('.pvConservationPlotRow');
                        if(pvConservationPlotSectionEle) pvConservationPlotSectionEle.style.display = 'none';
                        
        
                    }else{
        
                        let variantGraphSectionEle = this.ctx.querySelector('.pvVariantGraphRow');
                        if(variantGraphSectionEle) variantGraphSectionEle.style.display = 'table';
        
                        if(variantGraphSectionEle.classList.contains('expanded')) variantGraphSectionEle.classList.remove('expanded');
                        let pvVariantPlotSectionEle = this.ctx.querySelector('.pvVariantPlotRow');
                        if(pvVariantPlotSectionEle) pvVariantPlotSectionEle.style.display = 'none';
                        
        
                    }
                }

            });

        }

        this.ctx.hiddenSections = [];
        this.ctx.hiddenSubtracks = Object.assign({},{});
          
        
    }

    openRangeMenu(){

        //Close other open menus
        this.ctx.querySelector('.settingsMenu').style.display = 'none';
        
        let menuBox = this.ctx.querySelector(`.rangeMenu`);
        if(menuBox.style.display == 'none'){

            let startEle = this.ctx.querySelector('.pvRangeMenuStart');
            let endEle = this.ctx.querySelector('.pvRangeMenuEnd');
            
            if(startEle.value == 0 || endEle.value == 0){
                let currentStartVal = 1;
                let currentEndVal = this.ctx.viewerData.length;

                let navEle = this.ctx.querySelectorAll('.pvTrack')[0];
                if (navEle){
                    currentStartVal = navEle.getAttribute('displaystart');
                    currentEndVal = navEle.getAttribute('displayend');
                }
                
                startEle.value = Math.round(currentStartVal);
                endEle.value = Math.round(currentEndVal);
            }

            menuBox.style.display = 'block';
        }else{
            menuBox.style.display = 'none';
        }
    }

    openCategorySettingsMenu(){

        //Close other open menus
        this.ctx.querySelector('.rangeMenu').style.display = 'none';

        let menuBox = this.ctx.querySelector(`.settingsMenu`);
        if(menuBox.style.display == 'none'){
            
            menuBox.querySelectorAll('.pvSectionChkBox').forEach((chkBox, chkBoxIndex) => {
                if(this.ctx.hiddenSections.indexOf(chkBoxIndex) > -1){
                    chkBox.checked = true;
                }else{
                    chkBox.checked = false;
                }
            });

            menuBox.style.display = 'block';
        }else{
            menuBox.style.display = 'none';
        }
    }

    pvRangeMenuSubmit(){
        let startVal = this.ctx.querySelector('.pvRangeMenuStart').value;
        let endVal = this.ctx.querySelector('.pvRangeMenuEnd').value;

        if(startVal != '' && endVal != ''){
            startVal = parseFloat(startVal);
            endVal = parseFloat(endVal);
            if(endVal >= startVal){
                if (endVal > this.ctx.viewerData.length) {
                    endVal = this.ctx.viewerData.length;
                }

                let resetParam = {start: Math.round(startVal), end: Math.round(endVal)}

                let highlightCheckEle = this.ctx.querySelector('.pvRangeMenuHighlight');
                if(highlightCheckEle.checked){
                    resetParam['highlight'] = true;
                }

                this.resetZoom(resetParam);
                this.openRangeMenu();
            }
        }
    }

    pvCategorySettingsMenuSubmit(){
        this.ctx.querySelectorAll('.pvSectionChkBox').forEach((chkBox, chkBoxIndex) => {
            if(chkBox.checked){
                if(this.ctx.hiddenSections.indexOf(chkBoxIndex) == -1){
                    this.hideSection(chkBoxIndex);
                }
            }else{
                if(this.ctx.hiddenSections.indexOf(chkBoxIndex) > -1){
                    this.showSection(chkBoxIndex);
                } 
            }
        });

        this.openCategorySettingsMenu();
    }

    showLabelTooltip(e){
        let tooltipContentEle = e.currentTarget.lastElementChild;
        if(!tooltipContentEle || tooltipContentEle.className != "labelTooltipContent") return;

        let toolTipText = tooltipContentEle.innerText;

        let labelToolTipEle = this.ctx.querySelector(".labelTooltipBox");
        
        labelToolTipEle.innerHTML = toolTipText;

        let labelCoordinates = e.currentTarget.getBoundingClientRect();

        labelToolTipEle.style.left = (labelCoordinates.x + labelCoordinates.width + 5) +'px';

       
        labelToolTipEle.style.top = (labelCoordinates.y + 10) +'px';

        labelToolTipEle.style.display = 'block';

    }

    hideLabelTooltip(){
        this.ctx.querySelector(".labelTooltipBox").style.display = 'none';
    }

    showVariantPlot(){
        let variantPlotRowEle = this.ctx.querySelector(".pvVariantPlotRow");
        if(variantPlotRowEle.style.display == "none"){
            variantPlotRowEle.style.display = "block";
            variantPlotRowEle.previousElementSibling.classList.add('expanded');
        }else{
            variantPlotRowEle.style.display = "none";
            variantPlotRowEle.previousElementSibling.classList.remove('expanded');
        }
    }

    showConservationPlot() {
        let conservationPlotRowEle = this.ctx.querySelector(".pvConservationPlotRow");
        if (conservationPlotRowEle.style.display == "none") {
            conservationPlotRowEle.style.display = "block";
            conservationPlotRowEle.previousElementSibling.classList.add('expanded');
        } else {
            conservationPlotRowEle.style.display = "none";
            conservationPlotRowEle.previousElementSibling.classList.remove('expanded');
        }
    }

    filterSc(filtervalue) {
        this.ctx.querySelector('.sc_radio').dispatchEvent(new CustomEvent('sc-change', {
            detail: {
                type: filtervalue
            },
            bubbles: true, cancelable: true
        }));
    }

    getMSADownloadUrl() {
        let baseUrl = "https://www.ebi.ac.uk/pdbe/static/alignments/";
        if (this.ctx._accession) {
            return baseUrl + this.ctx._accession + ".sto.gz";
        } else {
            return "";
        }
    }

    addEventSubscription() {
        document.addEventListener("PDB.topologyViewer.click", e => {
            this.handleExtEvents(e);
        });

        document.addEventListener("PDB.topologyViewer.mouseover", e => {
            this.handleExtEvents(e);
        });

        document.addEventListener("PDB.topologyViewer.mouseout", e => {
            this.handleExtEvents(e);
        });

        document.addEventListener("PDB.litemol.click", e => {
            this.handleExtEvents(e);
        });

        document.addEventListener("PDB.litemol.mouseover", e => {
            this.handleExtEvents(e);
        });

        document.addEventListener("PDB.molstar.click", e => {
            this.handleExtEvents(e);
        });

        document.addEventListener("PDB.molstar.mouseover", e => {
            this.handleExtEvents(e);
        });
    }

    removeEventSubscription() {
        if(this.ctx.subscribeEvents){
            document.removeEventListener("PDB.topologyViewer.click");
            document.removeEventListener("PDB.topologyViewer.mouseover");
            document.removeEventListener("PDB.topologyViewer.mouseout");
            document.removeEventListener("PDB.litemol.click");
            document.removeEventListener("PDB.litemol.mouseover");
            document.removeEventListener("PDB.molstar.click");
            document.removeEventListener("PDB.molstar.mouseover");
        }
    }
}

export default LayoutHelper;
