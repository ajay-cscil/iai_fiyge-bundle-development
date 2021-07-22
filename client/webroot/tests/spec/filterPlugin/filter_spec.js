
describe("Filter", function() {
    var filter;
    beforeEach(function() {

        filter = new Filter();
    });
// test suit for form_field_name
    describe("when form_field_name is used to format the names into fully qualified names ", function() {
        it("Should be able to calculate the fully qualified name",
                function() {
                    expect(filter.form_field_name('invoices.country_id')).toEqual('data[invoices][country_id]');
                });
        it("Should be able to find fully qualified name on every value", function() {
            expect(filter.form_field_name('invoices.state_id')).toEqual('data[invoices][state_id]');
        });
    });
// test suit for sql_column_name
    describe("when sql_column_name is used to get the sql column name", function() {
        it("should be able to return the name of sql_column",
                function() {
                    var data = 'listviews.controller';
                    expect(filter.sql_column_name(data)).toEqual('controller');
                });
        it("should be able to return the name of sql_column",
                function() {
                    var data = 'invoices.country_id';
                    expect(filter.sql_column_name(data)).toEqual('country_id');
                });
    });
// test suit for search
    describe("when search is used to generate name of search", function() {
        it("should be able generate name of search",
                function() {
                    expect(filter.search('data[invoices][country_id]')).toEqual('[__name="data[invoices][country_id]"]');
                });
    });
    
   

    
});









