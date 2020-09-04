import * as d3 from "d3";
import ProtvistaTrack from "protvista-track";

const margin = {
  top: 10,
  bottom: 10
};

class ProtvistaPdbTrack extends ProtvistaTrack {

  connectedCallback() {
    super.connectedCallback()
  }

  _createTrack() {
    this._layoutObj.init(this._data);

    d3.select(this)
    .selectAll("svg")
      .remove();
    
    this.svg = d3.select(this)
      .append("div")
      .style("line-height", 0)
      .append("svg")
      .style('width', '100%')
      .attr("height", this._height);

    this.highlighted = this.svg
      .append("rect")
      .attr("class", "highlighted")
      .attr("fill", "rgba(255, 235, 59, 0.8)")
      .attr('stroke', 'black')
      .attr("height", this._height);

    // this.trackHighlighter.appendHighlightTo(this.svg);

    this.seq_g = this.svg.append("g").attr("class", "sequence-features").attr("transform", "translate(0,-5)");

    this._createFeatures();
    this.refresh();
  }

  _createFeatures() {
    this.featuresG = this.seq_g.selectAll("g.feature-group").data(this._data);

    this.locations = this.featuresG
      .enter()
      .append("g")
      .attr("class", "feature-group")
      .attr("id", d => `g_${d.accession}`)
      .selectAll("g.location-group")
      .data(d =>
        d.locations.map(loc =>
          Object.assign({}, loc, {
            feature: d
          })
        )
      )
      .enter()
      .append("g")
      .attr("class", "location-group");

    this.features = this.locations
      .selectAll("g.fragment-group")
      .data(d =>
        d.fragments.map(loc =>
          Object.assign({}, loc, {
            feature: d.feature
          })
        )
      )
      .enter()
      .append("path")
      .attr("class", "feature")
      .attr("tooltip-trigger", "true")
      .attr("d", f =>
        {  
          return this._featureShape.getFeatureShape(
            this.getSingleBaseWidth(),
            this._layoutObj.getFeatureHeight(f),
            f.end ? f.end - f.start + 1 : 1,
            this._getShape(f)
          )
         } 
      )
      .attr(
        "transform",
        f =>
          "translate(" +
          this.getXFromSeqPosition(f.start) +
          "," +
          (this.margin.top + this._layoutObj.getFeatureYPos(f.feature)) +
          ")"
      )
      .attr("fill", (f, i) => {
        let colorData = f.feature;
        if(f.feature.color) colorData = {color: f.feature.color};
        if(f.feature.locations && f.feature.locations[0].fragments[i] && f.feature.locations[0].fragments[i].color) colorData = {color: f.feature.locations[0].fragments[i].color};
        return this._getFeatureColor(colorData)
      })
      .attr("stroke", (f, i) => {
        let colorData = f.feature;
        if(f.feature.color) colorData = {color: f.feature.color};
        if(f.feature.locations && f.feature.locations[0].fragments[i] && f.feature.locations[0].fragments[i].color) colorData = {color: f.feature.locations[0].fragments[i].color};
        let apiColor = this._getFeatureColor(colorData);
        let lightColor = this.colorMixer(-0.3, apiColor); //lightened by 30%
        return lightColor;
      })
      .on("mouseover", (f, i) => {
        const self = this;
        const e = d3.event;
  
        const oldToolip = document.querySelectorAll("protvista-tooltip");
        if(oldToolip && oldToolip[0] && oldToolip[0].className == 'click-open'){
          //do nothing
        }else{
          window.setTimeout(function() {
            self.createTooltip(e, f);
          }, 50);
        }
        
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: {
              highlightend: f.end,
              highlightstart: f.start
            },
            bubbles: true,
            cancelable: true
          })
        );
        f.trackIndex = i;
        this.dispatchEvent(
          new CustomEvent("protvista-mouseover", {
            detail: f,
            bubbles: true,
            cancelable: true
          })
        );
      })
      .on("mouseout", () => {
        const self = this;

        const oldToolip = document.querySelectorAll("protvista-tooltip");
        if(oldToolip && oldToolip[0] && oldToolip[0].className == 'click-open'){
          //do nothing
        }else{
          window.setTimeout(function() {
            self.removeAllTooltips();
          }, 50);
        }

        this.dispatchEvent(
          new CustomEvent("change", {
            detail: {
              highlightend: null,
              highlightstart: null
            },
            bubbles: true,
            cancelable: true
          })
        );
        this.dispatchEvent(
          new CustomEvent("protvista-mouseout", {
            detail: null,
            bubbles: true,
            cancelable: true
          })
        );
      })
      .on("click", (d, i) => {
        d.trackIndex = i;
        this.createTooltip(d3.event, d, true);
        this.dispatchEvent(
          new CustomEvent("protvista-click", {
            detail: d,
            bubbles: true,
            cancelable: true
          })
        );
        
      });
  }

  _getShape(f) {
    if (f.shape) {
      return f.shape;
    } else if (f.feature && f.feature.shape) {
      return f.feature.shape;
    } else if (this._shape) {
      return this._shape;
    } else {
      return "rectangle";
    }
  }

  createTooltip(e, d, closeable = false) {
    
    this.removeAllTooltips();
    const tooltip = document.createElement("protvista-tooltip");
    
    tooltip.left =  e.pageX + 15; 
    tooltip.top = e.pageY + 5;
    tooltip.style.marginLeft = 0;
    tooltip.style.marginTop = 0;
    
    tooltip.title = `${d.feature.type} ${d.start}-${d.end}`;
    if(d.start == d.end) tooltip.title = `${d.feature.type} residue ${d.start}`;
    tooltip.closeable = closeable;

    // Passing the content as a property as it can contain HTML
    tooltip.content = d.feature.tooltipContent;
    if(d.tooltipContent) tooltip.content = d.tooltipContent;
    if(e.type == 'click') tooltip.classList.add("click-open");
    document.body.appendChild(tooltip);

    const toolTipEl = d3.select(tooltip).node();
    const tooltipDom = toolTipEl.getBoundingClientRect();
    const bottomSpace = window.innerHeight - e.clientY;
    const rightSpace = window.innerWidth - e.clientX;
    
    if(bottomSpace < 130){
      toolTipEl.style.top = e.pageY - (tooltipDom.height + 20) +'px';
    }

    if(rightSpace < 300){
      toolTipEl.style.left = '';
      toolTipEl.style.right = (rightSpace - 10)+'px';
    }
  }

  //Reference - https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)#stackoverflow-archive-begin
  colorMixer(p,c0,c1,l){
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
      let n=d.length,x={};
      if(n>9){
        [r,g,b,a]=d=d.split(","),n=d.length;
        if(n<3||n>4)return null;
        x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
      }else{
        if(n==8||n==6||n<4)return null;
        if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
        d=i(d.slice(1),16);
        if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
        else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
      }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
  }
  
}
export default ProtvistaPdbTrack;