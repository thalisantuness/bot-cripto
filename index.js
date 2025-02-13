const axios = require('axios');

const SYMBOL = "BTCUSDT"
const BUY_PRICE = 96068
const SELL_PRICE = 96090
const PERIOD = 14;

// "https://testnet.binance.vision"
const API_URL =  "https://api.binance.com"

function averages(prices, period,startIndex){
    let gains = 0, losses = 0;

    for(let i=0; i < period && (i + startIndex) < prices.length; i++){
        const diff = prices[i + startIndex] - prices[i+ startIndex-1];
        if(diff >= 0) 
            gains += diff;
        else
        losses += Math.abs(diff)
    }

    let avgGains = gains / period;
    let avgLosses = losses / period;

    return {avgGains, avgLosses};
}


function RSI(prices, period) {
    let avgGains = 0, avgLosses = 0;

    for(let i=1; i < prices.length ; i++){
      let newAverages = averages(prices, period, i);    

      if(i === 1){
        avgGains = newAverages.avgGains;
        avgLosses = newAverages.avgLosses;
        continue; 
      }

      avgGains = (avgGains *  (period - 1) + newAverages.avgGains) / period;
      avgLosses = (avgLosses * (period - 1) + newAverages.avgLosses) / period;
}


    const rs = avgGains / avgLosses;

    return 100 - (100 / (1 + rs));
    
}



let isOpened = false;

async function start(){
    const {data} = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL)

    const candle = data[data.length - 1]
    const lastPrice = parseFloat(candle[4])

    console.clear();
    console.log("Price " + lastPrice);

    const prices = data.map(k => parseFloat(k[4]))
    const rsi = RSI(prices, PERIOD)

    console.log("RSI: " + rsi)

    if(rsi < 30 && isOpened === false) {
        console.log("sobrevendido, hora de comprar")
        isOpened = true;
    }
        else if(rsi > 70 && isOpened === true) {
        console.log("sobrecomprado, hora de vender")
        isOpened = false;
    } else
    
        console.log("aguardar")
    
        }
    
    



setInterval(start, 3000);

start();