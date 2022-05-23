class Scatterplot {
    margin = {
        top: 10, right: 100, bottom: 40, left: 50
    }

    constructor(svg, data, width = 250, height = 250) {
        this.svg = svg;
        this.data = data;
        this.width = width;
        this.height = height;
        this.handlers = {};
        this.ylabel;
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();
        this.zScale = d3.scaleOrdinal().range(d3.schemeCategory10);

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.brush= d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .on("start brush", (event) =>{
                this.brushCircles(event);
            })

        this.xAxis
            .append("text")
            .attr("x", this.width / 2) 
            .attr("y", this.margin.bottom - 6) 
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .html("Follwers");
        
        this.ylabel = this.yAxis
            .append("text")
            .attr("x", -this.height / 2)
            .attr("y", -this.margin.left + 10)
            .attr("fill", "black")
            .style("font-size", "1.4em")
            .text(d3.select("input[type=radio][name=x-encoding]:checked").property("value"))
            .style("transform", "rotate(-90deg)")
            .style("text-anchor", "middle");
        
    }

    update(xVar, yVar, colorVar) {
        this.xVar = xVar;
        this.yVar = yVar;

        this.xScale.domain(d3.extent(this.data, d => d[xVar])).range([0, this.width]);
        this.yScale.domain(d3.extent(this.data, d => d[yVar])).range([this.height, 0]);
        this.zScale.domain(['FALSE', 'TRUE']);

        this.circles = this.container.selectAll("circle")
            .data(data)
            .join("circle");

        this.circles
            .transition()
            .attr("cx", d => this.xScale(d[xVar]))
            .attr("cy", d => this.yScale(d[yVar]))
            .attr("fill", d => this.zScale(d[colorVar]))
            .attr("r", 2)


        this.container.call(this.brush);

        var formatValue = d3.format(".2s");

        this.xAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
            .transition()
            .call(d3.axisBottom(this.xScale).tickFormat(function(d) { return formatValue(d); }));

        this.yAxis
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
            .transition()
            .call(d3.axisLeft(this.yScale).tickFormat(function(d) { return formatValue(d); }));

        this.ylabel
            .text(d3.select("input[type=radio][name=x-encoding]:checked").property("value"));            
        
        this.legend
            .style("display", "inline")
            .style("font-size", ".8em")
            .style("font-weight", "bold")
            .attr("transform", `translate(${this.width + this.margin.left + 10}, ${this.height / 2})`)
            .call(d3.legendColor().scale(this.zScale).title("Mature"))
        
    }

    isBrushed(d, selection) {
        let [[x0, y0], [x1, y1]] = selection;

        let x= this.xScale(d[this.xVar]);
        let y= this.yScale(d[this.yVar]);
        return x0<= x&& x<= x1&& y0<= y&& y<= y1;
    }

    brushCircles(event) {
        let selection = event.selection;

        this.circles.classed("brushed", d => this.isBrushed(d, selection));

        if (this.handlers.brush)
            this.handlers.brush(this.data.filter(d => this.isBrushed(d, selection)));
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}
