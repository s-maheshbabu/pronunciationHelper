module.exports = (originalWord, text, wordSuggestions) => {
  const allWords = [originalWord || [], ...wordSuggestions || []];
  const allWordsWithSpeech = [];
  allWords.forEach(word => {
    allWordsWithSpeech.push({
      primaryText: word,
      ssml: `<speak>${word}. I repeat, <prosody rate=\"x-slow\">${word}</prosody></speak>`
    });
  });
  return {
    data: {
      backgroundImage: {
        contentDescription: null,
        smallSourceUrl: null,
        largeSourceUrl: null,
        sources: [
          {
            url:
              "https://s3.amazonaws.com/pronunciations-alexa-skill/background.jpg",
            size: "small",
            widthPixels: 0,
            heightPixels: 0
          },
          {
            url:
              "https://s3.amazonaws.com/pronunciations-alexa-skill/background.jpg",
            size: "large",
            widthPixels: 0,
            heightPixels: 0
          }
        ]
      },
      title: "Welcome to pronunciations",
      image: {
        contentDescription: null,
        smallSourceUrl: null,
        largeSourceUrl: null,
        sources: [
          {
            url:
              "https://s3.amazonaws.com/pronunciations-alexa-skill/background.jpg",
            size: "small",
            widthPixels: 0,
            heightPixels: 0
          },
          {
            url:
              "https://s3.amazonaws.com/pronunciations-alexa-skill/background.jpg",
            size: "large",
            widthPixels: 0,
            heightPixels: 0
          }
        ]
      },
      textContent: {
        title: {
          type: "PlainText",
          text: `I pronounced '${originalWord}'`
        },
        primaryText: {
          type: "PlainText",
          text: text
        }
      },
      properties: {
        allWordsWithSpeech: allWordsWithSpeech
      },
      logoUrl: `https://s3.amazonaws.com/pronunciations-alexa-skill/512x512.png`,
      hintText: `Try tapping the buttons next to the words`,
      transformers: [
        {
          inputPath: "allWordsWithSpeech[*].ssml",
          outputName: "ssml",
          transformer: "ssmlToSpeech"
        }
      ]
    }
  };
};
