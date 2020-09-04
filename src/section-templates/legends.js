const { html } = require("lit-html");
import { styleMap } from 'lit-html/directives/style-map.js';

function PDBePvLegendsSection(ctx) {
    return html `<div></div>
                <div>
                    ${
                        Object.keys(ctx.viewerData.legends.data).map(legendKey => {
                            return html`
                            <div class="legendRow" style=${styleMap({textAlign: ctx.viewerData.legends.alignment})}>
                                ${isNaN(parseInt(legendKey)) ? html`<span class="legendText"><strong>${legendKey} : </strong></span>` : ``}
                                ${ctx.viewerData.legends.data[legendKey].map(legend => {
                                    if(!Array.isArray(legend.color)) legend.color = [legend.color];
                                    const totalColors = legend.color.length;
                                    const colorWidth = 100 / totalColors;
                                    
                                    let bgStyle = '';
                                    if(totalColors == 1){
                                        bgStyle = 'background:'+legend.color[0];
                                    }else{
                                        let gradientArr = ['to right'];
                                        legend.color.forEach((color, ci) => {
                                            if(ci == 0){
                                                gradientArr.push(color + ' ' + colorWidth + '%')
                                            }else if(ci == totalColors - 1){
                                                gradientArr.push(color+' ' + (colorWidth * ci - 1) + '%')
                                            }else{
                                                gradientArr.push(color+' ' + (colorWidth * ci) + '%'+' ' + (colorWidth * (ci + 1)) + '%')
                                            }
                                        });
                                        bgStyle = 'background:linear-gradient('+gradientArr.join(', ')+')';
                                    }

                                    return html`
                                    <span class="legendColor" style="${bgStyle}"></span>
                                    <span class="legendText">${legend.text}</span>
                                `})}
                            </div>
                            `
                        })
                    }
                </div>`
        
}

export default PDBePvLegendsSection;