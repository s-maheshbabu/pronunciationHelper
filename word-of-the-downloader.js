const request = require("request-promise");
const cheerio = require("cheerio");
const moment = require("moment");
const sleep = require("await-sleep");
const R = require("ramda");
const jsonfile = require("jsonfile");
const Map = require("immutable").Map;

let start_day = moment("2009-12-31");
const end_day = moment("2010-01-01");

const oxford_host = "https://od-api.oxforddictionaries.com";

const file = "data_2010.json";

const headers = {
  Accept: "application/json",
  app_id: "6fa85e4d",
  app_key: "df9b90fe9cbf1b5117e86ec2a61ef216"
};

let number_of_words_processed = 0;
let number_of_words_saved = 0;

const css_selector = ".word-and-pronunciation h1";
module.exports = async () => {
  console.log(
    "Job started. Will fetch data within the range " +
      start_day.format("YYYY-MM-DD") +
      " and " +
      end_day.format("YYYY-MM-DD")
  );

  while (start_day.isBefore(end_day)) {
    start_day = start_day.add(1, "d");
    number_of_words_processed++;

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
      });
    } catch (error) {
      console.log("Failed to fetch the word of the day at " + url);
      continue;
    }

    word = "wushu";
    console.log("Currently processing: " + word);

    const senses = await fetchSenses(word);
    if (!senses.length) {
      console.log("Could not obtain senses for: " + word);
      continue;
    }
    await sleep(1100);

    const sentences = await fetchSentences(word);
    if (!sentences.size) {
      console.log("Could not obtain sentences for: " + word);
      continue;
    }
    await sleep(1100);

    // Write to file.
    const mergedSenses = mergeSensesAndSentences(senses, sentences);

    const word_data = {
      word: word,
      senses: mergedSenses
    };

    jsonfile.writeFile(file, word_data, { flag: "a" }, function(err) {
      if (err) console.error(err);
      else number_of_words_saved++;
    });

    console.log();
  }

  console.log("Number of words processed: " + number_of_words_processed);
  console.log("Number of words saved: " + number_of_words_saved);
  return "Execution Complete. (This return value will be used by make-runnable)";
};

/*
Adds a sentence to the right sense object. For now, we do it
in place but may be making a new copy is better.
*/
function mergeSensesAndSentences(senses, sentences) {
  senses.forEach(sense => {
    const id = sense.id;
    const sentence = sentences.get(id);
    sense.sentence = sentence;
  });

  return senses;
}

async function fetchSenses(word) {
  const entries_endpoint = "/api/v1/entries/en/";

  let options = {
    url: oxford_host + entries_endpoint + word,
    headers: headers,
    resolveWithFullResponse: true,
    json: true
  };
  let response;
  try {
    response = await request.get(options);
  } catch (error) {
    console.error("Error while fetching definitions for the word: " + word);
    console.error(error.message);
    return [];
  }
  let bodyAsJSON = response.body;

  const derivativeOf = R.path([
    "results",
    0,
    "lexicalEntries",
    0,
    "derivativeOf",
    0,
    "id"
  ]);
  const rootWord = derivativeOf(bodyAsJSON);

  if (rootWord) {
    options = {
      url: oxford_host + entries_endpoint + rootWord,
      headers: headers
    };
    body = await request.get(options);
    bodyAsJSON = JSON.parse(body);
  }

  const getSenses = R.path([
    "results",
    0,
    "lexicalEntries",
    0,
    "entries",
    0,
    "senses"
  ]);

  const sensesToReturn = [];

  const topLevelSenses = getSenses(bodyAsJSON);
  if (!Array.isArray(topLevelSenses) || topLevelSenses.length == 0)
    return sensesToReturn;

  // If we also want to fetch the subsenses. This might be too much noise
  // and may be only want the main definitions.
  let subsenses = [];
  topLevelSenses.forEach(sense => {
    if (Array.isArray(sense.subsenses) && sense.subsenses.length) {
      subsenses = [...subsenses, ...sense.subsenses];
    }
  });
  let senses = [...topLevelSenses, ...subsenses];

  senses.forEach(sense => {
    const senseDefinitions = sense.definitions;
    const senseUsages = sense.examples;
    const senseId = sense.id;

    const strippedDownSenseObj = {
      id: senseId,
      definitions: senseDefinitions,
      usages: senseUsages
    };

    if (isValidSense(strippedDownSenseObj))
      sensesToReturn.push(strippedDownSenseObj);
  });

  return sensesToReturn;
}

function isValidSense(sense) {
  if (
    sense &&
    Array.isArray(sense.definitions) &&
    sense.definitions.length &&
    Array.isArray(sense.usages) &&
    sense.usages.length &&
    sense.id
  )
    return true;
  return false;
}

/*
Returns a Map of senseIds to sentence text. 
Since it is a Map, regardless of how many sentences are availabe per senseId,
we only return the last one.
*/
async function fetchSentences(word) {
  const sentences_endpoint = `/api/v1/entries/en/${word}/sentences`;

  const options = {
    url: oxford_host + sentences_endpoint,
    headers: headers,
    resolveWithFullResponse: true,
    json: true
  };
  let response;
  try {
    response = await request.get(options);
  } catch (error) {
    console.error("Error while fetching sentences for the word: " + word);
    console.error(error.message);
    return [];
  }
  let bodyAsJSON = response.body;

  const getSentences = R.path(["results", 0, "lexicalEntries", 0, "sentences"]);

  const sentencesToReturn = Map().asMutable();
  const sentences = getSentences(bodyAsJSON);
  if (!Array.isArray(sentences) || sentences.length == 0)
    return sentencesToReturn;

  sentences.every(sentence => {
    const senseIds = sentence.senseIds;
    const text = sentence.text;

    senseIds.forEach(senseId => {
      sentencesToReturn.set(senseId, text);
    });

    return true;
  });

  return sentencesToReturn.asImmutable();
}

require("make-runnable/custom")({
  printOutputFrame: false
});
