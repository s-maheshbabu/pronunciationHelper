module.exports = (originalWord, text) => {
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
          text: `I pronounced '${originalWord}'`
        },
        subtitle: {
          type: "PlainText",
          text: text
        },
        primaryText: {
          type: "PlainText",
          text: "Please try again if I misheard you"
        }
      },
      logoUrl:
        "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png",
      hintText: `Try, "Alexa, define ${originalWord}"`
    }
  };
};
