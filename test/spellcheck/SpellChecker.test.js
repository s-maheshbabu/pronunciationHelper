const SpellChecker = require("spellcheck/SpellChecker");

const expect = require("chai").expect;

const dictionaryAdditions = require("spellcheck/DictionaryAdditions");

before(async () => {
  await SpellChecker.init();
});

it("should recognize the words added to dictionary. Such words are added because they are not part of the dictionary but something user's expect to work. For example, the word 'alexa'", async () => {
  dictionaryAdditions.forEach(wordAddedToDictionary => {
    expect(SpellChecker.isMisspelled(wordAddedToDictionary)).to.equal(false);
  });
});
