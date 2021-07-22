describe("Testing resolve-operator functionality", function() {
    it("Testing resolve simple formula having one '+' operator", function() {
        var formula = "$('#element1').value()+$('#element2').value()";
        resolvedFormula = ["$('#element1').value()", "$('#element2').value()"];
        expect(resolveOperators(formula)).toEqual(resolvedFormula);
    });
    it("Testing resolve formula having one '-' operator", function() {
        var formula = "$('#element1').value()*$('#element2').value()";
        resolvedFormula = ["$('#element1').value()", "$('#element2').value()"];
        expect(resolveOperators(formula)).toEqual(resolvedFormula);
    });
    it("Testing resolve formula having one '*' operator", function() {
        var formula = "$('#element1').value()*$('#element2').value()";
        resolvedFormula = ["$('#element1').value()", "$('#element2').value()"];
        expect(resolveOperators(formula)).toEqual(resolvedFormula);
    });
    it("Testing resolve formula having multiple operators ", function() {
        var formula = "$('#element1').value()+$('#element2').value()-$('#element3').value()*$('#element4').value()";
        resolvedFormula = ["$('#element1').value()", "$('#element2').value()", "$('#element3').value()", "$('#element4').value()"];
        expect(resolveOperators(formula)).toEqual(resolvedFormula);
    });
    it("Testing resolve formula with chained jquery selectors ", function() {
        var formula = "$('#element1').find('.class').parent().value()+$('#element2').closest('.class').value()-$('.element3').value()*$('#element4').value()";
        resolvedFormula = ["$('#element1').find('.class').parent().value()", "$('#element2').closest('.class').value()", "$('.element3').value()", "$('#element4').value()"];
        expect(resolveOperators(formula)).toEqual(resolvedFormula);
    });
});