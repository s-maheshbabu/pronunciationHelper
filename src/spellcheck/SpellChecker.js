const dictionary = require("dictionary-en-us");
const nspell = require("nspell");
const dictionaryAdditions = require("spellcheck/DictionaryAdditions");

let SpellChecker;

module.exports.init = () => {
  return new Promise((resolve, reject) => {
    if (!SpellChecker) {
      console.log("SpellChecker being initialied.");
      dictionary(function(error, dict) {
        if (error) {
          // TODO: We should swallow this error and make the spell checker optional.
          // Currently code/tests assumes that SpellChecker is always available.
          console.log(`Error initializing the dictionary. Error: ${error}`);
          reject(error);
          return;
        }

        // Need to check if this is prohibitively expensive in prod env.

        // This is an expensive operation. SpellChecker should be made optional.
        // The load should be kicked off so subsequent requests can benefit from it
        // but the current session shouldn't be blocked on this.
        SpellChecker = nspell(dict);

        dictionaryAdditions.forEach(wordToBeAdded => {
          SpellChecker.add(wordToBeAdded);
        });

        resolve();
      });
    } else {
      resolve();
    }
  });
};

/**
 * Checks the lower case version and the title case version of
 * the input and if both are recognized as misspelled, returns
 * true.
 * @param {*} input word whose spelling is to be checked.
 */
module.exports.isMisspelled = input => {
  return (
    !SpellChecker.correct(input.toLowerCase()) &&
    !SpellChecker.correct(toTitleCase(input))
  );
};

/**
 * Obtains spell suggestions for the given word. If there are no
 * suggestions, an empty array is returned.
 *
 * @param {*} input word for which spell suggestions are to
 * be obtained.
 */
module.exports.getSuggestedSpellings = input => {
  return SpellChecker.suggest(input);
};

// --------------- Utility functions -----------------------
/**
 * Converts given string to title case. For example, san diEGo
 * would be converted to San Diego.
 * @param {*} input the string to be title cased.
 */
function toTitleCase(input) {
  return input.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
