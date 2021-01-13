// Create a tooltip
var tooltip = d3.select("body").append("div")    
    .attr("id", "tooltip")                
    .style("opacity", 0);

var product_ids = [
    "BTC-USD",
    "ETH-USD",
    "XRP-USD",
    "XLM-USD",
    "LTC-USD",
    "BCH-USD",
    "ZRX-USD",
    "ALGO-USD",
    "EOS-USD",
    "DASH-USD",
    "OXT-USD",
    "MKR-USD",
    "ATOM-USD",
    "XTZ-USD",
    "ETC-USD",
    "OMG-USD",
    "LINK-USD",
    "REP-USD",
    "DAI-USD",
  "EOS-USD"
  ];

// Init trade data
var trades = []

// Init time offset
var offset = undefined;

// SVG size params
var margin = {top: 40, right: 1, bottom: 50, left: 65};
var width = 960;
var height = product_ids.length * 40;

// Define canvas
var svg = d3.select("#chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create fill elements
svg.append('defs')
  .append('clipPath')
    .attr('id', 'clipper')
    .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)

// Set scaling functions
var x = d3.scaleTime()
          .range([0, width])
          .domain(getTimeExtent())

var y = d3.scaleBand()
          .range([0,height])
          .domain(product_ids)

var r = d3.scaleSqrt()
          .domain([0.0,1.0])
          .range([0,height])
          .exponent(0.4)

// Set axes
var xAxisBottom = d3.axisBottom().scale(x);
var xAxisTop = d3.axisTop().scale(x);
var yAxis = d3.axisLeft().scale(y);

// Right border
svg.append("g")
   .append("line")
      .attr("class","border")
      .attr('x1', width)
      .attr('x2', width)
      .attr('y1', 0)
      .attr('y2', height)

// Add grid lines
svg.append("g")
    .attr('id', 'grid-lines')
  .selectAll(".grid-line")
  .data(product_ids)
  .enter().append("line")
      .attr("class","grid-line")
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d =>y(d) + y.bandwidth()/2)
      .attr('y2', d =>y(d) + y.bandwidth()/2)

// Add bottom x axis elments
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr('id', 'xAxisBottom')
    .attr("class", "axis")
    .call(xAxisBottom);

// Add top x axis elments
svg.append("g")
    .attr('id', 'xAxisTop')
    .attr("class", "x axis")
    .call(xAxisTop);

// Add y axis element
svg.append("g")
    .attr('id', 'yAxis')
    .attr("class", "axis")
    .call(yAxis);

// Set interval callback
d3.interval(updateChart, 100);

// CBPro websocket url
var url = 'wss://ws-feed.pro.coinbase.com';
var webSocket = new WebSocket(url);

// Define websocket data to subscribe to 
var subscription = {
  "type": "subscribe",
  "channels": [
    {
      "name": "ticker",
      "product_ids": product_ids
    }
  ]
}

// Return time extent to update axis    
function getTimeExtent(){
  var now = new Date();
  var nowOffset = new Date(now.getTime() + offset);
  var dateStart = new Date(nowOffset.getTime() - 120*1000);
  return [dateStart, nowOffset]
}

// Update chart axis and data positions
function updateChart() {

  // Update x axis with new times
  timeExtent = getTimeExtent()
  x.domain(timeExtent)
  d3.select('#xAxisBottom').call(xAxisBottom)
  d3.select('#xAxisTop').call(xAxisTop)

  // Filter out trades that are outside timeline
  trades = trades.filter(function(trade){
    return trade.dateObj > timeExtent[0]
  })

  // Join trade data to cirle elements
  var circles = svg.selectAll('circle')
                  .data(trades, d => d.trade_id);

  // Remove unbound elements
  circles.exit().remove();

  // Create new cirle elements and update positions of existing ones
  circles.enter()
    .append('circle')
      .attr('class', d => d.side)
      .attr('r', d => r(d.last_size / d.volume_24h))
      .attr('cy', d => y(d.product_id) + y.bandwidth()/2)
      .on('mouseenter', mouseenter) 
      .on('mouseout', mouseout)
      .on('mousemove', mousemove)
    .merge(circles)
      .attr('cx', d => x(d.dateObj))
}

// Send subscription data
webSocket.onopen = function (event) {
  webSocket.send(JSON.stringify(subscription));
};

// Handle incoming messages
webSocket.onmessage = function (event) {
  
  // Parse message JSON
  var data = JSON.parse(event.data)

  // Process ticker messages
  if (data.type == 'ticker') {

    // Add message data to trades
    data.dateObj = new Date(data.time);
    trades.push(data)

    // Define offset
    if (offset == undefined) {
      var now = new Date();
      offset = data.dateObj.getTime() - now.getTime();
    }
  }
}

// Callback for mouse movment out of circle
function mouseout(d) {  
  
  // Toggle hover class     
  d3.select(this)
    .classed('hover', false); 

  // Hide tooltip
  tooltip
    .html("") 
    .style("opacity", 0); 
}

// Callback for mouse movment out of circle
function mouseenter(d) {  

  // Toggle hover class      
  d3.select(this)
    .classed('hover', true); 

  // Update tooltip content and position
  var matrix = getMatrix(this);
  var radius = parseFloat(this.getAttribute('r'));
  var ms = d.dateObj.getMilliseconds();
  var timeSting = d.dateObj.toLocaleTimeString().replace(' ','.' + ms + ' ')
  
  tooltip
    .html("<p><strong>" + d.product_id + "</strong></p>" + 
          "<p>Time: " + timeSting + "</p>" + 
          "<p>Size: " + d.last_size + "</p>") 
    .style("left", (window.pageXOffset + matrix.e - $("#tooltip").outerWidth() / 2) + "px")
    .style("top", (window.pageYOffset + matrix.f  + radius + 3) + "px")
    .style("opacity", 1)
}

// Callback for mouse movement in
function mousemove(d) {  
  
  // Update tooltip position
  var matrix = getMatrix(this);

  tooltip
    .style("left", (window.pageXOffset + matrix.e - $("#tooltip").outerWidth() / 2) + "px")

 }

// Calculate matrix for mouse offset
function getMatrix(circle) {
  var matrix = circle.getScreenCTM()
    .translate(+ circle.getAttribute("cx"), + circle.getAttribute("cy")); 

  return matrix
}

