describe("Testing sum() api", function() {
    it("Calculating sum of the elements which have class 'mytext'", function() {
        expect($(".mytext").sum()).toEqual(10.3);
    });
    it("Calculating sum of the elements which have id 'empty'", function() {
        expect($("#empty").sum()).toEqual(0);
    });
    it("Calculating sum of the elements having id 'empy' that returns no elements", function() {
        expect($("#empy").sum()).toEqual(0);
    });
});