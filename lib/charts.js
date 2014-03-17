timeSeriesChart = function() {
  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 600,
      height = 300,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(6),
      yAxis = d3.svg.axis().scale(yScale).orient("left");
      area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y);

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      var yMin = d3.min(data, function(d) { return d[1]; });
      var yMax =  d3.max(data, function(d) { return d[1]; });
      var yDelta = yMax - yMin;
      var yPadding = yDelta * .1;


      // Update the y-scale.
      yScale
          .domain([yMin - yPadding, yMax + yPadding])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "y axis")
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("transform", "translate("+ (-35) +","+(height/2)+")rotate(-90)") 
              //.attr("y", 6)
              //.attr("dy", ".71em")
              .attr("text-anchor", "middle")
              .text("Average Price ($USD)");
      gEnter.append("g").attr("class", "x axis");


      // commented out 
      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // added for responsive
      // svg.attr("width", '100%')
      //    .attr("height", '100%')
      //    // examine the following line to see why the resize is triggered late
      //    .attr('viewBox','0 0 '+width+' '+height)
      //    .attr('preserveAspectRatio','xMinYMid')
         //.attr("transform", "translate(" + Math.min(width,height) / 2 + "," + Math.min(width,height) / 2 + ")");          

      // var aspect = width / height,
      //     chart = $("#avgChart");
      // $(window).on("resize", function() {
      //     var targetWidth = $("#avgChart").parent().width();
      //     chart.attr("width", targetWidth);
      //     chart.attr("height", targetWidth / aspect);
      // }).trigger("resize");   


      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]));

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);
      // Update the y-axis.
      g.select(".y.axis")
          .attr("transform", "translate(0," + xScale.range()[0] + ")")
          .call(yAxis);          
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}