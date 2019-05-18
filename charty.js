// This is the svg namespace
const xmlns = "http://www.w3.org/2000/svg";
const svgPadding = 50;
const gridMargin = 10;


class Charty {

    constructor(svg, data){
        if(!(svg instanceof SVGSVGElement)) {
            throw new Error('The first argument must be a svg element');
        }
        
        if(typeof data !== 'object') {
            throw new Error('The second argument must be a plain object');
        }

        this.svg = svg;
        this.data = data;

        this.prepareSvg();
    }

    prepareSvg() {

        const { labels, dataset } = this.data;

        const { label, data, backgroundColor, borderColor, borderWidth } = dataset;

        // check the data
        if(data.length !== labels.length){
            throw new Error('Number of labels must match the number of data, so each label should have the corresponding data');
        }

        // Get svg coordinates
        const { x:svgX , y:svgY } = this.svg.currentTranslate;

        const svgHeight = this.svg.clientHeight;
        const svgWidth = this.svg.clientWidth;
        const width = svgWidth - svgPadding;
        const height = svgHeight - svgPadding;


        // Create the label of the chart
        const text = this.createTextFromLabel(label, svgX, svgY, borderColor);
        this.svg.appendChild(text);


        // calculate grid coordinate
        const { min, max } = this.getDataInterval(data);

        // Generate x axis
        const xAxisW = width / labels.length;
        for(let i=labels.length-1, x=svgX+svgWidth-gridMargin-xAxisW, y=svgY+svgHeight-svgPadding/2; i >= 0; --i) {

            const line = this.createGridLine(x, y, height+gridMargin, 'Vertical');
                        
            this.svg.appendChild(line);

            const labelText = this.createTextFromLabel(labels[i], x+gridMargin, y, 'rgba(128, 128, 128, 0.5)');
            this.svg.appendChild(labelText);

            x -= xAxisW;
        }

        // Generate y axis
        const MAX_BOUND = Math.ceil(height / 30);
        const MIN_BOUND = Math.ceil(height / 50);
        let yAxisH = max-min;
        let yAxisScale;
        let res_bound;
        
        for(let i = MIN_BOUND;i <= MAX_BOUND; ++i) {
            if( (i&1) === 0 && yAxisH%i === 0) {
                yAxisScale = i;
                res_bound = yAxisH / i;
                yAxisH = height / i;
                break;
            }
        }

        for(let i=0, m=min, x=svgX+svgWidth-gridMargin, y=svgY+svgHeight-svgPadding/2; i <= yAxisScale; ++i) {
            
            const line = this.createGridLine(x, y, width+gridMargin);
            
            this.svg.appendChild(line);

            const labelText = this.createTextFromLabel(m.toString(), x-svgWidth+svgPadding/2, y-gridMargin, 'rgba(128, 128, 128, 0.5)');
            this.svg.appendChild(labelText);
            m += res_bound;

            y -= yAxisH;
        }

        // Plot data
        for(let i=labels.length-1, x=svgX+svgWidth-gridMargin-xAxisW, y=svgY+svgHeight-svgPadding/2; i >= 0; --i) {

            const rectHeight = Math.abs(data[i]*(yAxisH/res_bound));

            const rect = document.createElementNS(xmlns, 'rect');

            // Dealing with the height and y attributes is the most crucial task
            if(max === 0) {
                rect.setAttributeNS(null, 'y', svgPadding/2);
            }
            else if(min < 0) {
    
                if(data[i] > 0) rect.setAttributeNS(null, 'y', y - rectHeight - height/2);
                else rect.setAttributeNS(null, 'y', y - height/2);

            }
            else {
                rect.setAttributeNS(null, 'y', y - rectHeight);
            }
            rect.setAttributeNS(null, 'height', rectHeight);

            rect.setAttributeNS(null, 'width', xAxisW-2*gridMargin);
            rect.setAttributeNS(null, 'x', x+gridMargin);
            rect.setAttributeNS(null, 'fill', backgroundColor);
            rect.style.stroke = borderColor;
            rect.style.strokeWidth = borderWidth;

            this.svg.appendChild(rect);

            x -= xAxisW;
        }

    }

    createTextFromLabel(label, x, y, color='red') {
        const text = document.createElementNS(xmlns, 'text');
        text.innerHTML = label.substring(0, 10);
        text.setAttributeNS(null, 'x', x);
        text.setAttributeNS(null, 'y', y+15);
        text.setAttributeNS(null, 'fill', color);

        return text;
    }

    createGridLine(x, y, length, type = 'Horizontal') {
        const line = document.createElementNS(xmlns, 'line');
        line.setAttributeNS(null, 'x1', x);
        line.setAttributeNS(null, 'y1', y);

        if(type === 'Horizontal')
            line.setAttributeNS(null, 'x2', x-length);
        else
            line.setAttributeNS(null, 'x2', x);
        
        if(type === 'Vertical')
            line.setAttributeNS(null, 'y2', y-length);
        else
            line.setAttributeNS(null, 'y2', y);
        
        line.style.stroke = 'rgba(128, 128, 128, 0.5)';
        line.style.strokeWidth = '1';

        return line;
    }

    getDataInterval(data) {
        // get the max in order to create the grid
        let max = -Infinity;
        let min = +Infinity;
        for(let d of data){
            if(d>max)
                max = d;
            if(d<min)
                min = d;
        }

        max = Math.max(0, Math.ceil(max / 10) * 10);
        if( max === 0 ) {
            min = Math.ceil(Math.abs(min) / 10) * -10;
        }else {
            min = Math.min(0, min >= 0 ? min : -max);
        }

        return {min, max};
    }
}