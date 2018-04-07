csv_file = "googl.csv"

var select_l = $('#select_line');
var select_r = $('#select_radial');

for (var i=2006; i<=2016; i++) {
	select_l.append($("<option></option>").attr("value",i).text(i)); 
	select_r.append($("<option></option>").attr("value",i).text(i));
}

// 2016 is default selected year
$("#select_line option[value='2016']").prop('selected', true);
$("#select_radial option[value='2016']").prop('selected', true);

/**
 * ===============================================================
 *						Line Graph Code
 * =============================================================== 
 */

var svg = d3.select("#svg_line");
var margin = {top: 20, right: 20, bottom: 30, left: 50};
var innerWidth = svg.attr("width") - margin.left - margin.right;
var innerHeight = svg.attr("height") - margin.top - margin.bottom;
const parseTime = d3.timeParse("%Y-%m-%d");
var bisectDate = d3.bisector(d => d.date).left;

var formatTime = d3.timeFormat("%B %d, %Y");

var g = null;

var x = d3.scaleTime().rangeRound([0, innerWidth]);
var y = d3.scaleLinear().rangeRound([innerHeight, 0]);

var line = d3.line()
			.x(d => x(d.date))
			.y(d => y(d.close));

const rowsPreProcessFn = d => {
	d.date = parseTime(d.date);
	d.close = +d.close;
	d.high = +d.high;
	d.low = +d.low;
	d.open = +d.open;
	d.volume = +d.volume;
	return d;
};

function drawLineGraph(year) {

	if (g) {
		g.remove();
	}

	g = svg.append("g")
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

	d3.csv(csv_file, rowsPreProcessFn, data => {
		data = data.filter( function (d) {
    		return d.date.getFullYear() == year;
		});
		
		x.domain(d3.extent(data, d => d.date));
		y.domain(d3.extent(data, d => d.close));

		g.append("g")
		.attr("transform", "translate(0," + innerHeight + ")")
		.call(d3.axisBottom(x));

		g.append("g")
		.call(d3.axisLeft(y))
		.append("text")
		.attr("fill", "black")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", "0.71em")
		.attr("text-anchor", "end")
		.text("Stock Price ($)");

		g.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-linejoin", "round")
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 1.5)
		.attr("d", line);

		var focus = g.append("g")
		        .attr("class", "focus")
		        .style("display", "none");

	    focus.append("line")
	        .attr("class", "x-hover-line hover-line")
	        .attr("y1", 0)
	        .attr("y2", innerHeight);

	    focus.append("line")
	        .attr("class", "y-hover-line hover-line")
	        .attr("x1", innerWidth)
	        .attr("x2", innerWidth);

	    focus.append("circle")
	        .attr("r", 7.5);

	    focus.append("text")
	        .attr("x", 15)
	      	.attr("dy", ".31em");

	    svg.append("rect")
	        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	        .attr("class", "overlay")
	        .attr("width", innerWidth)
	        .attr("height", innerHeight)
	        .on("mouseover", function() { 
	        	focus.style("display", null);
	        })
	        .on("mouseout", function() { 
	        	focus.style("display", "none"); 
	        })
	        .on("mousemove", mousemove);

	    function mousemove() {
			var x0 = x.invert(d3.mouse(this)[0]),
			i = bisectDate(data, x0, 1),
			d0 = data[i - 1],
			d1 = data[i],
			d = x0 - d0.year > d1.year - x0 ? d1 : d0;

			x_n = x(d.date);
			y_n = y(d.close);

			focus.attr("transform",
			"translate(" + x_n + "," + y_n + ")");
			
			focus.select("text").text(function() {
				return "Date: " +  formatTime(d.date) +
				'\nClose: ' + d.close +
				'\nHigh: ' + d.high +
				'\nLow: ' + d.low +
				'\nOpen: ' + d.open +
				'\nVolume: ' + d.volume;
			});
			
			focus
			.select(".x-hover-line")
			.attr("y2", innerHeight - y(d.close));
			
			focus
			.select(".y-hover-line")
			.attr("x2", innerHeight + innerWidth);
	    }
	});
}


