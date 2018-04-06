const margin = { left: 20, right: 175, top: 20, bottom: 20 };

const svg = d3.select('svg');
const width = svg.attr('width');
const height = svg.attr('height');
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

var euroToDollar = 1.24;
var mktPrice = d3.formatPrefix(["$", ".1"], 1e6);
var wage = d3.formatPrefix(["$", ".1"], 1e3);

const rowsPreProcessFn = d => {
	d.name = d.name;
	d.height = +d.height;
	d.weight = +d.weight;
	d.age = +d.age;
	d.overall = +d.overall;
	d.club = d.club;
	d.league = d.league;
	d.nationality = d.nationality;
	d.eur_value = mktPrice(+d.eur_value*euroToDollar);
	d.eur_wage = wage(+d.eur_wage*euroToDollar);
	d.eur_release_clause = mktPrice(+d.eur_release_clause*euroToDollar);
	d.potential = +d.potential;
	d.pac = +d.pac;
	d.sho = +d.sho;
	d.pas = +d.pas;
	d.dri = +d.dri;
	d.def = +d.def;
	d.phy = +d.phy;
	return d;
};

var selectData = [
	{"text": "Overall Rating", "value": "overall"},
	//{"text": "Height (cms)", "value": "height"},
	//{"text": "Weight (kg)", "value": "weight"},
	{"text": "Age", "value": "age"},
	//{"text": "Market Value (€)", "value": "eur_value"},
    //{"text": "Wage (€)", "value": "eur_wage"},
    //{"text": "Potential Rating", "value": "potential"},
    {"text": "Pace", "value": "pac"},
    {"text": "Shooting", "value": "sho"},
    {"text": "Passing", "value": "pas"},
	{"text": "Dribbling", "value": "dri"},
	{"text": "Defending", "value": "def"},
	{"text": "Physical", "value": "phy"}
]; 

