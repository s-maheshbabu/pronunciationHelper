/**
 * When users say utterances like "how to pronounce the word D. O. G.",
 * ASK is returning 'the word dog' as slot value instead of just 'dog'.
 *
 * Changing the sample utterances in ASK portal didn't help. So, we need
 * a solution that looks for extraneous phrases in the input and strip
 * them out.
 */
extraneousPhrases = [
  "word",
  "the word",
  "the word spelled",
  "the word spelled as",
  "the word that is spelled",
  "the word that is spelled as",
  "the word with spelling",
  "the word with the spelling",
  "name",
  "the name",
  "the name spelled",
  "the name spelled as",
  "the name that is spelled",
  "the name that is spelled as",
  "the name with spelling",
  "the name with the spelling"
];

module.exports = extraneousPhrases;
