/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


jQuery('document').ready(function(){
    $('.populate-design-meta-data').live('end',function(){
        $(this).closest('form').find('.listview').trigger('reload');
    });
});