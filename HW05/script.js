if (typeof d3v4 == 'undefined') {
	d3v4 = d3;
}        

const json_file = "eu_emails_sampled2.json"

var select_dept = $('#select_dept');
select_dept
.append($("<option></option>")
.attr("value", -1).text("All")); 
// -1 i.e. All is default Option
$("#select_line option[value='-1']").prop('selected', true);

var slider = $("#freq-slider")
var slider_val = $("#slider-val")

var svg = d3.select("#svg_graph");
var margin = {top: 20, right: 20, bottom: 20, left: 20};
var innerWidth = svg.attr("width") - margin.left - margin.right;
var innerHeight = svg.attr("height") - margin.top - margin.bottom;

var gMain = svg.append('g').classed('g-main', true);

var rect = gMain.append('rect')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .style('fill', 'white')

var g_network = null;

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().id(function(d) { return d.id; }))
	.force("charge", d3.forceManyBody().distanceMax(innerWidth/4))
	.force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2));

var graph_nodes = null;

g_network = gMain.append("g")
.attr('transform', `translate(${margin.left}, ${margin.top})`);

var id_to_dept_map = Array();
var dept_hist = Array();
var data = Array();
var keys = null;

/*
 * =====================================================================
 * Bar Chart
 * =====================================================================
 */

var svg_bar = d3.select("#svg_bar");
var margin_bar = {top: 20, right: 20, bottom: 40, left: 60};
var innerWidth_bar = +svg_bar.attr("width") - margin_bar.left - margin_bar.right;
var innerHeight_bar = +svg_bar.attr("height") - margin_bar.top - margin_bar.bottom;

var x = d3.scaleBand()
		.rangeRound([0, innerWidth_bar]).padding(0.1);

var y = d3.scaleLinear()
		.rangeRound([innerHeight_bar, 0]);

var g_bar = null;
svg_bar.append("g")
    .attr("transform", "translate(" + margin_bar.left + "," + margin_bar.top + ")");

/*
 * =====================================================================
 * End Bar Chart
 * =====================================================================
 */

// the brush needs to go before the nodes so that it doesn't
// get called when the mouse is over a node
var gBrushHolder = g_network.append('g');
var gBrush = null;

var nodes = null;
var rects = null;

d3.json(json_file, function(graph) {

	for (var i=0; i<graph.nodes.length; i++) {
		var id = graph.nodes[i].id.toString();
		var dept_id = graph.nodes[i].dept_id.toString();
		id_to_dept_map[id] = dept_id;
	}

	for (var i=0; i<graph.links.length; i++) {
		var frm = graph.links[i].source.toString();
		var to = graph.links[i].target.toString();
		
		if (id_to_dept_map[frm] in dept_hist) {
			dept_hist[id_to_dept_map[frm]] += 1
		} else {
			dept_hist[id_to_dept_map[frm]] = 1
		}
		
		if (id_to_dept_map[to] in dept_hist) {
			dept_hist[id_to_dept_map[to]] += 1
		} else {
			dept_hist[id_to_dept_map[to]] = 1
		}
	}

	keys = Object.keys(dept_hist);
	for (var i=0; i<keys.length; i++) {
		data.push({
			letter: keys[i],
			frequency: dept_hist[keys[i]]
		});

		select_dept
		.append($("<option></option>")
		.attr("value", keys[i]).text("Dept #" + keys[i]));
	}

	var link = g_network.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(graph.links)
		.enter().append("line")
		.attr("stroke-width", function(d) { return d.value; });

	nodes = g_network.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(graph.nodes)
		.enter().append("circle")
		.attr("class", d => { return "circle-" + d.dept_id; })
		.attr("r", 5)
		.attr("fill", function(d) { return color(d.dept_id); })
		.call(d3.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended));

	nodes.append("title")
		.text(function(d) { 
			return "ID: " + d.id + "\n"
			+ "DeptId: " + d.dept_id;
		});

	simulation
		.nodes(graph.nodes)
		.on("tick", ticked);

	simulation.force("link")
		.links(graph.links);

	function ticked() {
		link
		.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });

		nodes
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; });
	}

	drawBars(data);

	slider.on('input', function() {
		limit = this.value;
		slider_val.html(limit);
		rects_bars = d3.selectAll("rect.bar");
		rects_bars.style("opacity", 0.1);

		rects_bars.filter(function(d, i) {
			return d.frequency <= limit;
		}).style("opacity", 1);
	});
});

function dragstarted(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
}

function dragged(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
}

function dragended(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
}

