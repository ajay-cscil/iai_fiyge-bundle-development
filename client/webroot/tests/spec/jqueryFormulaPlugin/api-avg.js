describe("Testing avg() api", function() {
    it("Calculating average of the elements which have class 'mytext'", function() {
        expect($(".mytext").avg()).toEqual(3.4333333333333336);
    });
    it("Calculating average of the elements which have id 'empty'", function() {
        expect($("#empty").avg()).toEqual(0);
    });
    it("Calculating average of the elements having id 'empy' that returns no elements", function() {
        expect($("#empy").avg()).toEqual(0);
    });
});