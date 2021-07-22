

/*
compute_value:
A way to specify formula on target field, which will compute its value.
So specify a summary function "MIN/MAX/AVG/SUM" and name of total field.
"aggregation_method"
"aggregation_result_field"
Example 1:
<input name="data[invoices][invoice_lines][amount]" value="" aggregation_formula="invoices.invoice_lines.quantity*invoices.invoice_lines.unit_price|ROW"  >

Ajay's Question: Is the |ROW here to signify that this formula is on a per row basis? If this was an all rows formula, won't it make sense for us to write it excel way ?

=> In Grid this is painted as 
<input name="data[invoices][invoice_lines][0][amount]" value="">
<input name="data[invoices][invoice_lines][1][amount]" value="">
<input name="data[invoices][invoice_lines][2][amount]" value="">
<input name="data[invoices][invoice_lines][3][amount]" value="">
<input name="data[invoices][invoice_lines][4][amount]" value="">

=> Save total in
<input name="data[invoices][subtotal]" aggregation_formula="SUM(invoices.invoice_lines.amount)|COLUMN" >
<input name="data[invoices][total]" aggregation_formula="SUM(invoices.invoice_taxes.tax_code_amount)+invoices.subtotal|COLUMN" >

Ajay's Question: is the tax_code_amount the total of taxes

-- following not used as its difficult. 
<input name="data[invoices][subtotal]" aggregation_formula="SUM($('[amount]').val())" >
<input name="data[invoices][subtotal]" aggregation_formula="SUM($('[tax_code_amount]').val()+$('[subtotal]'))" >

$('[aggregation_formula]').aggregation({});
*/


(function($){
    // plugin name
    $.fn.aggregation=function(options){
        // defaults for plugin
        var defaults={
            // translate column name into form field name.
            /**
            Ajay's comments:
            There are 3 - 4 variables we have to take into consideration.
            1. Database field name
            2. Model field name, same as the form field name
            3. Form field name in case of a grid
            */
            'aggregation_formula':null,
            'parse_formula':function(scope,aggregationFormula){
                var tokens=aggregationFormula.match(/[0-9a-zA-Z_\.]/).sort().reverse();
                var fields=[];
                var selector='';
                tokens=$.unique(tokens);
                /**
                Ajay's comment : @TODO - possibly fix a loop within a loop situation
                */
                $.each(tokens,function(k,v){
                    selector='[__name="'+v+'"]';
                    $.each(scope,function(kk,vv){
                        /** 
                          Following "invoices.invoice_lines.quantity*invoices.invoice_lines.unit_price|ROW" evaluates to.....  :-(
                         ----------------------------------------------------------------------------------------------------
                         '(function(SCOPE){ 
                                        var values=[] ;
                                         $(SCOPE).find("[__name='invoices.invoice_lines.quantity']")
                                        .each(function(k,v){
                                            values.push($(this).val()); 
                                        });
                                        return (values.length == 1 ?values[0]:values); 
                          })(SCOPE) 
                         * 
                          (function(SCOPE){ 
                                        var values=[] ;
                                         $(SCOPE).find("[__name='invoices.invoice_lines.unit_price']")
                                        .each(function(k,v){
                                            values.push($(this).val()); 
                                        });
                                        return (values.length == 1 ?values[0]:values); 
                                            
              
                          })(SCOPE) 
                         */
                        
                        if(vv.find(selector).length > 0){
                            aggregationFormula=aggregationFormula
                            .replace(v,' (function(SCOPE){var values=[] ;$(SCOPE).find("[__name=\''+v+'\']").each(function(k,v){values.push( $.parseFloat($(this).val())) ;});return (values.length == 1 ?values[0]:values);})(SCOPE) ');
                        }
                        fields.push(selector);
                    });
                });
                return {
                    'formula':aggregationFormula,
                    'fields':fields
                };
            },
            'grid_row_class_name':'last-data-row',
            'grid_cell_class_name':'cell-info-grid'
        };
        function COUNT(){
            return arguments.length;
        }
        function SUM(arg){
            var length=arg.length;
            var sum=0;
            for(var i=0; i < length ; i++){
                sum += arg[i];
            }
            return sum;
        }
        function AVG(arg){
            return SUM(arg)/arg.length;
        }
        function MIN(){
            arguments.sort();
            return arguments.shift();
        }
        function MIN(){
            arguments.sort();
            return arguments.pop();
        }
        
        if(typeof($.parseFloat) == 'undefined' ){
            $.parseFloat=function(data){
                return data;
            }
        }
        if(typeof($.format) == 'undefined' ){
            $.format=function(data){
                return data;
            }
        }
        
        
        
        // merged settings;
        var settings=$.extend({},defaults,options);
        // loop of each match element in set
        var plugin = this.each(function(k,v){
            // alias for current element;
            var element=$(this);
            var fieldName=element.attr('name');
            // Extract aggregation formula...
            var aggregationFormula = (settings.aggregation_formula != null ? settings.aggregation_formula : element.attr('aggregation_formula'));
            if(aggregationFormula !=""){
                /// split formula and drirection(applicable on if current field is within grid). Possible values are "ROW","COLUMN" and ......
                aggregationFormula=aggregationFormula.split('|');
                var direction=(typeof(aggregationFormula[1]) !='undefined'?aggregationFormula[1]:null);
                aggregationFormula=aggregationFormula[0];
                
                // find the form for current element
                var form=element.closest('form');
                // find if current element is within some grid....
                var grid=element.closest('grid');
                
                // base on grid/direction.... compute scope for evaluation expression....
                var scope=[];
                if(grid.length > 0){
                    if(direction =='ROW'){
                        // Find the row within which current field is placed.... we need to eval formula within scope of this row.
                        scope.push(element.closest('.'+settings.grid_row_class_name+':first'));
                        var output=settings.parse_formula(scope,aggregationFormula);
                    }else if(direction =="COLUMN"){
                        // Find the column accross all table rows, as we need to eval formula accross all cells.
                        var index=element.closest('.'+settings.grid_cell_class_name).index();
                        element.closest('.'+settings.grid_row_class_name+':first').parents(':first').children().each(function(){
                            scope.push($(this).eq(index));
                        });
                        var output=settings.parse_formula(scope,aggregationFormula);
                    }else{
                        // Else Scope is whole form.
                        scope.push(form);
                        var output=settings.parse_formula(scope,aggregationFormula);
                    }
                }else{
                    // If not grid then Scope is whole form.
                    scope.push(form);
                    var output=settings.parse_formula(scope,aggregationFormula);
                }
                //Loop over every matching field in formula and add a change event to it, So that total can be recomputed....
                $.each(output['fields'],function(k,selector){
                    $.each(scope,function(kkk,vvv){
                        var SCOPE = vvv;
                        vvv.find(selector).not('.aggregation-attached').addClass('aggregation-attached').live('change',
                            function(){
                                var val=0;
                                try{
                                    eval('val=('+output['formula']+')');
                                }catch(e){
                            
                                }
                                form.find('[name="'+fieldName+'"]').val($.format(val));
                            });    
                    });
                });
            }
        });
        return plugin;
    }   
}(jQuery));