select_dept.on('change', function () {
	deptId = this.value;
	if (g_network) {
		if (deptId == -1) {
			d3.selectAll(".nodes circle")
			.attr("r", 5)
			.style("opacity", 1)
			.style("stroke", "white");
		} else {
			d3.selectAll(".nodes circle")
			.style("opacity", 0.1)
			.style("stroke", "white");

			d3.selectAll(".nodes circle.circle" + "-" + deptId)
			.attr("r", 7.5)
			.style("opacity", 1)
			.style("stroke", "black");
		}
	}
});

// Brushing Code
rect.on('click', () => {
    nodes.each(function(d) {
        d.selected = false;
        d.previouslySelected = false;
    });
    //debugger;
    nodes.classed("selected", false);
    //$("#select_line option[value='-1']").prop('selected', true);
    //select_OnChange(-1);
    drawBars(data);
});

function brushstarted() {
	// keep track of whether we're actively brushing so that we
	// don't remove the brush on keyup in the middle of a selection
	brushing = true;

	nodes.each(function(d) { 
	    d.previouslySelected = shiftKey 
	    && d.selected; 
	});
	console.log("Brushed");
}

function brushed() {
    if (!d3v4.event.sourceEvent) return;
    if (!d3v4.event.selection) return;

    var extent = d3v4.event.selection;

    nodes.classed("selected", function(d) {
        return d.selected = d.previouslySelected ^
        (extent[0][0] <= d.x && d.x < extent[1][0]
         && extent[0][1] <= d.y && d.y < extent[1][1]);
    });
}

function brushended() {
    if (!d3v4.event.sourceEvent) return;
    if (!d3v4.event.selection) return;
    if (!gBrush) return;

    gBrush.call(brush.move, null);

    if (!brushMode) {
        // the shift key has been release before we ended our brushing
        gBrush.remove();
        gBrush = null;
    }

    brushing = false;
	drawBars(get_selected_data());
	console.log("Brushing End...");
}

var brushMode = false;
var brushing = false;

var brush = d3v4.brush()
    .on("start", brushstarted)
    .on("brush", brushed)
    .on("end", brushended);

d3v4.select('body').on('keydown', keydown);
d3v4.select('body').on('keyup', keyup);

var shiftKey;

function keydown() {
    shiftKey = d3v4.event.shiftKey;

    if (shiftKey) {
        // if we already have a brush, don't do anything
        if (gBrush)
            return;

        brushMode = true;

        if (!gBrush) {
            gBrush = gBrushHolder.append('g');
            gBrush.call(brush);
        }
    }
}

function keyup() {
    shiftKey = false;
    brushMode = false;

    if (!gBrush)
        return;

    if (!brushing) {
        // only remove the brush if we're not actively brushing
        // otherwise it'll be removed when the brushing ends
        gBrush.remove();
        gBrush = null;
    }
}

function drawBars(new_data) {
	console.log("Redrawing bars...");
	if (g_bar) {
		g_bar.remove();
	}

	g_bar = svg_bar.append("g")
    		.attr("transform",
    			"translate(" + margin_bar.left + "," + margin_bar.top + ")");

	x.domain(new_data.map(d => d.letter));
	var frequency_range = [0, d3.max(new_data, d => d.frequency)]
	y.domain(frequency_range);

	slider.attr("max", frequency_range[1]);
	slider.attr("value", frequency_range[1]);
	slider_val.html(frequency_range[1]);

	g_bar.selectAll(".bar")
	.data(new_data)
	.enter().append("rect")
	.attr("class", "bar")
	.attr("x", d => x(d.letter))
	.attr("y", d => y(d.frequency))
	.attr("width", x.bandwidth())
	.attr("height", d => (innerHeight_bar - y(d.frequency)));

	g_bar.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0," + innerHeight_bar + ")")
	.call(d3.axisBottom(x))
	.append("text")
	.attr("text-anchor", "end")
	.style('fill', 'black')
	.attr("x", innerWidth - 40)
	.attr("y", 30)
	.text("Department Numbers");

	g_bar.append("g")
	.attr("class", "axis axis--y")
	.call(d3.axisLeft(y))
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", "0.71em")
	.attr("text-anchor", "end")
	.style('fill', 'black')
	.text("Frequency");
}

function get_selected_data() {
	var selected_data = new Array();

	var nodes = d3.selectAll("circle.selected");
	var dept_hist = new Array(); 		

	keys.forEach(function(key) {
		dept_hist[key] = 0
	});

	nodes.select(function(d, i) {
		var id = d.id.toString();
		dept_hist[id_to_dept_map[id]] += 1
	});

	keys.forEach(function(key) {
		selected_data.push({
			letter: key,
			frequency: dept_hist[key]
		});
	});

	return selected_data;
}