const states = Object.freeze({
  // When we recognize a misspelling, we offer the user suggestions
  // and iterate through those suggestions.
  SUGGEST_CORRECT_SPELLINGS: "SUGGEST_CORRECT_SPELLINGS"
});

module.exports = {
  APL_DOCUMENT_TYPE: "Alexa.Presentation.APL.RenderDocument",
  APL_DOCUMENT_VERSION: "1.0",
  MAX_SPELL_SUGGESTIONS_TO_DISPLAY: 5
};
