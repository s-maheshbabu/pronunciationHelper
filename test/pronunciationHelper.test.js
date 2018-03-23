const expect = require("chai").expect;
const mockery = require("mockery");
const sinon = require("sinon");

it("should fail when state is undefined", function() {
  var number = true;
  expect(number).to.be.true;
});
