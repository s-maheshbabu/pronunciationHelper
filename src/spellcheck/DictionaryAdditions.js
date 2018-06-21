const List = require("immutable").List;

/*
Customers expect some words that are not officially part of the
dictionary to work. Such words can be included here to be added
to the dictionary.dictionaryAdditions.

The idea is to observe skill usage over time and augment this list.
*/
module.exports = dictionaryAdditions = List([
  "bromance",
  "alexa",
  "chillax",
  "cortana",
  "lol",
  "noob",
  "twitterati",
  "woot"
]);
