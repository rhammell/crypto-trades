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
  "DAI-USD"
  ];

// Init trade data
var trades = []

// Init time offset
var offset = 0;

// SVG size params
var margin = {top: 50, right: 1, bottom: 50, left: 65};
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
svg.selectAll(".grid-line")
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
d3.interval(updateChart, 250);

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
  var dateStart = new Date(nowOffset.getTime() - 60*1000);
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
    return trade.time > timeExtent[0]
  })

  //console.log(trades.length)

  // Join trade data to cirle elements
  var circles = svg.selectAll('circle')
                  .data(trades, function(d){
                    return d;
                  });

  // Remove unbound data
  circles.exit().remove();

  // Create new cirle elements and update positions of existing ones
  circles.enter()
    .append('circle')
      .attr('class', d => d.side)
      .attr('r', d => r(d.last_size / d.volume_24h))
      .attr('cy', d => y(d.product_id) + y.bandwidth()/2)
      .on('mouseover', mouseover) 
      .on('mouseout', mouseout)
    .merge(circles)
      .attr('cx', d => x(d.time))
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
    data.time = new Date(data.time);
    trades.push(data)

    // Calc offset 
    var now = new Date();
    offset = data.time.getTime() - now.getTime();

    // Display time
    //$('#time').html(data.time + '<br>' + now);
  }
}

// Callback for mouse movment out of circle
function mouseout(d) {       
  d3.select(this)
    .classed('hover', false); 
}

// Callback for mouse movment out of circle
function mouseover(d) {        
  d3.select(this)
    .classed('hover', true); 
  console.log('hover')
}


