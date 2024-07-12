function parseEmail(email) {
  if (!email) return "";
  let parsedAtSign = email.split("@")?.at(0);
  let parsePlusSign = parsedAtSign?.split("+");
  let parsedPlusSign = parsePlusSign?.at(0);
  return parsedPlusSign;
}


describe("checking lib functions", () => {
  it("email contain with abc@gmail.com convert to abc", () => {
    expect(parseEmail("abc@gmail.com")).toBe("abc")
  });
  it("email contain with abc+slackmod@gmail.com convert to abc", () => {
    expect(parseEmail("abc+slackmod@gmail.com")).toBe("abc")
  });
});
