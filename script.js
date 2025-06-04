let portfolio = JSON.parse(localStorage.getItem('portfolio')) || {};

function calculateTrade() {
  const symbol = document.getElementById('symbol').value.trim().toUpperCase();
  const type = document.getElementById('transactionType').value;
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseInt(document.getElementById('quantity').value);
  const broker = document.getElementById('broker').value;
  const tradeType = document.getElementById('tradeType').value;

  if (!symbol || isNaN(price) || isNaN(quantity) || quantity <= 0 || price <= 0) {
    alert("Please enter valid details.");
    return;
  }

  let charges = 0;
  let grossPL = 0;
  let netPL = 0;
  if (type === 'sell') {
    const match = (portfolio[symbol] || []).slice();
    let remaining = quantity;
    let totalCost = 0;
    while (match.length && remaining > 0) {
      const lot = match[0];
      const used = Math.min(lot.quantity, remaining);
      totalCost += used * lot.price;
      lot.quantity -= used;
      if (lot.quantity === 0) match.shift();
      remaining -= used;
    }
    grossPL = price * quantity - totalCost;
    const turnover = price * quantity + totalCost;
    charges = (0.0000345 + 0.000001) * turnover;
    const net = grossPL - charges;
    netPL = net.toFixed(2);
  }

  const result = document.getElementById('result');
  result.innerHTML = (type === 'buy')
    ? `Buy Entry: ₹${price} × ${quantity} = ₹${(price * quantity).toFixed(2)}`
    : (grossPL >= 0
      ? `Profit of ₹${grossPL.toFixed(2)}<br>Charges: ₹${charges.toFixed(2)}<br>Net Profit: ₹${netPL}`
      : `Loss of ₹${Math.abs(grossPL).toFixed(2)}<br>Charges: ₹${charges.toFixed(2)}<br>Net Loss: ₹${Math.abs(netPL)}`);

  result.style.display = 'block';
  document.getElementById('addButton').style.display = 'inline-block';
}

function addTrade() {
  const symbol = document.getElementById('symbol').value.trim().toUpperCase();
  const type = document.getElementById('transactionType').value;
  const price = parseFloat(document.getElementById('price').value);
  const quantity = parseInt(document.getElementById('quantity').value);

  if (type === 'buy') {
    if (!portfolio[symbol]) portfolio[symbol] = [];
    portfolio[symbol].push({ price, quantity });
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    alert("Buy trade saved to portfolio.");
  } else {
    alert("Sell trade is only used for calculation, not stored.");
  }

  location.reload();
}

if (document.getElementById('portfolioContent')) {
  const container = document.getElementById('portfolioContent');
  container.innerHTML = '';
  for (const [symbol, buys] of Object.entries(portfolio)) {
    const rows = buys.map(b => `<tr><td>${symbol}</td><td>Buy</td><td>₹${b.price.toFixed(2)}</td><td>${b.quantity}</td></tr>`).join("");
    container.innerHTML += `<table><thead><tr><th>Symbol</th><th>Type</th><th>Price</th><th>Quantity</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
}