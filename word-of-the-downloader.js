const request = require("request-promise");
const cheerio = require("cheerio");
const moment = require("moment");
const sleep = require("await-sleep");

const getIn = require("immutable").getIn;

let start_day = moment("2010-01-01");
const end_day = moment("2010-01-03");

const oxford_host = "https://od-api.oxforddictionaries.com";
const entries_endpoint = "/api/v1/entries/en/";
const headers = {
  Accept: "application/json",
  app_id: "6fa85e4d",
  app_key: "df9b90fe9cbf1b5117e86ec2a61ef216"
};

const css_selector = ".word-and-pronunciation h1";
module.exports = async () => {
  console.log(
    "Job started. Will fetch data within the range " +
      start_day.format("YYYY-MM-DD") +
      " and " +
      end_day.format("YYYY-MM-DD")
  );

  while (start_day.isBefore(end_day)) {
    const url =
      "https://www.merriam-webster.com/word-of-the-day/" +
      start_day.format("YYYY-MM-DD");

    let word;
    try {
      const body = await request.get(url);
      $ = cheerio.load(body);
      links = $(css_selector);
      $(links).each(function(i, link) {
        word = $(link).text();
        console.log(word);
      });
    } catch (error) {
      console.log("Failed to fetch the word of the day at " + url);
    }

    await sleep(1000);

    const options = {
      url: oxford_host + entries_endpoint + "voracity",
      headers: headers
    };
    const body = await request.get(options);
    const bodyAsJSON = JSON.parse(body);

    const results = getIn(bodyAsJSON, ["results"]);
    let result;
    if (Array.isArray(results) && results.length) {
      result = results[0];
    }

    const lexicalEntries = getIn(result, ["lexicalEntries"]);
    let lexicalEntry;
    if (Array.isArray(lexicalEntries) && lexicalEntries.length) {
      lexicalEntry = lexicalEntries[0];
    }

    const entries = getIn(lexicalEntry, ["entries"]);
    let entry;
    if (Array.isArray(entries) && entries.length) {
      entry = entries[0];
    }

    const senses = getIn(entry, ["senses"]);

    console.log(senses);

    // Write to file.

    start_day = start_day.add(1, "d");
  }

  return "Execution Complete. (This return value will be used by make-runnable)";
};

require("make-runnable/custom")({
  printOutputFrame: false
});
