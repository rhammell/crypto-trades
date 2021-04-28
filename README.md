# crypto-trades
Visualize cryptocurrency trades in real time. See a live demo [here](https://rhammell.github.io/crypto-trades/).

Trades for various Crypto/USD pairs are displayed on a scrolling timeline, where individual trades are each represented by a circle node. The size of the node is relative to the trade's size compared to the currency's daily volume. The color of the cirle is determined by its order side - green for buy orders, red for sell orders.

New trades are added to the timeline as they are recieved, and the timeline shows the last 60 seconds of trade activity. Mouse over any node to see its timestamp and order size. 

Trade information is provided in real time by the the Coinbase Pro [websocket feed](https://docs.pro.coinbase.com/#websocket-feed). 

<p align="center">
  <img width="800" src="img/chart.gif">
</p>