select_l.on('change', function() {
	drawLineGraph(this.value);
});

drawLineGraph("2016");

/**
 * ===============================================================
 *						Radial Graph Code
 * =============================================================== 
 */

const svg_radial = d3.select("#svg_radial");
var margin_r = {top: 20, right: 20,	bottom: 20,	left: 20};
var innerWidth_r = svg_radial.attr("width") - margin.left - margin.right;
var innerHeight_r = svg_radial.attr("height") - margin.top - margin.bottom;

var g_r = null;
svg_radial.append("g")
			.attr("transform", 
			"translate(" + innerWidth_r / 2 + "," + innerHeight_r / 2 + ")");
    
const innerRadius = 100; 
const outerRadius = Math.min(innerWidth_r, innerHeight_r) / 2 - 6;
const fullCircle = 2 * Math.PI;

const formatMonth = d3.timeFormat("%b"); 
const xScale = d3.scaleTime().range([0, fullCircle]);
const yScale = d3.scaleRadial().range([innerRadius, outerRadius]);

var lineScale = d3.lineRadial()
					.angle(d => xScale(d.date))
					// x: angle in radians; 0 at -y (12 o'clock)
					.radius(d => yScale(d.close));
					// y: distance from origin (0,0)

function drawRadialGraph(year) {

	if (g_r) {
		g_r.remove();
	}

	g_r = svg_radial.append("g")
			.attr("transform", 
			"translate(" + innerWidth_r / 2 + "," + innerHeight_r / 2 + ")");

	d3.csv(csv_file, rowsPreProcessFn, data => {
    	
    	data = data.filter( function (d) {
    		return d.date.getFullYear() == year;
		});

		xScale.domain(d3.extent(data, d => d.date));
		yScale.domain(d3.extent(data, d => d.close));
		    
		var linePlot = g_r.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "#4099ff")
		.attr("d", lineScale);
		
		var yAxis = g_r.append("g")
		.attr("text-anchor", "middle");

		var yTick = yAxis
		.selectAll("g")
		.data(yScale.ticks(5))
		.enter().append("g");

		yTick.append("circle")
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("opacity", 0.2)
		.attr("r", yScale);
		    
		yAxis.append("circle")
		.attr("fill", "none")
		.attr("stroke", "black")
		.attr("opacity", 0.2)
		.attr("r", function() { 
			return yScale(yScale.domain()[0])
		});

		yTick.append("text")
		.attr("y", d => -yScale(d))
		.attr("dy", "0.35em")
		.text(d => "$" + d);
		    
		var xAxis = g_r.append("g");

		var xTick = xAxis
		.selectAll("g")
		.data(xScale.ticks(12))
		.enter().append("g")
		.attr("text-anchor", "middle")
		.attr("transform", function(d) {
			return "rotate(" + ((xScale(d)) * 180 / Math.PI - 90) + ")" +
				" translate (" + innerRadius + ",0)";
		});

		xTick.append("line")
		.attr("x2", -5)
		.attr("stroke", "#000");

		xTick.append("text")
		.attr("transform", function(d) { 
		    var angle = xScale(d); 
		    return ((angle < Math.PI / 2) || (angle > (Math.PI * 3 / 2))) ?
		    	"rotate(90)translate(0,22)" : "rotate(-90)translate(0, -15)";
		})
		.text(d => formatMonth(d))
		.style("font-size", 10)
		.attr("opacity", 0.6)
		    
		var title = g_r.append("g")
		.attr("class", "title")
		.append("text")
		.attr("dy", "-0.2em")
		.attr("text-anchor", "middle")
		.text("Google")
		    
		var subtitle = g_r.append("text")
		.attr("dy", "1em")
		.attr("text-anchor", "middle")
		.attr("opacity", 0.6)
		.text(year);
	});
}

select_r.on('change', function() {
	drawRadialGraph(this.value);
});

drawRadialGraph("2016");

