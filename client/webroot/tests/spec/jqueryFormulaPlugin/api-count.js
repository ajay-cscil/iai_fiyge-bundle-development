describe("Testing count() api", function() {
    it("Calculating count of the elements which have class 'txtval'", function() {
        expect($(".txtval").count()).toEqual(3);
    });
    it("Calculating count of the elements which have id 'mytxt' returns only one element", function() {
        expect($("#mytxt").count()).toEqual(1);
    });
    it("Calculating count of the elements which have class 'mytxt' returns no element", function() {
        expect($(".mytxt").min()).toEqual(0);
    });
});