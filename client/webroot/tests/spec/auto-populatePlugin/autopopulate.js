Autopopulate = function() {
};
Autopopulate.prototype.name_formatter = function(name) {
    name = name.split(".");
    return name = "data[" + name.join("][") + "]";
}
Autopopulate.prototype.data_cleaner = function(data) {
    if (typeof (data['paginate']) != 'undefined' && typeof (data['paginate']['data']) != 'undefined') {
        data = data['paginate']['data'];
    }
    return data;
}
Autopopulate.prototype.new_q = function(q) {
    q['method'] = 'find';
    q['fields'] = [];
    q['where'] = {};
    return q;
}
Autopopulate.prototype.bringData = function(q, dataSource) {
            var data = {};
            
            // get data based on 'q'
              
                $.getJSON(dataSource,
                        {
                            "q": JSON.stringify(q)
                        },
                function(response)
                {  console.log(response)
                    return(response)

                });
            
        }