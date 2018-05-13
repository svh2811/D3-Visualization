var json_file = "database.json"

var month_select = $("#month");
month_select.on('change', function() {
    var candidate = $('input:radio[name=names]:checked').val();
    console.log("Month Changed: " + this.value)
    drawBars(candidate, this.value);
});

var svg_cloud = d3.select("#svg_cloud");
var margin = {top: 30, right: 50, bottom: 30, left: 50};
var innerWidth = svg_cloud.attr("width") - margin.left - margin.right;
var innerHeight = svg_cloud.attr("height") - margin.top - margin.bottom;

var g_cloud = null;

var xScale = null;        

var database = null;
var max_font = innerHeight/2
var color = d3.scaleOrdinal(d3.schemeCategory20);

function drawWordCloud(candidate) {
    addMask();
    
    if (g_cloud) {
        g_cloud.remove();
    }

    g_cloud = svg_cloud.append("g")
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

    var frequency_list = database[candidate].global_freq

    var max_frequency = database[candidate].max_word_freq
    
    xScale = d3.scaleLinear()
               .domain([1, max_frequency])
               .range([10, max_font]);

    d3.layout.cloud()
    .size([innerWidth, innerHeight])
    .timeInterval(20)
    .words(frequency_list)
    .fontSize(d => xScale(d.freq))
    .text(d => d.text)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .on("end", draw)
    .on("complete", removeMask)
    .start();

    var months = database[candidate]["months"]; 

    month_select
        .find('option')
        .remove();

    for (var i=0; i<months.length; i++) {
        month_select
            .append($("<option></option>")
            .attr("value", months[i])
            .text(months[i])); 
    }

    $("#month option[value='Sep']").prop('selected', true);
    drawBars(candidate, "Sep");
}

function draw(words) {
    g_cloud.append("g")
    .attr("width", innerWidth)
    .attr("height", innerHeight)
    .attr("class", "wordcloud")
    .append("g")
    .attr("transform", "translate(" + [innerWidth >> 1, innerHeight >> 1] + ")")
    .selectAll("text")
    .data(words)
    .enter()
    .append("text")
    .style("font-size", function(d) { 
        return xScale(d.freq) + "px";
    })
    .style("font-family", "Impact")
    .style("fill", function(d, i) {
        return color(i);
    })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(d => d.text)
    .on("mouseover", function(d){
        console.log("MOuse-Over")
        tooltip
        .style("left", d3.event.pageX - 70 + "px")
        .style("top", d3.event.pageY - 90 + "px")
        .style("display", "inline-block")
        .html("Token: " + (d.text) + "<br>" +
              "Freq: " + (d.freq));
    })
    .on("mouseout", function(d){
        tooltip.style("display", "none");
    });
}

function addMask() {
    $('#svg_cloud_div').ploading({action: 'show'});
    $('#svg_bar_div').ploading({action: 'show'});
    $("input[type=radio], select").prop("disabled", true);
}

function removeMask() {
    $('#svg_cloud_div').ploading({action: 'hide'});
    $('#svg_bar_div').ploading({action: 'hide'});
    $("input[type=radio], select").prop("disabled", false);
}


$('input:radio[name=names]').change(function() {
    console.log("Changed : " + this.value)
    drawWordCloud(this.value);
});

$.getJSON(json_file, function(data) {
    database = data;
    $("#clinton").prop("checked", true);
    drawWordCloud("clinton");
});


//##############################################################################

var svg_bar = d3.select("#svg_bar");

var margin_bar = {top: 20, right: 20, bottom: 30, left: 40};
var innerWidth_bar = +svg_bar.attr("width") - margin_bar.left - margin_bar.right;
var innerHeight_bar = +svg_bar.attr("height") - margin_bar.top - margin_bar.bottom;

var g_bar = null;

function drawBars(candidate, month) {
    if (g_bar) {
        g_bar.remove();
    }

    g_bar = svg_bar.append("g")
            .attr("transform",
             "translate(" + margin_bar.left + "," + margin_bar.top + ")");

    var x = d3.scaleBand()
        .range([0, innerWidth_bar])
        .padding(0.1);

    var y = d3.scaleLinear()
        .range([innerHeight_bar, 0]);

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);        

    var speeches = database[candidate]["speeches"];

    speeches = speeches.filter(function (speech) {
        return speech.month == month;
    });

    x.domain(speeches.map(function(d) { return d.place; }));
    y.domain([0, d3.max(speeches, function(d) { return d.token_freq; })]);

    g_bar
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + innerHeight_bar + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("y", 2)
    .attr("x", -10)
    .attr("dy", "1.00em")
    .attr("transform", "rotate(16)")
    .style("text-anchor", "start");

    g_bar
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Frequency");

    g_bar
    .selectAll(".bar")
    .data(speeches)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.place); })
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.token_freq); })
    .attr("height", function(d) { return innerHeight_bar - y(d.token_freq); })
    .on("mouseover", function(d){
        console.log("MOuse-Over")
        tooltip
        .style("left", d3.event.pageX - 95 + "px")
        .style("top", d3.event.pageY - 135 + "px")
        .style("display", "inline-block")
        .html("Token: " + (d.token_name) + "<br>" +
              "Freq: " + (d.token_freq) + "<br>" +
              "Month: " + (d.month) + "<br>" +
              "Place: " + (d.place));
    })
    .on("mouseout", function(d){
        tooltip.style("display", "none");
    });
}

// #####################################################

var tooltip = d3.select("body")
                .append("div")
                .attr("class", "toolTip");
