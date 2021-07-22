describe("Testing min() api", function() {
    it("Calculating minimum number out of the elements which have class 'txtval'", function() {
        expect($(".txtval").min()).toEqual(2);
    });
    it("Calculating minimum number out of the elements which have id 'mytxt' returns only one element", function() {
        expect($("#mytxt").min()).toEqual(8.3);
    });
    it("Calculating minimum number out of the elements which have class 'mytxt' returns no element", function() {
        expect($(".mytxt").min()).toEqual(0);
    });
});