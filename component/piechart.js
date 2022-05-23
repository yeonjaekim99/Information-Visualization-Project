class Piechart {
    margin = {
        top: 190, right: -60, bottom: 0, left: 150
    }

    constructor(svg, data, width = 200, height = 200) {
        this.svg = svg;
        this.data = data;
        this.width = width;
        this.height = height;
        this.radius = Math.min(this.width, this.height) / 2;
        this.handlers = {};
        this.label = [];
    }

    initialize() {
        // color code
        const color = d3.scaleOrdinal(["#ff9aa2", "#ffb7b2", "#ffdac1", "#e2f0cb", "#b5ead7", "#bbf4ff", "#c7ceea", "#cacaca"]);
        
        // count language data
        const  LanguageData = {};
        for(var i = 0; i< this.data.length; i++){
            if(this.data[i].Language in LanguageData){
                LanguageData[this.data[i].Language] = LanguageData[this.data[i].Language] + 1;
            }
            else{
                LanguageData[this.data[i].Language] = 1;
            }
        }

        // sort data in desc order
        var sortable = [];
        for (var vehicle in LanguageData) {
            sortable.push([vehicle, LanguageData[vehicle]]);
        }
        sortable.sort(function(a, b) {
            return b[1] - a[1];
        });

        // make label, data(%)
        var label = [];
        var data = [];
        var num = 0;
        for(var i = 0; i < 7; i++){
            label.push(sortable[i][0]);
            data.push(sortable[i][1] / 10);
            num = num + sortable[i][1];
        }
        label.push("Etc.");
        data.push((1000 - num) / 10);
        this.label = label;

        // title, svg, container, legend setting
        this.svg = d3.select(this.svg)
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);
        this.container = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);  
        this.legend = this.svg.append("text")
            .attr("id", "language")
            .attr("font-size", "15px")
            .attr("fill", "grey")
            .attr("font-weight", "bold")
            .attr("transform", `translate(${50}, ${320})`); 
        this.title = this.svg.append("text")
            .text("Percentage of streamers by language")
            .attr("font-size", "15px")
            .attr("font-weight", "bold")
            .attr("transform", `translate(${10}, ${60})`); 

        // draw pie chart
        const pie = d3.pie();
        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(this.radius);
        const arcs = this.container
            .selectAll("arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc")
            .on("mouseover", onMouseOver)
            .on("mouseout", onMouseOut)
            .on("click", (event, i) =>{
                this.handleClick(event, i);
            });
            
        arcs.append("path")
            .attr("fill", (d, i) => color(i))
            .attr("d", arc);
        
        // percent label
        arcs.append("text")
            .attr("transform", (d) => `translate(${arc.centroid(d)})`)
            .text((d) => d.value+"%")
            .attr("font-size", "12px")
            .attr("fill", "#fff")
            .attr("text-anchor", "middle")
            .attr("display", "none");
            	
        // mouse over, out
        function onMouseOut(d, i) {
            d3.select(this)
                .select("path")
                .transition()
                .duration(200)
                .style("fill", color((i.index==0 || i.index==1)? (i.index==0? i.index : 7): i.index-1));
            d3.select(this).select("text").attr("display", "none");
            
            var div = document.getElementById('language');
            div.textContent = "";
        }

        function onMouseOver(d, i) {
            d3.select(this)
                .select("path")
                .transition()
                .duration(200)
                .style("fill", "#888888");
            d3.select(this).select("text").attr("display", "block");
           
            var div = document.getElementById('language');
            div.textContent = label[(i.index==0 || i.index==1)? (i.index==0? i.index : 7): i.index-1] + " " 
                + data[(i.index==0 || i.index==1)? (i.index==0? i.index : 7): i.index-1] + "%";
        }
    }
    
    getFilteredData(data, label, idx) {
        if(idx == 7){
            return data.filter(function(d) {
                return (d.Language != label[0]) && (d.Language != label[1]) &&
                (d.Language != label[2]) && (d.Language != label[3]) &&  
                (d.Language != label[4]) && (d.Language != label[5]) && 
                (d.Language != label[6]);
            });
        }
        else
            return data.filter(function(d) { return d.Language === label[idx]; });
    }
    
    handleClick (event, i){
        var idx = (i.index==0 || i.index==1)? (i.index==0? i.index : 7): i.index-1;

        if (this.handlers.click){
                this.handlers.click(this.getFilteredData(this.data, this.label, idx));
        }            
    };

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }

}
