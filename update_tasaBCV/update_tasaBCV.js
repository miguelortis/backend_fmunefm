const puppeteer = require("puppeteer");
const Rate = require("../models/rate");
//
const updateTasaBCV = async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto("http://www.bcv.org.ve/");
    await page.waitForSelector("#dolar");
    const divisa = await page.evaluate(() => {
      const element = {};
      element.currencyType = document.querySelector(
        "#dolar div div span"
      ).innerText;
      element.value = parseFloat(
        document
          .querySelector("#dolar div div div strong")
          .innerText.replace(",", ".")
      );
      element.date = document
        .querySelector(".date-display-single")
        .getAttribute("content");

      return element;
    });

    ///////////////////////////////////
    await browser.close();

    // console.log(divisa);
    ///////save in db, in the rate_bcv model

    const { date, value, currencyType } = divisa;

    const registrationDate = new Date()

    const response = await exchangeRate.updateOne(
      { currencyType: currencyType },
      {
        $set: {
          dateBCV: date,
          registrationDate: registrationDate,
          value: value,
          currencyType: currencyType,
        },
        $addToSet: {

          old_rates: [
            {
              dateBCV: date,
              registrationDate: registrationDate,
              value: value,
              currencyType: currencyType,
              updateType: "Automatico",
            },
          ],
        },
      },
    );
  } catch (error) {
    if (error) {
      console.log(error);
    }
  }
};
module.exports = updateTasaBCV;
