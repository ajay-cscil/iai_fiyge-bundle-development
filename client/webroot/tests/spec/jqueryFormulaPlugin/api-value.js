describe("Testing value() api", function() {
    it("Calculating value of textbox(invisible on this page) having id 'mytxt'", function() {
        expect($("#mytxt").value()).toEqual(8.3);
    });
    it("Calculating value of textbox(invisible on this page) having id 'mytx' that returns no elements", function() {
        expect($("#mytx").value()).toEqual(0);
    });
    it("Calculating value of textbox(invisible on this page) having class 'mytext' that returns three textboxes", function() {
        expect($(".mytext").value()).toEqual(8.3);
    });
    it("Calculating value of textbox(invisible on this page) having id 'empty' that have value ''", function() {
        expect($("#empty").value()).toEqual(0);
    });
});