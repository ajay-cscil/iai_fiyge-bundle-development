/* 
 * This plugin provides formula computaion. And gives aggregate functions (sum, avg, max, min, count) to compute summary.
 * Use Case-
 * <input name="data[invoices][subtotal]" 
 formula="$('[name *= "sub_total"]').sum() + $('[name *= "tax_total"] ').value() - $('[name *=discount]').val()" >
 */
$(document).bind('document_update', function(event, dom) {
    dom.find('[formula]').each(function() {
        var formula_with_form_id = $(this).attr('formula').replace(/\$/gi, "$('#" + $(this).closest('form').attr('id') + "').find");
        $(this).attr('formula', formula_with_form_id);
        $(this).compute();
    });
});
// Iterates over all the fields having attribute 'formula' and attaches a custome event 'computeformula' to them and triggers it if the target's closest form changes
$.fn.compute = function(options) {
    var defaults = {};
    var settings = $.extend({'debug': 0}, defaults, options);
    $(this).each(function() {
        var isFormulaInitialize = $(this).attr('is_formula_initialize');
        if ((typeof (isFormulaInitialize) == 'undefined' || isFormulaInitialize != 1) && (typeof ($(this).attr('formula')) != "undefined")) {
            var formula = $(this).attr('formula');
            $(this).attr('formula', formula.replace(/row/gi, '$(this).closest(".last-data-row")'));
            // Binding a custome event 'computeformula' to formula fields that will be fired when any of the formula dependency changes
            $(this).attr('is_formula_initialize', 1).bind("computeformula", function(event) {
                if (!$(this).hasClass('template-element')) {
                    var val = 0;
                    eval("val=" + $(this).attr('formula') + ";");
                    log($(this).attr('name') + " val=" + $(this).attr('formula') + ";");
                    val = $.format(val, 'n2');
                    $(this).val(val).triggerHandler('change');
                }
            });
            $(this).closest('form').on('change', function(event) {
                $(this).find('[formula]').trigger('computeformula');
            });
        }
    });
    return $(this);
};

// Returns parsefloat value of the field
$.fn.value = function() {
    if (typeof ($(this).val() != "undefined")) {
        if ($(this).val() == "") {
            return 0;
        } else if (!isNaN($.parseFloat($(this).val()))) {
            return $.parseFloat($(this).val());
        }
        return 0;
    }
    return 0;
};

// $(selector).sum() sums all the fields returned by selector
$.fn.sum = function() {
    var sum = 0;
    $(this).each(function() {
        sum += $(this).value();
    });
    return sum;
};

// $(selector).avg() returns average of all the fields returned by selector
$.fn.avg = function() {
    var length = $(this).length;
    if (length === 0) {
        return 0;
    } else {
        var sum = $(this).sum();
        return (sum / length);
    }
};

// $(selector).max() returns maximum value number amongst all the fields returned by selector
$.fn.max = function() {
    var length = $(this).length;
    if (length === 0) {
        return 0;
    } else {
        var max = 0;
        $(this).each(function() {
            max = max < $(this).value() ? $(this).value() : max;
        });
        return max;
    }
};

// $(selector).min() returns minimum value number amongst all the fields returned by selector
$.fn.min = function() {
    var min = 0;
    if ($(this).length > 0) {
        min = $(this).value();
        $(this).each(function() {
            min = ($(this).value() < min ? $(this).value() : min);
        });
    }
    return min;
};

// $(selector).count() returns number of fields returned by selector
$.fn.count = function() {
    return $(this).length;
};