
describe("Autopopulation", function() {
    var autopopulate;
    beforeEach(function() {

        autopopulate = new Autopopulate();
    });
// test suit for name_formatter
    describe("when name_formatter is used to format the names into fully qualified names ", function() {
        it("Should be able to calculate the fully qualified name",
                function() {
                    expect(autopopulate.name_formatter('sales_orders.account_id')).toEqual('data[sales_orders][account_id]');
                });
        it("Should be able to find fully qualified name on every value", function() {
            expect(autopopulate.name_formatter('invoices.partner_id')).toEqual('data[invoices][partner_id]');
        });
    });
// test suit for data_cleaner
    describe("when data_cleaner is used to take clean data only", function() {
        it("should be able to clean the data based on validation",
                function() {
                    var data = {};
                    data['paginate'] = {};
                    data['paginate']['data'] = ['city'];
                    expect(autopopulate.data_cleaner(data)).toEqual(['city']);
                });
    });
// test suit for calculating data source
    describe("when new_q is used to generate new q", function() {
        it("should be able generate the q",
                function() {
                    var q = {};
                    expect(autopopulate.new_q(q)).toEqual({"method": "find", "fields": [], "where": {}});
                });
    });
    
   

    
});









