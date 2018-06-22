const SpellChecker = require("spellcheck/SpellChecker");

const expect = require("chai").expect;
const assert = require("chai").assert;

const dictionaryAdditions = require("spellcheck/DictionaryAdditions");

var request = require("request");
var cheerio = require("cheerio");

it("testing", async done => {
  var searchTerm = "daca";
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
