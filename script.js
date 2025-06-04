function calculate() {
  const symbol = document.getElementById("symbol").value.trim();
  const buyPrice = parseFloat(document.getElementById("buyPrice").value);
  const sellPrice = parseFloat(document.getElementById("sellPrice").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const broker = document.getElementById("broker").value;
  const tradeType = document.getElementById("tradeType").value;

  if (!symbol || isNaN(buyPrice) || isNaN(sellPrice) || isNaN(quantity)) {
    alert("Fill all fields correctly.");
    return;
  }

  const buyValue = buyPrice * quantity;
  const sellValue = sellPrice * quantity;
  const turnover = buyValue + sellValue;
  const grossPL = sellValue - buyValue;

  let brokerage = 0, stt = 0, exchTxn = 0.0000345 * turnover, sebi = 0.000001 * turnover, gst = 0, stampDuty = 0, dpCharge = 0;

  if (tradeType === 'intraday') {
    brokerage = Math.min(20, 0.0003 * turnover);
    stt = 0.00025 * turnover;
    stampDuty = 0.00003 * buyValue;
  } else {
    stt = 0.001 * sellValue;
    stampDuty = 0.00015 * buyValue;
    dpCharge = 13.5;
  }

  gst = 0.18 * (brokerage + exchTxn);
  const totalCharges = brokerage + stt + exchTxn + sebi + gst + stampDuty + dpCharge;
  const netPL = grossPL - totalCharges;

  const resultContainer = document.getElementById("resultContainer");
  const summary = netPL >= 0 ? `Profit of ₹${netPL.toFixed(2)}` : `Loss of ₹${Math.abs(netPL).toFixed(2)}`;
  resultContainer.innerHTML = `
    <p><strong>Gross P&L:</strong> ₹${grossPL.toFixed(2)}</p>
    <p><strong>Total Charges:</strong> ₹${totalCharges.toFixed(2)}</p>
    <p><strong>Net P&L:</strong> ${summary}</p>
    <button onclick="addToPortfolio()">✅ Add to Portfolio</button>
  `;
  resultContainer.style.display = "block";
}

function addToPortfolio() {
  const symbol = document.getElementById("symbol").value.trim();
  const buyPrice = parseFloat(document.getElementById("buyPrice").value);
  const sellPrice = parseFloat(document.getElementById("sellPrice").value);
  const quantity = parseInt(document.getElementById("quantity").value);
  const tradeType = document.getElementById("tradeType").value;

  const portfolio = JSON.parse(localStorage.getItem("portfolioLog")) || [];
  portfolio.push({ symbol, buyPrice, sellPrice, quantity, tradeType });
  localStorage.setItem("portfolioLog", JSON.stringify(portfolio));
  alert("Trade added to portfolio!");
}

function goToPortfolioPage() {
  window.location.href = "portfolio.html";
}
