const axios = require('axios');
const crypto = require('crypto');

const SYMBOL = "BTCUSDT"
const PERIOD = 14;
const QUANTITY = "0.001";

const API_URL =  "https://testnet.binance.vision"
// const API_URL =  "https://api.binance.com"

const API_KEY = "D9XstzcKw4Zflv1GrhWg7Ln0EZmw6zvEeoUeu9FnVYiiIMr9GThLL5ylKb1Qtgoc"

const SECRETE_KEY = "SujzZFJgVqbzDRqHI2WQ4vymdWg8m7A7gBxHRK8PrEPkfONflesFN8HmTKrDEj8Y"

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


async function newOrder(symbol, quantity, side){

  
    const order = { symbol, quantity, side };
    order.type = "MARKET";
    order.timestamp = Date.now();

    const signature = crypto.createHmac("sha256", SECRETE_KEY).update(new URLSearchParams(order).toString()).digest("hex");


order.signature = signature;

try{
    
    const { data } = await axios.post(
        API_URL + "/api/v3/order",
         new URLSearchParams(order).toString(),
    {
        headers: {"X-MBX-APIKEY": API_KEY}
    } 
)

console.log(data)

}catch(err){
    console.error(err.response.data);
}


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
    console.log("Já comprei? " + isOpened)

    newOrder(SYMBOL, QUANTITY, "BUY") 
    process.exit(0)

    // if(rsi < 30 && isOpened === false) {
    //     console.log("sobrevendido, hora de comprar")
    //     newOrder(SYMBOL, QUANTITY, "BUY")  
    //     isOpened = true;
    // }
    //     else if(rsi > 70 && isOpened === true) {
    //     console.log("sobrecomprado, hora de vender")
    //     newOrder(SYMBOL, QUANTITY, "SELL")
    //     isOpened = false;
    // } else
    
    //     console.log("aguardar")
    
        }
    
    



setInterval(start, 3000);

start();