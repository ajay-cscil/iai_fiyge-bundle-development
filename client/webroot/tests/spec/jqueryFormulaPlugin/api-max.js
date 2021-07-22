describe("Testing max() api", function() {
    it("Calculating maximum number out of the elements which have class 'txtval'", function() {
        expect($(".txtval").max()).toEqual(8.3);
    });
    it("Calculating maximum number out of the elements which have id 'mytxt' returns only one element", function() {
        expect($("#mytxt").min()).toEqual(8.3);
    });
    it("Calculating maximum number out of the elements which have class 'mytxt' returns no element", function() {
        expect($(".mytxt").min()).toEqual(0);
    });
});