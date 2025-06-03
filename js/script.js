const portfolioKey = 'stockPortfolio';

// Load portfolio from localStorage or empty array
let portfolio = JSON.parse(localStorage.getItem(portfolioKey)) || [];

function calculatePL(trade) {
  const {buyPrice, sellPrice, quantity, broker, tradeType} = trade;

  const buyValue = buyPrice * quantity;
  const sellValue = sellPrice * quantity;
  const turnover = buyValue + sellValue;
  const grossPL = sellValue - buyValue;

  let brokerage = 0;
  let stt = 0;
  let exchTxn = 0.0000345 * turnover;
  let sebi = 0.000001 * turnover;
  let gst = 0;
  let stampDuty = 0;
  let dpCharge = 0;

  if (tradeType === 'intraday') {
    brokerage = Math.min(20, 0.0003 * turnover);
    stt = 0.00025 * turnover;
    stampDuty = 0.00003 * buyValue;
  } else {
    brokerage = 0;
    stt = 0.001 * sellValue;
    stampDuty = 0.00015 * buyValue;
    dpCharge = 13.5;
  }

  gst = 0.18 * (brokerage + exchTxn);
  const totalCharges = brokerage + stt + exchTxn + sebi + gst + stampDuty + dpCharge;
  const netPL = grossPL - totalCharges;

  return { grossPL, totalCharges, netPL };
}

function formatPL(value) {
  if (value > 0) return `Profit of ₹${value.toFixed(2)}`;
  else if (value < 0) return `Loss of ₹${Math.abs(value).toFixed(2)}`;
  else return `Break-even`;
}

function renderPortfolio() {
  const tbody = document.getElementById('portfolioBody');
  tbody.innerHTML = '';

  if (portfolio.length === 0) {
    document.getElementById('portfolioTable').style.display = 'none';
    document.getElementById('totalProfit').style.display = 'none';
    return;
  }

  document.getElementById('portfolioTable').style.display = 'table';
  document.getElementById('totalProfit').style.display = 'block';

  let totalNetPL = 0;

  portfolio.forEach((trade, index) => {
    const {grossPL, totalCharges, netPL} = calculatePL(trade);
    totalNetPL += netPL;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${trade.symbol.toUpperCase()}</td>
      <td>₹${trade.buyPrice.toFixed(2)}</td>
      <td>₹${trade.sellPrice.toFixed(2)}</td>
      <td>${trade.quantity}</td>
      <td>${trade.broker}</td>
      <td>${trade.tradeType}</td>
      <td>${formatPL(grossPL)}</td>
      <td>₹${totalCharges.toFixed(2)}</td>
      <td>${formatPL(netPL)}</td>
      <td><button class="remove-btn" onclick="removeFromPortfolio(${index})">Remove</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('totalProfit').innerHTML = `Total Net P&L: ${formatPL(totalNetPL)}`;
}

// Add trade to portfolio and render
function addToPortfolio() {
  const symbol = document.getElementById('symbol').value.trim();
  const buyPrice = parseFloat(document.getElementById('buyPrice').value);
  const sellPrice = parseFloat(document.getElementById('sellPrice').value);
  const quantity = parseInt(document.getElementById('quantity').value);
  const broker = document.getElementById('broker').value;
  const tradeType = document.getElementById('tradeType').value;

  if (!symbol || isNaN(buyPrice) || isNaN(sellPrice) || isNaN(quantity)) {
    alert('Please fill all fields correctly.');
    return;
  }

  if (buyPrice <= 0 || sellPrice <= 0 || quantity <= 0) {
    alert('Buy price, Sell price and Quantity must be positive numbers.');
    return;
  }

  // Confirm before adding
  if (!confirm('Do you want to add this trade to your portfolio?')) return;

  portfolio.push({ symbol, buyPrice, sellPrice, quantity, broker, tradeType });
  localStorage.setItem(portfolioKey, JSON.stringify(portfolio));
  renderPortfolio();

  // Clear inputs
  document.getElementById('symbol').value = '';
  document.getElementById('buyPrice').value = '';
  document.getElementById('sellPrice').value = '';
  document.getElementById('quantity').value = '';
}

// Calculate current input without adding to portfolio
function calculateCurrent() {
  const symbol = document.getElementById('symbol').value.trim();
  const buyPrice = parseFloat(document.getElementById('buyPrice').value);
  const sellPrice = parseFloat(document.getElementById('sellPrice').value);
  const quantity = parseInt(document.getElementById('quantity').value);
  const broker = document.getElementById('broker').value;
  const tradeType = document.getElementById('tradeType').value;

  if (!symbol || isNaN(buyPrice) || isNaN(sellPrice) || isNaN(quantity)) {
    alert('Please fill all fields correctly to calculate.');
    return;
  }

  if (buyPrice <= 0 || sellPrice <= 0 || quantity <= 0) {
    alert('Buy price, Sell price and Quantity must be positive numbers.');
    return;
  }

  const trade = { symbol, buyPrice, sellPrice, quantity, broker, tradeType };
  const { grossPL, totalCharges, netPL } = calculatePL(trade);

  alert(
    `For ${symbol.toUpperCase()}:
` +
    `Gross P&L: ${formatPL(grossPL)}
` +
    `Total Charges: ₹${totalCharges.toFixed(2)}
` +
    `Net P&L: ${formatPL(netPL)}`
  );
}

function removeFromPortfolio(index) {
  portfolio.splice(index, 1);
  localStorage.setItem(portfolioKey, JSON.stringify(portfolio));
  renderPortfolio();
}

// Detect and apply dark mode on page load based on user preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
} else {
  document.documentElement.setAttribute('data-theme', 'light');
}

// Initial render
renderPortfolio();
