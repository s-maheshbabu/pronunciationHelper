const SpellChecker = require("spellcheck/SpellChecker");

const expect = require("chai").expect;
const assert = require("chai").assert;

const dictionaryAdditions = require("spellcheck/DictionaryAdditions");

var request = require("request");
var cheerio = require("cheerio");
var moment = require("moment");

it("testing", async done => {
  var start_day = moment("2010-01-01");
  var end_day = moment("2010-03-01");

  while (start_day.isBefore(end_day)) {
    start_day = start_day.add(1, "d");

    var url =
      "https://www.merriam-webster.com/word-of-the-day/" +
      start_day.format("YYYY-MM-DD");
    console.log(url);
  }

  var url = "https://www.merriam-webster.com/word-of-the-day/2018-06-14";

  request(url, function(err, resp, body) {
    $ = cheerio.load(body);
    links = $(".word-and-pronunciation h1"); //use your CSS selector here
    $(links).each(function(i, link) {
      console.log("-----" + $(link).text());
    });
    done();
  });
});
