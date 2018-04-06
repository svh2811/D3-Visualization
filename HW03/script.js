const margin = { left: 20, right: 20, top: 20, bottom: 20 };

const svg = d3.select('svg');
const width = svg.attr('width');
const height = svg.attr('height');
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

var bInput = d3.select('#bSelect').on('change', bChange);

var active = d3.select(null);

var projection = d3.geoWinkel3()
				.scale(227)
				.translate([innerWidth / 2, innerHeight / 2])
				.precision(.1);

var path = d3.geoPath().projection(projection);
var graticule = d3.geoGraticule();

var zoom = d3.zoom()
	.scaleExtent([1, 8])
	.on("zoom", zoomed);

svg.on("click", stopped, true);

svg.append("rect")
	.attr("class", "background")
	.attr("width", "100%")
	.attr("height", "100%")
	.on("click", reset);

var g = svg.append("g");

svg.call(zoom); 

var tooltip = d3.select("table");

d3.json("world-50m.json", function (world) {

	var countries = topojson.feature(world, world.objects.countries).features;
	var neighbors = topojson.neighbors(world.objects.countries.geometries);

	g.selectAll("path")
		.data(countries)
		.enter().append("path")
		.attr("d", path)
		.attr("class", "feature")
		.on("click", clicked);

	g.append("path")
		.datum(topojson.mesh(world, world.objects.countries, function(a, b) {
			return a !== b; 
		}))
		.attr("class", "mesh")
		.attr("d", path);

	// This is important to order data-point drawing order
	// i.e. draw points on top of world map not otherwise
	d3.csv('data_cs.csv', rows => {
		plotPoints(rows, "count");
	});
});

function clicked(d) {
	if (active.node() === this) {
		return reset();
	}
		
	active.classed("active", false);
	active = d3.select(this).classed("active", true);

	var bounds = path.bounds(d),
	dx = bounds[1][0] - bounds[0][0],
	dy = bounds[1][1] - bounds[0][1],
	x = (bounds[0][0] + bounds[1][0]) / 2,
	y = (bounds[0][1] + bounds[1][1]) / 2,
	scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
	translate = [width / 2 - scale * x, height / 2 - scale * y];

	svg.transition()
		.duration(750)
		.call(zoom.transform,
			d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
}

function reset() {
	active.classed("active", false);
	active = d3.select(null);

	svg.transition()
		.duration(750)
		.call( zoom.transform, d3.zoomIdentity );
}

function zoomed() {
	g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
	g.attr("transform", d3.event.transform);
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
	if (d3.event.defaultPrevented) {
		d3.event.stopPropagation();
	}
}

function bChange() {

	var value = this.value; 
	var prop = this.options[this.selectedIndex].value;

	g.selectAll("circle.bubble").remove();

	d3.csv('data_cs.csv', rows => {
		plotPoints(rows, prop);
	});
}

function plotPoints(rows, prop) {
	console.log("Plotting Points : " + prop);

	var radius = d3.scaleSqrt()
	.domain(d3.extent(rows, d => +d[prop]))
	.range([1, 10]);

	g.selectAll("circle")
	.data(rows)
	.enter()
	.append("circle")
	.attr("class", "bubble")
	.attr("cx", d => projection([+d.longitude, +d.latitude])[0])
	.attr("cy", d => projection([+d.longitude, +d.latitude])[1])
	.attr("r", d => radius(+d[prop]))
	.on("mouseover", function (d) {
		for (var property in d) {
			if (property === "longitude" || property === "latitude") {
				continue;
			}
			d3.select("#" + property).text(d[property]);
		}
		return tooltip.style("display", "inline-block");
	})
	.on("mousemove", function () {
		return tooltip.style("top", (event.pageY - 10) + "px")
					.style("left", (event.pageX + 10) + "px");
	})
	.on("mouseout", function () {
		return tooltip.style("display", "none");
	});
}