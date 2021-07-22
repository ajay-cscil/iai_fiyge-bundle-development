Filter = function() {
};
Filter.prototype.form_field_name = function(name) {
    var name = name.split(".");
    return name = "data[" + name.join("][") + "]";
}
Filter.prototype.sql_column_name = function(name) {
    var name = name.replace('[', '.').replace(']', '.').split('.');
    var found = false;
    while (name.length > 0 && found === false) {
        var tempName = name.pop();
        if (tempName != "") {
            found = tempName;
        }
    }
    return found;
}
Filter.prototype.search = function(name) {
    return '[__name="' + name + '"]';
    
}



