// services/currencyService.js

const { Currency, ExchangeRate } = require('../models');
const { get } = require('../routes');

async function getCurrencyByCode(code) {
  try {
    const currency = await Currency.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!currency) {
      throw new Error(`Currency with code ${code} not found.`);
    }

    return currency;
  } catch (err) {
    console.error('Error reading currency info:', err.message);
    throw err;
  }
}

async function getExchangeRate(currencyId, date) {
  try {
    const record = await ExchangeRate.findOne({
      where: {
        currency_id: currencyId,
        date: date,
      }
    });

    if (!record) {
      throw new Error(`Exchange rate not found for currency_id=${currencyId} on date=${date}`);
    }

    return record;
  } catch (err) {
    console.error('Error reading exchange rate:', err.message);
    throw err;
  }
}

module.exports = {
  getCurrencyByCode,
  getExchangeRate,
};