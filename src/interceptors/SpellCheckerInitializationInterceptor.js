const SpellChecker = require("spellcheck/SpellChecker");

module.exports = SpellCheckerInitializationInterceptor = {
  process(handlerInput) {
    return SpellChecker.init();
  }
};
