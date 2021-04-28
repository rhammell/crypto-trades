# crypto-trades
Visualize cryptocurrency trades in real time. See a live demo [here](https://rhammell.github.io/crypto-trades/).

Trades for various Crypto/USD pairs are displayed on a scrolling timeline, where individual trades are each represented by a circle node. The size of the node is determined by the trade's size relative to the currency's daily trade volume. The color of the node is determined by its order side - green for buy orders, red for sell orders.

<p align="center">
  <img width="800" src="img/chart.gif">
</p>

New trades are added to the timeline as they are received, and the timeline shows the last 60 seconds of trade activity. Mouse over any node to see its timestamp and order size. 

Trade information is provided in real time by the the Coinbase Pro [websocket feed](https://docs.pro.coinbase.com/#websocket-feed). 