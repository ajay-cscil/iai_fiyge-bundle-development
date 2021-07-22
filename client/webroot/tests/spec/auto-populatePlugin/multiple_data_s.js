describe("When we want to fetch multiple data from maax", function() {

// test case for leads ajax call
    it("Should be able to perform a successful ajax request and get multiple  data of address type shipping", function() {
        var asyncCallComplete, result,
                _this = this;
        // asyncCallComplete is set to true when the ajax call is complete
        asyncCallComplete = false;

        // result stores the result of the successful ajax call
        result = null;

        // SECTION 1 - call asynchronous function
        runs(function() {
            var href=document.location.href.split('/');
            return $.ajax({
                url: href[0]+'//'+href[2]+'/'+href[3]+"/crm/accounts/index.json/",
                type: "GET",
                data: {
                    "q": {"method":"find","fields":["accounts.addresses.address_line_1","accounts.addresses.address_line_2","accounts.addresses.city","accounts.addresses.state","accounts.addresses.country","accounts.addresses.zip"],"where":{"accounts.addresses.config_address_types.address_type":"Shipping","accounts.id":"7835"}}
                },
                contentType: "application/x-www-form-urlencoded",
                success: function(data) {
                    asyncCallComplete = true;
                    result = data;
                }
            });
        });



        // SECTION 2 - wait for the asynchronous call to complete
        waitsFor(function() {
            return asyncCallComplete !== false;
        });

        // SECTION 3 - perform tests
        return runs(function() {
            return expect(result['paginate']['data']).toBeDefined();
        });
    });
});