d3.csv('fifa18-top5-league.csv', rowsPreProcessFn, rows => {
	
	var xInput = d3.select('#xSelect')
	.on('change',xChange)
	.selectAll('option')
	.data(selectData)
	.enter()
	.append('option')
	.attr('value', d => d.value)
	.text(d => d.text);

	var yInput = d3.select('#ySelect')
	.on('change',yChange)
	.selectAll('option')
	.data(selectData)
	.enter()
	.append('option')
	.attr('value', d => d.value)
	.text(d => d.text);

	const xValue = d => d.overall;
	const yValue = d => d.overall;

	//var g = svg.append('g')
	//	.attr('transform', `translate(${margin.left}, ${margin.top})`);

	var xScale = d3.scaleLinear()
				.domain(d3.extent(rows, xValue))
	    		.range([0,innerWidth]);

	var yScale = d3.scaleLinear()
				.domain(d3.extent(rows, yValue))
    			.range([innerHeight,0]);

	var xAxis = d3.axisBottom().scale(xScale);
	var yAxis = d3.axisLeft().scale(yScale);

	//https://stackoverflow.com/questions/38391411/what-is-the-d3-js-v4-0-equivalent-for-d3-scale-category10
	var color = d3.scaleOrdinal(d3.schemeCategory10);

	// X-axis
  	svg.append('g')
	.attr('class','axis')
	.attr('id','xAxis')
	.attr('transform', `translate(30, ${innerHeight})`)
	.call(xAxis)
	.append("text")
	.attr('id','xAxisLabel')
	.attr('class', 'axis-label')
	.attr("x", innerWidth)
	.attr("y", -10)
	.style("text-anchor", "end")
	.text("Overall Rating");

	//Y Axis
	svg.append('g')
	.attr('class','axis')
	.attr('id','yAxis')
	.attr('transform', `translate(30, 0)`)
	.call(yAxis)
	.append("text")
	.attr('id', 'yAxisLabel')
	.attr('class', 'axis-label')
	.attr('transform','rotate(-90)')
	.attr('x', -60)
    .attr('y', 20)
    .style('text-anchor','middle')
	.text('Overall Rating');	

	svg.selectAll('circle')
	.data(rows)
	.enter()
	.append('circle')
	.attr('transform', `translate(30, 0)`)
	.attr('class', 'data-circle')
	.attr("r", 3.5)
	.attr('cx', d => xScale(xValue(d)))
	.attr('cy', d => yScale(yValue(d)))
	.style("fill", d => color(d.league))
	.attr('fill-opacity', 0.5)
	.on('mouseover', function () {
		d3.select(this)
		.transition()
		.duration(500)
		.attr('r',20)
		.attr('stroke-width',3)
	})
	.on('mouseout', function () {
		d3.select(this)
		.transition()
		.duration(500)
		.attr('r',3.5)
		.attr('stroke-width',1)
	})
	.append('title') // Tooltip
	.text(function (d) { 
		return "Name: " +  d.name +
		'\nClub: ' + d.club +
		'\nCountry: ' + d.nationality +
		'\nPace: ' + d.pac +
		'\nDribbling.: ' + d.dri +
		'\nDefending: ' + d.def +
		'\nPhysical: ' + d.phy
	});

	var legend = svg.selectAll(".legend")
	.data(color.domain())
	.enter()
	.append("g")
	.attr("class", "legend")
	.attr("transform", (d, i) => "translate(175," + i * 20 + ")");

	legend.append("rect")
	.attr("x", innerWidth - 18)
	.attr("y", margin.top)
	.attr("width", 12)
	.attr("height", 12)
	.style("fill", color);

	legend.on("click", function(type) {
		// dim all of the icons in legend
		d3.selectAll(".legend").style("opacity", 0.1);
		
		// make the one selected be un-dimmed
		d3.select(this).style("opacity", 1);
		
		// select all dots and apply 0 opacity (hide)
		d3.selectAll(".data-circle")
		// .transition()
		// .duration(500)
		.style("opacity", 0.0)
		// filter out the ones we want to show and apply properties
		.filter(function(d) {
			return d["league"] == type;
		})
		.style("opacity", 1) // need this line to unhide dots
		//.style("stroke", "black")
		// apply stroke rule
		/*.style("fill", function(d) {
			if (d.hospital_expire_flag == 1) {
				return this
			} else {
				return "white"
			};
		});*/
	});

	legend.append("text")
	.attr("x", innerWidth - 24)
	.attr("y", margin.top + 10)
	.attr("font-size", 9)
	//.attr("dy", ".50em")
	.style("text-anchor", "end")
	.text(d => d);

	function xChange() {	
		// get the new x value
		var value = this.value;
		var textString = this.options[this.selectedIndex].text;
		
		// change the xScale
		xScale.domain([
			d3.min([0,d3.min(rows, d => d[value] )]),
			d3.max([0,d3.max(rows, d => d[value] )])
		]);

		// change the xScale
		xAxis.scale(xScale);
		
		// redraw the xAxis
		d3.select('#xAxis').call(xAxis);
		
		// change the xAxisLabel
		d3.select('#xAxisLabel').text(textString);
		
		// update the circles
		d3.selectAll('.data-circle').attr('cx', d => xScale(d[value]));
	}

	function yChange() {

		// get the new y value
		var value = this.value; 
		var textString = this.options[this.selectedIndex].text;

		// change the yScale
		yScale.domain([
			d3.min([0,d3.min(rows, d => d[value] )]),
			d3.max([0,d3.max(rows, d => d[value] )])
		]);

		// change the yScale
		yAxis.scale(yScale);
		
		// redraw the yAxis
		d3.select('#yAxis').call(yAxis);

		// change the yAxisLabel
		d3.select('#yAxisLabel').text(textString);

		// update the circles
		d3.selectAll('.data-circle').attr('cy', d => yScale(d[value]));
	}

	d3.select("#resetLegend").on('click',resetLegend);
	function resetLegend() {
		d3.selectAll(".legend").style("opacity", 1);
		d3.selectAll(".data-circle").style("opacity", 1)	
	}
});