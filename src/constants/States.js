const states = Object.freeze({
  // When we recognize a misspelling, we offer the user suggestions
  // and iterate through those suggestions.
  SUGGEST_CORRECT_SPELLINGS: "SUGGEST_CORRECT_SPELLINGS",
  // Offer to open dictionary app or webpage
  OFFER_DICTIONARY_PUNCHOUT: "OFFER_DICTIONARY_PUNCHOUT",
});

module.exports = {
  states: states
};
