describe("Testing formula evaluation", function() {
    it("Testing formula=\"$('#qty').value()*$('#pu').value()-($('#qty').value()*$('#pu').value()*$('#disc').value()/100)+(($('#qty').value()*$('#pu').value()-($('#qty').value()*$('#pu').value()*$('#disc').value()/100))*$('#tax').value()/100)\"", function() {
        $('#form1').find('[formula]').compute();
        $('#qty').trigger('change');
        expect($('#total').value()).toEqual($.parseFloat($.format(4892.5,'n2')));
    });
    it("Testing formula=\"((100+250)*4-(50-20))/6\"", function() {
        $('#form2').find('[formula]').compute();
        $('#form2-qty').trigger('change');
        expect($('#form2-total').value()).toEqual($.parseFloat($.format(228.33333333333334,'n2')));
    });
    it("Testing formula=\"$('#qty').value()*$('#pu').value()-($('#qty').value()*$('#pu').value()*$('#disc').value()/100)+(($('#qty').value()*$('#pu').value()-($('#qty').value()*$('#pu').value()*$('#disc').value()/100))*$('#tax').value()/100)-70\"", function() {
        $('#form3').find('[formula]').compute();
        $('#form3-qty').trigger('change');
        expect($('#form3-total').value()).toEqual($.parseFloat($.format(4822.5,'n2')));
    });
    it("Testing formula=\"70+$('#qty').value()*$('#pu').value()-($('#qty').value()*$('#pu').value()*$('#disc').value()/100)+(($('#qty').value()*$('#pu').value()-($('#qty').value()*$('#pu').value()*$('#disc').value()/100))*$('#tax').value()/100)\"", function() {
        $('#form4').find('[formula]').compute();
        $('#form4-qty').trigger('change');
        expect($('#form4-total').value()).toEqual($.parseFloat($.format(4962.5,'n2')));
    });
    it("Testing formula=\"quote lines", function() {
        $('#quot_line').find('[formula]').compute();
        $('[name="data[quotes][quote_lines][1][total_amount]"]').trigger('change');
        expect($('[name="data[quotes][quote_lines][1][total_amount]"]').value()).toEqual($.parseFloat($.format(20,'n2')));
    });
});