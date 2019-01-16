module.exports = (title, text) => {
  return {
    bodyTemplateData: {
      type: "object",
      objectId: "bodyTemplateSample",
      backgroundImage: {
        contentDescription: null,
        smallSourceUrl: null,
        largeSourceUrl: null,
        sources: [
          {
            url:
              "https://d2o906d8ln7ui1.cloudfront.net/images/BT1_Background.png",
            size: "small",
            widthPixels: 0,
            heightPixels: 0
          },
          {
            url:
              "https://d2o906d8ln7ui1.cloudfront.net/images/BT1_Background.png",
            size: "large",
            widthPixels: 0,
            heightPixels: 0
          }
        ]
      },
      title: title,
      textContent: {
        primaryText: {
          type: "PlainText",
          text: text
        }
      },
      logoUrl:
        "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
    }
  };
};
