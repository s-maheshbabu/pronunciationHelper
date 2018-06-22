const unitUnderTest = require("../src/index");

const expect = require("chai").expect;
const assert = require("chai").assert;
const decache = require("decache");

const extraneousPhrases = require("constants/PhrasesToStrip");
const STATES = require("constants/States").states;
const SpellChecker = require("spellcheck/SpellChecker");

const context = {};

before(async () => {
  await SpellChecker.init();
});

afterEach(function() {
  decache("../test-data/event");
});
