module.exports = (skillSummary, usageInfo) => {
  return {
    bodyTemplate2Data: {
      type: "object",
      objectId: "bt2Sample",
      backgroundImage: {
        contentDescription: null,
        smallSourceUrl: null,
        largeSourceUrl: null,
        sources: [
          {
            url:
              "https://d2o906d8ln7ui1.cloudfront.net/images/BT2_Background.png",
            size: "small",
            widthPixels: 0,
            heightPixels: 0
          },
          {
            url:
              "https://d2o906d8ln7ui1.cloudfront.net/images/BT2_Background.png",
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
            url: "https://d2o906d8ln7ui1.cloudfront.net/images/details_01.png",
            size: "small",
            widthPixels: 0,
            heightPixels: 0
          },
          {
            url: "https://d2o906d8ln7ui1.cloudfront.net/images/details_01.png",
            size: "large",
            widthPixels: 0,
            heightPixels: 0
          }
        ]
      },
      textContent: {
        title: {
          type: "PlainText",
          text: `I can help pronounce English words`
        },
        primaryText: {
          type: "PlainText",
          text: skillSummary
        },
        secondaryText: {
          type: "PlainText",
          text: usageInfo
        }
      },
      logoUrl:
        "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png",
      hintText: `Try, "Alexa, open pronunciations and pronounce G. Y. R. O.`
    }
  };
};
