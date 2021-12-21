
/* FILENAME:/js/jquery.validate.js*/
/*!
 * jQuery Validation Plugin 1.11.1
 *
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 *
 * Copyright 2013 Jörn Zaefferer
 * Released under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

    $.extend($.fn, {
        // http://docs.jquery.com/Plugins/Validation/validate
        validate: function(options) {

            // if nothing is selected, return nothing; can't chain anyway
            if (!this.length) {
                if (options && options.debug && window.console) {
                    console.warn("Nothing selected, can't validate, returning nothing.");
                }
                return;
            }

            // check if a validator for this form was already created
            var validator = $.data(this[0], "validator");
            if (validator) {
                return validator;
            }

            // Add novalidate tag if HTML5.
            this.attr("novalidate", "novalidate");

            validator = new $.validator(options, this[0]);
            $.data(this[0], "validator", validator);

            if (validator.settings.onsubmit) {

                this.validateDelegate(":submit", "click", function(event) {
                    if (validator.settings.submitHandler) {
                        validator.submitButton = event.target;
                    }
                    // allow suppressing validation by adding a cancel class to the submit button
                    if ($(event.target).hasClass("cancel")) {
                        validator.cancelSubmit = true;
                    }

                    // allow suppressing validation by adding the html5 formnovalidate attribute to the submit button
                    if ($(event.target).attr("formnovalidate") !== undefined) {
                        validator.cancelSubmit = true;
                    }
                });

                // validate the form on submit
                this.submit(function(event) {
                    if (validator.settings.debug) {
                        // prevent form submit to be able to see console output
                        event.preventDefault();
                    }
                    function handle() {
                        var hidden;
                        if (validator.settings.submitHandler) {
                            if (validator.submitButton) {
                                // insert a hidden input as a replacement for the missing submit button
                                hidden = $("<input type='hidden'/>").attr("name", validator.submitButton.name).val($(validator.submitButton).val()).appendTo(validator.currentForm);
                            }
                            validator.settings.submitHandler.call(validator, validator.currentForm, event);
                            if (validator.submitButton) {
                                // and clean up afterwards; thanks to no-block-scope, hidden can be referenced
                                hidden.remove();
                            }
                            return false;
                        }
                        return true;
                    }

                    // prevent submit for invalid forms or custom submit handlers
                    if (validator.cancelSubmit) {
                        validator.cancelSubmit = false;
                        return handle();
                    }
                    if (validator.form()) {
                        if (validator.pendingRequest) {
                            validator.formSubmitted = true;
                            return false;
                        }
                        return handle();
                    } else {
                        validator.focusInvalid();
                        return false;
                    }
                });
            }

            return validator;
        },
        // http://docs.jquery.com/Plugins/Validation/valid
        valid: function() {
            if ($(this[0]).is("form")) {
                return this.validate().form();
            } else {
                var valid = true;
                var validator = $(this[0].form).validate();
                this.each(function() {
                    valid = valid && validator.element(this);
                });
                return valid;
            }
        },
        // attributes: space seperated list of attributes to retrieve and remove
        removeAttrs: function(attributes) {
            var result = {},
                    $element = this;
            $.each(attributes.split(/\s/), function(index, value) {
                result[value] = $element.attr(value);
                $element.removeAttr(value);
            });
            return result;
        },
        // http://docs.jquery.com/Plugins/Validation/rules
        rules: function(command, argument) {
            var element = this[0];

            if (command) {
                var settings = $.data(element.form, "validator").settings;
                var staticRules = settings.rules;
                var existingRules = $.validator.staticRules(element);
                switch (command) {
                    case "add":
                        $.extend(existingRules, $.validator.normalizeRule(argument));
                        // remove messages from rules, but allow them to be set separetely
                        delete existingRules.messages;
                        staticRules[element.name] = existingRules;
                        if (argument.messages) {
                            settings.messages[element.name] = $.extend(settings.messages[element.name], argument.messages);
                        }
                        break;
                    case "remove":
                        if (!argument) {
                            delete staticRules[element.name];
                            return existingRules;
                        }
                        var filtered = {};
                        $.each(argument.split(/\s/), function(index, method) {
                            filtered[method] = existingRules[method];
                            delete existingRules[method];
                        });
                        return filtered;
                }
            }

            var data = $.validator.normalizeRules(
                    $.extend(
                            {},
                            $.validator.classRules(element),
                            $.validator.attributeRules(element),
                            $.validator.dataRules(element),
                            $.validator.staticRules(element)
                            ), element);

            // make sure required is at front
            if (data.required) {
                var param = data.required;
                delete data.required;
                data = $.extend({required: param}, data);
            }

            return data;
        }
    });

// Custom selectors
    $.extend($.expr[":"], {
        // http://docs.jquery.com/Plugins/Validation/blank
        blank: function(a) {
            return !$.trim("" + $(a).val());
        },
        // http://docs.jquery.com/Plugins/Validation/filled
        filled: function(a) {
            return !!$.trim("" + $(a).val());
        },
        // http://docs.jquery.com/Plugins/Validation/unchecked
        unchecked: function(a) {
            return !$(a).prop("checked");
        }
    });

// constructor for validator
    $.validator = function(options, form) {
        this.settings = $.extend(true, {}, $.validator.defaults, options);
        this.currentForm = form;
        this.init();
    };

    $.validator.format = function(source, params) {
        if (typeof (source) == 'undefined') {
            source = '';
        }
        if (typeof (source) != 'string') {
            source = '';
        }
        if (arguments.length === 1) {
            return function() {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.validator.format.apply(this, args);
            };
        }
        if (arguments.length > 2 && params.constructor !== Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor !== Array) {
            params = [params];
        }
        $.each(params, function(i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function() {
                return n;
            });
        });
        return source;
    };

    $.extend($.validator, {
        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            validClass: "valid",
            errorElement: "label",
            focusInvalid: true,
            errorContainer: $([]),
            errorLabelContainer: $([]),
            onsubmit: true,
            ignore: ":hidden",
            ignoreTitle: false,
            onfocusin: function(element, event) {
                this.lastActive = element;

                // hide error label and remove error class on focus if enabled
                if (this.settings.focusCleanup && !this.blockFocusCleanup) {
                    if (this.settings.unhighlight) {
                        this.settings.unhighlight.call(this, element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.addWrapper(this.errorsFor(element)).hide();
                }
            },
            onfocusout: function(element, event) {
                if (!this.checkable(element) && (element.name in this.submitted || !this.optional(element))) {
                    this.element(element);
                }
            },
            onkeyup: function(element, event) {
                if (event.which === 9 && this.elementValue(element) === "") {
                    return;
                } else if (element.name in this.submitted || element === this.lastElement) {
                    this.element(element);
                }
            },
            onclick: function(element, event) {
                // click on selects, radiobuttons and checkboxes
                if (element.name in this.submitted) {
                    this.element(element);
                }
                // or option elements, check parent select in that case
                else if (element.parentNode.name in this.submitted) {
                    this.element(element.parentNode);
                }
            },
            highlight: function(element, errorClass, validClass) {
                if (element.type === "radio") {
                    this.findByName(element.name).addClass(errorClass).removeClass(validClass);
                } else {
                    $(element).addClass(errorClass).removeClass(validClass);
                }
            },
            unhighlight: function(element, errorClass, validClass) {
                if (element.type === "radio") {
                    this.findByName(element.name).removeClass(errorClass).addClass(validClass);
                } else {
                    $(element).removeClass(errorClass).addClass(validClass);
                }
            }
        },
        // http://docs.jquery.com/Plugins/Validation/Validator/setDefaults
        setDefaults: function(settings) {
            $.extend($.validator.defaults, settings);
        },
        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date (ISO).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            maxlength: $.validator.format("Please enter no more than {0} characters."),
            minlength: $.validator.format("Please enter at least {0} characters."),
            rangelength: $.validator.format("Please enter a value between {0} and {1} characters long."),
            range: $.validator.format("Please enter a value between {0} and {1}."),
            max: $.validator.format("Please enter a value less than or equal to {0}."),
            min: $.validator.format("Please enter a value greater than or equal to {0}.")
        },
        autoCreateRanges: false,
        prototype: {
            init: function() {
                this.labelContainer = $(this.settings.errorLabelContainer);
                this.errorContext = this.labelContainer.length && this.labelContainer || $(this.currentForm);
                this.containers = $(this.settings.errorContainer).add(this.settings.errorLabelContainer);
                this.submitted = {};
                this.valueCache = {};
                this.pendingRequest = 0;
                this.pending = {};
                this.invalid = {};
                this.reset();

                var groups = (this.groups = {});
                $.each(this.settings.groups, function(key, value) {
                    if (typeof value === "string") {
                        value = value.split(/\s/);
                    }
                    $.each(value, function(index, name) {
                        groups[name] = key;
                    });
                });
                var rules = this.settings.rules;
                $.each(rules, function(key, value) {
                    rules[key] = $.validator.normalizeRule(value);
                });

                function delegate(event) {
                    var validator = $.data(this[0].form, "validator"),
                            eventType = "on" + event.type.replace(/^validate/, "");
                    if (validator.settings[eventType]) {
                        validator.settings[eventType].call(validator, this[0], event);
                    }
                }
                $(this.currentForm)
                        .validateDelegate(":text, [type='password'], [type='file'], select, textarea, " +
                                "[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
                                "[type='email'], [type='datetime'], [type='date'], [type='month'], " +
                                "[type='week'], [type='time'], [type='datetime-local'], " +
                                "[type='range'], [type='color'] ",
                                "focusin focusout keyup", delegate)
                        .validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);

                if (this.settings.invalidHandler) {
                    $(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler);
                }
            },
            // http://docs.jquery.com/Plugins/Validation/Validator/form
            form: function() {
                this.checkForm();
                $.extend(this.submitted, this.errorMap);
                this.invalid = $.extend({}, this.errorMap);
                if (!this.valid()) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                }
                this.showErrors();
                return this.valid();
            },
            checkForm: function() {
                this.prepareForm();
                for (var i = 0, elements = (this.currentElements = this.elements()); elements[i]; i++) {
                    this.check(elements[i]);
                }
                return this.valid();
            },
            // http://docs.jquery.com/Plugins/Validation/Validator/element
            element: function(element) {
                element = this.validationTargetFor(this.clean(element));
                this.lastElement = element;
                this.prepareElement(element);
                this.currentElements = $(element);
                var result = this.check(element) !== false;
                if (result) {
                    delete this.invalid[element.name];
                } else {
                    this.invalid[element.name] = true;
                }
                if (!this.numberOfInvalids()) {
                    // Hide error containers on last error
                    this.toHide = this.toHide.add(this.containers);
                }
                this.showErrors();
                return result;
            },
            // http://docs.jquery.com/Plugins/Validation/Validator/showErrors
            showErrors: function(errors) {
                if (errors) {
                    // add items to error list and map
                    $.extend(this.errorMap, errors);
                    this.errorList = [];
                    for (var name in errors) {
                        this.errorList.push({
                            message: errors[name],
                            element: this.findByName(name)[0]
                        });
                    }
                    // remove items from success list
                    this.successList = $.grep(this.successList, function(element) {
                        return !(element.name in errors);
                    });
                }
                if (this.settings.showErrors) {
                    this.settings.showErrors.call(this, this.errorMap, this.errorList);
                } else {
                    this.defaultShowErrors();
                }
            },
            // http://docs.jquery.com/Plugins/Validation/Validator/resetForm
            resetForm: function() {
                if ($.fn.resetForm) {
                    $(this.currentForm).resetForm();
                }
                this.submitted = {};
                this.lastElement = null;
                this.prepareForm();
                this.hideErrors();
                this.elements().removeClass(this.settings.errorClass).removeData("previousValue");
            },
            numberOfInvalids: function() {
                return this.objectLength(this.invalid);
            },
            objectLength: function(obj) {
                var count = 0;
                for (var i in obj) {
                    count++;
                }
                return count;
            },
            hideErrors: function() {
                this.addWrapper(this.toHide).hide();
            },
            valid: function() {
                return this.size() === 0;
            },
            size: function() {
                return this.errorList.length;
            },
            focusInvalid: function() {
                if (this.settings.focusInvalid) {
                    try {
                        $(this.findLastActive() || this.errorList.length && this.errorList[0].element || [])
                                .filter(":visible")
                                .focus()
                                // manually trigger focusin event; without it, focusin handler isn't called, findLastActive won't have anything to find
                                .trigger("focusin");
                    } catch (e) {
                        // ignore IE throwing errors when focusing hidden elements
                    }
                }
            },
            findLastActive: function() {
                var lastActive = this.lastActive;
                return lastActive && $.grep(this.errorList, function(n) {
                    return n.element.name === lastActive.name;
                }).length === 1 && lastActive;
            },
            elements: function() {
                var validator = this,
                        rulesCache = {};

                // select all valid inputs inside the form (no submit or reset buttons)
                return $(this.currentForm)
                        .find("input, select, textarea")
                        .not(":submit, :reset, :image, [disabled]")
                        .not(this.settings.ignore)
                        .filter(function() {
                            if (!this.name && validator.settings.debug && window.console) {
                                console.error("%o has no name assigned", this);
                            }

                            // select only the first element for each name, and only those with rules specified
                            if (this.name in rulesCache || !validator.objectLength($(this).rules())) {
                                return false;
                            }

                            rulesCache[this.name] = true;
                            return true;
                        });
            },
            clean: function(selector) {
                return $(selector)[0];
            },
            errors: function() {
                var errorClass = this.settings.errorClass.replace(" ", ".");
                return $(this.settings.errorElement + "." + errorClass, this.errorContext);
            },
            reset: function() {
                this.successList = [];
                this.errorList = [];
                this.errorMap = {};
                this.toShow = $([]);
                this.toHide = $([]);
                this.currentElements = $([]);
            },
            prepareForm: function() {
                this.reset();
                this.toHide = this.errors().add(this.containers);
            },
            prepareElement: function(element) {
                this.reset();
                this.toHide = this.errorsFor(element);
            },
            elementValue: function(element) {
                var type = $(element).attr("type"),
                        val = $(element).val();

                if (type === "radio" || type === "checkbox") {
                    return $("input[name='" + $(element).attr("name") + "']:checked").val();
                }

                if (typeof val === "string") {
                    return val.replace(/\r/g, "");
                }
                return val;
            },
            check: function(element) {
                element = this.validationTargetFor(this.clean(element));

                var rules = $(element).rules();
                var dependencyMismatch = false;
                var val = this.elementValue(element);
                var result;

                for (var method in rules) {
                    var rule = {method: method, parameters: rules[method]};
                    try {

                        result = $.validator.methods[method].call(this, val, element, rule.parameters);

                        // if a method indicates that the field is optional and therefore valid,
                        // don't mark it as valid when there are no other rules
                        if (result === "dependency-mismatch") {
                            dependencyMismatch = true;
                            continue;
                        }
                        dependencyMismatch = false;

                        if (result === "pending") {
                            this.toHide = this.toHide.not(this.errorsFor(element));
                            return;
                        }

                        if (!result) {
                            this.formatAndAdd(element, rule);
                            return false;
                        }
                    } catch (e) {
                        if (this.settings.debug && window.console) {
                            console.log("Exception occurred when checking element " + element.id + ", check the '" + rule.method + "' method.", e);
                        }
                        throw e;
                    }
                }
                if (dependencyMismatch) {
                    return;
                }
                if (this.objectLength(rules)) {
                    this.successList.push(element);
                }
                return true;
            },
            // return the custom message for the given element and validation method
            // specified in the element's HTML5 data attribute
            customDataMessage: function(element, method) {
                return $(element).data("msg-" + method.toLowerCase()) || (element.attributes && $(element).attr("data-msg-" + method.toLowerCase()));
            },
            // return the custom message for the given element name and validation method
            customMessage: function(name, method) {
                var m = this.settings.messages[name];
                return m && (m.constructor === String ? m : m[method]);
            },
            // return the first defined argument, allowing empty strings
            findDefined: function() {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] !== undefined) {
                        return arguments[i];
                    }
                }
                return undefined;
            },
            defaultMessage: function(element, method) {
                return this.findDefined(
                        this.customMessage(element.name, method),
                        this.customDataMessage(element, method),
                        // title is never undefined, so handle empty string as undefined
                        !this.settings.ignoreTitle && element.title || undefined,
                        $.validator.messages[method],
                        "<strong>Warning: No message defined for " + element.name + "</strong>"
                        );
            },
            formatAndAdd: function(element, rule) {
                var message = this.defaultMessage(element, rule.method),
                        theregex = /\$?\{(\d+)\}/g;
                if (typeof message === "function") {
                    message = message.call(this, rule.parameters, element);
                } else if (theregex.test(message)) {
                    message = $.validator.format(message.replace(theregex, "{$1}"), rule.parameters);
                }
                this.errorList.push({
                    message: message,
                    element: element
                });

                this.errorMap[element.name] = message;
                this.submitted[element.name] = message;
            },
            addWrapper: function(toToggle) {
                if (this.settings.wrapper) {
                    toToggle = toToggle.add(toToggle.parent(this.settings.wrapper));
                }
                return toToggle;
            },
            defaultShowErrors: function() {
                var i, elements;
                for (i = 0; this.errorList[i]; i++) {
                    var error = this.errorList[i];
                    if (this.settings.highlight) {
                        this.settings.highlight.call(this, error.element, this.settings.errorClass, this.settings.validClass);
                    }
                    this.showLabel(error.element, error.message);
                }
                if (this.errorList.length) {
                    this.toShow = this.toShow.add(this.containers);
                }
                if (this.settings.success) {
                    for (i = 0; this.successList[i]; i++) {
                        this.showLabel(this.successList[i]);
                    }
                }
                if (this.settings.unhighlight) {
                    for (i = 0, elements = this.validElements(); elements[i]; i++) {
                        this.settings.unhighlight.call(this, elements[i], this.settings.errorClass, this.settings.validClass);
                    }
                }
                this.toHide = this.toHide.not(this.toShow);
                this.hideErrors();
                this.addWrapper(this.toShow).show();
            },
            validElements: function() {
                return this.currentElements.not(this.invalidElements());
            },
            invalidElements: function() {
                return $(this.errorList).map(function() {
                    return this.element;
                });
            },
            showLabel: function(element, message) {
                var label = this.errorsFor(element);
                if (label.length) {
                    // refresh error/success class
                    label.removeClass(this.settings.validClass).addClass(this.settings.errorClass);
                    // replace message on existing label
                    label.html(message);
                } else {
                    // create label
                    label = $("<" + this.settings.errorElement + ">")
                            .attr("for", this.idOrName(element))
                            .addClass(this.settings.errorClass)
                            .html(message || "");
                    if (this.settings.wrapper) {
                        // make sure the element is visible, even in IE
                        // actually showing the wrapped element is handled elsewhere
                        label = label.hide().show().wrap("<" + this.settings.wrapper + "/>").parent();
                    }
                    if (!this.labelContainer.append(label).length) {
                        if (this.settings.errorPlacement) {
                            this.settings.errorPlacement(label, $(element));
                        } else {
                            label.insertAfter(element);
                        }
                    }
                }
                if (!message && this.settings.success) {
                    label.text("");
                    if (typeof this.settings.success === "string") {
                        label.addClass(this.settings.success);
                    } else {
                        this.settings.success(label, element);
                    }
                }
                this.toShow = this.toShow.add(label);
            },
            errorsFor: function(element) {
                var name = this.idOrName(element);
                return this.errors().filter(function() {
                    return $(this).attr("for") === name;
                });
            },
            idOrName: function(element) {
                return this.groups[element.name] || (this.checkable(element) ? element.name : element.id || element.name);
            },
            validationTargetFor: function(element) {
                // if radio/checkbox, validate first element in group instead
                if (this.checkable(element)) {
                    element = this.findByName(element.name).not(this.settings.ignore)[0];
                }
                return element;
            },
            checkable: function(element) {
                return (/radio|checkbox/i).test(element.type);
            },
            findByName: function(name) {
                return $(this.currentForm).find("[name='" + name + "']");
            },
            getLength: function(value, element) {
                switch (element.nodeName.toLowerCase()) {
                    case "select":
                        return $("option:selected", element).length;
                    case "input":
                        if (this.checkable(element)) {
                            return this.findByName(element.name).filter(":checked").length;
                        }
                }
                return value.length;
            },
            depend: function(param, element) {
                return this.dependTypes[typeof param] ? this.dependTypes[typeof param](param, element) : true;
            },
            dependTypes: {
                "boolean": function(param, element) {
                    return param;
                },
                "string": function(param, element) {
                    return !!$(param, element.form).length;
                },
                "function": function(param, element) {
                    return param(element);
                }
            },
            optional: function(element) {
                var val = this.elementValue(element);
                return !$.validator.methods.required.call(this, val, element) && "dependency-mismatch";
            },
            startRequest: function(element) {
                if (!this.pending[element.name]) {
                    this.pendingRequest++;
                    this.pending[element.name] = true;
                }
            },
            stopRequest: function(element, valid) {
                this.pendingRequest--;
                // sometimes synchronization fails, make sure pendingRequest is never < 0
                if (this.pendingRequest < 0) {
                    this.pendingRequest = 0;
                }
                delete this.pending[element.name];
                if (valid && this.pendingRequest === 0 && this.formSubmitted && this.form()) {
                    $(this.currentForm).submit();
                    this.formSubmitted = false;
                } else if (!valid && this.pendingRequest === 0 && this.formSubmitted) {
                    $(this.currentForm).triggerHandler("invalid-form", [this]);
                    this.formSubmitted = false;
                }
            },
            previousValue: function(element) {
                return $.data(element, "previousValue") || $.data(element, "previousValue", {
                    old: null,
                    valid: true,
                    message: this.defaultMessage(element, "remote")
                });
            }

        },
        classRuleSettings: {
            required: {required: true},
            email: {email: true},
            url: {url: true},
            date: {date: true},
            dateISO: {dateISO: true},
            number: {number: true},
            digits: {digits: true},
            creditcard: {creditcard: true}
        },
        addClassRules: function(className, rules) {
            if (className.constructor === String) {
                this.classRuleSettings[className] = rules;
            } else {
                $.extend(this.classRuleSettings, className);
            }
        },
        classRules: function(element) {
            var rules = {};
            var classes = $(element).attr("class");
            if (classes) {
                $.each(classes.split(" "), function() {
                    if (this in $.validator.classRuleSettings) {
                        $.extend(rules, $.validator.classRuleSettings[this]);
                    }
                });
            }
            return rules;
        },
        attributeRules: function(element) {
            var rules = {};
            var $element = $(element);
            var type = $element[0].getAttribute("type");

            for (var method in $.validator.methods) {
                var value;

                // support for <input required> in both html5 and older browsers
                if (method === "required") {
                    value = $element.get(0).getAttribute(method);
                    // Some browsers return an empty string for the required attribute
                    // and non-HTML5 browsers might have required="" markup
                    if (value === "") {
                        value = true;
                    }
                    // force non-HTML5 browsers to return bool
                    value = !!value;
                } else {
                    value = $element.attr(method);
                }

                // convert the value to a number for number inputs, and for text for backwards compability
                // allows type="date" and others to be compared as strings
                if (/min|max/.test(method) && (type === null || /number|range|text/.test(type))) {
                    value = Number(value);
                }

                if (value) {
                    rules[method] = value;
                } else if (type === method && type !== 'range') {
                    // exception: the jquery validate 'range' method
                    // does not test for the html5 'range' type
                    rules[method] = true;
                }
            }

            // maxlength may be returned as -1, 2147483647 (IE) and 524288 (safari) for text inputs
            if (rules.maxlength && /-1|2147483647|524288/.test(rules.maxlength)) {
                delete rules.maxlength;
            }

            return rules;
        },
        dataRules: function(element) {
            var method, value,
                    rules = {}, $element = $(element);
            for (method in $.validator.methods) {
                value = $element.data("rule-" + method.toLowerCase());
                if (value !== undefined) {
                    rules[method] = value;
                }
            }
            return rules;
        },
        staticRules: function(element) {
            var rules = {};
            var validator = $.data(element.form, "validator");
            if (validator.settings.rules) {
                rules = $.validator.normalizeRule(validator.settings.rules[element.name]) || {};
            }
            return rules;
        },
        normalizeRules: function(rules, element) {
            // handle dependency check
            $.each(rules, function(prop, val) {
                // ignore rule when param is explicitly false, eg. required:false
                if (val === false) {
                    delete rules[prop];
                    return;
                }
                if (val.param || val.depends) {
                    var keepRule = true;
                    switch (typeof val.depends) {
                        case "string":
                            keepRule = !!$(val.depends, element.form).length;
                            break;
                        case "function":
                            keepRule = val.depends.call(element, element);
                            break;
                    }
                    if (keepRule) {
                        rules[prop] = val.param !== undefined ? val.param : true;
                    } else {
                        delete rules[prop];
                    }
                }
            });

            // evaluate parameters
            $.each(rules, function(rule, parameter) {
                rules[rule] = $.isFunction(parameter) ? parameter(element) : parameter;
            });

            // clean number parameters
            $.each(['minlength', 'maxlength'], function() {
                if (rules[this]) {
                    rules[this] = Number(rules[this]);
                }
            });
            $.each(['rangelength', 'range'], function() {
                var parts;
                if (rules[this]) {
                    if ($.isArray(rules[this])) {
                        rules[this] = [Number(rules[this][0]), Number(rules[this][1])];
                    } else if (typeof rules[this] === "string") {
                        parts = rules[this].split(/[\s,]+/);
                        rules[this] = [Number(parts[0]), Number(parts[1])];
                    }
                }
            });

            if ($.validator.autoCreateRanges) {
                // auto-create ranges
                if (rules.min && rules.max) {
                    rules.range = [rules.min, rules.max];
                    delete rules.min;
                    delete rules.max;
                }
                if (rules.minlength && rules.maxlength) {
                    rules.rangelength = [rules.minlength, rules.maxlength];
                    delete rules.minlength;
                    delete rules.maxlength;
                }
            }

            return rules;
        },
        // Converts a simple string to a {string: true} rule, e.g., "required" to {required:true}
        normalizeRule: function(data) {
            if (typeof data === "string") {
                var transformed = {};
                $.each(data.split(/\s/), function() {
                    transformed[this] = true;
                });
                data = transformed;
            }
            return data;
        },
        // http://docs.jquery.com/Plugins/Validation/Validator/addMethod
        addMethod: function(name, method, message) {
            $.validator.methods[name] = method;
            $.validator.messages[name] = message !== undefined ? message : $.validator.messages[name];
            if (method.length < 3) {
                $.validator.addClassRules(name, $.validator.normalizeRule(name));
            }
        },
        methods: {
            // http://docs.jquery.com/Plugins/Validation/Methods/required
            required: function(value, element, param) {
                // check if dependency is met
                if (!this.depend(param, element)) {
                    return "dependency-mismatch";
                }
                if (element.nodeName.toLowerCase() === "select") {
                    // could be an array for select-multiple or a string, both are fine this way
                    var val = $(element).val();
                    return val && val.length > 0;
                }
                if (this.checkable(element)) {
                    return this.getLength(value, element) > 0;
                }
                return $.trim(value).length > 0;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/email
            email: function(value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                return this.optional(element) || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/url
            url: function(value, element) {
                // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
                return this.optional(element) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/date
            date: function(value, element) {
                var $return = this.optional(element) || !/Invalid|NaN/.test(new Date(value).toString());
                if ($return === false && value.indexOf("XVAR_") != -1) {
                    $return = true;
                }
                return $return;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
            dateISO: function(value, element) {
                return this.optional(element) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/number
            number: function(value, element) {
                return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/digits
            digits: function(value, element) {
                return this.optional(element) || /^\d+$/.test(value);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/creditcard
            // based on http://en.wikipedia.org/wiki/Luhn
            creditcard: function(value, element) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }
                // accept only spaces, digits and dashes
                if (/[^0-9 \-]+/.test(value)) {
                    return false;
                }
                var nCheck = 0,
                        nDigit = 0,
                        bEven = false;

                value = value.replace(/\D/g, "");

                for (var n = value.length - 1; n >= 0; n--) {
                    var cDigit = value.charAt(n);
                    nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9) {
                            nDigit -= 9;
                        }
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }

                return (nCheck % 10) === 0;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/minlength
            minlength: function(value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length >= param;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/maxlength
            maxlength: function(value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || length <= param;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/rangelength
            rangelength: function(value, element, param) {
                var length = $.isArray(value) ? value.length : this.getLength($.trim(value), element);
                return this.optional(element) || (length >= param[0] && length <= param[1]);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/min
            min: function(value, element, param) {
                return this.optional(element) || value >= param;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/max
            max: function(value, element, param) {
                return this.optional(element) || value <= param;
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/range
            range: function(value, element, param) {
                return this.optional(element) || (value >= param[0] && value <= param[1]);
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/equalTo
            equalTo: function(value, element, param) {
                // bind to the blur event of the target in order to revalidate whenever the target field is updated
                // TODO find a way to bind the event just once, avoiding the unbind-rebind overhead
                var target = $(param);
                if (this.settings.onfocusout) {
                    target.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
                        $(element).valid();
                    });
                }
                return value === target.val();
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/remote
            remote: function(value, element, param) {
                if (this.optional(element)) {
                    return "dependency-mismatch";
                }

                var previous = this.previousValue(element);
                if (!this.settings.messages[element.name]) {
                    this.settings.messages[element.name] = {};
                }
                previous.originalMessage = this.settings.messages[element.name].remote;
                this.settings.messages[element.name].remote = previous.message;

                param = typeof param === "string" && {url: param} || param;

                if (previous.old === value) {
                    return previous.valid;
                }

                previous.old = value;
                var validator = this;
                this.startRequest(element);
                var data = {};
                data[element.name] = value;
                $.ajax($.extend(true, {
                    url: param,
                    mode: "abort",
                    port: "validate" + element.name,
                    dataType: "json",
                    data: data,
                    success: function(response) {
                        validator.settings.messages[element.name].remote = previous.originalMessage;
                        var valid = response === true || response === "true";
                        if (valid) {
                            var submitted = validator.formSubmitted;
                            validator.prepareElement(element);
                            validator.formSubmitted = submitted;
                            validator.successList.push(element);
                            delete validator.invalid[element.name];
                            validator.showErrors();
                        } else {
                            var errors = {};
                            var message = response || validator.defaultMessage(element, "remote");
                            errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
                            validator.invalid[element.name] = true;
                            validator.showErrors(errors);
                        }
                        previous.valid = valid;
                        validator.stopRequest(element, valid);
                    }
                }, param));
                return "pending";
            }

        }

    });

// deprecated, use $.validator.format instead
    $.validatorFormat = $.validator.format;

}(jQuery));

// ajax mode: abort
// usage: $.ajax({ mode: "abort"[, port: "uniqueport"]});
// if mode:"abort" is used, the previous request on that port (port can be undefined) is aborted via XMLHttpRequest.abort()
(function($) {
    var pendingRequests = {};
    // Use a prefilter if available (1.5+)
    if ($.ajaxPrefilter) {
        $.ajaxPrefilter(function(settings, _, xhr) {
            var port = settings.port;
            if (settings.mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                pendingRequests[port] = xhr;
            }
        });
    } else {
        // Proxy ajax
        var ajax = $.ajax;
        $.ajax = function(settings) {
            var mode = ("mode" in settings ? settings : $.ajaxSettings).mode,
                    port = ("port" in settings ? settings : $.ajaxSettings).port;
            if (mode === "abort") {
                if (pendingRequests[port]) {
                    pendingRequests[port].abort();
                }
                pendingRequests[port] = ajax.apply(this, arguments);
                return pendingRequests[port];
            }
            return ajax.apply(this, arguments);
        };
    }
}(jQuery));

// provides delegate(type: String, delegate: Selector, handler: Callback) plugin for easier event delegation
// handler is only called when $(event.target).is(delegate), in the scope of the jquery-object for event.target
(function($) {
    $.extend($.fn, {
        validateDelegate: function(delegate, type, handler) {
            return this.bind(type, function(event) {
                var target = $(event.target);
                if (target.is(delegate)) {
                    return handler.apply(target, arguments);
                }
            });
        }
    });
}(jQuery));

/* FILENAME:/js/jquery.validate.mapping.js*/
$(document).bind('document_update', function(event, dom) {
    var forms = [];
    if (dom.is('form')) {
        forms.push(dom);
    } else {
        forms = dom.find('form');
    }
    $.each(forms, function(k, v) {
        $(v).ready(function(){
        $.validate_form($(v));
        $(v).submit(function() {
                $(this).valid();
            });
            $(v).find('input[type="submit"]').click(function(){
                if(!$(this).closest('form').valid()){
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
                }                   
            });
            });
    });
});
// constructs and returns the final data (rules and messages) to pass to original jquery.validate plugin
$.validation = function(filter, model, fdata) {
    for (x in filter) {
        fdata['rules']['data[' + model + '][' + x + ']'] = {};
        fdata['messages']['data[' + model + '][' + x + ']'] = {};
        $.validate_rules(x, filter[x], model, fdata)
    }
    for (x in fdata['messages']) {

        popup_x = x.split('][');
        pop = popup_x.pop();
        pop = '__' + pop;
        popup_x.push(pop);
        popup_x = popup_x.join('][');


        fdata['messages'][popup_x] = fdata['messages'][x];
        fdata['rules'][popup_x] = fdata['rules'][x];
    }
    return fdata;
};

// Finds the nested fields and rules associated and calls $.validate_map on these
$.validate_rules = function(name, rules, model, fdata, pre_x, ans_x) {
    if (typeof (rules) !== 'undefined') {
        for (x in rules) {
            data = [];
            if (x == 'rule') {
                if (isNaN(parseInt(rules[x])) === true) {
                    data = $.validate_map(rules[x]);
                    if (typeof (data) !== 'undefined') {
                        fdata['rules']['data[' + model + '][' + name + ']'] = jQuery.extend(fdata['rules']['data[' + model + '][' + name + ']'], data[0]);
                        fdata['messages']['data[' + model + '][' + name + ']'] = jQuery.extend(fdata['messages']['data[' + model + '][' + name + ']'], data[1]);
                    }
                }

            }
            else if (x == 'params') {
                var objectLength=0;
                $.each(rules['params'],function(k,v){
                    objectLength++;
                });
                if (rules['params'].length > 0 || objectLength)
                    if (rules[x]['options'][1] != 'undefined') {
                        data = $.validate_map(rules[x]['options'][1]);
                    }
                if (typeof (data) !== 'undefined') {
                    if (typeof (ans_x) != 'undefined') {
                        name = name + '][' + ans_x;
                    }
                    fdata['rules']['data[' + model + '][' + name + ']'] = jQuery.extend(fdata['rules']['data[' + model + '][' + name + ']'], data[0]);
                    fdata['messages']['data[' + model + '][' + name + ']'] = jQuery.extend(fdata['messages']['data[' + model + '][' + name + ']'], data[1]);
                }
            }
            else if ((rules instanceof Array) || (rules instanceof Object)) {

                $.validate_rules(name, rules[x], model, fdata, x, pre_x)

            }


        }

    }

};
// maps Maax rules to jquery validation plugin rules
$.validate_map = function(rule) {
    var map = [];
    switch (rule) {
        case "\\kernel\\validation::notEmpty":
            map = [{"required": true}, {"required": "Required"}];
            break;
        case "notEmpty":
            map = [{"required": true}, {"required": "Required"}];
            break;
        case "\\kernel\\validation::isValidEmail":
            map = [{"email": true}, {"email": "Invalid"}];
            break;
        case "\\kernel\\validation::isValidPhoneNumber":
            map = [{"intlphone": true}, {"intlphone": "Invalid"}];
            break;
    }
    return map;

};
// function to validate phone number
jQuery.validator.addMethod('intlphone', function(value) {
    return (value.match(/^\s*(?!([^-]*-){5})(\+\s*\d+)?\s*(\(\s*\d+\s*\))?\s*[- \d]+\s*$|^\s*$/));
});
// validates form
$.validate_form = function(form) {
    var rules = {};
    var messages = {};
    var jsRules = {
        rules: rules,
        messages: messages
    };
    var fdata = $.validation(form.data('filter_rules'), form.data('model'), jsRules);
  //  form.validate(fdata);
};
/* FILENAME:/js/jquery.formula.js*/
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
/* FILENAME:/js/json.js*/
/*
    http://www.JSON.org/json2.js
    2011-01-18

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, strict: false, regexp: false */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

var JSON;
if (!JSON) {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
/* FILENAME:/js/jquery-ui-timepicker.js*/
/*
* jQuery timepicker addon
* By: Trent Richardson [http://trentrichardson.com]
* Version 0.9.2
* Last Modified: 12/27/2010
* 
* Copyright 2010 Trent Richardson
* Dual licensed under the MIT and GPL licenses.
* http://trentrichardson.com/Impromptu/GPL-LICENSE.txt
* http://trentrichardson.com/Impromptu/MIT-LICENSE.txt
* 
* HERES THE CSS:
* .ui-timepicker-div .ui-widget-header{ margin-bottom: 8px; }
* .ui-timepicker-div dl{ text-align: left; }
* .ui-timepicker-div dl dt{ height: 25px; }
* .ui-timepicker-div dl dd{ margin: -25px 0 10px 65px; }
* .ui-timepicker-div td { font-size: 90%; }
*/

(function($) {

$.extend($.ui, { timepicker: { version: "0.9.2" } });

/* Time picker manager.
   Use the singleton instance of this class, $.timepicker, to interact with the time picker.
   Settings for (groups of) time pickers are maintained in an instance object,
   allowing multiple different settings on the same page. */

function Timepicker() {
	this.regional = []; // Available regional settings, indexed by language code
	this.regional[''] = { // Default regional settings
		currentText: 'Now',
		closeText: 'Done',
		ampm: false,
		timeFormat: 'hh:mm tt',
		timeOnlyTitle: 'Choose Time',
		timeText: 'Time',
		hourText: 'Hour',
		minuteText: 'Minute',
		secondText: 'Second'
	};
	this._defaults = { // Global defaults for all the datetime picker instances
		showButtonPanel: true,
		timeOnly: false,
		showHour: true,
		showMinute: true,
		showSecond: false,
		showTime: true,
		stepHour: 0.05,
		stepMinute: 0.05,
		stepSecond: 0.05,
		hour: 0,
		minute: 0,
		second: 0,
		hourMin: 0,
		minuteMin: 0,
		secondMin: 0,
		hourMax: 23,
		minuteMax: 59,
		secondMax: 59,
		minDateTime: null,
		maxDateTime: null,		
		hourGrid: 0,
		minuteGrid: 0,
		secondGrid: 0,
		alwaysSetTime: true,
		separator: ' ',
		altFieldTimeOnly: true
	};
	$.extend(this._defaults, this.regional['']);
}

$.extend(Timepicker.prototype, {
	$input: null,
	$altInput: null,
	$timeObj: null,
	inst: null,
	hour_slider: null,
	minute_slider: null,
	second_slider: null,
	hour: 0,
	minute: 0,
	second: 0,
	hourMinOriginal: null,
	minuteMinOriginal: null,
	secondMinOriginal: null,
	hourMaxOriginal: null,
	minuteMaxOriginal: null,
	secondMaxOriginal: null,
	ampm: '',
	formattedDate: '',
	formattedTime: '',
	formattedDateTime: '',

	/* Override the default settings for all instances of the time picker.
	   @param  settings  object - the new settings to use as defaults (anonymous object)
	   @return the manager object */
	setDefaults: function(settings) {
		extendRemove(this._defaults, settings || {});
		return this;
	},

	//########################################################################
	// Create a new Timepicker instance
	//########################################################################
	_newInst: function($input, o) {
		var tp_inst = new Timepicker(),
			inlineSettings = {};

		tp_inst.hour = tp_inst._defaults.hour;
		tp_inst.minute = tp_inst._defaults.minute;
		tp_inst.second = tp_inst._defaults.second;
		tp_inst.ampm = '';
		tp_inst.$input = $input;
			

		for (var attrName in this._defaults) {
			var attrValue = $input.attr('time:' + attrName);
			if (attrValue) {
				try {
					inlineSettings[attrName] = eval(attrValue);
				} catch (err) {
					inlineSettings[attrName] = attrValue;
				}
			}
		}
		tp_inst._defaults = $.extend({}, this._defaults, inlineSettings, o, {
			beforeShow: function(input, dp_inst) {
				if (o.altField)
					tp_inst.$altInput = $($.datepicker._get(dp_inst, 'altField'))
						.css({ cursor: 'pointer' })
						.focus(function(){
							$input.trigger("focus");
						});
				if ($.isFunction(o.beforeShow))
					o.beforeShow(input, dp_inst);
			},
			onChangeMonthYear: function(year, month, dp_inst) {
				// Update the time as well : this prevents the time from disappearing from the $input field.
				tp_inst._updateDateTime(dp_inst);
				if ($.isFunction(o.onChangeMonthYear))
					o.onChangeMonthYear(year, month, dp_inst);
			},
			onClose: function(dateText, dp_inst) {
				if (tp_inst.timeDefined === true && $input.val() != '')
					tp_inst._updateDateTime(dp_inst);
				if ($.isFunction(o.onClose))
					o.onClose(dateText, dp_inst);
			},
			timepicker: tp_inst // add timepicker as a property of datepicker: $.datepicker._get(dp_inst, 'timepicker');
		});

		// datepicker needs minDate/maxDate, timepicker needs minDateTime/maxDateTime..
		if(tp_inst._defaults.minDate !== undefined && tp_inst._defaults.minDate instanceof Date)
			tp_inst._defaults.minDateTime = new Date(tp_inst._defaults.minDate.getTime());
		if(tp_inst._defaults.minDateTime !== undefined && tp_inst._defaults.minDateTime instanceof Date)
			tp_inst._defaults.minDate = new Date(tp_inst._defaults.minDateTime.getTime());
		if(tp_inst._defaults.maxDate !== undefined && tp_inst._defaults.maxDate instanceof Date)
			tp_inst._defaults.maxDateTime = new Date(tp_inst._defaults.maxDate.getTime());
		if(tp_inst._defaults.maxDateTime !== undefined && tp_inst._defaults.maxDateTime instanceof Date)
			tp_inst._defaults.maxDate = new Date(tp_inst._defaults.maxDateTime.getTime());
			
		return tp_inst;
	},

	//########################################################################
	// add our sliders to the calendar
	//########################################################################
	_addTimePicker: function(dp_inst) {
		var currDT = (this.$altInput && this._defaults.altFieldTimeOnly) ?
				this.$input.val() + ' ' + this.$altInput.val() : 
				this.$input.val();

		this.timeDefined = this._parseTime(currDT);
		this._limitMinMaxDateTime(dp_inst, false);
		this._injectTimePicker();
	},

	//########################################################################
	// parse the time string from input value or _setTime
	//########################################################################
	_parseTime: function(timeString, withDate) {
		var regstr = this._defaults.timeFormat.toString()
				.replace(/h{1,2}/ig, '(\\d?\\d)')
				.replace(/m{1,2}/ig, '(\\d?\\d)')
				.replace(/s{1,2}/ig, '(\\d?\\d)')
				.replace(/t{1,2}/ig, '(am|pm|a|p)?')
				.replace(/\s/g, '\\s?') + '$',
			order = this._getFormatPositions(),
			treg;

		if (!this.inst) this.inst = $.datepicker._getInst(this.$input[0]);

		if (withDate || !this._defaults.timeOnly) {
			// the time should come after x number of characters and a space.
			// x = at least the length of text specified by the date format
			var dp_dateFormat = $.datepicker._get(this.inst, 'dateFormat');
			regstr = '.{' + dp_dateFormat.length + ',}\\s*' + this._defaults.separator.replace(/\s/g, '\\s?') + regstr;
		}

		treg = timeString.match(new RegExp(regstr, 'i'));

		if (treg) {
			if (order.t !== -1)
				this.ampm = ((treg[order.t] === undefined || treg[order.t].length === 0) ?
					'' :
					(treg[order.t].charAt(0).toUpperCase() == 'A') ? 'AM' : 'PM').toUpperCase();

			if (order.h !== -1) {
				if (this.ampm == 'AM' && treg[order.h] == '12') 
					this.hour = 0; // 12am = 0 hour
				else if (this.ampm == 'PM' && treg[order.h] != '12') 
					this.hour = (parseFloat(treg[order.h]) + 12).toFixed(0); // 12pm = 12 hour, any other pm = hour + 12
				else this.hour = Number(treg[order.h]);
			}

			if (order.m !== -1) this.minute = Number(treg[order.m]);
			if (order.s !== -1) this.second = Number(treg[order.s]);
			
			return true;

		}
		return false;
	},

	//########################################################################
	// figure out position of time elements.. cause js cant do named captures
	//########################################################################
	_getFormatPositions: function() {
		var finds = this._defaults.timeFormat.toLowerCase().match(/(h{1,2}|m{1,2}|s{1,2}|t{1,2})/g),
			orders = { h: -1, m: -1, s: -1, t: -1 };

		if (finds)
			for (var i = 0; i < finds.length; i++)
				if (orders[finds[i].toString().charAt(0)] == -1)
					orders[finds[i].toString().charAt(0)] = i + 1;

		return orders;
	},

	//########################################################################
	// generate and inject html for timepicker into ui datepicker
	//########################################################################
	_injectTimePicker: function() {
		var $dp = this.inst.dpDiv,
			o = this._defaults,
			tp_inst = this,
			// Added by Peter Medeiros:
			// - Figure out what the hour/minute/second max should be based on the step values.
			// - Example: if stepMinute is 15, then minMax is 45.
			hourMax = (o.hourMax - (o.hourMax % o.stepHour)).toFixed(0),
			minMax  = (o.minuteMax - (o.minuteMax % o.stepMinute)).toFixed(0),
			secMax  = (o.secondMax - (o.secondMax % o.stepSecond)).toFixed(0),
			dp_id = this.inst.id.toString().replace(/([^A-Za-z0-9_])/g, '');

		// Prevent displaying twice
		if ($dp.find("div#ui-timepicker-div-"+ dp_id).length === 0) {
			var noDisplay = ' style="display:none;"',
				html =	'<div class="ui-timepicker-div" id="ui-timepicker-div-' + dp_id + '"><dl>' +
						'<dt class="ui_tpicker_time_label" id="ui_tpicker_time_label_' + dp_id + '"' +
						((o.showTime) ? '' : noDisplay) + '>' + o.timeText + '</dt>' +
						'<dd class="ui_tpicker_time" id="ui_tpicker_time_' + dp_id + '"' +
						((o.showTime) ? '' : noDisplay) + '></dd>' +
						'<dt class="ui_tpicker_hour_label" id="ui_tpicker_hour_label_' + dp_id + '"' +
						((o.showHour) ? '' : noDisplay) + '>' + o.hourText + '</dt>',
				hourGridSize = 0,
				minuteGridSize = 0,
				secondGridSize = 0,
				size;
 
			if (o.showHour && o.hourGrid > 0) {
				html += '<dd class="ui_tpicker_hour">' +
						'<div id="ui_tpicker_hour_' + dp_id + '"' + ((o.showHour)   ? '' : noDisplay) + '></div>' +
						'<div style="padding-left: 1px"><table><tr>';

				for (var h = o.hourMin; h < hourMax; h += o.hourGrid) {
					hourGridSize++;
					var tmph = (o.ampm && h > 12) ? h-12 : h;
					if (tmph < 10) tmph = '0' + tmph;
					if (o.ampm) {
						if (h == 0) tmph = 12 +'a';
						else if (h < 12) tmph += 'a';
						else tmph += 'p';
					}
					html += '<td>' + tmph + '</td>';
				}

				html += '</tr></table></div>' +
						'</dd>';
			} else html += '<dd class="ui_tpicker_hour" id="ui_tpicker_hour_' + dp_id + '"' +
							((o.showHour) ? '' : noDisplay) + '></dd>';

			html += '<dt class="ui_tpicker_minute_label" id="ui_tpicker_minute_label_' + dp_id + '"' +
					((o.showMinute) ? '' : noDisplay) + '>' + o.minuteText + '</dt>';

			if (o.showMinute && o.minuteGrid > 0) {
				html += '<dd class="ui_tpicker_minute ui_tpicker_minute_' + o.minuteGrid + '">' +
						'<div id="ui_tpicker_minute_' + dp_id + '"' +
						((o.showMinute) ? '' : noDisplay) + '></div>' +
						'<div style="padding-left: 1px"><table><tr>';

				for (var m = o.minuteMin; m < minMax; m += o.minuteGrid) {
					minuteGridSize++;
					html += '<td>' + ((m < 10) ? '0' : '') + m + '</td>';
				}

				html += '</tr></table></div>' +
						'</dd>';
			} else html += '<dd class="ui_tpicker_minute" id="ui_tpicker_minute_' + dp_id + '"' +
							((o.showMinute) ? '' : noDisplay) + '></dd>';

			html += '<dt class="ui_tpicker_second_label" id="ui_tpicker_second_label_' + dp_id + '"' +
					((o.showSecond) ? '' : noDisplay) + '>' + o.secondText + '</dt>';

			if (o.showSecond && o.secondGrid > 0) {
				html += '<dd class="ui_tpicker_second ui_tpicker_second_' + o.secondGrid + '">' +
						'<div id="ui_tpicker_second_' + dp_id + '"' +
						((o.showSecond) ? '' : noDisplay) + '></div>' +
						'<div style="padding-left: 1px"><table><tr>';

				for (var s = o.secondMin; s < secMax; s += o.secondGrid) {
					secondGridSize++;
					html += '<td>' + ((s < 10) ? '0' : '') + s + '</td>';
				}

				html += '</tr></table></div>' +
						'</dd>';
			} else html += '<dd class="ui_tpicker_second" id="ui_tpicker_second_' + dp_id + '"'	+
							((o.showSecond) ? '' : noDisplay) + '></dd>';

			html += '</dl></div>';
			$tp = $(html);

				// if we only want time picker...
			if (o.timeOnly === true) {
				$tp.prepend(
					'<div class="ui-widget-header ui-helper-clearfix ui-corner-all">' +
						'<div class="ui-datepicker-title">' + o.timeOnlyTitle + '</div>' +
					'</div>');
				$dp.find('.ui-datepicker-header, .ui-datepicker-calendar').hide();
			}

			this.hour_slider = $tp.find('#ui_tpicker_hour_'+ dp_id).slider({
				orientation: "horizontal",
				value: this.hour,
				min: o.hourMin,
				max: hourMax,
				step: o.stepHour,
				slide: function(event, ui) {
					tp_inst.hour_slider.slider( "option", "value", ui.value);
					tp_inst._onTimeChange();
				}
			});

			// Updated by Peter Medeiros:
			// - Pass in Event and UI instance into slide function
			this.minute_slider = $tp.find('#ui_tpicker_minute_'+ dp_id).slider({
				orientation: "horizontal",
				value: this.minute,
				min: o.minuteMin,
				max: minMax,
				step: o.stepMinute,
				slide: function(event, ui) {
					// update the global minute slider instance value with the current slider value
					tp_inst.minute_slider.slider( "option", "value", ui.value);
					tp_inst._onTimeChange();
				}
			});

			this.second_slider = $tp.find('#ui_tpicker_second_'+ dp_id).slider({
				orientation: "horizontal",
				value: this.second,
				min: o.secondMin,
				max: secMax,
				step: o.stepSecond,
				slide: function(event, ui) {
					tp_inst.second_slider.slider( "option", "value", ui.value);
					tp_inst._onTimeChange();
				}
			});

			// Add grid functionality
			if (o.showHour && o.hourGrid > 0) {
				size = 100 * hourGridSize * o.hourGrid / (hourMax - o.hourMin);

				$tp.find(".ui_tpicker_hour table").css({
					width: size + "%",
					marginLeft: (size / (-2 * hourGridSize)) + "%",
					borderCollapse: 'collapse'
				}).find("td").each( function(index) {
					$(this).click(function() {
						var h = $(this).html();
						if(o.ampm)	{
							var ap = h.substring(2).toLowerCase(),
								aph = parseInt(h.substring(0,2));
							if (ap == 'a') {
								if (aph == 12) h = 0;
								else h = aph;
							} else if (aph == 12) h = 12;
							else h = aph + 12;
						}
						tp_inst.hour_slider.slider("option", "value", h);
						tp_inst._onTimeChange();
					}).css({
						cursor: 'pointer',
						width: (100 / hourGridSize) + '%',
						textAlign: 'center',
						overflow: 'hidden'
					});
				});
			}

			if (o.showMinute && o.minuteGrid > 0) {
				size = 100 * minuteGridSize * o.minuteGrid / (minMax - o.minuteMin);
				$tp.find(".ui_tpicker_minute table").css({
					width: size + "%",
					marginLeft: (size / (-2 * minuteGridSize)) + "%",
					borderCollapse: 'collapse'
				}).find("td").each(function(index) {
					$(this).click(function() {
						tp_inst.minute_slider.slider("option", "value", $(this).html());
						tp_inst._onTimeChange();
					}).css({
						cursor: 'pointer',
						width: (100 / minuteGridSize) + '%',
						textAlign: 'center',
						overflow: 'hidden'
					});
				});
			}

			if (o.showSecond && o.secondGrid > 0) {
				$tp.find(".ui_tpicker_second table").css({
					width: size + "%",
					marginLeft: (size / (-2 * secondGridSize)) + "%",
					borderCollapse: 'collapse'
				}).find("td").each(function(index) {
					$(this).click(function() {
						tp_inst.second_slider.slider("option", "value", $(this).html());
						tp_inst._onTimeChange();
					}).css({
						cursor: 'pointer',
						width: (100 / secondGridSize) + '%',
						textAlign: 'center',
						overflow: 'hidden'
					});
				});
			}

			var $buttonPanel = $dp.find('.ui-datepicker-buttonpane');
			if ($buttonPanel.length) $buttonPanel.before($tp);
			else $dp.append($tp);

			this.$timeObj = $('#ui_tpicker_time_'+ dp_id);

			if (this.inst !== null) {
				var timeDefined = this.timeDefined;
				this._onTimeChange();
				this.timeDefined = timeDefined;
			}
		}
	},

	//########################################################################
	// This function tries to limit the ability to go outside the 
	// min/max date range
	//########################################################################
	_limitMinMaxDateTime: function(dp_inst, adjustSliders){
		var o = this._defaults,
			dp_date = new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay),
			tp_date = new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay, this.hour, this.minute, this.second, 0);
		
		if(this._defaults.minDateTime !== null && dp_date){
			var minDateTime = this._defaults.minDateTime,
				minDateTimeDate = new Date(minDateTime.getFullYear(), minDateTime.getMonth(), minDateTime.getDate(), 0, 0, 0, 0);
			
			if(this.hourMinOriginal === null || this.minuteMinOriginal === null || this.secondMinOriginal === null){
				this.hourMinOriginal = o.hourMin;
				this.minuteMinOriginal = o.minuteMin;
				this.secondMinOriginal = o.secondMin;
			}
		
			if(minDateTimeDate.getTime() == dp_date.getTime()){
				this._defaults.hourMin = minDateTime.getHours();
				this._defaults.minuteMin = minDateTime.getMinutes();
				this._defaults.secondMin = minDateTime.getSeconds();

				if(this.hour < this._defaults.hourMin) this.hour = this._defaults.hourMin;
				if(this.minute < this._defaults.minuteMin) this.minute = this._defaults.minuteMin;
				if(this.second < this._defaults.secondMin) this.second = this._defaults.secondMin;
			}else{
				this._defaults.hourMin = this.hourMinOriginal;
				this._defaults.minuteMin = this.minuteMinOriginal;
				this._defaults.secondMin = this.secondMinOriginal;
			}
		}

		if(this._defaults.maxDateTime !== null && dp_date){
			var maxDateTime = this._defaults.maxDateTime,
				maxDateTimeDate = new Date(maxDateTime.getFullYear(), maxDateTime.getMonth(), maxDateTime.getDate(), 0, 0, 0, 0);
	
			if(this.hourMaxOriginal === null || this.minuteMaxOriginal === null || this.secondMaxOriginal === null){
				this.hourMaxOriginal = o.hourMax;
				this.minuteMaxOriginal = o.minuteMax;
				this.secondMaxOriginal = o.secondMax;
			}
		
			if(maxDateTimeDate.getTime() == dp_date.getTime()){
				this._defaults.hourMax = maxDateTime.getHours();
				this._defaults.minuteMax = maxDateTime.getMinutes();
				this._defaults.secondMax = maxDateTime.getSeconds();
				
				if(this.hour > this._defaults.hourMax){ this.hour = this._defaults.hourMax; }
				if(this.minute > this._defaults.minuteMax) this.minute = this._defaults.minuteMax;
				if(this.second > this._defaults.secondMax) this.second = this._defaults.secondMax;
			}else{
				this._defaults.hourMax = this.hourMaxOriginal;
				this._defaults.minuteMax = this.minuteMaxOriginal;
				this._defaults.secondMax = this.secondMaxOriginal;
			}
		}
				
		if(adjustSliders !== undefined && adjustSliders === true){
			this.hour_slider.slider("option", { min: this._defaults.hourMin, max: this._defaults.hourMax }).slider('value', this.hour);
			this.minute_slider.slider("option", { min: this._defaults.minuteMin, max: this._defaults.minuteMax }).slider('value', this.minute);
			this.second_slider.slider("option", { min: this._defaults.secondMin, max: this._defaults.secondMax }).slider('value', this.second);
		}

	},
	
	//########################################################################
	// when a slider moves, set the internal time...
	// on time change is also called when the time is updated in the text field
	//########################################################################
	_onTimeChange: function() {
		var hour   = (this.hour_slider) ? this.hour_slider.slider('value') : false,
			minute = (this.minute_slider) ? this.minute_slider.slider('value') : false,
			second = (this.second_slider) ? this.second_slider.slider('value') : false;

		if (hour !== false) hour = parseInt(hour,10);
		if (minute !== false) minute = parseInt(minute,10);
		if (second !== false) second = parseInt(second,10);

		var ampm = (hour < 12) ? 'AM' : 'PM';
			
		// If the update was done in the input field, the input field should not be updated.
		// If the update was done using the sliders, update the input field.
		var hasChanged = (hour != this.hour || minute != this.minute || second != this.second || (this.ampm.length > 0 && this.ampm != ampm));
		
		if (hasChanged) {

			if (hour !== false) {
				this.hour = hour;
				if (this._defaults.ampm) this.ampm = ampm;
			}
			if (minute !== false) this.minute = minute;
			if (second !== false) this.second = second;

		}
		this._formatTime();
		if (this.$timeObj) this.$timeObj.text(this.formattedTime);
		this.timeDefined = true;
		if (hasChanged) this._updateDateTime();
	},

	//########################################################################
	// format the time all pretty...
	//########################################################################
	_formatTime: function(time, format, ampm) {
		if (ampm == undefined) ampm = this._defaults.ampm;
		time = time || { hour: this.hour, minute: this.minute, second: this.second, ampm: this.ampm };
		var tmptime = format || this._defaults.timeFormat.toString();

		if (ampm) {
			var hour12 = ((time.ampm == 'AM') ? (time.hour) : (time.hour % 12));
			hour12 = (Number(hour12) === 0) ? 12 : hour12;
			tmptime = tmptime.toString()
				.replace(/hh/g, ((hour12 < 10) ? '0' : '') + hour12)
				.replace(/h/g, hour12)
				.replace(/mm/g, ((time.minute < 10) ? '0' : '') + time.minute)
				.replace(/m/g, time.minute)
				.replace(/ss/g, ((time.second < 10) ? '0' : '') + time.second)
				.replace(/s/g, time.second)
				.replace(/TT/g, time.ampm.toUpperCase())
				.replace(/tt/g, time.ampm.toLowerCase())
				.replace(/T/g, time.ampm.charAt(0).toUpperCase())
				.replace(/t/g, time.ampm.charAt(0).toLowerCase());
		} else {
			tmptime = tmptime.toString()
				.replace(/hh/g, ((time.hour < 10) ? '0' : '') + time.hour)
				.replace(/h/g, time.hour)
				.replace(/mm/g, ((time.minute < 10) ? '0' : '') + time.minute)
				.replace(/m/g, time.minute)
				.replace(/ss/g, ((time.second < 10) ? '0' : '') + time.second)
				.replace(/s/g, time.second);
			tmptime = $.trim(tmptime.replace(/t/gi, ''));
		}

		if (arguments.length) return tmptime;
		else this.formattedTime = tmptime;
	},

	//########################################################################
	// update our input with the new date time..
	//########################################################################
	_updateDateTime: function(dp_inst) {
		dp_inst = this.inst || dp_inst,
			dt = new Date(dp_inst.selectedYear, dp_inst.selectedMonth, dp_inst.selectedDay),
			dateFmt = $.datepicker._get(dp_inst, 'dateFormat'),
			formatCfg = $.datepicker._getFormatConfig(dp_inst),
			timeAvailable = dt !== null && this.timeDefined;
		this.formattedDate = $.datepicker.formatDate(dateFmt, (dt === null ? new Date() : dt), formatCfg);
		var formattedDateTime = this.formattedDate;
		if (dp_inst.lastVal !== undefined && (dp_inst.lastVal.length > 0 && this.$input.val().length === 0))
			return;

		if (this._defaults.timeOnly === true) {
			formattedDateTime = this.formattedTime;
		} else if (this._defaults.timeOnly !== true && (this._defaults.alwaysSetTime || timeAvailable)) {			
			formattedDateTime += this._defaults.separator + this.formattedTime;
		}

		this.formattedDateTime = formattedDateTime;
		
		if (this.$altInput && this._defaults.altFieldTimeOnly === true)	{
			this.$altInput.val(this.formattedTime);
			this.$input.val(this.formattedDate);
		} else if(this.$altInput) {
			this.$altInput.val(formattedDateTime);
			this.$input.val(formattedDateTime);
		} else {
			this.$input.val(formattedDateTime);
		}
		
		this.$input.trigger("change");
	}

});

$.fn.extend({
	//########################################################################
	// shorthand just to use timepicker..
	//########################################################################
	timepicker: function(o) {
		o = o || {};
		var tmp_args = arguments;

		if (typeof o == 'object') tmp_args[0] = $.extend(o, { timeOnly: true });

		return $(this).each(function() {
			$.fn.datetimepicker.apply($(this), tmp_args);
		});
	},

	//########################################################################
	// extend timepicker to datepicker
	//########################################################################
	datetimepicker: function(o) {
		o = o || {};
		var $input = this,
			tmp_args = arguments;

		if (typeof(o) == 'string'){
			if(o == 'getDate') 
				return $.fn.datepicker.apply($(this[0]), tmp_args);
			else 
				return this.each(function() {
					var $t = $(this);
					$t.datepicker.apply($t, tmp_args);
				});
		}
		else
			return this.each(function() {
				var $t = $(this);
				$t.datepicker($.timepicker._newInst($t, o)._defaults);
			});
	}
});

//########################################################################
// the bad hack :/ override datepicker so it doesnt close on select
// inspired: http://stackoverflow.com/questions/1252512/jquery-datepicker-prevent-closing-picker-when-clicking-a-date/1762378#1762378
//########################################################################
$.datepicker._base_selectDate = $.datepicker._selectDate;
$.datepicker._selectDate = function (id, dateStr) {
	var inst = this._getInst($(id)[0]),
		tp_inst = this._get(inst, 'timepicker');

	if (tp_inst) {
		tp_inst._limitMinMaxDateTime(inst, true);
		inst.inline = inst.stay_open = true;
		this._base_selectDate(id, dateStr);
		inst.inline = inst.stay_open = false;
		this._notifyChange(inst);
		this._updateDatepicker(inst);
	}
	else this._base_selectDate(id, dateStr);
};

//#############################################################################################
// second bad hack :/ override datepicker so it triggers an event when changing the input field
// and does not redraw the datepicker on every selectDate event
//#############################################################################################
$.datepicker._base_updateDatepicker = $.datepicker._updateDatepicker;
$.datepicker._updateDatepicker = function(inst) {
	if (typeof(inst.stay_open) !== 'boolean' || inst.stay_open === false) {
				
		this._base_updateDatepicker(inst);
		
		// Reload the time control when changing something in the input text field.
		var tp_inst = this._get(inst, 'timepicker');
		if(tp_inst) tp_inst._addTimePicker(inst);
	}
};

//#######################################################################################
// third bad hack :/ override datepicker so it allows spaces and colan in the input field
//#######################################################################################
$.datepicker._base_doKeyPress = $.datepicker._doKeyPress;
$.datepicker._doKeyPress = function(event) {
	var inst = $.datepicker._getInst(event.target),
		tp_inst = $.datepicker._get(inst, 'timepicker');

	if (tp_inst) {
		if ($.datepicker._get(inst, 'constrainInput')) {
			var ampm = tp_inst._defaults.ampm,
				datetimeChars = tp_inst._defaults.timeFormat.toString()
								.replace(/[hms]/g, '')
								.replace(/TT/g, ampm ? 'APM' : '')
								.replace(/T/g, ampm ? 'AP' : '')
								.replace(/tt/g, ampm ? 'apm' : '')
								.replace(/t/g, ampm ? 'ap' : '') +
								" " +
								tp_inst._defaults.separator +
								$.datepicker._possibleChars($.datepicker._get(inst, 'dateFormat')),
				chr = String.fromCharCode(event.charCode === undefined ? event.keyCode : event.charCode);
			return event.ctrlKey || (chr < ' ' || !datetimeChars || datetimeChars.indexOf(chr) > -1);
		}
	}
	
	return $.datepicker._base_doKeyPress(event);
};

//#######################################################################################
// Override key up event to sync manual input changes.
//#######################################################################################
$.datepicker._base_doKeyUp = $.datepicker._doKeyUp;
$.datepicker._doKeyUp = function (event) {
	var inst = $.datepicker._getInst(event.target),
		tp_inst = $.datepicker._get(inst, 'timepicker');

	if (tp_inst) {
		if (tp_inst._defaults.timeOnly && (inst.input.val() != inst.lastVal)) {
			try {
				$.datepicker._updateDatepicker(inst);
			}
			catch (err) {
				$.datepicker.log(err);
			}
		}
	}

	return $.datepicker._base_doKeyUp(event);
};

//#######################################################################################
// override "Today" button to also grab the time.
//#######################################################################################
$.datepicker._base_gotoToday = $.datepicker._gotoToday;
$.datepicker._gotoToday = function(id) {
	this._base_gotoToday(id);
	this._setTime(this._getInst($(id)[0]), new Date());
};

//#######################################################################################
// Create our own set time function
//#######################################################################################
$.datepicker._setTime = function(inst, date) {
	var tp_inst = this._get(inst, 'timepicker');
	if (tp_inst) {
		var defaults = tp_inst._defaults,
			// calling _setTime with no date sets time to defaults
			hour = date ? date.getHours() : defaults.hour,
			minute = date ? date.getMinutes() : defaults.minute,
			second = date ? date.getSeconds() : defaults.second;

		//check if within min/max times..
		if ((hour < defaults.hourMin || hour > defaults.hourMax) || (minute < defaults.minuteMin || minute > defaults.minuteMax) || (second < defaults.secondMin || second > defaults.secondMax)) {
			hour = defaults.hourMin;
			minute = defaults.minuteMin;
			second = defaults.secondMin;
		}

		if (tp_inst.hour_slider) tp_inst.hour_slider.slider('value', hour);
		else tp_inst.hour = hour;
		if (tp_inst.minute_slider) tp_inst.minute_slider.slider('value', minute);
		else tp_inst.minute = minute;
		if (tp_inst.second_slider) tp_inst.second_slider.slider('value', second);
		else tp_inst.second = second;

		tp_inst._onTimeChange();
		tp_inst._updateDateTime(inst);
	}
};

//#######################################################################################
// Create new public method to set only time, callable as $().datepicker('setTime', date)
//#######################################################################################
$.datepicker._setTimeDatepicker = function(target, date, withDate) {
	var inst = this._getInst(target),
		tp_inst = this._get(inst, 'timepicker');

	if (tp_inst) {
		this._setDateFromField(inst);
		var tp_date;
		if (date) {
			if (typeof date == "string") {
				tp_inst._parseTime(date, withDate);
				tp_date = new Date();
				tp_date.setHours(tp_inst.hour, tp_inst.minute, tp_inst.second);
			}
			else tp_date = new Date(date.getTime());
			if (tp_date.toString() == 'Invalid Date') tp_date = undefined;
		}
		this._setTime(inst, tp_date);
	}

};

//#######################################################################################
// override setDate() to allow setting time too within Date object
//#######################################################################################
$.datepicker._base_setDateDatepicker = $.datepicker._setDateDatepicker;
$.datepicker._setDateDatepicker = function(target, date) {
	var inst = this._getInst(target),
	tp_date = (date instanceof Date) ? new Date(date.getTime()) : date;

	this._updateDatepicker(inst);
	this._base_setDateDatepicker.apply(this, arguments);
	this._setTimeDatepicker(target, tp_date, true);
};

//#######################################################################################
// override getDate() to allow getting time too within Date object
//#######################################################################################
$.datepicker._base_getDateDatepicker = $.datepicker._getDateDatepicker;
$.datepicker._getDateDatepicker = function(target, noDefault) {
	var inst = this._getInst(target),
		tp_inst = this._get(inst, 'timepicker');

	if (tp_inst) {
		this._setDateFromField(inst, noDefault);
		var date = this._getDate(inst);
		if (date && tp_inst._parseTime($(target).val(), true)) date.setHours(tp_inst.hour, tp_inst.minute, tp_inst.second);
		return date;
	}
	return this._base_getDateDatepicker(target, noDefault);
};

//#######################################################################################
// jQuery extend now ignores nulls!
//#######################################################################################
function extendRemove(target, props) {
	$.extend(target, props);
	for (var name in props)
		if (props[name] === null || props[name] === undefined)
			target[name] = props[name];
	return target;
}

$.timepicker = new Timepicker(); // singleton instance
$.timepicker.version = "0.9.2";

})(jQuery);

/* FILENAME:/module/cleditor/jquery.cleditor.js*/
/**
 @preserve CLEditor WYSIWYG HTML Editor v1.3.0
 http://premiumsoftware.net/cleditor
 requires jQuery v1.4.2 or later

 Copyright 2010, Chris Landowski, Premium Software, LLC
 Dual licensed under the MIT or GPL Version 2 licenses.
*/

// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// @output_file_name jquery.cleditor.min.js
// ==/ClosureCompiler==

(function($) {

    //==============
    // jQuery Plugin
    //==============

    $.cleditor = {

        // Define the defaults used for all new cleditor instances
        defaultOptions: {
            width:        '100%', // width not including margins, borders or padding
            height:       250, // height not including margins, borders or padding
            controls:     // controls to add to the toolbar
            "bold italic underline strikethrough subscript superscript | font size " +
            "style | color highlight removeformat | bullets numbering | outdent " +
            "indent | alignleft center alignright justify | undo redo | " +
            "rule image link unlink | cut copy paste pastetext | print source",
            colors:       // colors in the color popup
            "FFF FCC FC9 FF9 FFC 9F9 9FF CFF CCF FCF " +
            "CCC F66 F96 FF6 FF3 6F9 3FF 6FF 99F F9F " +
            "BBB F00 F90 FC6 FF0 3F3 6CC 3CF 66C C6C " +
            "999 C00 F60 FC3 FC0 3C0 0CC 36F 63F C3C " +
            "666 900 C60 C93 990 090 399 33F 60C 939 " +
            "333 600 930 963 660 060 366 009 339 636 " +
            "000 300 630 633 330 030 033 006 309 303",    
            fonts:        // font names in the font popup
            "Arial,Arial Black,Comic Sans MS,Courier New,Narrow,Garamond," +
            "Georgia,Impact,Sans Serif,Serif,Tahoma,Trebuchet MS,Verdana",
            sizes:        // sizes in the font size popup
            "1,2,3,4,5,6,7",
            styles:       // styles in the style popup
            [["Paragraph", "<p>"], ["Header 1", "<h1>"], ["Header 2", "<h2>"],
            ["Header 3", "<h3>"],  ["Header 4","<h4>"],  ["Header 5","<h5>"],
            ["Header 6","<h6>"]],
            useCSS:       false, // use CSS to style HTML when possible (not supported in ie)
            docType:      // Document type contained within the editor
            '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
            docCSSFile:   // CSS file used to style the document contained within the editor
            "", 
            bodyStyle:    // style to assign to document body contained within the editor
            "margin:4px; font:10pt Arial,Verdana; cursor:text"
        },

        // Define all usable toolbar buttons - the init string property is 
        //   expanded during initialization back into the buttons object and 
        //   seperate object properties are created for each button.
        //   e.g. buttons.size.title = "Font Size"
        buttons: {
            // name,title,command,popupName (""=use name)
            init:
            "bold,,|" +
        "italic,,|" +
        "underline,,|" +
        "strikethrough,,|" +
        "subscript,,|" +
        "superscript,,|" +
        "font,,fontname,|" +
        "size,Font Size,fontsize,|" +
        "style,,formatblock,|" +
        "color,Font Color,forecolor,|" +
        "highlight,Text Highlight Color,hilitecolor,color|" +
        "removeformat,Remove Formatting,|" +
        "bullets,,insertunorderedlist|" +
        "numbering,,insertorderedlist|" +
        "outdent,,|" +
        "indent,,|" +
        "alignleft,Align Text Left,justifyleft|" +
        "center,,justifycenter|" +
        "alignright,Align Text Right,justifyright|" +
        "justify,,justifyfull|" +
        "undo,,|" +
        "redo,,|" +
        "rule,Insert Horizontal Rule,inserthorizontalrule|" +
        "image,Insert Image,insertimage,url|" +
        "link,Insert Hyperlink,createlink,url|" +
        "unlink,Remove Hyperlink,|" +
        "cut,,|" +
        "copy,,|" +
        "paste,,|" +
        "pastetext,Paste as Text,inserthtml,|" +
        "print,,|" +
        "source,Show Source"
        },

        // imagesPath - returns the path to the images folder
        imagesPath: function() {
            return imagesPath();
        }

    };

    // cleditor - creates a new editor for each of the matched textareas
    $.fn.cleditor = function(options) {

        // Create a new jQuery object to hold the results
        var $result = $([]);

        // Loop through all matching textareas and create the editors
        this.each(function(idx, elem) {
            if (elem.tagName == "TEXTAREA") {
                var data = $.data(elem, CLEDITOR);
                if (!data) data = new cleditor(elem, options);
                $result = $result.add(data);
            }
        });

        // return the new jQuery object
        return $result;

    };
    
    //==================
    // Private Variables
    //==================

    var

    // Misc constants
    BACKGROUND_COLOR = "backgroundColor",
    BUTTON           = "button",
    BUTTON_NAME      = "buttonName",
    CHANGE           = "change",
    CLEDITOR         = "cleditor",
    CLICK            = "click",
    DISABLED         = "disabled",
    DIV_TAG          = "<div>",
    TRANSPARENT      = "transparent",
    UNSELECTABLE     = "unselectable",

    // Class name constants
    MAIN_CLASS       = "cleditorMain",    // main containing div
    TOOLBAR_CLASS    = "cleditorToolbar", // toolbar div inside main div
    GROUP_CLASS      = "cleditorGroup",   // group divs inside the toolbar div
    BUTTON_CLASS     = "cleditorButton",  // button divs inside group div
    DISABLED_CLASS   = "cleditorDisabled",// disabled button divs
    DIVIDER_CLASS    = "cleditorDivider", // divider divs inside group div
    POPUP_CLASS      = "cleditorPopup",   // popup divs inside body
    LIST_CLASS       = "cleditorList",    // list popup divs inside body
    COLOR_CLASS      = "cleditorColor",   // color popup div inside body
    PROMPT_CLASS     = "cleditorPrompt",  // prompt popup divs inside body
    MSG_CLASS        = "cleditorMsg",     // message popup div inside body

    // Test for ie
    ie = $.browser.msie,
    ie6 = /msie\s6/i.test(navigator.userAgent),

    // Test for iPhone/iTouch/iPad
    iOS = /iphone|ipad|ipod/i.test(navigator.userAgent),

    // Popups are created once as needed and shared by all editor instances
    popups = {},

    // Used to prevent the document click event from being bound more than once
    documentClickAssigned,

    // Local copy of the buttons object
    buttons = $.cleditor.buttons;

    //===============
    // Initialization
    //===============

    // Expand the buttons.init string back into the buttons object
    //   and create seperate object properties for each button.
    //   e.g. buttons.size.title = "Font Size"
    $.each(buttons.init.split("|"), function(idx, button) {
        var items = button.split(","), name = items[0];
        buttons[name] = {
            stripIndex: idx,
            name: name,
            title: items[1] === "" ? name.charAt(0).toUpperCase() + name.substr(1) : items[1],
            command: items[2] === "" ? name : items[2],
            popupName: items[3] === "" ? name : items[3]
        };
    });
    delete buttons.init;

    //============
    // Constructor
    //============

    // cleditor - creates a new editor for the passed in textarea element
    cleditor = function(area, options) {

        var editor = this;

        // Get the defaults and override with options
        editor.options = options = $.extend({}, $.cleditor.defaultOptions, options);

        // Hide the textarea and associate it with this editor
        var $area = editor.$area = $(area)
        .hide()
        .data(CLEDITOR, editor)
        .blur(function() {
            // Update the iframe when the textarea loses focus
            updateFrame(editor, true);
        });

        // Create the main container and append the textarea
        var $main = editor.$main = $(DIV_TAG)
        .addClass(MAIN_CLASS)
        .width(options.width)
        .height(options.height);

        // Create the toolbar
        var $toolbar = editor.$toolbar = $(DIV_TAG)
        .addClass(TOOLBAR_CLASS)
        .appendTo($main);

        // Add the first group to the toolbar
        var $group = $(DIV_TAG)
        .addClass(GROUP_CLASS)
        .appendTo($toolbar);
    
        // Add the buttons to the toolbar
        $.each(options.controls.split(" "), function(idx, buttonName) {
            if (buttonName === "") return true;

            // Divider
            if (buttonName == "|") {

                // Add a new divider to the group
                var $div = $(DIV_TAG)
                .addClass(DIVIDER_CLASS)
                .appendTo($group);

                // Create a new group
                $group = $(DIV_TAG)
                .addClass(GROUP_CLASS)
                .appendTo($toolbar);

            }

            // Button
            else {
        
                // Get the button definition
                var button = buttons[buttonName];

                // Add a new button to the group
                var $buttonDiv = $(DIV_TAG)
                .data(BUTTON_NAME, button.name)
                .addClass(BUTTON_CLASS)
                .attr("title", button.title)
                .bind(CLICK, $.proxy(buttonClick, editor))
                .appendTo($group)
                .hover(hoverEnter, hoverLeave);

                // Prepare the button image
                var map = {};
                if (button.css) map = button.css;
                else if (button.image) map.backgroundImage = imageUrl(button.image);
                if (button.stripIndex) map.backgroundPosition = button.stripIndex * -24;
                $buttonDiv.css(map);

                // Add the unselectable attribute for ie
                if (ie)
                    $buttonDiv.attr(UNSELECTABLE, "on");

                // Create the popup
                if (button.popupName)
                    createPopup(button.popupName, options, button.popupClass,
                        button.popupContent, button.popupHover);
        
            }

        });

        // Add the main div to the DOM and append the textarea
        $main.insertBefore($area)
        .append($area);

        // Bind the document click event handler
        if (!documentClickAssigned) {
            $(document).click(function(e) {
                // Dismiss all non-prompt popups
                var $target = $(e.target);
                if (!$target.add($target.parents()).is("." + PROMPT_CLASS))
                    hidePopups();
            });
            documentClickAssigned = true;
        }

        // Bind the window resize event when the width or height is auto or %
        if (/auto|%/.test("" + options.width + options.height))
            $(window).resize(function() {
                refresh(editor);
            });

        // Create the iframe and resize the controls
        refresh(editor);

    };

    //===============
    // Public Methods
    //===============

    var fn = cleditor.prototype,

    // Expose the following private functions as methods on the cleditor object.
    // The closure compiler will rename the private functions. However, the
    // exposed method names on the cleditor object will remain fixed.
    methods = [
    ["clear", clear],
    ["disable", disable],
    ["execCommand", execCommand],
    ["focus", focus],
    ["hidePopups", hidePopups],
    ["sourceMode", sourceMode, true],
    ["refresh", refresh],
    ["select", select],
    ["selectedHTML", selectedHTML, true],
    ["selectedText", selectedText, true],
    ["showMessage", showMessage],
    ["updateFrame", updateFrame],
    ["updateTextArea", updateTextArea]
    ];

    $.each(methods, function(idx, method) {
        fn[method[0]] = function() {
            var editor = this, args = [editor];
            // using each here would cast booleans into objects!
            for(var x = 0; x < arguments.length; x++) {
                args.push(arguments[x]);
            }
            var result = method[1].apply(editor, args);
            if (method[2]) return result;
            return editor;
        };
    });

    // change - shortcut for .bind("change", handler) or .trigger("change")
    fn.change = function(handler) {
        var $this = $(this);
        return handler ? $this.bind(CHANGE, handler) : $this.trigger(CHANGE);
    };

    //===============
    // Event Handlers
    //===============

    // buttonClick - click event handler for toolbar buttons
    function buttonClick(e) {

        var editor = this,
        buttonDiv = e.target,
        buttonName = $.data(buttonDiv, BUTTON_NAME),
        button = buttons[buttonName],
        popupName = button.popupName,
        popup = popups[popupName];

        // Check if disabled
        if (editor.disabled || $(buttonDiv).attr(DISABLED) == DISABLED)
            return;

        // Fire the buttonClick event
        var data = {
            editor: editor,
            button: buttonDiv,
            buttonName: buttonName,
            popup: popup,
            popupName: popupName,
            command: button.command,
            useCSS: editor.options.useCSS
        };

        if (button.buttonClick && button.buttonClick(e, data) === false)
            return false;

        // Toggle source
        if (buttonName == "source") {

            // Show the iframe
            if (sourceMode(editor)) {
                delete editor.range;
                editor.$area.hide();
                editor.$frame.show();
                buttonDiv.title = button.title;
            }

            // Show the textarea
            else {
                editor.$frame.hide();
                editor.$area.show();
                buttonDiv.title = "Show Rich Text";
            }

            // Enable or disable the toolbar buttons
            // IE requires the timeout
            setTimeout(function() {
                refreshButtons(editor);
            }, 100);

        }

        // Check for rich text mode
        else if (!sourceMode(editor)) {

            // Handle popups
            if (popupName) {
                var $popup = $(popup);

                // URL
                if (popupName == "url") {

                    // Check for selection before showing the link url popup
                    if (buttonName == "link" && selectedText(editor) === "") {
                        showMessage(editor, "A selection is required when inserting a link.", buttonDiv);
                        return false;
                    }

                    // Wire up the submit button click event handler
                    $popup.children(":button")
                    .unbind(CLICK)
                    .bind(CLICK, function() {

                        // Insert the image or link if a url was entered
                        var $text = $popup.find(":text"),
                        url = $.trim($text.val());
                        if (url !== "")
                            execCommand(editor, data.command, url, null, data.button);

                        // Reset the text, hide the popup and set focus
                        $text.val("http://");
                        hidePopups();
                        focus(editor);

                    });

                }

                // Paste as Text
                else if (popupName == "pastetext") {

                    // Wire up the submit button click event handler
                    $popup.children(":button")
                    .unbind(CLICK)
                    .bind(CLICK, function() {

                        // Insert the unformatted text replacing new lines with break tags
                        var $textarea = $popup.find("textarea"),
                        text = $textarea.val().replace(/\n/g, "<br />");
                        if (text !== "")
                            execCommand(editor, data.command, text, null, data.button);

                        // Reset the text, hide the popup and set focus
                        $textarea.val("");
                        hidePopups();
                        focus(editor);

                    });

                }

                // Show the popup if not already showing for this button
                if (buttonDiv !== $.data(popup, BUTTON)) {
                    showPopup(editor, popup, buttonDiv);
                    return false; // stop propagination to document click
                }

                // propaginate to documnt click
                return;

            }

            // Print
            else if (buttonName == "print")
                editor.$frame[0].contentWindow.print();

            // All other buttons
            else if (!execCommand(editor, data.command, data.value, data.useCSS, buttonDiv))
                return false;

        }

        // Focus the editor
        focus(editor);

    }

    // hoverEnter - mouseenter event handler for buttons and popup items
    function hoverEnter(e) {
        var $div = $(e.target).closest("div");
        $div.css(BACKGROUND_COLOR, $div.data(BUTTON_NAME) ? "#FFF" : "#FFC");
    }

    // hoverLeave - mouseleave event handler for buttons and popup items
    function hoverLeave(e) {
        $(e.target).closest("div").css(BACKGROUND_COLOR, "transparent");
    }

    // popupClick - click event handler for popup items
    function popupClick(e) {

        var editor = this,
        popup = e.data.popup,
        target = e.target;

        // Check for message and prompt popups
        if (popup === popups.msg || $(popup).hasClass(PROMPT_CLASS))
            return;

        // Get the button info
        var buttonDiv = $.data(popup, BUTTON),
        buttonName = $.data(buttonDiv, BUTTON_NAME),
        button = buttons[buttonName],
        command = button.command,
        value,
        useCSS = editor.options.useCSS;

        // Get the command value
        if (buttonName == "font")
            // Opera returns the fontfamily wrapped in quotes
            value = target.style.fontFamily.replace(/"/g, "");
        else if (buttonName == "size") {
            if (target.tagName == "DIV")
                target = target.children[0];
            value = target.innerHTML;
        }
        else if (buttonName == "style")
            value = "<" + target.tagName + ">";
        else if (buttonName == "color")
            value = hex(target.style.backgroundColor);
        else if (buttonName == "highlight") {
            value = hex(target.style.backgroundColor);
            if (ie) command = 'backcolor';
            else useCSS = true;
        }

        // Fire the popupClick event
        var data = {
            editor: editor,
            button: buttonDiv,
            buttonName: buttonName,
            popup: popup,
            popupName: button.popupName,
            command: command,
            value: value,
            useCSS: useCSS
        };

        if (button.popupClick && button.popupClick(e, data) === false)
            return;

        // Execute the command
        if (data.command && !execCommand(editor, data.command, data.value, data.useCSS, buttonDiv))
            return false;

        // Hide the popup and focus the editor
        hidePopups();
        focus(editor);

    }

    //==================
    // Private Functions
    //==================

    // checksum - returns a checksum using the Adler-32 method
    function checksum(text)
    {
        var a = 1, b = 0;
        for (var index = 0; index < text.length; ++index) {
            a = (a + text.charCodeAt(index)) % 65521;
            b = (b + a) % 65521;
        }
        return (b << 16) | a;
    }

    // clear - clears the contents of the editor
    function clear(editor) {
        editor.$area.val("");
        updateFrame(editor);
    }

    // createPopup - creates a popup and adds it to the body
    function createPopup(popupName, options, popupTypeClass, popupContent, popupHover) {

        // Check if popup already exists
        if (popups[popupName])
            return popups[popupName];

        // Create the popup
        var $popup = $(DIV_TAG)
        .hide()
        .addClass(POPUP_CLASS)
        .appendTo("body");

        // Add the content

        // Custom popup
        if (popupContent)
            $popup.html(popupContent);

        // Color
        else if (popupName == "color") {
            var colors = options.colors.split(" ");
            if (colors.length < 10)
                $popup.width("auto");
            $.each(colors, function(idx, color) {
                $(DIV_TAG).appendTo($popup)
                .css(BACKGROUND_COLOR, "#" + color);
            });
            popupTypeClass = COLOR_CLASS;
        }

        // Font
        else if (popupName == "font")
            $.each(options.fonts.split(","), function(idx, font) {
                $(DIV_TAG).appendTo($popup)
                .css("fontFamily", font)
                .html(font);
            });

        // Size
        else if (popupName == "size")
            $.each(options.sizes.split(","), function(idx, size) {
                $(DIV_TAG).appendTo($popup)
                .html("<font size=" + size + ">" + size + "</font>");
            });

        // Style
        else if (popupName == "style")
            $.each(options.styles, function(idx, style) {
                $(DIV_TAG).appendTo($popup)
                .html(style[1] + style[0] + style[1].replace("<", "</"));
            });

        // URL
        else if (popupName == "url") {
            $popup.html('Enter URL:<br><input type=text value="http://" size=35><br><input type=button value="Submit">');
            popupTypeClass = PROMPT_CLASS;
        }

        // Paste as Text
        else if (popupName == "pastetext") {
            $popup.html('Paste your content here and click submit.<br /><textarea cols=40 rows=3></textarea><br /><input type=button value=Submit>');
            popupTypeClass = PROMPT_CLASS;
        }

        // Add the popup type class name
        if (!popupTypeClass && !popupContent)
            popupTypeClass = LIST_CLASS;
        $popup.addClass(popupTypeClass);

        // Add the unselectable attribute to all items
        if (ie) {
            $popup.attr(UNSELECTABLE, "on")
            .find("div,font,p,h1,h2,h3,h4,h5,h6")
            .attr(UNSELECTABLE, "on");
        }

        // Add the hover effect to all items
        if ($popup.hasClass(LIST_CLASS) || popupHover === true)
            $popup.children().hover(hoverEnter, hoverLeave);

        // Add the popup to the array and return it
        popups[popupName] = $popup[0];
        return $popup[0];

    }

    // disable - enables or disables the editor
    function disable(editor, disabled) {

        // Update the textarea and save the state
        if (disabled) {
            editor.$area.attr(DISABLED, DISABLED);
            editor.disabled = true;
        }
        else {
            editor.$area.removeAttr(DISABLED);
            delete editor.disabled;
        }

        // Switch the iframe into design mode.
        // ie6 does not support designMode.
        // ie7 & ie8 do not properly support designMode="off".
        try {
            if (ie) editor.doc.body.contentEditable = !disabled;
            else editor.doc.designMode = !disabled ? "on" : "off";
        }
        // Firefox 1.5 throws an exception that can be ignored
        // when toggling designMode from off to on.
        catch (err) {}

        // Enable or disable the toolbar buttons
        refreshButtons(editor);

    }

    // execCommand - executes a designMode command
    function execCommand(editor, command, value, useCSS, button) {
        console.log([command,value]);
        // Restore the current ie selection
        restoreRange(editor);

        // Set the styling method
        if (!ie) {
            if (useCSS === undefined || useCSS === null)
                useCSS = editor.options.useCSS;
            editor.doc.execCommand("styleWithCSS", 0, useCSS.toString());
        }

        // Execute the command and check for error
        var success = true, description;
        if (ie && command.toLowerCase() == "inserthtml")
            getRange(editor).pasteHTML(value);
        else {
            try {
                success = editor.doc.execCommand(command, 0, value || null);
            }
            catch (err) {
                description = err.description;
                success = false;
            }
            if (!success) {
                if ("cutcopypaste".indexOf(command) > -1)
                    showMessage(editor, "For security reasons, your browser does not support the " +
                        command + " command. Try using the keyboard shortcut or context menu instead.",
                        button);
                else
                    showMessage(editor,
                        (description ? description : "Error executing the " + command + " command."),
                        button);
            }
        }

        // Enable the buttons
        refreshButtons(editor);
        return success;

    }

    // focus - sets focus to either the textarea or iframe
    function focus(editor) {
        setTimeout(function() {
            if (sourceMode(editor)) editor.$area.focus();
            else editor.$frame[0].contentWindow.focus();
            refreshButtons(editor);
        }, 0);
    }

    // getRange - gets the current text range object
    function getRange(editor) {
        if (ie) return getSelection(editor).createRange();
        return getSelection(editor).getRangeAt(0);
    }

    // getSelection - gets the current text range object
    function getSelection(editor) {
        if (ie) return editor.doc.selection;
        return editor.$frame[0].contentWindow.getSelection();
    }

    // Returns the hex value for the passed in string.
    //   hex("rgb(255, 0, 0)"); // #FF0000
    //   hex("#FF0000"); // #FF0000
    //   hex("#F00"); // #FF0000
    function hex(s) {
        var m = /rgba?\((\d+), (\d+), (\d+)/.exec(s),
        c = s.split("");
        if (m) {
            s = ( m[1] << 16 | m[2] << 8 | m[3] ).toString(16);
            while (s.length < 6)
                s = "0" + s;
        }
        return "#" + (s.length == 6 ? s : c[1] + c[1] + c[2] + c[2] + c[3] + c[3]);
    }

    // hidePopups - hides all popups
    function hidePopups() {
        $.each(popups, function(idx, popup) {
            $(popup)
            .hide()
            .unbind(CLICK)
            .removeData(BUTTON);
        });
    }

    // imagesPath - returns the path to the images folder
    function imagesPath() {
        var cssFile = "jquery.cleditor.css",
        href = $("link[href$='" + cssFile +"']").attr("href");
        return href.substr(0, href.length - cssFile.length) + "images/";
    }

    // imageUrl - Returns the css url string for a filemane
    function imageUrl(filename) {
        return "url(" + imagesPath() + filename + ")";
    }

    // refresh - creates the iframe and resizes the controls
    function refresh(editor) {

        var $main = editor.$main,
        options = editor.options;

        // Remove the old iframe
        if (editor.$frame) 
            editor.$frame.remove();

        // Create a new iframe
        var $frame = editor.$frame = $('<iframe frameborder="0" src="javascript:true;">')
        .hide()
        .appendTo($main);

        // Load the iframe document content
        var contentWindow = $frame[0].contentWindow,
        doc = editor.doc = contentWindow.document,
        $doc = $(doc);

        doc.open();
        doc.write(
            options.docType +
            '<html>' +
            ((options.docCSSFile === '') ? '' : '<head><link rel="stylesheet" type="text/css" href="' + options.docCSSFile + '" /></head>') +
            '<body style="' + options.bodyStyle + '"></body></html>'
            );
        doc.close();

        // Work around for bug in IE which causes the editor to lose
        // focus when clicking below the end of the document.
        if (ie)
            $doc.click(function() {
                focus(editor);
            });

        // Load the content
        updateFrame(editor);

        // Bind the ie specific iframe event handlers
        if (ie) {

            // Save the current user selection. This code is needed since IE will
            // reset the selection just after the beforedeactivate event and just
            // before the beforeactivate event.
            $doc.bind("beforedeactivate beforeactivate selectionchange keypress", function(e) {
        
                // Flag the editor as inactive
                if (e.type == "beforedeactivate")
                    editor.inactive = true;
        
                // Get rid of the bogus selection and flag the editor as active
                else if (e.type == "beforeactivate") {
                    if (!editor.inactive && editor.range && editor.range.length > 1)
                        editor.range.shift();
                    delete editor.inactive;
                }

                // Save the selection when the editor is active
                else if (!editor.inactive) {
                    if (!editor.range) 
                        editor.range = [];
                    editor.range.unshift(getRange(editor));

                    // We only need the last 2 selections
                    while (editor.range.length > 2)
                        editor.range.pop();
                }

            });

            // Restore the text range when the iframe gains focus
            $frame.focus(function() {
                restoreRange(editor);
            });

        }

        // Update the textarea when the iframe loses focus
        ($.browser.mozilla ? $doc : $(contentWindow)).blur(function() {
            updateTextArea(editor, true);
        });

        // Enable the toolbar buttons as the user types or clicks
        $doc.click(hidePopups)
        .bind("keyup mouseup", function() {
            refreshButtons(editor);
        });

        // Show the textarea for iPhone/iTouch/iPad or
        // the iframe when design mode is supported.
        if (iOS) editor.$area.show();
        else $frame.show();

        // Wait for the layout to finish - shortcut for $(document).ready()
        $(function() {

            var $toolbar = editor.$toolbar,
            $group = $toolbar.children("div:last"),
            wid = $main.width();
            wid='100%';
            // Resize the toolbar
            var hgt = $group.offset().top + $group.outerHeight() - $toolbar.offset().top + 1;
            $toolbar.height(hgt);

            // Resize the iframe
            hgt = (/%/.test("" + options.height) ? $main.height() : parseInt(options.height)) - hgt;
            $frame.width(wid).height(hgt);

            // Resize the textarea. IE6 textareas have a 1px top
            // & bottom margin that cannot be removed using css.
            editor.$area.width(wid).height(ie6 ? hgt - 2 : hgt);

            // Switch the iframe into design mode if enabled
            disable(editor, editor.disabled);

            // Enable or disable the toolbar buttons
            refreshButtons(editor);

        });

    }

    // refreshButtons - enables or disables buttons based on availability
    function refreshButtons(editor) {

        // Webkit requires focus before queryCommandEnabled will return anything but false
        if (!iOS && $.browser.webkit && !editor.focused) {
            editor.$frame[0].contentWindow.focus();
            window.focus();
            editor.focused = true;
        }

        // Get the object used for checking queryCommandEnabled
        var queryObj = editor.doc;
        if (ie) queryObj = getRange(editor);

        // Loop through each button
        var inSourceMode = sourceMode(editor);
        $.each(editor.$toolbar.find("." + BUTTON_CLASS), function(idx, elem) {

            var $elem = $(elem),
            button = $.cleditor.buttons[$.data(elem, BUTTON_NAME)],
            command = button.command,
            enabled = true;

            // Determine the state
            if (editor.disabled)
                enabled = false;
            else if (button.getEnabled) {
                var data = {
                    editor: editor,
                    button: elem,
                    buttonName: button.name,
                    popup: popups[button.popupName],
                    popupName: button.popupName,
                    command: button.command,
                    useCSS: editor.options.useCSS
                };
                enabled = button.getEnabled(data);
                if (enabled === undefined)
                    enabled = true;
            }
            else if (((inSourceMode || iOS) && button.name != "source") ||
                (ie && (command == "undo" || command == "redo")))
                enabled = false;
            else if (command && command != "print") {
                if (ie && command == "hilitecolor")
                    command = "backcolor";
                // IE does not support inserthtml, so it's always enabled
                if (!ie || command != "inserthtml") {
                    try {
                        enabled = queryObj.queryCommandEnabled(command);
                    }
                    catch (err) {
                        enabled = false;
                    }
                }
            }

            // Enable or disable the button
            if (enabled) {
                $elem.removeClass(DISABLED_CLASS);
                $elem.removeAttr(DISABLED);
            }
            else {
                $elem.addClass(DISABLED_CLASS);
                $elem.attr(DISABLED, DISABLED);
            }

        });
    }

    // restoreRange - restores the current ie selection
    function restoreRange(editor) {
        if (ie && editor.range)
            editor.range[0].select();
    }

    // select - selects all the text in either the textarea or iframe
    function select(editor) {
        setTimeout(function() {
            if (sourceMode(editor)) editor.$area.select();
            else execCommand(editor, "selectall");
        }, 0);
    }

    // selectedHTML - returns the current HTML selection or and empty string
    function selectedHTML(editor) {
        restoreRange(editor);
        var range = getRange(editor);
        if (ie)
            return range.htmlText;
        var layer = $("<layer>")[0];
        layer.appendChild(range.cloneContents());
        var html = layer.innerHTML;
        layer = null;
        return html;
    }

    // selectedText - returns the current text selection or and empty string
    function selectedText(editor) {
        restoreRange(editor);
        if (ie) return getRange(editor).text;
        return getSelection(editor).toString();
    }

    // showMessage - alert replacement
    function showMessage(editor, message, button) {
        var popup = createPopup("msg", editor.options, MSG_CLASS);
        popup.innerHTML = message;
        showPopup(editor, popup, button);
    }

    // showPopup - shows a popup
    function showPopup(editor, popup, button) {

        var offset, left, top, $popup = $(popup);

        // Determine the popup location
        if (button) {
            var $button = $(button);
            offset = $button.offset();
            left = --offset.left;
            top = offset.top + $button.height();
        }
        else {
            var $toolbar = editor.$toolbar;
            offset = $toolbar.offset();
            left = Math.floor(($toolbar.width() - $popup.width()) / 2) + offset.left;
            top = offset.top + $toolbar.height() - 2;
        }

        // Position and show the popup
        hidePopups();
        $popup.css({
            left: left, 
            top: top
        })
        .show();

        // Assign the popup button and click event handler
        if (button) {
            $.data(popup, BUTTON, button);
            $popup.bind(CLICK, {
                popup: popup
            }, $.proxy(popupClick, editor));
        }

        // Focus the first input element if any
        setTimeout(function() {
            $popup.find(":text,textarea").eq(0).focus().select();
        }, 100);

    }

    // sourceMode - returns true if the textarea is showing
    function sourceMode(editor) {
        return editor.$area.is(":visible");
    }

    // updateFrame - updates the iframe with the textarea contents
    function updateFrame(editor, checkForChange) {
    
        var code = editor.$area.val(),
        options = editor.options,
        updateFrameCallback = options.updateFrame,
        $body = $(editor.doc.body);

        // Check for textarea change to avoid unnecessary firing
        // of potentially heavy updateFrame callbacks.
        if (updateFrameCallback) {
            var sum = checksum(code);
            if (checkForChange && editor.areaChecksum == sum)
                return;
            editor.areaChecksum = sum;
        }

        // Convert the textarea source code into iframe html
        var html = updateFrameCallback ? updateFrameCallback(code) : code;

        // Prevent script injection attacks by html encoding script tags
        html = html.replace(/<(?=\/?script)/ig, "&lt;");

        // Update the iframe checksum
        if (options.updateTextArea)
            editor.frameChecksum = checksum(html);

        // Update the iframe and trigger the change event
        if (html != $body.html()) {
            $body.html(html);
            $(editor).triggerHandler(CHANGE);
        }

    }

    // updateTextArea - updates the textarea with the iframe contents
    function updateTextArea(editor, checkForChange) {

        var html = $(editor.doc.body).html(),
        options = editor.options,
        updateTextAreaCallback = options.updateTextArea,
        $area = editor.$area;

        // Check for iframe change to avoid unnecessary firing
        // of potentially heavy updateTextArea callbacks.
        if (updateTextAreaCallback) {
            var sum = checksum(html);
            if (checkForChange && editor.frameChecksum == sum)
                return;
            editor.frameChecksum = sum;
        }

        // Convert the iframe html into textarea source code
        var code = updateTextAreaCallback ? updateTextAreaCallback(html) : html;

        // Update the textarea checksum
        if (options.updateFrame)
            editor.areaChecksum = checksum(code);

        // Update the textarea and trigger the change event
        if (code != $area.val()) {
            $area.val(code);
            $(editor).triggerHandler(CHANGE);
        }

    }

})(jQuery);

/* FILENAME:/js/jquery.cookie.js*/
/*jslint browser: true */ /*global jQuery: true */

/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

// TODO JsDoc

/**
 * Create a cookie with the given key and value and other optional parameters.
 *
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Set the value of a cookie.
 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
 * @desc Create a cookie with all available options.
 * @example $.cookie('the_cookie', 'the_value');
 * @desc Create a session cookie.
 * @example $.cookie('the_cookie', null);
 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
 *       used when the cookie was set.
 *
 * @param String key The key of the cookie.
 * @param String value The value of the cookie.
 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
 *                             when the the browser exits.
 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
 *                        require a secure protocol (like HTTPS).
 * @type undefined
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */

/**
 * Get the value of a cookie with the given key.
 *
 * @example $.cookie('the_cookie');
 * @desc Get the value of a cookie.
 *
 * @param String key The key of the cookie.
 * @return The value of the cookie.
 * @type String
 *
 * @name $.cookie
 * @cat Plugins/Cookie
 * @author Klaus Hartl/klaus.hartl@stilbuero.de
 */
jQuery.cookie = function (key, value, options) {

    // key and value given, set cookie...
    if (arguments.length > 1 && (value === null || typeof value !== "object")) {
        options = jQuery.extend({}, options);

        if (value === null) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? String(value) : encodeURIComponent(String(value)),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};

/* FILENAME:/module/markitup/sets/bbcode/set.js*/
// ----------------------------------------------------------------------------
// markItUp!
// ----------------------------------------------------------------------------
// Copyright (C) 2008 Jay Salvat
// http://markitup.jaysalvat.com/
// ----------------------------------------------------------------------------
// BBCode tags example
// http://en.wikipedia.org/wiki/Bbcode
// ----------------------------------------------------------------------------
// Feel free to add more tags
// ----------------------------------------------------------------------------
mySettings = {
    previewParserPath:	'', 
    markupSet: [
    {
        name:'Bold', 
        key:'B', 
        openWith:'[b]', 
        closeWith:'[/b]'
    },

    {
        name:'Italic', 
        key:'I', 
        openWith:'[i]', 
        closeWith:'[/i]'
    },

    {
        name:'Underline', 
        key:'U', 
        openWith:'[u]', 
        closeWith:'[/u]'
    },

    {
        separator:'---------------'
    },
    {
        name:'Picture', 
        key:'P', 
        replaceWith:'[img][![Url]!][/img]'
    },

    {
        name:'Link', 
        key:'L', 
        openWith:'[url=[![Url]!]]', 
        closeWith:'[/url]', 
        placeHolder:'Your text to link here...'
    },

    {
        separator:'---------------'
    },
    {
        name:'Size', 
        key:'S', 
        openWith:'[size=[![Text size]!]]', 
        closeWith:'[/size]',
        dropMenu :[
        {
            name:'Big', 
            openWith:'[size=200]', 
            closeWith:'[/size]'
        },
        {
            name:'Normal', 
            openWith:'[size=100]', 
            closeWith:'[/size]'
        },
        {
            name:'Small', 
            openWith:'[size=50]', 
            closeWith:'[/size]'
        }
        ]
    },

    {
        separator:'---------------'
    },
    {
        name:'Bulleted list', 
        openWith:'[list]\n', 
        closeWith:'\n[/list]'
    },

    {
        name:'Numeric list', 
        openWith:'[list=[![Starting number]!]]\n', 
        closeWith:'\n[/list]'
    },

    {
        name:'List item', 
        openWith:'[*] '
    },

    {
        separator:'---------------'
    },
    {
        name:'Quotes', 
        openWith:'[quote]', 
        closeWith:'[/quote]'
    },

    {
        name:'Code', 
        openWith:'[code]', 
        closeWith:'[/code]'
    },

    {
        separator:'---------------'
    },
    {
        name:'Clean', 
        className:"clean", 
        replaceWith:function(markitup) {
            return markitup.selection.replace(/\[(.*?)\]/g, "")
        }
    },
    {
        name:'Preview', 
        className:"preview", 
        call:'preview'
    },
    {
        name:'Document',
        className:"sprite sprite-page_white_add",
        replaceWith:'[document][![document id]!][/document]'
    },
    {
        name:'Page Break',
        className:"sprite sprite-page_white_copy",
        replaceWith:'[page-break]'
    },
    {
        name:'PHP',
        className:"php", 
        openWith:'[php]', 
        closeWith:'[/php]'
    },
    {
        name:'xhtml',
        className:"sprite sprite-html", 
        openWith:'[xhtml]', 
        closeWith:'[/xhtml]'
    },

    {
        name:'text_heading_1',
        className:"sprite sprite-text_heading_1", 
        openWith:'[h1]', 
        closeWith:'[/h1]'
    },
    {
        name:'text_heading_2',
        className:"sprite sprite-text_heading_2", 
        openWith:'[h2]', 
        closeWith:'[/h2]'
    },
    {
        name:'text_heading_3',
        className:"sprite sprite-text_heading_3", 
        openWith:'[h3]', 
        closeWith:'[/h3]'
    },
    {
        name:'text_heading_4',
        className:"sprite sprite-text_heading_4", 
        openWith:'[h4]', 
        closeWith:'[/h4]'
    },
    {
        name:'text_heading_5',
        className:"sprite sprite-text_heading_5", 
        openWith:'[h5]', 
        closeWith:'[/h5]'
    },
    {
        name:'text_heading_6',
        className:"sprite sprite-text_heading_6", 
        openWith:'[h6]', 
        closeWith:'[/h6]'
    },
    ]
};
/* FILENAME:/module/markitup/jquery.markitup.js*/
// ----------------------------------------------------------------------------
// markItUp! Universal MarkUp Engine, JQuery plugin
// v 1.1.x
// Dual licensed under the MIT and GPL licenses.
// ----------------------------------------------------------------------------
// Copyright (C) 2007-2011 Jay Salvat
// http://markitup.jaysalvat.com/
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------
(function($) {
	$.fn.markItUp = function(settings, extraSettings) {
		var options, ctrlKey, shiftKey, altKey;
		ctrlKey = shiftKey = altKey = false;
	
		options = {	id:						'',
					nameSpace:				'',
					root:					'',
					previewInWindow:		'', // 'width=800, height=600, resizable=yes, scrollbars=yes'
					previewAutoRefresh:		true,
					previewPosition:		'after',
					previewTemplatePath:	'~/templates/preview.html',
					previewParser:			false,
					previewParserPath:		'',
					previewParserVar:		'data',
					resizeHandle:			true,
					beforeInsert:			'',
					afterInsert:			'',
					onEnter:				{},
					onShiftEnter:			{},
					onCtrlEnter:			{},
					onTab:					{},
					markupSet:			[	{ /* set */ } ]
				};
		$.extend(options, settings, extraSettings);

		// compute markItUp! path
		if (!options.root) {
			$('script').each(function(a, tag) {
				miuScript = $(tag).get(0).src.match(/(.*)jquery\.markitup(\.pack)?\.js$/);
				if (miuScript !== null) {
					options.root = miuScript[1];
				}
			});
		}

		return this.each(function() {
			var $$, textarea, levels, scrollPosition, caretPosition, caretOffset,
				clicked, hash, header, footer, previewWindow, template, iFrame, abort;
			$$ = $(this);
			textarea = this;
			levels = [];
			abort = false;
			scrollPosition = caretPosition = 0;
			caretOffset = -1;

			options.previewParserPath = localize(options.previewParserPath);
			options.previewTemplatePath = localize(options.previewTemplatePath);

			// apply the computed path to ~/
			function localize(data, inText) {
				if (inText) {
					return 	data.replace(/("|')~\//g, "$1"+options.root);
				}
				return 	data.replace(/^~\//, options.root);
			}

			// init and build editor
			function init() {
				id = ''; nameSpace = '';
				if (options.id) {
					id = 'id="'+options.id+'"';
				} else if ($$.attr("id")) {
					id = 'id="markItUp'+($$.attr("id").substr(0, 1).toUpperCase())+($$.attr("id").substr(1))+'"';

				}
				if (options.nameSpace) {
					nameSpace = 'class="'+options.nameSpace+'"';
				}
				$$.wrap('<div '+nameSpace+'></div>');
				$$.wrap('<div '+id+' class="markItUp"></div>');
				$$.wrap('<div class="markItUpContainer"></div>');
				$$.addClass("markItUpEditor");

				// add the header before the textarea
				header = $('<div class="markItUpHeader"></div>').insertBefore($$);
				$(dropMenus(options.markupSet)).appendTo(header);

				// add the footer after the textarea
				footer = $('<div class="markItUpFooter"></div>').insertAfter($$);

				// add the resize handle after textarea
				if (options.resizeHandle === true && $.browser.safari !== true) {
					resizeHandle = $('<div class="markItUpResizeHandle"></div>')
						.insertAfter($$)
						.bind("mousedown", function(e) {
							var h = $$.height(), y = e.clientY, mouseMove, mouseUp;
							mouseMove = function(e) {
								$$.css("height", Math.max(20, e.clientY+h-y)+"px");
								return false;
							};
							mouseUp = function(e) {
								$("html").unbind("mousemove", mouseMove).unbind("mouseup", mouseUp);
								return false;
							};
							$("html").bind("mousemove", mouseMove).bind("mouseup", mouseUp);
					});
					footer.append(resizeHandle);
				}

				// listen key events
				$$.keydown(keyPressed).keyup(keyPressed);
				
				// bind an event to catch external calls
				$$.bind("insertion", function(e, settings) {
					if (settings.target !== false) {
						get();
					}
					if (textarea === $.markItUp.focused) {
						markup(settings);
					}
				});

				// remember the last focus
				$$.focus(function() {
					$.markItUp.focused = this;
				});
			}

			// recursively build header with dropMenus from markupset
			function dropMenus(markupSet) {
				var ul = $('<ul></ul>'), i = 0;
				$('li:hover > ul', ul).css('display', 'block');
				$.each(markupSet, function() {
					var button = this, t = '', title, li, j;
					title = (button.key) ? (button.name||'')+' [Ctrl+'+button.key+']' : (button.name||'');
					key   = (button.key) ? 'accesskey="'+button.key+'"' : '';
					if (button.separator) {
						li = $('<li class="markItUpSeparator">'+(button.separator||'')+'</li>').appendTo(ul);
					} else {
						i++;
						for (j = levels.length -1; j >= 0; j--) {
							t += levels[j]+"-";
						}
						li = $('<li class="markItUpButton markItUpButton'+t+(i)+' '+(button.className||'')+'"><a href="" '+key+' title="'+title+'">'+(button.name||'')+'</a></li>')
						.bind("contextmenu", function() { // prevent contextmenu on mac and allow ctrl+click
							return false;
						}).click(function() {
							return false;
						}).bind("focusin", function(){
                            $$.focus();
						}).mouseup(function() {
							if (button.call) {
								eval(button.call)();
							}
							setTimeout(function() { markup(button) },1);
							return false;
						}).hover(function() {
								$('> ul', this).show();
								$(document).one('click', function() { // close dropmenu if click outside
										$('ul ul', header).hide();
									}
								);
							}, function() {
								$('> ul', this).hide();
							}
						).appendTo(ul);
						if (button.dropMenu) {
							levels.push(i);
							$(li).addClass('markItUpDropMenu').append(dropMenus(button.dropMenu));
						}
					}
				}); 
				levels.pop();
				return ul;
			}

			// markItUp! markups
			function magicMarkups(string) {
				if (string) {
					string = string.toString();
					string = string.replace(/\(\!\(([\s\S]*?)\)\!\)/g,
						function(x, a) {
							var b = a.split('|!|');
							if (altKey === true) {
								return (b[1] !== undefined) ? b[1] : b[0];
							} else {
								return (b[1] === undefined) ? "" : b[0];
							}
						}
					);
					// [![prompt]!], [![prompt:!:value]!]
					string = string.replace(/\[\!\[([\s\S]*?)\]\!\]/g,
						function(x, a) {
							var b = a.split(':!:');
							if (abort === true) {
								return false;
							}
							value = prompt(b[0], (b[1]) ? b[1] : '');
							if (value === null) {
								abort = true;
							}
							return value;
						}
					);
					return string;
				}
				return "";
			}

			// prepare action
			function prepare(action) {
				if ($.isFunction(action)) {
					action = action(hash);
				}
				return magicMarkups(action);
			}

			// build block to insert
			function build(string) {
				var openWith 			= prepare(clicked.openWith);
				var placeHolder 		= prepare(clicked.placeHolder);
				var replaceWith 		= prepare(clicked.replaceWith);
				var closeWith 			= prepare(clicked.closeWith);
				var openBlockWith 		= prepare(clicked.openBlockWith);
				var closeBlockWith 		= prepare(clicked.closeBlockWith);
				var multiline 			= clicked.multiline;
				
				if (replaceWith !== "") {
					block = openWith + replaceWith + closeWith;
				} else if (selection === '' && placeHolder !== '') {
					block = openWith + placeHolder + closeWith;
				} else {
					string = string || selection;

					var lines = selection.split(/\r?\n/), blocks = [];
					
					for (var l=0; l < lines.length; l++) {
						line = lines[l];
						var trailingSpaces;
						if (trailingSpaces = line.match(/ *$/)) {
							blocks.push(openWith + line.replace(/ *$/g, '') + closeWith + trailingSpaces);
						} else {
							blocks.push(openWith + line + closeWith);
						}
					}
					
					block = blocks.join("\n");
				}

				block = openBlockWith + block + closeBlockWith;

				return {	block:block, 
							openWith:openWith, 
							replaceWith:replaceWith, 
							placeHolder:placeHolder,
							closeWith:closeWith
					};
			}

			// define markup to insert
			function markup(button) {
				var len, j, n, i;
				hash = clicked = button;
				get();
				$.extend(hash, {	line:"", 
						 			root:options.root,
									textarea:textarea, 
									selection:(selection||''), 
									caretPosition:caretPosition,
									ctrlKey:ctrlKey, 
									shiftKey:shiftKey, 
									altKey:altKey
								}
							);
				// callbacks before insertion
				prepare(options.beforeInsert);
				prepare(clicked.beforeInsert);
				if ((ctrlKey === true && shiftKey === true) || button.multiline === true) {
					prepare(clicked.beforeMultiInsert);
				}			
				$.extend(hash, { line:1 });

				if ((ctrlKey === true && shiftKey === true)) {
					lines = selection.split(/\r?\n/);
					for (j = 0, n = lines.length, i = 0; i < n; i++) {
						if ($.trim(lines[i]) !== '') {
							$.extend(hash, { line:++j, selection:lines[i] } );
							lines[i] = build(lines[i]).block;
						} else {
							lines[i] = "";
						}
					}
					string = { block:lines.join('\n')};
					start = caretPosition;
					len = string.block.length + (($.browser.opera) ? n-1 : 0);
				} else if (ctrlKey === true) {
					string = build(selection);
					start = caretPosition + string.openWith.length;
					len = string.block.length - string.openWith.length - string.closeWith.length;
					len = len - (string.block.match(/ $/) ? 1 : 0);
					len -= fixIeBug(string.block);
				} else if (shiftKey === true) {
					string = build(selection);
					start = caretPosition;
					len = string.block.length;
					len -= fixIeBug(string.block);
				} else {
					string = build(selection);
					start = caretPosition + string.block.length ;
					len = 0;
					start -= fixIeBug(string.block);
				}
				if ((selection === '' && string.replaceWith === '')) {
					caretOffset += fixOperaBug(string.block);
					
					start = caretPosition + string.openWith.length;
					len = string.block.length - string.openWith.length - string.closeWith.length;

					caretOffset = $$.val().substring(caretPosition,  $$.val().length).length;
					caretOffset -= fixOperaBug($$.val().substring(0, caretPosition));
				}
				$.extend(hash, { caretPosition:caretPosition, scrollPosition:scrollPosition } );

				if (string.block !== selection && abort === false) {
					insert(string.block);
					set(start, len);
				} else {
					caretOffset = -1;
				}
				get();

				$.extend(hash, { line:'', selection:selection });

				// callbacks after insertion
				if ((ctrlKey === true && shiftKey === true) || button.multiline === true) {
					prepare(clicked.afterMultiInsert);
				}
				prepare(clicked.afterInsert);
				prepare(options.afterInsert);

				// refresh preview if opened
				if (previewWindow && options.previewAutoRefresh) {
					refreshPreview(); 
				}
																									
				// reinit keyevent
				shiftKey = altKey = ctrlKey = abort = false;
			}

			// Substract linefeed in Opera
			function fixOperaBug(string) {
				if ($.browser.opera) {
					return string.length - string.replace(/\n*/g, '').length;
				}
				return 0;
			}
			// Substract linefeed in IE
			function fixIeBug(string) {
				if ($.browser.msie) {
					return string.length - string.replace(/\r*/g, '').length;
				}
				return 0;
			}
				
			// add markup
			function insert(block) {	
				if (document.selection) {
					var newSelection = document.selection.createRange();
					newSelection.text = block;
				} else {
					textarea.value =  textarea.value.substring(0, caretPosition)  + block + textarea.value.substring(caretPosition + selection.length, textarea.value.length);
				}
			}

			// set a selection
			function set(start, len) {
				if (textarea.createTextRange){
					// quick fix to make it work on Opera 9.5
					if ($.browser.opera && $.browser.version >= 9.5 && len == 0) {
						return false;
					}
					range = textarea.createTextRange();
					range.collapse(true);
					range.moveStart('character', start); 
					range.moveEnd('character', len); 
					range.select();
				} else if (textarea.setSelectionRange ){
					textarea.setSelectionRange(start, start + len);
				}
				textarea.scrollTop = scrollPosition;
				textarea.focus();
			}

			// get the selection
			function get() {
				textarea.focus();

				scrollPosition = textarea.scrollTop;
				if (document.selection) {
					selection = document.selection.createRange().text;
					if ($.browser.msie) { // ie
						var range = document.selection.createRange(), rangeCopy = range.duplicate();
						rangeCopy.moveToElementText(textarea);
						caretPosition = -1;
						while(rangeCopy.inRange(range)) {
							rangeCopy.moveStart('character');
							caretPosition ++;
						}
					} else { // opera
						caretPosition = textarea.selectionStart;
					}
				} else { // gecko & webkit
					caretPosition = textarea.selectionStart;

					selection = textarea.value.substring(caretPosition, textarea.selectionEnd);
				} 
				return selection;
			}

			// open preview window
			function preview() {
				if (!previewWindow || previewWindow.closed) {
					if (options.previewInWindow) {
						previewWindow = window.open('', 'preview', options.previewInWindow);
						$(window).unload(function() {
							previewWindow.close();
						});
					} else {
						iFrame = $('<iframe class="markItUpPreviewFrame"></iframe>');
						if (options.previewPosition == 'after') {
							iFrame.insertAfter(footer);
						} else {
							iFrame.insertBefore(header);
						}	
						previewWindow = iFrame[iFrame.length - 1].contentWindow || frame[iFrame.length - 1];
					}
				} else if (altKey === true) {
					if (iFrame) {
						iFrame.remove();
					} else {
						previewWindow.close();
					}
					previewWindow = iFrame = false;
				}
				if (!options.previewAutoRefresh) {
					refreshPreview(); 
				}
				if (options.previewInWindow) {
					previewWindow.focus();
				}
			}

			// refresh Preview window
			function refreshPreview() {
 				renderPreview();
			}

			function renderPreview() {		
				var phtml;
				if (options.previewParser && typeof options.previewParser === 'function') {
					var data = options.previewParser( $$.val() );
					writeInPreview( localize(data, 1) ); 
				} else if (options.previewParserPath !== '') {
					$.ajax({
						type: 'POST',
						dataType: 'text',
						global: false,
						url: options.previewParserPath,
						data: options.previewParserVar+'='+encodeURIComponent($$.val()),
						success: function(data) {
							writeInPreview( localize(data, 1) ); 
						}
					});
				} else {
					if (!template) {
						$.ajax({
							url: options.previewTemplatePath,
							dataType: 'text',
							global: false,
							success: function(data) {
								writeInPreview( localize(data, 1).replace(/<!-- content -->/g, $$.val()) );
							}
						});
					}
				}
				return false;
			}
			
			function writeInPreview(data) {
				if (previewWindow.document) {			
					try {
						sp = previewWindow.document.documentElement.scrollTop
					} catch(e) {
						sp = 0;
					}	
					previewWindow.document.open();
					previewWindow.document.write(data);
					previewWindow.document.close();
					previewWindow.document.documentElement.scrollTop = sp;
				}
			}
			
			// set keys pressed
			function keyPressed(e) { 
				shiftKey = e.shiftKey;
				altKey = e.altKey;
				ctrlKey = (!(e.altKey && e.ctrlKey)) ? (e.ctrlKey || e.metaKey) : false;

				if (e.type === 'keydown') {
					if (ctrlKey === true) {
						li = $('a[accesskey="'+String.fromCharCode(e.keyCode)+'"]', header).parent('li');
						if (li.length !== 0) {
							ctrlKey = false;
							setTimeout(function() {
								li.triggerHandler('mouseup');
							},1);
							return false;
						}
					}
					if (e.keyCode === 13 || e.keyCode === 10) { // Enter key
						if (ctrlKey === true) {  // Enter + Ctrl
							ctrlKey = false;
							markup(options.onCtrlEnter);
							return options.onCtrlEnter.keepDefault;
						} else if (shiftKey === true) { // Enter + Shift
							shiftKey = false;
							markup(options.onShiftEnter);
							return options.onShiftEnter.keepDefault;
						} else { // only Enter
							markup(options.onEnter);
							return options.onEnter.keepDefault;
						}
					}
					if (e.keyCode === 9) { // Tab key
						if (shiftKey == true || ctrlKey == true || altKey == true) {
							return false; 
						}
						if (caretOffset !== -1) {
							get();
							caretOffset = $$.val().length - caretOffset;
							set(caretOffset, 0);
							caretOffset = -1;
							return false;
						} else {
							markup(options.onTab);
							return options.onTab.keepDefault;
						}
					}
				}
			}

			init();
		});
	};

	$.fn.markItUpRemove = function() {
		return this.each(function() {
				var $$ = $(this).unbind().removeClass('markItUpEditor');
				$$.parent('div').parent('div.markItUp').parent('div').replaceWith($$);
			}
		);
	};

	$.markItUp = function(settings) {
		var options = { target:false };
		$.extend(options, settings);
		if (options.target) {
			return $(options.target).each(function() {
				$(this).focus();
				$(this).trigger('insertion', [options]);
			});
		} else {
			$('textarea').trigger('insertion', [options]);
		}
	};
})(jQuery);

/* FILENAME:/js/jquery.tokeninput.js*/
/*
 * jQuery Plugin: Tokenizing Autocomplete Text Entry
 * Version 1.6.1
 *
 * Copyright (c) 2009 James Smith (http://loopj.com)
 * Licensed jointly under the GPL and MIT licenses,
 * choose which one suits your project best!
 *
 */

(function($) {
    // Default settings
    var DEFAULT_SETTINGS = {
        // Search settings
        method: "GET",
        queryParam: "q",
        searchDelay: 300,
        minChars: 1,
        propertyToSearch: "name",
        jsonContainer: null,
        contentType: "json",
        // Prepopulation settings
        prePopulate: null,
        processPrePopulate: false,
        // Display settings
        hintText: "Type in a search term",
        noResultsText: "No results",
        searchingText: "Searching...",
        deleteText: "&times;",
        animateDropdown: true,
        placeholder: null,
        theme: null,
        zindex: 999,
        resultsLimit: null,
        enableHTML: false,
        resultsFormatter: function(item) {
            var string = item[this.propertyToSearch];
            return "<li>" + (this.enableHTML ? string : _escapeHTML(string)) + "</li>";
        },
        tokenFormatter: function(item) {
            var string = item[this.propertyToSearch];
            return "<li><p class='value'>" + (this.enableHTML ? string : _escapeHTML(string)) + "</p></li>";
        },
        // Tokenization settings
        tokenLimit: null,
        tokenDelimiter: ",",
        preventDuplicates: false,
        tokenValue: "key",
        // Behavioral settings
        allowFreeTagging: false,
        allowTabOut: false,
        // Callbacks
        onResult: null,
        onCachedResult: null,
        onAdd: null,
        onFreeTaggingAdd: null,
        onDelete: null,
        onReady: null,
        // Other settings
        idPrefix: "token-input-",
        // Keep track if the input is currently in disabled mode
        disabled: false
    };

    // Default classes to use when theming
    var DEFAULT_CLASSES = {
        tokenList: "token-input-list",
        token: "token-input-token",
        tokenReadOnly: "token-input-token-readonly",
        tokenDelete: "token-input-delete-token",
        selectedToken: "token-input-selected-token",
        highlightedToken: "token-input-highlighted-token",
        dropdown: "token-input-dropdown",
        dropdownItem: "token-input-dropdown-item",
        dropdownItem2: "token-input-dropdown-item2",
        selectedDropdownItem: "token-input-selected-dropdown-item",
        inputToken: "token-input-input-token",
        focused: "token-input-focused",
        disabled: "token-input-disabled"
    };

    // Input box position "enum"
    var POSITION = {
        BEFORE: 0,
        AFTER: 1,
        END: 2
    };

    // Keys "enum"
    var KEY = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        NUMPAD_ENTER: 108,
        COMMA: 188
    };

    var HTML_ESCAPES = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    var HTML_ESCAPE_CHARS = /[&<>"'\/]/g;

    function coerceToString(val) {
        return String((val === null || val === undefined) ? '' : val);
    }

    function _escapeHTML(text) {
        return coerceToString(text).replace(HTML_ESCAPE_CHARS, function(match) {
            return HTML_ESCAPES[match];
        });
    }

    // Additional public (exposed) methods
    var methods = {
        init: function(url_or_data_or_function, options) {
            var settings = $.extend({}, DEFAULT_SETTINGS, options || {});
            return this.each(function() {
                $(this).data("settings", settings);
                $(this).data("tokenInputObject", new $.TokenList(this, url_or_data_or_function, settings));
            });
        },
        clear: function() {
            this.data("tokenInputObject").clear();
            return this;
        },
        add: function(item) {
            this.data("tokenInputObject").add(item);
            return this;
        },
        remove: function(item) {
            this.data("tokenInputObject").remove(item);
            return this;
        },
        get: function() {
            return this.data("tokenInputObject").getTokens();
        },
        toggleDisabled: function(disable) {
            this.data("tokenInputObject").toggleDisabled(disable);
            return this;
        },
        setOptions: function(options) {
            $(this).data("settings", $.extend({}, $(this).data("settings"), options || {}));
            return this;
        },
        destroy: function() {
            if (this.data("tokenInputObject")) {
                this.data("tokenInputObject").clear();
                var tmpInput = this;
                var closest = this.parent();
                closest.empty();
                tmpInput.show();
                closest.append(tmpInput);
                return tmpInput;
            }
        }
    };

    // Expose the .tokenInput function to jQuery as a plugin
    $.fn.tokenInput = function(method) {
        // Method calling and initialization logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return methods.init.apply(this, arguments);
        }
    };

    // TokenList class for each input
    $.TokenList = function(input, url_or_data, settings) {
        //
        // Initialization
        //

        // Configure the data source
        if ($.type(url_or_data) === "string" || $.type(url_or_data) === "function") {
            // Set the url to query against
            $(input).data("settings").url = url_or_data;

            // If the URL is a function, evaluate it here to do our initalization work
            var url = computeURL();

            // Make a smart guess about cross-domain if it wasn't explicitly specified
            if ($(input).data("settings").crossDomain === undefined && typeof url === "string") {
                if (url.indexOf("://") === -1) {
                    $(input).data("settings").crossDomain = false;
                } else {
                    $(input).data("settings").crossDomain = (location.href.split(/\/+/g)[1] !== url.split(/\/+/g)[1]);
                }
            }
        } else if (typeof (url_or_data) === "object") {
            // Set the local data to search through
            $(input).data("settings").local_data = url_or_data;
        }

        // Build class names
        if ($(input).data("settings").classes) {
            // Use custom class names
            $(input).data("settings").classes = $.extend({}, DEFAULT_CLASSES, $(input).data("settings").classes);
        } else if ($(input).data("settings").theme) {
            // Use theme-suffixed default class names
            $(input).data("settings").classes = {};
            $.each(DEFAULT_CLASSES, function(key, value) {
                $(input).data("settings").classes[key] = value + "-" + $(input).data("settings").theme;
            });
        } else {
            $(input).data("settings").classes = DEFAULT_CLASSES;
        }


        // Save the tokens
        var saved_tokens = [];

        // Keep track of the number of tokens in the list
        var token_count = 0;

        // Basic cache to save on db hits
        var cache = new $.TokenList.Cache();

        // Keep track of the timeout, old vals
        var timeout;
        var input_val;

        // Create a new text input an attach keyup events
        var input_box = $("<input type=\"text\"  autocomplete=\"off\" autocapitalize=\"off\">")
                .css({
                    outline: "none"
                })
                .attr("id", $(input).data("settings").idPrefix + input.id)
                .focus(function() {
                    if ($(input).data("settings").disabled) {
                        return false;
                    } else
                    if ($(input).data("settings").tokenLimit === null || $(input).data("settings").tokenLimit !== token_count) {
                        show_dropdown_hint();
                    }
                    token_list.addClass($(input).data("settings").classes.focused);
                })
                .blur(function() {
                    hide_dropdown();

                    if ($(input).data("settings").allowFreeTagging) {
                        add_freetagging_tokens();
                    }

                    $(this).val("");
                    token_list.removeClass($(input).data("settings").classes.focused);
                })
                .bind("keyup keydown blur update", resize_input)
                .keydown(function(event) {
                    var previous_token;
                    var next_token;

                    switch (event.keyCode) {
                        case KEY.LEFT:
                        case KEY.RIGHT:
                        case KEY.UP:
                        case KEY.DOWN:
                            if (!$(this).val()) {
                                previous_token = input_token.prev();
                                next_token = input_token.next();

                                if ((previous_token.length && previous_token.get(0) === selected_token) || (next_token.length && next_token.get(0) === selected_token)) {
                                    // Check if there is a previous/next token and it is selected
                                    if (event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) {
                                        deselect_token($(selected_token), POSITION.BEFORE);
                                    } else {
                                        deselect_token($(selected_token), POSITION.AFTER);
                                    }
                                } else if ((event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) && previous_token.length) {
                                    // We are moving left, select the previous token if it exists
                                    select_token($(previous_token.get(0)));
                                } else if ((event.keyCode === KEY.RIGHT || event.keyCode === KEY.DOWN) && next_token.length) {
                                    // We are moving right, select the next token if it exists
                                    select_token($(next_token.get(0)));
                                }
                            } else {
                                var dropdown_item = null;

                                if (event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) {
                                    dropdown_item = $(selected_dropdown_item).next();
                                } else {
                                    dropdown_item = $(selected_dropdown_item).prev();
                                }

                                if (dropdown_item.length) {
                                    select_dropdown_item(dropdown_item);
                                }
                            }
                            return false;
                            break;

                        case KEY.BACKSPACE:
                            previous_token = input_token.prev();

                            if (!$(this).val().length) {
                                if (selected_token) {
                                    delete_token($(selected_token));
                                    hidden_input.change();
                                } else if (previous_token.length) {
                                    select_token($(previous_token.get(0)));
                                }

                                return false;
                            } else if ($(this).val().length === 1) {
                                hide_dropdown();
                            } else {
                                // set a timeout just long enough to let this function finish.
                                setTimeout(function() {
                                    do_search();
                                }, 5);
                            }
                            break;

                        case KEY.TAB:
                        case KEY.ENTER:
                        case KEY.NUMPAD_ENTER:
                        case KEY.COMMA:
                            if (selected_dropdown_item) {
                                add_token($(selected_dropdown_item).data("tokeninput"));
                                hidden_input.change();
                            } else {
                                if ($(input).data("settings").allowFreeTagging) {
                                    if ($(input).data("settings").allowTabOut && $(this).val() === "") {
                                        return true;
                                    } else {
                                        add_freetagging_tokens();
                                    }
                                } else {
                                    $(this).val("");
                                    if ($(input).data("settings").allowTabOut) {
                                        return true;
                                    }
                                }
                                event.stopPropagation();
                                event.preventDefault();
                            }
                            return false;

                        case KEY.ESCAPE:
                            hide_dropdown();
                            return true;

                        default:
                            if (String.fromCharCode(event.which)) {
                                // set a timeout just long enough to let this function finish.
                                setTimeout(function() {
                                    do_search();
                                }, 5);
                            }
                            break;
                    }
                });

        // Keep reference for placeholder
        if (settings.placeholder)
            input_box.attr("placeholder", settings.placeholder)

        // Keep a reference to the original input box
        var hidden_input = $(input)
                .hide()
                .val("")
                .focus(function() {
                    focus_with_timeout(input_box);
                })
                .blur(function() {
                    input_box.blur();
                    //return the object to this can be referenced in the callback functions.
                    return hidden_input;
                });

        // Keep a reference to the selected token and dropdown item
        var selected_token = null;
        var selected_token_index = 0;
        var selected_dropdown_item = null;

        // The list to store the token items in
        var token_list = $("<ul />")
                .addClass($(input).data("settings").classes.tokenList)
                .click(function(event) {
                    var li = $(event.target).closest("li");
                    if (li && li.get(0) && $.data(li.get(0), "tokeninput")) {
                        toggle_select_token(li);
                    } else {
                        // Deselect selected token
                        if (selected_token) {
                            deselect_token($(selected_token), POSITION.END);
                        }

                        // Focus input box
                        focus_with_timeout(input_box);
                    }
                })
                .mouseover(function(event) {
                    var li = $(event.target).closest("li");
                    if (li && selected_token !== this) {
                        li.addClass($(input).data("settings").classes.highlightedToken);
                    }
                })
                .mouseout(function(event) {
                    var li = $(event.target).closest("li");
                    if (li && selected_token !== this) {
                        li.removeClass($(input).data("settings").classes.highlightedToken);
                    }
                })
                .insertBefore(hidden_input);

        // The token holding the input box
        var input_token = $("<li />")
                .addClass($(input).data("settings").classes.inputToken)
                .appendTo(token_list)
                .append(input_box);

        // The list to store the dropdown items in
        var dropdown = $("<div>")
                .addClass($(input).data("settings").classes.dropdown)
                .appendTo("body")
                .hide();

        // Magic element to help us resize the text input
        var input_resizer = $("<tester/>")
                .insertAfter(input_box)
                .css({
                    position: "absolute",
                    top: -9999,
                    left: -9999,
                    width: "auto",
                    fontSize: input_box.css("fontSize"),
                    fontFamily: input_box.css("fontFamily"),
                    fontWeight: input_box.css("fontWeight"),
                    letterSpacing: input_box.css("letterSpacing"),
                    whiteSpace: "nowrap"
                });

        // Pre-populate list if items exist
        hidden_input.val("");
        var li_data = $(input).data("settings").prePopulate || hidden_input.data("pre");
        if ($(input).data("settings").processPrePopulate && $.isFunction($(input).data("settings").onResult)) {
            li_data = $(input).data("settings").onResult.call(hidden_input, li_data);
        }
        if (li_data && li_data.length) {
            $.each(li_data, function(index, value) {
                insert_token(value);
                checkTokenLimit();
                input_box.attr("placeholder", null)
            });
        }

        // Check if widget should initialize as disabled
        if ($(input).data("settings").disabled) {
            toggleDisabled(true);
        }

        // Initialization is done
        if ($.isFunction($(input).data("settings").onReady)) {
            $(input).data("settings").onReady.call();
        }

        //
        // Public functions
        //

        this.clear = function() {
            token_list.children("li").each(function() {
                if ($(this).children("input").length === 0) {
                    delete_token($(this));
                }
            });
        };

        this.add = function(item) {
            add_token(item);
        };

        this.remove = function(item) {
            token_list.children("li").each(function() {
                if ($(this).children("input").length === 0) {
                    var currToken = $(this).data("tokeninput");
                    var match = true;
                    for (var prop in item) {
                        if (item[prop] !== currToken[prop]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        delete_token($(this));
                    }
                }
            });
        };

        this.getTokens = function() {
            return saved_tokens;
        };

        this.toggleDisabled = function(disable) {
            toggleDisabled(disable);
        };

        // Resize input to maximum width so the placeholder can be seen
        resize_input();

        //
        // Private functions
        //

        function escapeHTML(text) {
            return $(input).data("settings").enableHTML ? text : _escapeHTML(text);
        }

        // Toggles the widget between enabled and disabled state, or according
        // to the [disable] parameter.
        function toggleDisabled(disable) {
            if (typeof disable === 'boolean') {
                $(input).data("settings").disabled = disable
            } else {
                $(input).data("settings").disabled = !$(input).data("settings").disabled;
            }
            input_box.attr('disabled', $(input).data("settings").disabled);
            token_list.toggleClass($(input).data("settings").classes.disabled, $(input).data("settings").disabled);
            // if there is any token selected we deselect it
            if (selected_token) {
                deselect_token($(selected_token), POSITION.END);
            }
            hidden_input.attr('disabled', $(input).data("settings").disabled);
        }

        function checkTokenLimit() {
            if ($(input).data("settings").tokenLimit !== null && token_count >= $(input).data("settings").tokenLimit) {
                input_box.hide();
                hide_dropdown();
                return;
            }
        }

        function resize_input() {
            if (input_val === (input_val = input_box.val())) {
                return;
            }

            // Get width left on the current line
            var width_left = token_list.width() - input_box.offset().left - token_list.offset().left;
            // Enter new content into resizer and resize input accordingly
            input_resizer.html(_escapeHTML(input_val) || _escapeHTML(settings.placeholder));
            // Get maximum width, minimum the size of input and maximum the widget's width
            input_box.width(Math.min(token_list.width(),
                    Math.max(width_left, input_resizer.width() + 30)));
        }

        function is_printable_character(keycode) {
            return ((keycode >= 48 && keycode <= 90) || // 0-1a-z
                    (keycode >= 96 && keycode <= 111) || // numpad 0-9 + - / * .
                    (keycode >= 186 && keycode <= 192) || // ; = , - . / ^
                    (keycode >= 219 && keycode <= 222));    // ( \ ) '
        }

        function add_freetagging_tokens() {
            var value = $.trim(input_box.val());
            var tokens = value.split($(input).data("settings").tokenDelimiter);
            $.each(tokens, function(i, token) {
                if (!token) {
                    return;
                }

                if ($.isFunction($(input).data("settings").onFreeTaggingAdd)) {
                    token = $(input).data("settings").onFreeTaggingAdd.call(hidden_input, token);
                }
                var object = {};
                object[$(input).data("settings").tokenValue] = object[$(input).data("settings").propertyToSearch] = token;
                add_token(object);
            });
        }

        // Inner function to a token to the list
        function insert_token(item) {
            var $this_token = $(input).data("settings").tokenFormatter(item);
            if ($this_token === false) {
                return $this_token;
            }
            $this_token = $($this_token);
            var readonly = item.readonly === true ? true : false;

            if (readonly)
                $this_token.addClass($(input).data("settings").classes.tokenReadOnly);

            $this_token.addClass($(input).data("settings").classes.token).insertBefore(input_token);

            // The 'delete token' button
            if (!readonly) {
                $("<span>" + $(input).data("settings").deleteText + "</span>")
                        .addClass($(input).data("settings").classes.tokenDelete)
                        .appendTo($this_token)
                        .click(function() {
                            if (!$(input).data("settings").disabled) {
                                delete_token($(this).parent());
                                hidden_input.change();
                                return false;
                            }
                        });
            }

            // Store data on the token
            var token_data = item;
            $.data($this_token.get(0), "tokeninput", item);

            // Save this token for duplicate checking
            saved_tokens = saved_tokens.slice(0, selected_token_index).concat([token_data]).concat(saved_tokens.slice(selected_token_index));
            selected_token_index++;

            // Update the hidden input
            update_hidden_input(saved_tokens, hidden_input);

            token_count += 1;

            // Check the token limit
            if ($(input).data("settings").tokenLimit !== null && token_count >= $(input).data("settings").tokenLimit) {
                input_box.hide();
                hide_dropdown();
            }

            return $this_token;
        }

        // Add a token to the token list based on user input
        function add_token(item) {
            var callback = $(input).data("settings").onAdd;

            // See if the token already exists and select it if we don't want duplicates
            if (token_count > 0 && $(input).data("settings").preventDuplicates) {
                var found_existing_token = null;
                token_list.children().each(function() {
                    var existing_token = $(this);
                    var existing_data = $.data(existing_token.get(0), "tokeninput");
                    if (existing_data && existing_data[settings.tokenValue] === item[settings.tokenValue]) {
                        found_existing_token = existing_token;
                        return false;
                    }
                });

                if (found_existing_token) {
                    select_token(found_existing_token);
                    input_token.insertAfter(found_existing_token);
                    focus_with_timeout(input_box);
                    return;
                }
            }

            // Squeeze input_box so we force no unnecessary line break
            input_box.width(0);
            $this_token = false;
            // Insert the new tokens
            if ($(input).data("settings").tokenLimit == null || token_count < $(input).data("settings").tokenLimit) {
                $this_token = insert_token(item);
                // Remove the placeholder so it's not seen after you've added a token
                input_box.attr("placeholder", null)
                checkTokenLimit();
            }

            // Clear input box
            input_box.val("");

            // Don't show the help dropdown, they've got the idea
            hide_dropdown();

            // Execute the onAdd callback if defined
            if ($this_token !== false && $.isFunction(callback)) {
                callback.call(hidden_input, item, $this_token);
            }
        }

        // Select a token in the token list
        function select_token(token) {
            if (!$(input).data("settings").disabled) {
                token.addClass($(input).data("settings").classes.selectedToken);
                selected_token = token.get(0);

                // Hide input box
                input_box.val("");

                // Hide dropdown if it is visible (eg if we clicked to select token)
                hide_dropdown();
            }
        }

        // Deselect a token in the token list
        function deselect_token(token, position) {
            token.removeClass($(input).data("settings").classes.selectedToken);
            selected_token = null;

            if (position === POSITION.BEFORE) {
                input_token.insertBefore(token);
                selected_token_index--;
            } else if (position === POSITION.AFTER) {
                input_token.insertAfter(token);
                selected_token_index++;
            } else {
                input_token.appendTo(token_list);
                selected_token_index = token_count;
            }

            // Show the input box and give it focus again
            focus_with_timeout(input_box);
        }

        // Toggle selection of a token in the token list
        function toggle_select_token(token) {
            var previous_selected_token = selected_token;

            if (selected_token) {
                deselect_token($(selected_token), POSITION.END);
            }

            if (previous_selected_token === token.get(0)) {
                deselect_token(token, POSITION.END);
            } else {
                select_token(token);
            }
        }

        // Delete a token from the token list
        function delete_token(token) {
            // Remove the id from the saved list
            var token_data = $.data(token.get(0), "tokeninput");
            var callback = $(input).data("settings").onDelete;

            var index = token.prevAll().length;
            if (index > selected_token_index)
                index--;

            // Delete the token
            var deleted = $(token).find('[name*="[deleted]"]');
            if (deleted.length > 0) {
                token.hide();
                deleted.val(1);
            } else {
                token.remove();
            }
            selected_token = null;

            // Show the input box and give it focus again
            focus_with_timeout(input_box);

            // Remove this token from the saved list
            saved_tokens = saved_tokens.slice(0, index).concat(saved_tokens.slice(index + 1));
            if (saved_tokens.length == 0) {
                input_box.attr("placeholder", settings.placeholder)
            }
            if (index < selected_token_index)
                selected_token_index--;

            // Update the hidden input
            update_hidden_input(saved_tokens, hidden_input);

            token_count -= 1;

            if ($(input).data("settings").tokenLimit !== null) {
                input_box
                        .show()
                        .val("");
                focus_with_timeout(input_box);
            }

            // Execute the onDelete callback if defined
            if ($.isFunction(callback)) {
                callback.call(hidden_input, token_data, token);
            }
        }

        // Update the hidden input box value
        function update_hidden_input(saved_tokens, hidden_input) {
            var token_values = $.map(saved_tokens, function(el) {
                if (typeof $(input).data("settings").tokenValue == 'function')
                    return $(input).data("settings").tokenValue.call(this, el);

                return el[$(input).data("settings").tokenValue];
            });
            hidden_input.val(token_values.join($(input).data("settings").tokenDelimiter));

        }

        // Hide and clear the results dropdown
        function hide_dropdown() {
            dropdown.hide().empty();
            selected_dropdown_item = null;
        }

        function show_dropdown() {
            dropdown
                    .css({
                        position: "absolute",
                        top: token_list.offset().top + token_list.outerHeight(),
                        left: token_list.offset().left,
                        width: token_list.width(),
                        'z-index': $(input).data("settings").zindex
                    })
                    .show();
        }

        function show_dropdown_searching() {
            if ($(input).data("settings").searchingText) {
                dropdown.html("<p>" + escapeHTML($(input).data("settings").searchingText) + "</p>");
                show_dropdown();
            }
        }

        function show_dropdown_hint() {
            if ($(input).data("settings").hintText) {
                dropdown.html("<p>" + escapeHTML($(input).data("settings").hintText) + "</p>");
                show_dropdown();
            }
        }

        var regexp_special_chars = new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g');
        function regexp_escape(term) {
            return term.replace(regexp_special_chars, '\\$&');
        }

        // Highlight the query part of the search term
        function highlight_term(value, term) {
            return value.replace(
                    new RegExp(
                            "(?![^&;]+;)(?!<[^<>]*)(" + regexp_escape(term) + ")(?![^<>]*>)(?![^&;]+;)",
                            "gi"
                            ), function(match, p1) {
                return "<b>" + escapeHTML(p1) + "</b>";
            }
            );
        }

        function find_value_and_highlight_term(template, value, term) {
            return template.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + regexp_escape(value) + ")(?![^<>]*>)(?![^&;]+;)", "g"), highlight_term(value, term));
        }

        // Populate the results dropdown with some results
        function populate_dropdown(query, results) {
            if (results && results.length) {
                dropdown.empty();
                var dropdown_ul = $("<ul>")
                        .appendTo(dropdown)
                        .mouseover(function(event) {
                            select_dropdown_item($(event.target).closest("li"));
                        })
                        .mousedown(function(event) {
                            add_token($(event.target).closest("li").data("tokeninput"));
                            hidden_input.change();
                            return false;
                        })
                        .hide();

                if ($(input).data("settings").resultsLimit && results.length > $(input).data("settings").resultsLimit) {
                    results = results.slice(0, $(input).data("settings").resultsLimit);
                }

                $.each(results, function(index, value) {
                    var this_li = $(input).data("settings").resultsFormatter(value);

                    this_li = find_value_and_highlight_term(this_li, value[$(input).data("settings").propertyToSearch], query);

                    this_li = $(this_li).appendTo(dropdown_ul);

                    if (index % 2) {
                        this_li.addClass($(input).data("settings").classes.dropdownItem);
                    } else {
                        this_li.addClass($(input).data("settings").classes.dropdownItem2);
                    }

                    if (index === 0) {
                        select_dropdown_item(this_li);
                    }

                    $.data(this_li.get(0), "tokeninput", value);
                });

                show_dropdown();

                if ($(input).data("settings").animateDropdown) {
                    dropdown_ul.slideDown("fast");
                } else {
                    dropdown_ul.show();
                }
            } else {
                if ($(input).data("settings").noResultsText) {
                    dropdown.html("<p>" + escapeHTML($(input).data("settings").noResultsText) + "</p>");
                    show_dropdown();
                }
            }
        }

        // Highlight an item in the results dropdown
        function select_dropdown_item(item) {
            if (item) {
                if (selected_dropdown_item) {
                    deselect_dropdown_item($(selected_dropdown_item));
                }

                item.addClass($(input).data("settings").classes.selectedDropdownItem);
                selected_dropdown_item = item.get(0);
            }
        }

        // Remove highlighting from an item in the results dropdown
        function deselect_dropdown_item(item) {
            item.removeClass($(input).data("settings").classes.selectedDropdownItem);
            selected_dropdown_item = null;
        }

        // Do a search and show the "searching" dropdown if the input is longer
        // than $(input).data("settings").minChars
        function do_search() {
            var query = input_box.val();

            if (query && query.length) {
                if (selected_token) {
                    deselect_token($(selected_token), POSITION.AFTER);
                }

                if (query.length >= $(input).data("settings").minChars) {
                    show_dropdown_searching();
                    clearTimeout(timeout);

                    timeout = setTimeout(function() {
                        run_search(query);
                    }, $(input).data("settings").searchDelay);
                } else {
                    hide_dropdown();
                }
            }
        }

        // Do the actual search
        function run_search(query) {
            var cache_key = query + computeURL(query);
            var cached_results = cache.get(cache_key);
            cached_results = false;
            if (cached_results) {
                if ($.isFunction($(input).data("settings").onCachedResult)) {
                    cached_results = $(input).data("settings").onCachedResult.call(hidden_input, cached_results);
                }
                populate_dropdown(query, cached_results);
            } else {
                // Are we doing an ajax search or local data search?
                if ($(input).data("settings").url) {
                    var url = computeURL(query);
                    // Extract exisiting get params
                    var ajax_params = {};
                    ajax_params.data = {};
                    if (url.indexOf("?") > -1) {
                        var parts = url.split("?");
                        ajax_params.url = parts[0];

                        var param_array = parts[1].split("&");
                        $.each(param_array, function(index, value) {
                            var kv = value.split("=");
                            ajax_params.data[kv[0]] = kv[1];
                        });
                    } else {
                        ajax_params.url = url;
                    }

                    // Prepare the request
                    if (url.indexOf("q=") === -1) {
                        ajax_params.data[$(input).data("settings").queryParam] = query;
                    }
                    ajax_params.type = $(input).data("settings").method;
                    ajax_params.dataType = $(input).data("settings").contentType;
                    if ($(input).data("settings").crossDomain) {
                        ajax_params.dataType = "jsonp";
                    }

                    // Attach the success callback
                    ajax_params.success = function(results) {
                        cache.add(cache_key, $(input).data("settings").jsonContainer ? results[$(input).data("settings").jsonContainer] : results);
                        if ($.isFunction($(input).data("settings").onResult)) {
                            results = $(input).data("settings").onResult.call(hidden_input, results);
                        }

                        // only populate the dropdown if the results are associated with the active search query
                        if (input_box.val() === query) {
                            populate_dropdown(query, $(input).data("settings").jsonContainer ? results[$(input).data("settings").jsonContainer] : results);
                        }
                    };

                    // Provide a beforeSend callback
                    if (settings.onSend) {
                        settings.onSend(ajax_params);
                    }

                    // Make the request
                    $.ajax(ajax_params);
                } else if ($(input).data("settings").local_data) {
                    // Do the search through local data
                    var results = $.grep($(input).data("settings").local_data, function(row) {
                        return row[$(input).data("settings").propertyToSearch].toLowerCase().indexOf(query.toLowerCase()) > -1;
                    });

                    cache.add(cache_key, results);
                    if ($.isFunction($(input).data("settings").onResult)) {
                        results = $(input).data("settings").onResult.call(hidden_input, results);
                    }
                    populate_dropdown(query, results);
                }
            }
        }

        // compute the dynamic URL
        function computeURL(query) {
            var url = $(input).data("settings").url;
            if (typeof $(input).data("settings").url == 'function') {
                url = $(input).data("settings").url.call($(input).data("settings"), query);
            }
            return url;
        }

        // Bring browser focus to the specified object.
        // Use of setTimeout is to get around an IE bug.
        // (See, e.g., http://stackoverflow.com/questions/2600186/focus-doesnt-work-in-ie)
        //
        // obj: a jQuery object to focus()
        function focus_with_timeout(obj) {
            setTimeout(function() {
                obj.focus();
            }, 50);
        }

    };

    // Really basic cache for the results
    $.TokenList.Cache = function(options) {
        var settings = $.extend({
            max_size: 500
        }, options);

        var data = {};
        var size = 0;

        var flush = function() {
            data = {};
            size = 0;
        };

        this.add = function(query, results) {
            if (size > settings.max_size) {
                flush();
            }

            if (!data[query]) {
                size += 1;
            }

            data[query] = results;
        };

        this.get = function(query) {
            return data[query];
        };
    };
}(jQuery));


/* FILENAME:/js/jquery.glob.js*/
/*
 * Globalization
 * http://github.com/nje/jquery-glob
 */
(function() {

var Globalization = {},
    localized = { en: {} };
localized["default"] = localized.en;

Globalization.extend = function( deep ) {
    var target = arguments[ 1 ] || {};
    for ( var i = 2, l = arguments.length; i < l; i++ ) {
        var source = arguments[ i ];
        if ( source ) {
            for ( var field in source ) {
                var sourceVal = source[ field ];
                if ( typeof sourceVal !== "undefined" ) {
                    if ( deep && (isObject( sourceVal ) || isArray( sourceVal )) ) {
                        var targetVal = target[ field ];
                        // extend onto the existing value, or create a new one
                        targetVal = targetVal && (isObject( targetVal ) || isArray( targetVal ))
                            ? targetVal
                            : (isArray( sourceVal ) ? [] : {});
                        target[ field ] = this.extend( true, targetVal, sourceVal );
                    }
                    else {
                        target[ field ] = sourceVal;
                    }
                }
            }
        }
    }
    return target;
}

Globalization.findClosestCulture = function(name) {
    var match;
    if ( !name ) {
        return this.culture || this.cultures["default"];
    }
    if ( isString( name ) ) {
        name = name.split( ',' );
    }
    if ( isArray( name ) ) {
        var lang,
            cultures = this.cultures,
            list = name,
            i, l = list.length,
            prioritized = [];
        for ( i = 0; i < l; i++ ) {
            name = trim( list[ i ] );
            var pri, parts = name.split( ';' );
            lang = trim( parts[ 0 ] );
            if ( parts.length === 1 ) {
                pri = 1;
            }
            else {
                name = trim( parts[ 1 ] );
                if ( name.indexOf("q=") === 0 ) {
                    name = name.substr( 2 );
                    pri = parseFloat( name, 10 );
                    pri = isNaN( pri ) ? 0 : pri;
                }
                else {
                    pri = 1;
                }
            }
            prioritized.push( { lang: lang, pri: pri } );
        }
        prioritized.sort(function(a, b) {
            return a.pri < b.pri ? 1 : -1;
        });
        for ( i = 0; i < l; i++ ) {
            lang = prioritized[ i ].lang;
            match = cultures[ lang ];
            // exact match?
            if ( match ) {
                return match;
            }
        }
        for ( i = 0; i < l; i++ ) {
            lang = prioritized[ i ].lang;
            // for each entry try its neutral language
            do {
                var index = lang.lastIndexOf( "-" );
                if ( index === -1 ) {
                    break;
                }
                // strip off the last part. e.g. en-US => en
                lang = lang.substr( 0, index );
                match = cultures[ lang ];
                if ( match ) {
                    return match;
                }
            }
            while ( 1 );
        }
    }
    else if ( typeof name === 'object' ) {
        return name;
    }
    return match || null;
}
Globalization.preferCulture = function(name) {
    this.culture = this.findClosestCulture( name ) || this.cultures["default"];
}
Globalization.localize = function(key, culture, value) {
    if (typeof culture === 'string') {
        culture = culture || "default";
        culture = this.cultures[ culture ] || { name: culture };
    }
    var local = localized[ culture.name ];
    if ( arguments.length === 3 ) {
        if ( !local) {
            local = localized[ culture.name ] = {};
        }
        local[ key ] = value;
    }
    else {
        if ( local ) {
            value = local[ key ];
        }
        if ( typeof value === 'undefined' ) {
            var language = localized[ culture.language ];
            if ( language ) {
                value = language[ key ];
            }
            if ( typeof value === 'undefined' ) {
                value = localized["default"][ key ];
            }
        }
    }
    return typeof value === "undefined" ? null : value;
}
Globalization.format = function(value, format, culture) {
    culture = this.findClosestCulture( culture );
    if ( typeof value === "number" ) {
        value = formatNumber( value, format, culture );
    }
    else if ( value instanceof Date ) {
        value = formatDate( value, format, culture );
    }
    return value;
}
Globalization.parseInt = function(value, radix, culture) {
    return Math.floor( this.parseFloat( value, radix, culture ) );
}
Globalization.parseFloat = function(value, radix, culture) {
    culture = this.findClosestCulture( culture );
    var ret = NaN,
        nf = culture.numberFormat;

    // trim leading and trailing whitespace
    value = trim( value );

    // allow infinity or hexidecimal
    if (regexInfinity.test(value)) {
        ret = parseFloat(value, radix);
    }
    else if (!radix && regexHex.test(value)) {
        ret = parseInt(value, 16);
    }
    else {
        var signInfo = parseNegativePattern( value, nf, nf.pattern[0] ),
            sign = signInfo[0],
            num = signInfo[1];
        // determine sign and number
        if ( sign === "" && nf.pattern[0] !== "-n" ) {
            signInfo = parseNegativePattern( value, nf, "-n" );
            sign = signInfo[0];
            num = signInfo[1];
        }
        sign = sign || "+";
        // determine exponent and number
        var exponent,
            intAndFraction,
            exponentPos = num.indexOf( 'e' );
        if ( exponentPos < 0 ) exponentPos = num.indexOf( 'E' );
        if ( exponentPos < 0 ) {
            intAndFraction = num;
            exponent = null;
        }
        else {
            intAndFraction = num.substr( 0, exponentPos );
            exponent = num.substr( exponentPos + 1 );
        }
        // determine decimal position
        var integer,
            fraction,
            decSep = nf['.'],
            decimalPos = intAndFraction.indexOf( decSep );
        if ( decimalPos < 0 ) {
            integer = intAndFraction;
            fraction = null;
        }
        else {
            integer = intAndFraction.substr( 0, decimalPos );
            fraction = intAndFraction.substr( decimalPos + decSep.length );
        }
        // handle groups (e.g. 1,000,000)
        var groupSep = nf[","];
        integer = integer.split(groupSep).join('');
        var altGroupSep = groupSep.replace(/\u00A0/g, " ");
        if ( groupSep !== altGroupSep ) {
            integer = integer.split(altGroupSep).join('');
        }
        // build a natively parsable number string
        var p = sign + integer;
        if ( fraction !== null ) {
            p += '.' + fraction;
        }
        if ( exponent !== null ) {
            // exponent itself may have a number patternd
            var expSignInfo = parseNegativePattern( exponent, nf, "-n" );
            p += 'e' + (expSignInfo[0] || "+") + expSignInfo[1];
        }
        if ( regexParseFloat.test( p ) ) {
            ret = parseFloat( p );
        }
    }
    return ret;
}
Globalization.parseDate = function(value, formats, culture) {
    culture = this.findClosestCulture( culture );

    var date, prop, patterns;
    if ( formats ) {
        if ( typeof formats === "string" ) {
            formats = [ formats ];
        }
        if ( formats.length ) {
            for ( var i = 0, l = formats.length; i < l; i++ ) {
                var format = formats[ i ];
                if ( format ) {
                    date = parseExact( value, format, culture );
                    if ( date ) {
                        break;
                    }
                }
            }
        }
    }
    else {
        patterns = culture.calendar.patterns;
        for ( prop in patterns ) {
            date = parseExact( value, patterns[prop], culture );
            if ( date ) {
                break;
            }
        }
    }
    return date || null;
}

// 1.    When defining a culture, all fields are required except the ones stated as optional.
// 2.    You can use Globalization.extend to copy an existing culture and provide only the differing values,
//       a good practice since most cultures do not differ too much from the 'default' culture.
//       DO use the 'default' culture if you do this, as it is the only one that definitely
//       exists.
// 3.    Other plugins may add to the culture information provided by extending it. However,
//       that plugin may extend it prior to the culture being defined, or after. Therefore,
//       do not overwrite values that already exist when defining the baseline for a culture,
//       by extending your culture object with the existing one.
// 4.    Each culture should have a ".calendars" object with at least one calendar named "standard"
//       which serves as the default calendar in use by that culture.
// 5.    Each culture should have a ".calendar" object which is the current calendar being used,
//       it may be dynamically changed at any time to one of the calendars in ".calendars".

// To define a culture, use the following pattern, which handles defining the culture based
// on the 'default culture, extending it with the existing culture if it exists, and defining
// it if it does not exist.
// Globalization.cultures.foo = Globalization.extend(true, Globalization.extend(true, {}, Globalization.cultures['default'], fooCulture), Globalization.cultures.foo)

var cultures = Globalization.cultures = Globalization.cultures || {};
var en = cultures["default"] = cultures.en = Globalization.extend(true, {
    // A unique name for the culture in the form <language code>-<country/region code>
    name: "en",
    // the name of the culture in the english language
    englishName: "English",
    // the name of the culture in its own language
    nativeName: "English",
    // whether the culture uses right-to-left text
    isRTL: false,
    // 'language' is used for so-called "specific" cultures.
    // For example, the culture "es-CL" means "Spanish, in Chili".
    // It represents the Spanish-speaking culture as it is in Chili,
    // which might have different formatting rules or even translations
    // than Spanish in Spain. A "neutral" culture is one that is not
    // specific to a region. For example, the culture "es" is the generic
    // Spanish culture, which may be a more generalized version of the language
    // that may or may not be what a specific culture expects.
    // For a specific culture like "es-CL", the 'language' field refers to the
    // neutral, generic culture information for the language it is using.
    // This is not always a simple matter of the string before the dash.
    // For example, the "zh-Hans" culture is netural (Simplified Chinese).
    // And the 'zh-SG' culture is Simplified Chinese in Singapore, whose lanugage
    // field is "zh-CHS", not "zh".
    // This field should be used to navigate from a specific culture to it's
    // more general, neutral culture. If a culture is already as general as it 
    // can get, the language may refer to itself.
    language: "en",
    // numberFormat defines general number formatting rules, like the digits in
    // each grouping, the group separator, and how negative numbers are displayed.
    numberFormat: {
        // [negativePattern]
        // Note, numberFormat.pattern has no 'positivePattern' unlike percent and currency,
        // but is still defined as an array for consistency with them.
        //  negativePattern: one of "(n)|-n|- n|n-|n -"
        pattern: ["-n"], 
        // number of decimal places normally shown
        decimals: 2,
        // string that separates number groups, as in 1,000,000
        ',': ",",
        // string that separates a number from the fractional portion, as in 1.99
        '.': ".",
        // array of numbers indicating the size of each number group.
        // TODO: more detailed description and example
        groupSizes: [3],
        // symbol used for positive numbers
        '+': "+",
        // symbol used for negative numbers
        '-': "-",
        percent: {
            // [negativePattern, positivePattern]
            //     negativePattern: one of "-n %|-n%|-%n|%-n|%n-|n-%|n%-|-% n|n %-|% n-|% -n|n- %"
            //     positivePattern: one of "n %|n%|%n|% n"
            pattern: ["-n %","n %"], 
            // number of decimal places normally shown
            decimals: 2,
            // array of numbers indicating the size of each number group.
            // TODO: more detailed description and example
            groupSizes: [3],
            // string that separates number groups, as in 1,000,000
            ',': ",",
            // string that separates a number from the fractional portion, as in 1.99
            '.': ".",
            // symbol used to represent a percentage
            symbol: "%"
        },
        currency: {
            // [negativePattern, positivePattern]
            //     negativePattern: one of "($n)|-$n|$-n|$n-|(n$)|-n$|n-$|n$-|-n $|-$ n|n $-|$ n-|$ -n|n- $|($ n)|(n $)"
            //     positivePattern: one of "$n|n$|$ n|n $"
            pattern: ["($n)","$n"],
            // number of decimal places normally shown
            decimals: 2,
            // array of numbers indicating the size of each number group.
            // TODO: more detailed description and example
            groupSizes: [3],
            // string that separates number groups, as in 1,000,000
            ',': ",",
            // string that separates a number from the fractional portion, as in 1.99
            '.': ".",
            // symbol used to represent currency
            symbol: "$"
        }
    },
    // calendars defines all the possible calendars used by this culture.
    // There should be at least one defined with name 'standard', and is the default
    // calendar used by the culture.
    // A calendar contains information about how dates are formatted, information about
    // the calendar's eras, a standard set of the date formats,
    // translations for day and month names, and if the calendar is not based on the Gregorian
    // calendar, conversion functions to and from the Gregorian calendar.
    calendars: {
        standard: {
            // name that identifies the type of calendar this is
            name: "Gregorian_USEnglish",
            // separator of parts of a date (e.g. '/' in 11/05/1955)
            '/': "/",
            // separator of parts of a time (e.g. ':' in 05:44 PM)
            ':': ":",
            // the first day of the week (0 = Sunday, 1 = Monday, etc)
            firstDay: 0,
            days: {
                // full day names
                names: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
                // abbreviated day names
                namesAbbr: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
                // shortest day names
                namesShort: ["Su","Mo","Tu","We","Th","Fr","Sa"]
            },
            months: {
                // full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
                names: ["January","February","March","April","May","June","July","August","September","October","November","December",""],
                // abbreviated month names
                namesAbbr: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",""]
            },
            // AM and PM designators in one of these forms:
            // The usual view, and the upper and lower case versions
            //      [standard,lowercase,uppercase] 
            // The culture does not use AM or PM (likely all standard date formats use 24 hour time)
            //      null
            AM: ["AM", "am", "AM"],
            PM: ["PM", "pm", "PM"],
            eras: [
                // eras in reverse chronological order.
                // name: the name of the era in this culture (e.g. A.D., C.E.)
                // start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
                // offset: offset in years from gregorian calendar
                { "name": "A.D.", "start": null, "offset": 0 }
            ],
            // when a two digit year is given, it will never be parsed as a four digit
            // year greater than this year (in the appropriate era for the culture)
            // Set it as a full year (e.g. 2029) or use an offset format starting from
            // the current year: "+19" would correspond to 2029 if the current year 2010.
            twoDigitYearMax: 2029,
            // set of predefined date and time patterns used by the culture
            // these represent the format someone in this culture would expect
            // to see given the portions of the date that are shown.
            patterns: {
                // short date pattern
                d: "M/d/yyyy",
                // long date pattern
                D: "dddd, MMMM dd, yyyy",
                // short time pattern
                t: "h:mm tt",
                // long time pattern
                T: "h:mm:ss tt",
                // long date, short time pattern
                f: "dddd, MMMM dd, yyyy h:mm tt",
                // long date, long time pattern
                F: "dddd, MMMM dd, yyyy h:mm:ss tt",
                // month/day pattern
                M: "MMMM dd",
                // month/year pattern
                Y: "yyyy MMMM",
                // S is a sortable format that does not vary by culture
                S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss"
            }
            // optional fields for each calendar:
            /*
            monthsGenitive:
                Same as months but used when the day preceeds the month.
                Omit if the culture has no genitive distinction in month names.
                For an explaination of genitive months, see http://blogs.msdn.com/michkap/archive/2004/12/25/332259.aspx
            convert:
                Allows for the support of non-gregorian based calendars. This convert object is used to
                to convert a date to and from a gregorian calendar date to handle parsing and formatting.
                The two functions:
                    fromGregorian(date)
                        Given the date as a parameter, return an array with parts [year, month, day]
                        corresponding to the non-gregorian based year, month, and day for the calendar.
                    toGregorian(year, month, day)
                        Given the non-gregorian year, month, and day, return a new Date() object 
                        set to the corresponding date in the gregorian calendar.
            */
        }
    }
}, cultures.en);
en.calendar = en.calendar || en.calendars.standard;

var regexTrim = /^\s+|\s+$/g,
    regexInfinity = /^[+-]?infinity$/i,
    regexHex = /^0x[a-f0-9]+$/i,
    regexParseFloat = /^[+-]?\d*\.?\d*(e[+-]?\d+)?$/,
    toString = Object.prototype.toString;

function startsWith(value, pattern) {
    return value.indexOf( pattern ) === 0;
}

function endsWith(value, pattern) {
    return value.substr( value.length - pattern.length ) === pattern;
}

function trim(value) {
    return (value+"").replace( regexTrim, "" );
}

function zeroPad(str, count, left) {
    for (var l=str.length; l < count; l++) {
        str = (left ? ('0' + str) : (str + '0'));
    }
    return str;
}

function isArray(obj) {
    return toString.call(obj) === "[object Array]";
}

function isString(obj) {
    return toString.call(obj) === "[object String]";
}

function isObject(obj) {
    return toString.call(obj) === "[object Object]";
}

function arrayIndexOf( array, item ) {
    if ( array.indexOf ) {
        return array.indexOf( item );
    }
    for ( var i = 0, length = array.length; i < length; i++ ) {
        if ( array[ i ] === item ) {
            return i;
        }
    }
    return -1;
}

// *************************************** Numbers ***************************************

function expandNumber(number, precision, formatInfo) {
    var groupSizes = formatInfo.groupSizes,
        curSize = groupSizes[ 0 ],
        curGroupIndex = 1,
        factor = Math.pow( 10, precision ),
        rounded = Math.round( number * factor ) / factor;
    if ( !isFinite(rounded) ) {
        rounded = number;
    }
    number = rounded;
        
    var numberString = number+"",
        right = "",
        split = numberString.split(/e/i),
        exponent = split.length > 1 ? parseInt( split[ 1 ], 10 ) : 0;
    numberString = split[ 0 ];
    split = numberString.split( "." );
    numberString = split[ 0 ];
    right = split.length > 1 ? split[ 1 ] : "";
        
    var l;
    if ( exponent > 0 ) {
        right = zeroPad( right, exponent, false );
        numberString += right.slice( 0, exponent );
        right = right.substr( exponent );
    }
    else if ( exponent < 0 ) {
        exponent = -exponent;
        numberString = zeroPad( numberString, exponent + 1 );
        right = numberString.slice( -exponent, numberString.length ) + right;
        numberString = numberString.slice( 0, -exponent );
    }

    if ( precision > 0 ) {
        right = formatInfo['.'] +
            ((right.length > precision) ? right.slice( 0, precision ) : zeroPad( right, precision ));
    }
    else {
        right = "";
    }

    var stringIndex = numberString.length - 1,
        sep = formatInfo[","],
        ret = "";

    while ( stringIndex >= 0 ) {
        if ( curSize === 0 || curSize > stringIndex ) {
            return numberString.slice( 0, stringIndex + 1 ) + ( ret.length ? ( sep + ret + right ) : right );
        }
        ret = numberString.slice( stringIndex - curSize + 1, stringIndex + 1 ) + ( ret.length ? ( sep + ret ) : "" );

        stringIndex -= curSize;

        if ( curGroupIndex < groupSizes.length ) {
            curSize = groupSizes[ curGroupIndex ];
            curGroupIndex++;
        }
    }
    return numberString.slice( 0, stringIndex + 1 ) + sep + ret + right;
}


function parseNegativePattern(value, nf, negativePattern) {
    var neg = nf["-"],
        pos = nf["+"],
        ret;
    switch (negativePattern) {
        case "n -":
            neg = ' ' + neg;
            pos = ' ' + pos;
            // fall through
        case "n-":
            if ( endsWith( value, neg ) ) {
                ret = [ '-', value.substr( 0, value.length - neg.length ) ];
            }
            else if ( endsWith( value, pos ) ) {
                ret = [ '+', value.substr( 0, value.length - pos.length ) ];
            }
            break;
        case "- n":
            neg += ' ';
            pos += ' ';
            // fall through
        case "-n":
            if ( startsWith( value, neg ) ) {
                ret = [ '-', value.substr( neg.length ) ];
            }
            else if ( startsWith(value, pos) ) {
                ret = [ '+', value.substr( pos.length ) ];
            }
            break;
        case "(n)":
            if ( startsWith( value, '(' ) && endsWith( value, ')' ) ) {
                ret = [ '-', value.substr( 1, value.length - 2 ) ];
            }
            break;
    }
    return ret || [ '', value ];
}

function formatNumber(value, format, culture) {
    if ( !format || format === 'i' ) {
        return culture.name.length ? value.toLocaleString() : value.toString();
    }
    format = format || "D";

    var nf = culture.numberFormat,
        number = Math.abs(value),
        precision = -1,
        pattern;
    if (format.length > 1) precision = parseInt( format.slice( 1 ), 10 );

    var current = format.charAt( 0 ).toUpperCase(),
        formatInfo;

    switch (current) {
        case "D":
            pattern = 'n';
            if (precision !== -1) {
                number = zeroPad( ""+number, precision, true );
            }
            if (value < 0) number = -number;
            break;
        case "N":
            formatInfo = nf;
            // fall through
        case "C":
            formatInfo = formatInfo || nf.currency;
            // fall through
        case "P":
            formatInfo = formatInfo || nf.percent;
            pattern = value < 0 ? formatInfo.pattern[0] : (formatInfo.pattern[1] || "n");
            if (precision === -1) precision = formatInfo.decimals;
            number = expandNumber( number * (current === "P" ? 100 : 1), precision, formatInfo );
            break;
        default:
            throw "Bad number format specifier: " + current;
    }

    var patternParts = /n|\$|-|%/g,
        ret = "";
    for (;;) {
        var index = patternParts.lastIndex,
            ar = patternParts.exec(pattern);

        ret += pattern.slice( index, ar ? ar.index : pattern.length );

        if (!ar) {
            break;
        }

        switch (ar[0]) {
            case "n":
                ret += number;
                break;
            case "$":
                ret += nf.currency.symbol;
                break;
            case "-":
                // don't make 0 negative
                if ( /[1-9]/.test( number ) ) {
                    ret += nf["-"];
                }
                break;
            case "%":
                ret += nf.percent.symbol;
                break;
        }
    }

    return ret;
}

// *************************************** Dates ***************************************

function outOfRange(value, low, high) {
    return value < low || value > high;
}

function expandYear(cal, year) {
    // expands 2-digit year into 4 digits.
    var now = new Date(),
        era = getEra(now);
    if ( year < 100 ) {
        var twoDigitYearMax = cal.twoDigitYearMax;
        twoDigitYearMax = typeof twoDigitYearMax === 'string' ? new Date().getFullYear() % 100 + parseInt( twoDigitYearMax, 10 ) : twoDigitYearMax;
        var curr = getEraYear( now, cal, era );
        year += curr - ( curr % 100 );
        if ( year > twoDigitYearMax ) {
            year -= 100;
        }
    }
    return year;
}

function getEra(date, eras) {
    if ( !eras ) return 0;
    var start, ticks = date.getTime();
    for ( var i = 0, l = eras.length; i < l; i++ ) {
        start = eras[ i ].start;
        if ( start === null || ticks >= start ) {
            return i;
        }
    }
    return 0;
}

function toUpper(value) {
    // 'he-IL' has non-breaking space in weekday names.
    return value.split( "\u00A0" ).join(' ').toUpperCase();
}

function toUpperArray(arr) {
    var results = [];
    for ( var i = 0, l = arr.length; i < l; i++ ) {
        results[i] = toUpper(arr[i]);
    }
    return results;
}

function getEraYear(date, cal, era, sortable) {
    var year = date.getFullYear();
    if ( !sortable && cal.eras ) {
        // convert normal gregorian year to era-shifted gregorian
        // year by subtracting the era offset
        year -= cal.eras[ era ].offset;
    }    
    return year;
}

function getDayIndex(cal, value, abbr) {
    var ret,
        days = cal.days,
        upperDays = cal._upperDays;
    if ( !upperDays ) {
        cal._upperDays = upperDays = [
            toUpperArray( days.names ),
            toUpperArray( days.namesAbbr ),
            toUpperArray( days.namesShort )
        ];
    }
    value = toUpper( value );
    if ( abbr ) {
        ret = arrayIndexOf( upperDays[ 1 ], value );
        if ( ret === -1 ) {
            ret = arrayIndexOf( upperDays[ 2 ], value );
        }
    }
    else {
        ret = arrayIndexOf( upperDays[ 0 ], value );
    }
    return ret;
}

function getMonthIndex(cal, value, abbr) {
    var months = cal.months,
        monthsGen = cal.monthsGenitive || cal.months,
        upperMonths = cal._upperMonths,
        upperMonthsGen = cal._upperMonthsGen;
    if ( !upperMonths ) {
        cal._upperMonths = upperMonths = [
            toUpperArray( months.names ),
            toUpperArray( months.namesAbbr ),
        ];
        cal._upperMonthsGen = upperMonthsGen = [
            toUpperArray( monthsGen.names ),
            toUpperArray( monthsGen.namesAbbr )
        ];
    }
    value = toUpper( value );
    var i = arrayIndexOf( abbr ? upperMonths[ 1 ] : upperMonths[ 0 ], value );
    if ( i < 0 ) {
        i = arrayIndexOf( abbr ? upperMonthsGen[ 1 ] : upperMonthsGen[ 0 ], value );
    }
    return i;
}

function appendPreOrPostMatch(preMatch, strings) {
    // appends pre- and post- token match strings while removing escaped characters.
    // Returns a single quote count which is used to determine if the token occurs
    // in a string literal.
    var quoteCount = 0,
        escaped = false;
    for ( var i = 0, il = preMatch.length; i < il; i++ ) {
        var c = preMatch.charAt( i );
        switch ( c ) {
            case '\'':
                if ( escaped ) {
                    strings.push( "'" );
                }
                else {
                    quoteCount++;
                }
                escaped = false;
                break;
            case '\\':
                if ( escaped ) {
                    strings.push( "\\" );
                }
                escaped = !escaped;
                break;
            default:
                strings.push( c );
                escaped = false;
                break;
        }
    }
    return quoteCount;
}

function expandFormat(cal, format) {
    // expands unspecified or single character date formats into the full pattern.
    format = format || "F";
    var pattern,
        patterns = cal.patterns,
        len = format.length;
    if ( len === 1 ) {
        pattern = patterns[ format ];
        if ( !pattern ) {
            throw "Invalid date format string '" + format + "'.";
        }
        format = pattern;
    }
    else if ( len === 2  && format.charAt(0) === "%" ) {
        // %X escape format -- intended as a custom format string that is only one character, not a built-in format.
        format = format.charAt( 1 );
    }
    return format;
}

function getParseRegExp(cal, format) {
    // converts a format string into a regular expression with groups that
    // can be used to extract date fields from a date string.
    // check for a cached parse regex.
    var re = cal._parseRegExp;
    if ( !re ) {
        cal._parseRegExp = re = {};
    }
    else {
        var reFormat = re[ format ];
        if ( reFormat ) {
            return reFormat;
        }
    }

    // expand single digit formats, then escape regular expression characters.
    var expFormat = expandFormat( cal, format ).replace( /([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, "\\\\$1" ),
        regexp = ["^"],
        groups = [],
        index = 0,
        quoteCount = 0,
        tokenRegExp = getTokenRegExp(),
        match;

    // iterate through each date token found.
    while ( (match = tokenRegExp.exec( expFormat )) !== null ) {
        var preMatch = expFormat.slice( index, match.index );
        index = tokenRegExp.lastIndex;

        // don't replace any matches that occur inside a string literal.
        quoteCount += appendPreOrPostMatch( preMatch, regexp );
        if ( quoteCount % 2 ) {
            regexp.push( match[ 0 ] );
            continue;
        }

        // add a regex group for the token.
        var m = match[ 0 ],
            len = m.length,
            add;
        switch ( m ) {
            case 'dddd': case 'ddd':
            case 'MMMM': case 'MMM':
            case 'gg': case 'g':
                add = "(\\D+)";
                break;
            case 'tt': case 't':
                add = "(\\D*)";
                break;
            case 'yyyy':
            case 'fff':
            case 'ff':
            case 'f':
                add = "(\\d{" + len + "})";
                break;
            case 'dd': case 'd':
            case 'MM': case 'M':
            case 'yy': case 'y':
            case 'HH': case 'H':
            case 'hh': case 'h':
            case 'mm': case 'm':
            case 'ss': case 's':
                add = "(\\d\\d?)";
                break;
            case 'zzz':
                add = "([+-]?\\d\\d?:\\d{2})";
                break;
            case 'zz': case 'z':
                add = "([+-]?\\d\\d?)";
                break;
            case '/':
                add = "(\\" + cal["/"] + ")";
                break;
            default:
                throw "Invalid date format pattern '" + m + "'.";
                break;
        }
        if ( add ) {
            regexp.push( add );
        }
        groups.push( match[ 0 ] );
    }
    appendPreOrPostMatch( expFormat.slice( index ), regexp );
    regexp.push( "$" );

    // allow whitespace to differ when matching formats.
    var regexpStr = regexp.join( '' ).replace( /\s+/g, "\\s+" ),
        parseRegExp = {'regExp': regexpStr, 'groups': groups};

    // cache the regex for this format.
    return re[ format ] = parseRegExp;
}

function getTokenRegExp() {
    // regular expression for matching date and time tokens in format strings.
    return /\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g;
}

function parseExact(value, format, culture) {
    // try to parse the date string by matching against the format string
    // while using the specified culture for date field names.
    value = trim( value );
    var cal = culture.calendar,
        // convert date formats into regular expressions with groupings.
        // use the regexp to determine the input format and extract the date fields.
        parseInfo = getParseRegExp(cal, format),
        match = new RegExp(parseInfo.regExp).exec(value);
    if (match === null) {
        return null;
    }
    // found a date format that matches the input.
    var groups = parseInfo.groups,
        era = null, year = null, month = null, date = null, weekDay = null,
        hour = 0, hourOffset, min = 0, sec = 0, msec = 0, tzMinOffset = null,
        pmHour = false;
    // iterate the format groups to extract and set the date fields.
    for ( var j = 0, jl = groups.length; j < jl; j++ ) {
        var matchGroup = match[ j + 1 ];
        if ( matchGroup ) {
            var current = groups[ j ],
                clength = current.length,
                matchInt = parseInt( matchGroup, 10 );
            switch ( current ) {
                case 'dd': case 'd':
                    // Day of month.
                    date = matchInt;
                    // check that date is generally in valid range, also checking overflow below.
                    if ( outOfRange( date, 1, 31 ) ) return null;
                    break;
                case 'MMM':
                case 'MMMM':
                    month = getMonthIndex( cal, matchGroup, clength === 3 );
                    if ( outOfRange( month, 0, 11 ) ) return null;
                    break;
                case 'M': case 'MM':
                    // Month.
                    month = matchInt - 1;
                    if ( outOfRange( month, 0, 11 ) ) return null;
                    break;
                case 'y': case 'yy':
                case 'yyyy':
                    year = clength < 4 ? expandYear( cal, matchInt ) : matchInt;
                    if ( outOfRange( year, 0, 9999 ) ) return null;
                    break;
                case 'h': case 'hh':
                    // Hours (12-hour clock).
                    hour = matchInt;
                    if ( hour === 12 ) hour = 0;
                    if ( outOfRange( hour, 0, 11 ) ) return null;
                    break;
                case 'H': case 'HH':
                    // Hours (24-hour clock).
                    hour = matchInt;
                    if ( outOfRange( hour, 0, 23 ) ) return null;
                    break;
                case 'm': case 'mm':
                    // Minutes.
                    min = matchInt;
                    if ( outOfRange( min, 0, 59 ) ) return null;
                    break;
                case 's': case 'ss':
                    // Seconds.
                    sec = matchInt;
                    if ( outOfRange( sec, 0, 59 ) ) return null;
                    break;
                case 'tt': case 't':
                    // AM/PM designator.
                    // see if it is standard, upper, or lower case PM. If not, ensure it is at least one of
                    // the AM tokens. If not, fail the parse for this format.
                    pmHour = cal.PM && ( matchGroup === cal.PM[0] || matchGroup === cal.PM[1] || matchGroup === cal.PM[2] );
                    if ( !pmHour && ( !cal.AM || (matchGroup !== cal.AM[0] && matchGroup !== cal.AM[1] && matchGroup !== cal.AM[2]) ) ) return null;
                    break;
                case 'f':
                    // Deciseconds.
                case 'ff':
                    // Centiseconds.
                case 'fff':
                    // Milliseconds.
                    msec = matchInt * Math.pow( 10, 3-clength );
                    if ( outOfRange( msec, 0, 999 ) ) return null;
                    break;
                case 'ddd':
                    // Day of week.
                case 'dddd':
                    // Day of week.
                    weekDay = getDayIndex( cal, matchGroup, clength === 3 );
                    if ( outOfRange( weekDay, 0, 6 ) ) return null;
                    break;
                case 'zzz':
                    // Time zone offset in +/- hours:min.
                    var offsets = matchGroup.split( /:/ );
                    if ( offsets.length !== 2 ) return null;
                    hourOffset = parseInt( offsets[ 0 ], 10 );
                    if ( outOfRange( hourOffset, -12, 13 ) ) return null;
                    var minOffset = parseInt( offsets[ 1 ], 10 );
                    if ( outOfRange( minOffset, 0, 59 ) ) return null;
                    tzMinOffset = (hourOffset * 60) + (startsWith( matchGroup, '-' ) ? -minOffset : minOffset);
                    break;
                case 'z': case 'zz':
                    // Time zone offset in +/- hours.
                    hourOffset = matchInt;
                    if ( outOfRange( hourOffset, -12, 13 ) ) return null;
                    tzMinOffset = hourOffset * 60;
                    break;
                case 'g': case 'gg':
                    var eraName = matchGroup;
                    if ( !eraName || !cal.eras ) return null;
                    eraName = trim( eraName.toLowerCase() );
                    for ( var i = 0, l = cal.eras.length; i < l; i++ ) {
                        if ( eraName === cal.eras[ i ].name.toLowerCase() ) {
                            era = i;
                            break;
                        }
                    }
                    // could not find an era with that name
                    if ( era === null ) return null;
                    break;
            }
        }
    }
    var result = new Date(), defaultYear, convert = cal.convert;
    defaultYear = convert ? convert.fromGregorian( result )[ 0 ] : result.getFullYear();
    if ( year === null ) {
        year = defaultYear;
    }
    else if ( cal.eras ) {
        // year must be shifted to normal gregorian year
        // but not if year was not specified, its already normal gregorian
        // per the main if clause above.
        year += cal.eras[ (era || 0) ].offset;
    }
    // set default day and month to 1 and January, so if unspecified, these are the defaults
    // instead of the current day/month.
    if ( month === null ) {
        month = 0;
    }
    if ( date === null ) {
        date = 1;
    }
    // now have year, month, and date, but in the culture's calendar.
    // convert to gregorian if necessary
    if ( convert ) {
        result = convert.toGregorian( year, month, date );
        // conversion failed, must be an invalid match
        if ( result === null ) return null;
    }
    else {
        // have to set year, month and date together to avoid overflow based on current date.
        result.setFullYear( year, month, date );
        // check to see if date overflowed for specified month (only checked 1-31 above).
        if ( result.getDate() !== date ) return null;
        // invalid day of week.
        if ( weekDay !== null && result.getDay() !== weekDay ) {
            return null;
        }
    }
    // if pm designator token was found make sure the hours fit the 24-hour clock.
    if ( pmHour && hour < 12 ) {
        hour += 12;
    }
    result.setHours( hour, min, sec, msec );
    if ( tzMinOffset !== null ) {
        // adjust timezone to utc before applying local offset.
        var adjustedMin = result.getMinutes() - ( tzMinOffset + result.getTimezoneOffset() );
        // Safari limits hours and minutes to the range of -127 to 127.  We need to use setHours
        // to ensure both these fields will not exceed this range.  adjustedMin will range
        // somewhere between -1440 and 1500, so we only need to split this into hours.
        result.setHours( result.getHours() + parseInt( adjustedMin / 60, 10 ), adjustedMin % 60 );
    }
    return result;
}

function formatDate(value, format, culture) {
    var cal = culture.calendar,
        convert = cal.convert;
    if ( !format || !format.length || format === 'i' ) {
        var ret;
        if ( culture && culture.name.length ) {
            if ( convert ) {
                // non-gregorian calendar, so we cannot use built-in toLocaleString()
                ret = formatDate( value, cal.patterns.F, culture );
            }
            else {
                var eraDate = new Date( value.getTime() ),
                    era = getEra( value, cal.eras );
                eraDate.setFullYear( getEraYear( value, cal, era ) );
                ret = eraDate.toLocaleString();
            }
        }
        else {
            ret = value.toString();
        }
        return ret;
    }

    var eras = cal.eras,
        sortable = format === "s";
    format = expandFormat( cal, format );

    // Start with an empty string
    ret = [];
    var hour,
        zeros = ['0','00','000'],
        foundDay,
        checkedDay,
        dayPartRegExp = /([^d]|^)(d|dd)([^d]|$)/g,
        quoteCount = 0,
        tokenRegExp = getTokenRegExp(),
        converted;

    function padZeros(num, c) {
        var r, s = num+'';
        if ( c > 1 && s.length < c ) {
            r = ( zeros[ c - 2 ] + s);
            return r.substr( r.length - c, c );
        }
        else {
            r = s;
        }
        return r;
    }
    
    function hasDay() {
        if ( foundDay || checkedDay ) {
            return foundDay;
        }
        foundDay = dayPartRegExp.test( format );
        checkedDay = true;
        return foundDay;
    }
    
    function getPart( date, part ) {
        if ( converted ) {
            return converted[ part ];
        }
        switch ( part ) {
            case 0: return date.getFullYear();
            case 1: return date.getMonth();
            case 2: return date.getDate();
        }
    }

    if ( !sortable && convert ) {
        converted = convert.fromGregorian( value );
    }

    for (;;) {
        // Save the current index
        var index = tokenRegExp.lastIndex,
            // Look for the next pattern
            ar = tokenRegExp.exec( format );

        // Append the text before the pattern (or the end of the string if not found)
        var preMatch = format.slice( index, ar ? ar.index : format.length );
        quoteCount += appendPreOrPostMatch( preMatch, ret );

        if ( !ar ) {
            break;
        }

        // do not replace any matches that occur inside a string literal.
        if ( quoteCount % 2 ) {
            ret.push( ar[ 0 ] );
            continue;
        }
        
        var current = ar[ 0 ],
            clength = current.length;

        switch ( current ) {
            case "ddd":
                //Day of the week, as a three-letter abbreviation
            case "dddd":
                // Day of the week, using the full name
                names = (clength === 3) ? cal.days.namesAbbr : cal.days.names;
                ret.push( names[ value.getDay() ] );
                break;
            case "d":
                // Day of month, without leading zero for single-digit days
            case "dd":
                // Day of month, with leading zero for single-digit days
                foundDay = true;
                ret.push( padZeros( getPart( value, 2 ), clength ) );
                break;
            case "MMM":
                // Month, as a three-letter abbreviation
            case "MMMM":
                // Month, using the full name
                var part = getPart( value, 1 );
                ret.push( (cal.monthsGenitive && hasDay())
                    ? cal.monthsGenitive[ clength === 3 ? "namesAbbr" : "names" ][ part ]
                    : cal.months[ clength === 3 ? "namesAbbr" : "names" ][ part ] );
                break;
            case "M":
                // Month, as digits, with no leading zero for single-digit months
            case "MM":
                // Month, as digits, with leading zero for single-digit months
                ret.push( padZeros( getPart( value, 1 ) + 1, clength ) );
                break;
            case "y":
                // Year, as two digits, but with no leading zero for years less than 10
            case "yy":
                // Year, as two digits, with leading zero for years less than 10
            case "yyyy":
                // Year represented by four full digits
                part = converted ? converted[ 0 ] : getEraYear( value, cal, getEra( value, eras ), sortable );
                if ( clength < 4 ) {
                    part = part % 100;
                }
                ret.push( padZeros( part, clength ) );
                break;
            case "h":
                // Hours with no leading zero for single-digit hours, using 12-hour clock
            case "hh":
                // Hours with leading zero for single-digit hours, using 12-hour clock
                hour = value.getHours() % 12;
                if ( hour === 0 ) hour = 12;
                ret.push( padZeros( hour, clength ) );
                break;
            case "H":
                // Hours with no leading zero for single-digit hours, using 24-hour clock
            case "HH":
                // Hours with leading zero for single-digit hours, using 24-hour clock
                ret.push( padZeros( value.getHours(), clength ) );
                break;
            case "m":
                // Minutes with no leading zero  for single-digit minutes
            case "mm":
                // Minutes with leading zero  for single-digit minutes
                ret.push( padZeros( value.getMinutes(), clength ) );
                break;
            case "s":
                // Seconds with no leading zero for single-digit seconds
            case "ss":
                // Seconds with leading zero for single-digit seconds
                ret.push( padZeros(value .getSeconds(), clength ) );
                break;
            case "t":
                // One character am/pm indicator ("a" or "p")
            case "tt":
                // Multicharacter am/pm indicator
                part = value.getHours() < 12 ? (cal.AM ? cal.AM[0] : " ") : (cal.PM ? cal.PM[0] : " ");
                ret.push( clength === 1 ? part.charAt( 0 ) : part );
                break;
            case "f":
                // Deciseconds
            case "ff":
                // Centiseconds
            case "fff":
                // Milliseconds
                ret.push( padZeros( value.getMilliseconds(), 3 ).substr( 0, clength ) );
                break;
            case "z": 
                // Time zone offset, no leading zero
            case "zz":
                // Time zone offset with leading zero
                hour = value.getTimezoneOffset() / 60;
                ret.push( (hour <= 0 ? '+' : '-') + padZeros( Math.floor( Math.abs( hour ) ), clength ) );
                break;
            case "zzz":
                // Time zone offset with leading zero
                hour = value.getTimezoneOffset() / 60;
                ret.push( (hour <= 0 ? '+' : '-') + padZeros( Math.floor( Math.abs( hour ) ), 2 ) +
                    // Hard coded ":" separator, rather than using cal.TimeSeparator
                    // Repeated here for consistency, plus ":" was already assumed in date parsing.
                    ":" + padZeros( Math.abs( value.getTimezoneOffset() % 60 ), 2 ) );
                break;
            case "g":
            case "gg":
                if ( cal.eras ) {
                    ret.push( cal.eras[ getEra(value, eras) ].name );
                }
                break;
        case "/":
            ret.push( cal["/"] );
            break;
        default:
            throw "Invalid date format pattern '" + current + "'.";
            break;
        }
    }
    return ret.join( '' );
}

// EXPORTS

jQuery.findClosestCulture = Globalization.findClosestCulture;
jQuery.culture = Globalization.culture;
jQuery.cultures = Globalization.cultures
jQuery.preferCulture = Globalization.preferCulture
jQuery.localize = Globalization.localize
jQuery.format = Globalization.format
jQuery.parseInt = Globalization.parseInt
jQuery.parseFloat = Globalization.parseFloat
jQuery.parseDate = Globalization.parseDate

})();


/* FILENAME:/js/jquery.tagsinput.js*/
/*

	jQuery Tags Input Plugin 1.3.3
	
	Copyright (c) 2011 XOXCO, Inc
	
	Documentation for this plugin lives here:
	http://xoxco.com/clickable/jquery-tags-input
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php

	ben@xoxco.com

*/

(function($) {

	var delimiter = new Array();
	var tags_callbacks = new Array();
	$.fn.doAutosize = function(o){
	    var minWidth = $(this).data('minwidth'),
	        maxWidth = $(this).data('maxwidth'),
	        val = '',
	        input = $(this),
	        testSubject = $('#'+$(this).data('tester_id'));
	
	    if (val === (val = input.val())) {return;}
	
	    // Enter new content into testSubject
	    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	    testSubject.html(escaped);
	    // Calculate new width + whether to change
	    var testerWidth = testSubject.width(),
	        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
	        currentWidth = input.width(),
	        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
	                             || (newWidth > minWidth && newWidth < maxWidth);
	
	    // Animate width
	    if (isValidWidthChange) {
	        input.width(newWidth);
	    }


  };
  $.fn.resetAutosize = function(options){
    // alert(JSON.stringify(options));
    var minWidth =  $(this).data('minwidth') || options.minInputWidth || $(this).width(),
        maxWidth = $(this).data('maxwidth') || options.maxInputWidth || ($(this).closest('.tagsinput').width() - options.inputPadding),
        val = '',
        input = $(this),
        testSubject = $('<tester/>').css({
            position: 'absolute',
            top: -9999,
            left: -9999,
            width: 'auto',
            fontSize: input.css('fontSize'),
            fontFamily: input.css('fontFamily'),
            fontWeight: input.css('fontWeight'),
            letterSpacing: input.css('letterSpacing'),
            whiteSpace: 'nowrap'
        }),
        testerId = $(this).attr('id')+'_autosize_tester';
    if(! $('#'+testerId).length > 0){
      testSubject.attr('id', testerId);
      testSubject.appendTo('body');
    }

    input.data('minwidth', minWidth);
    input.data('maxwidth', maxWidth);
    input.data('tester_id', testerId);
    input.css('width', minWidth);
  };
  
	$.fn.addTag = function(value,options) {
			options = jQuery.extend({focus:false,callback:true},options);
			this.each(function() { 
				var id = $(this).attr('id');

				var tagslist = $(this).val().split(delimiter[id]);
				if (tagslist[0] == '') { 
					tagslist = new Array();
				}

				value = jQuery.trim(value);
		
				if (options.unique) {
					var skipTag = $(this).tagExist(value);
					if(skipTag == true) {
					    //Marks fake input as not_valid to let styling it
    				    $('#'+id+'_tag').addClass('not_valid');
    				}
				} else {
					var skipTag = false; 
				}
				
				if (value !='' && skipTag != true) { 
                    $('<span>').addClass('tag').append(
                        $('<span>').text(value).append('&nbsp;&nbsp;'),
                        $('<a>', {
                            href  : '#',
                            title : 'Removing tag',
                            text  : 'x'
                        }).click(function () {
                            return $('#' + id).removeTag(escape(value));
                        })
                    ).insertBefore('#' + id + '_addTag');

					tagslist.push(value);
				
					$('#'+id+'_tag').val('');
					if (options.focus) {
						$('#'+id+'_tag').focus();
					} else {		
						$('#'+id+'_tag').blur();
					}
					
					$.fn.tagsInput.updateTagsField(this,tagslist);
					
					if (options.callback && tags_callbacks[id] && tags_callbacks[id]['onAddTag']) {
						var f = tags_callbacks[id]['onAddTag'];
						f.call(this, value);
					}
					if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
					{
						var i = tagslist.length;
						var f = tags_callbacks[id]['onChange'];
						f.call(this, $(this), tagslist[i-1]);
					}					
				}
		
			});		
			
			return false;
		};
		
	$.fn.removeTag = function(value) { 
			value = unescape(value);
			this.each(function() { 
				var id = $(this).attr('id');
	
				var old = $(this).val().split(delimiter[id]);
					
				$('#'+id+'_tagsinput .tag').remove();
				str = '';
				for (i=0; i< old.length; i++) { 
					if (old[i]!=value) { 
						str = str + delimiter[id] +old[i];
					}
				}
				
				$.fn.tagsInput.importTags(this,str);

				if (tags_callbacks[id] && tags_callbacks[id]['onRemoveTag']) {
					var f = tags_callbacks[id]['onRemoveTag'];
					f.call(this, value);
				}
			});
					
			return false;
		};
	
	$.fn.tagExist = function(val) {
		var id = $(this).attr('id');
		var tagslist = $(this).val().split(delimiter[id]);
		return (jQuery.inArray(val, tagslist) >= 0); //true when tag exists, false when not
	};
	
	// clear all existing tags and import new ones from a string
	$.fn.importTags = function(str) {
                id = $(this).attr('id');
		$('#'+id+'_tagsinput .tag').remove();
		$.fn.tagsInput.importTags(this,str);
	}
		
	$.fn.tagsInput = function(options) { 
    var settings = jQuery.extend({
      interactive:true,
      defaultText:'add a tag',
      minChars:0,
      width:'300px',
      height:'100px',
      autocomplete: {selectFirst: false },
      'hide':true,
      'delimiter':',',
      'unique':true,
      removeWithBackspace:true,
      placeholderColor:'#666666',
      autosize: true,
      comfortZone: 20,
      inputPadding: 6*2
    },options);

		this.each(function() { 
			if (settings.hide) { 
				$(this).hide();				
			}
			var id = $(this).attr('id');
			if (!id || delimiter[$(this).attr('id')]) {
				id = $(this).attr('id', 'tags' + new Date().getTime()).attr('id');
			}
			
			var data = jQuery.extend({
				pid:id,
				real_input: '#'+id,
				holder: '#'+id+'_tagsinput',
				input_wrapper: '#'+id+'_addTag',
				fake_input: '#'+id+'_tag'
			},settings);
	
			delimiter[id] = data.delimiter;
			
			if (settings.onAddTag || settings.onRemoveTag || settings.onChange) {
				tags_callbacks[id] = new Array();
				tags_callbacks[id]['onAddTag'] = settings.onAddTag;
				tags_callbacks[id]['onRemoveTag'] = settings.onRemoveTag;
				tags_callbacks[id]['onChange'] = settings.onChange;
			}
	
			var markup = '<div id="'+id+'_tagsinput" class="tagsinput"><div id="'+id+'_addTag">';
			
			if (settings.interactive) {
				markup = markup + '<input id="'+id+'_tag" value="" data-default="'+settings.defaultText+'" />';
			}
			
			markup = markup + '</div><div class="tags_clear"></div></div>';
			
			$(markup).insertAfter(this);

			$(data.holder).css('width',settings.width);
			$(data.holder).css('min-height',settings.height);
			$(data.holder).css('height','100%');
	
			if ($(data.real_input).val()!='') { 
				$.fn.tagsInput.importTags($(data.real_input),$(data.real_input).val());
			}		
			if (settings.interactive) { 
				$(data.fake_input).val($(data.fake_input).attr('data-default'));
				$(data.fake_input).css('color',settings.placeholderColor);
		        $(data.fake_input).resetAutosize(settings);
		
				$(data.holder).bind('click',data,function(event) {
					$(event.data.fake_input).focus();
				});
			
				$(data.fake_input).bind('focus',data,function(event) {
					if ($(event.data.fake_input).val()==$(event.data.fake_input).attr('data-default')) { 
						$(event.data.fake_input).val('');
					}
					$(event.data.fake_input).css('color','#000000');		
				});
						
				if (settings.autocomplete_url != undefined) {
					autocomplete_options = {source: settings.autocomplete_url};
					for (attrname in settings.autocomplete) { 
						autocomplete_options[attrname] = settings.autocomplete[attrname]; 
					}
				
					if (jQuery.Autocompleter !== undefined) {
						$(data.fake_input).autocomplete(settings.autocomplete_url, settings.autocomplete);
						$(data.fake_input).bind('result',data,function(event,data,formatted) {
							if (data) {
								$('#'+id).addTag(data[0] + "",{focus:true,unique:(settings.unique)});
							}
					  	});
					} else if (jQuery.ui.autocomplete !== undefined) {
						$(data.fake_input).autocomplete(autocomplete_options);
						$(data.fake_input).bind('autocompleteselect',data,function(event,ui) {
							$(event.data.real_input).addTag(ui.item.value,{focus:true,unique:(settings.unique)});
							return false;
						});
					}
				
					
				} else {
						// if a user tabs out of the field, create a new tag
						// this is only available if autocomplete is not used.
						$(data.fake_input).bind('blur',data,function(event) { 
							var d = $(this).attr('data-default');
							if ($(event.data.fake_input).val()!='' && $(event.data.fake_input).val()!=d) { 
								if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
									$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
							} else {
								$(event.data.fake_input).val($(event.data.fake_input).attr('data-default'));
								$(event.data.fake_input).css('color',settings.placeholderColor);
							}
							return false;
						});
				
				}
				// if user types a comma, create a new tag
				$(data.fake_input).bind('keypress',data,function(event) {
					if (event.which==event.data.delimiter.charCodeAt(0) || event.which==13 ) {
					    event.preventDefault();
						if( (event.data.minChars <= $(event.data.fake_input).val().length) && (!event.data.maxChars || (event.data.maxChars >= $(event.data.fake_input).val().length)) )
							$(event.data.real_input).addTag($(event.data.fake_input).val(),{focus:true,unique:(settings.unique)});
					  	$(event.data.fake_input).resetAutosize(settings);
						return false;
					} else if (event.data.autosize) {
			            $(event.data.fake_input).doAutosize(settings);
            
          			}
				});
				//Delete last tag on backspace
				data.removeWithBackspace && $(data.fake_input).bind('keydown', function(event)
				{
					if(event.keyCode == 8 && $(this).val() == '')
					{
						 event.preventDefault();
						 var last_tag = $(this).closest('.tagsinput').find('.tag:last').text();
						 var id = $(this).attr('id').replace(/_tag$/, '');
						 last_tag = last_tag.replace(/[\s]+x$/, '');
						 $('#' + id).removeTag(escape(last_tag));
						 $(this).trigger('focus');
					}
				});
				$(data.fake_input).blur();
				
				//Removes the not_valid class when user changes the value of the fake input
				if(data.unique) {
				    $(data.fake_input).keydown(function(event){
				        if(event.keyCode == 8 || String.fromCharCode(event.which).match(/\w+|[áéíóúÁÉÍÓÚñÑ,/]+/)) {
				            $(this).removeClass('not_valid');
				        }
				    });
				}
			} // if settings.interactive
		});
			
		return this;
	
	};
	
	$.fn.tagsInput.updateTagsField = function(obj,tagslist) { 
		var id = $(obj).attr('id');
		$(obj).val(tagslist.join(delimiter[id]));
	};
	
	$.fn.tagsInput.importTags = function(obj,val) {			
		$(obj).val('');
		var id = $(obj).attr('id');
		var tags = val.split(delimiter[id]);
		for (i=0; i<tags.length; i++) { 
			$(obj).addTag(tags[i],{focus:false,callback:false});
		}
		if(tags_callbacks[id] && tags_callbacks[id]['onChange'])
		{
			var f = tags_callbacks[id]['onChange'];
			f.call(obj, obj, tags[i]);
		}
	};

})(jQuery);

/* FILENAME:/js/jquery.depends_on.js*/
/*
 fetch_default_value:
 
 While creating form fields we will specify a property called "on_change_field",
 this will be fully qualified name of other form field its depends on.
 
 
 */


(function($) {
    // we will track change in DOM from our plugin
    $(document).bind('document_update', function(event, dom) {
        //code for grid it will modify the name of on_change_field in grid
        dom.find("[name]").not('.template-element').each(function() {
            if (typeof ($(this).attr('on_change_field')) != undefined) {
                var on_change = $(this).attr('on_change_field');
            }
            if (on_change != null && on_change != '') {
                var on_change_fullname = on_change.split(".");
                on_change_fullname = "data[" + on_change_fullname.join("][") + "]";
                var form = $(this).closest('form');
                var on_change_fullname = form.find('[name="' + on_change_fullname + '"]').attr('name');
                var name = $(this).attr('name');
                name = name.split('][');
                name.pop();
                var grid = name.pop();
                grid = parseInt(grid);
                if (typeof (grid) == 'number' && grid && typeof (on_change_fullname) == 'undefined') {
                    $(this).attr('on_change_field', Grid(on_change, grid)).removeAttr('disabled').filter('[is_disabled="1"]').attr('disabled', 'disabled');
                }
            }
            function Grid(on_change, count) {
                on_change = on_change.split('.');
                r = on_change.pop();
                on_change.push(count);
                on_change.push(r);
                on_change = on_change.join('.');
                return on_change;

            }

        });
        dom.find(".popup-hidden")
                .not('.template-element')
                .bind('data_source_url', function(event, id) {
                    try {
                        var href = '';
                        var td = $(this).closest('div');
                        var popupSelect = td.find('.popup-select');
                        if (popupSelect.length > 0) {
                            href = popupSelect.find("option:selected").attr('href');
                        } else {
                            href = $((typeof (this.element) != 'undefined' && typeof (this.element[0]) != 'undefined' ? this.element[0] : this)).attr('href');
                        }
                        if (typeof (href) != 'undefined' && $.trim(href) != '') {
                            href = href.replace('/index', '/view');
                            href += ".json?id=" + id;
                            $(this).data('data_source_url', href);
                            event.preventDefault();
                            return false;
                        }
                    }
                    catch (err)
                    {
                        log(err);
                    }
                });

        if (typeof (dom) != 'undefined') {
            // track on change field from the form as DOM changes
            dom.find("[on_change_field]").not('.template-element').autoPopulate({
                'name_formatter': function(name) {
                    var name = name.split(".");
                    return name = "data[" + name.join("][") + "]";
                },
                'data_cleaner': function(data) {
                    if (typeof (data['paginate']) != 'undefined' && typeof (data['paginate']['data']) != 'undefined') {
                        data = data['paginate']['data'];
                        return data;
                    } else
                        return [];

                },
                'data_source': function(id) {
                    $(this).triggerHandler('data_source_url', id);
                    return $(this).data('data_source_url');
                },
                bring_data: function(q, dataSource) {
                    var promise = $.Deferred();
                    $.ajax(dataSource, {
                        data: {
                            q: JSON.stringify(q)
                        },
                        success: function(result) {
                            promise.resolve(result);
                        },
                        error: function() {

                            var error = 'failed in fetching data';
                            promise.reject(error);
                        }
                    });
                    return promise;
                },
                new_q: function(q) {
                    q['method'] = 'find';
                    q['fields'] = [];
                    q['where'] = {};
                    return q;
                }

            });
        }

    });
    // plugin name
    $.fn.autoPopulate = function(options) {

        // take sample thids as imnput
        //console.log('shubham')
        // defaults for plugin
        var defaults = {
            // in case "on_change_field" value need tranformation to get actual field name.
            'name_formatter': function(name) {
                return name;
            },
            // possible values are
            // 1. JSON data.
            // 2. URL to fetch data from.
            // 3. function which returns JSON data or URL to fetch data.
            'data_source': '',
            // in case server data need preprocessing.
            'data_cleaner': '',
            'populate_on_create': 1,
            'on_change_field': null
        };
        // merged settings;
        var settings = $.extend({}, defaults, options);
        //private function setting values, trigger data_ready event;

        // function to generate 'q' based on dependent field registry
        function generate_Q(onChangeField) {
            try {
                // 'q' that will get generated will come under this oject
                var rule_Q = {};
                // finding all dependent fields
                var dependentList = onChangeField.data('dependent_list');
                var form = onChangeField.closest('form');
                // iterating over all dependencies to generate 'q' accordingly
                $.each(dependentList, function(i, dependentName) {

                    // finding all filter conditions and its values
                    filterField = $(form.find('[name="' + dependentName + '"]')).attr('__filter_field');
                    if (typeof (filterField) == 'undefined') {
                        log('Auto-population : filter field not defined' + dependentName);
                    }
                    if (typeof (filterField) != 'undefined') {
                        filterField = filterField.split('.');
                        filterField.splice(0, 1);
                        filterField = filterField.join('.');
                    }

                    filterValue = $(form.find('[name="' + dependentName + '"]')).attr('filter_val');
                    if (typeof (filterValue) == 'undefined') {
                        log('Auto-population : filter value not defined' + dependentName);
                    }
                    mappedField = $(form.find('[name="' + dependentName + '"]')).attr('__mapped_field');
                    if (typeof (mappedField) == 'undefined') {
                        log('Auto-population : mappedField not defined for' + dependentName);
                    }

                    // @author : tushar takkar
                    // why we need following commented code?
                    /*
                     if (typeof (mappedField) != 'undefined') {
                     mappedField = mappedField.split('.');
                     mappedField.splice(0, 1);
                     mappedField = mappedField.join('.');
                     }*/

                    if (mappedField != null) {
                        // defining index as under which we will populate the 'q'
                        if (filterField == null) {
                            index = 'simple';
                        } else
                        {
                            index = filterField + '|' + filterValue
                        }
                        // generating new 'q' as per our condition
                        if (typeof (rule_Q[index]) == 'undefined') {
                            var q = {};
                            var q = settings.new_q(q);
                            rule_Q[index] = q;
                        }
                        // push fields in our 'q'
                        rule_Q[index]['fields'].push(mappedField);
                        // populate where conditions in 'q'
                        if (filterField != null) {
                            rule_Q[index]['where'][filterField] = filterValue;
                        }

                    }

                });
                return rule_Q;
            }
            catch (err)
            {
                log(err);
            }
        }

        function processString(dup, alias) {
            dup = dup.split('.');
            var index = dup.lastIndexOf(alias);
            if (index != -1) {
                // if found then remove everything before it
                dup = dup.slice(index);
            } else {
                // else add alias as 0th string
                dup.unshift(alias);
            }
            return dup.join('.');
        }

        // function to bring data via ajax calls based on our 'q'
        function bringData(rule_Q, dataSource, id, onChangeField) {
            try {
                // hot fix for issue of alias name
                if (typeof (id[0]) != 'undefined' && $.trim(id[0]) != '') {
                    var alias = id[0].split('.');
                    alias = alias[0];
                }
                for (z in rule_Q) {
                    for (x in rule_Q[z]['fields']) {
                        //@author : tushar takkar
                        /*this code is wrong
                         if (dup[0] != alias) {
                         if (alias in dup) {
                         dup.splice(0, dup.indexOf(alias));
                         }
                         dup[0] = alias;
                         dup = dup.join('.');
                         rule_Q[z]['fields'][x] = dup;
                         }
                         */
                        // We have to remove any path before alias string, if its missing as it as first string.
                        rule_Q[z]['fields'][x] = processString(rule_Q[z]['fields'][x], alias);
                    }
                    for (y in rule_Q[z]['where']) {
                        var dup = processString(y, alias);
                        rule_Q[z]['where'][dup] = rule_Q[z]['where'][y];
                        delete(rule_Q[z]['where'][y]);
                    }
                }

                var data = {};
                var count = 0;
                var cnt = 0;
                // count to control the asynchronous code so that we can populate the data
                for (x in rule_Q) {
                    count++;
                }

                // get data based on 'q'
                $.each(rule_Q, function(i, q) {
                    // populate where condition as we need only data if this id
                    q['where'][id[0]] = id[1];
                    // call bring data by declaring promise variable
                    if (typeof (settings.bring_data) == "function") {
                        // calling bring data
                        var dataPromise = settings.bring_data(q, dataSource);
                        // we get our data when promise done
                        dataPromise.done(function(result) {
                            //calling data cleaner to clean data
                            data[i] = settings.data_cleaner(result);
                            if (cnt == count - 1) {
                                // calling populate value as we  need to populate this data in fields
                                $.populateValue(onChangeField, data);
                            } else {
                                cnt++;
                            }

                        });

                    }

                });
            }
            catch (err)
            {
                log(err);
            }
        }

        // function to populate value to be called from bring data after data is being collected
        $.populateValue = function(onChangeField, data) {
            try {
                // find all dependencies;
                var dependentList = onChangeField.data('dependent_list');
                var form = onChangeField.closest('form');
                // if data does not comes
                if (data === false) {
                    data = {};
                    $.each(dependentList, function(i, dependentName) {
                        form.find('[name="' + dependentName + '"]').val('');
                    });
                } else {
                    // iterate over dependent list and populate data one by one
                    $.each(dependentList, function(i, dependentName) {
                        // to reset all dependent fields before setting it 
                        form.find('[name="' + dependentName + '"]').val('');
                        if (typeof (dependentName) != 'undefined' && $.trim(dependentName) != '') {
                            var popupHidden = dependentName.split('][');
                            popup = popupHidden.pop();
                            if (popup[0] == '_' && popup[1] == '_') {
                                popup = popup.slice(2, popup.length);
                                popupHidden.push(popup);
                                popupHidden = popupHidden.join('][');
                                var flag = true;
                            }

                        }
                        // fetching attributs from the DOM
                        filterField = $(form.find('[name="' + dependentName + '"]')).attr('__filter_field');
                        if (typeof (filterField) != 'undefined') {
                            filterField = filterField.split('.');
                            filterField.splice(0, 1);
                            filterField = filterField.join('.');
                        }
                        filterValue = $(form.find('[name="' + dependentName + '"]')).attr('filter_val');
                        mappedField = $(form.find('[name="' + dependentName + '"]')).attr('__mapped_field');
                        if (typeof (mappedField) != 'undefined') {
                            mappedField = mappedField.split('.').pop();
                        }

                        // populating fields in DOM
                        if (mappedField != null) {
                            // index from which we have to get data on this dependent field
                            if (filterField == null) {
                                index = 'simple';
                            } else
                            {
                                index = filterField + '|' + filterValue
                            }
                            // if we have not got the data we need to follow fall back to populate same data
                            if (data[index].length == 0) {
                                ind = index.split('|');
                                for (x in data) {
                                    if (data[x].length > 0) {
                                        if (x.indexOf(ind[0]) !== -1)
                                            index = x;

                                    }

                                }
                            }
                            // populating data based on fields
                            $.each(data[index], function(k, v) {
                                // iterating through each key
                                for (key in v) {
                                    // if key matches the mapped field we have to put that data
                                    if (key == mappedField) {
                                        var field = form.find('[name="' + dependentName + '"]');
                                        // condition to check if field is empty
                                        if (field.val().length == 0) {
                                            if (flag == true) {
                                                populatePopupValue(dependentName, v[key], popupHidden, form);
                                                flag = false;
                                            } else {
                                                log('Auto-population : [name="' + dependentName + '"].val(' + v[key] + ')');
                                                // finding the field and setting its value
                                                form.find('[name="' + dependentName + '"]').val(v[key]).trigger('change');
                                            }
                                        }
                                    }

                                }


                            });


                        }


                    });
                }
            }
            catch (err)
            {
                log(err);
            }
        }
        function populatePopupValue(dependentName, id, popupHidden, form) {
            try {
                var source = $(form.find('[name="' + dependentName + '"]')).attr('href');
                if (typeof (source) != 'undefined' && $.trim(source) != '') {
                    source += '.json';
                    if (source.indexOf('view') > -1) {
                        source = source.replace('/view', '/index');
                    }
                }

                if (typeof (settings.new_q) == 'function') {
                    var q = {};
                    var q = settings.new_q(q);
                    q['fields'].push('{{MODEL}}.{{DISPLAY_FIELD}}');
                    q['where']['{{MODEL}}.{{PRIMARY_KEY}}'] = id;
                }
                if (typeof (settings.bring_data) == "function") {
                    var dataPromise = settings.bring_data(q, source);
                    // we get our data when promise done
                    dataPromise.done(function(result) {
                        //calling data cleaner to clean data
                        data = result['paginate']['data'][0];
                        for (x in data) {
                            log('Auto-population : [name="' + dependentName + '"].val(' + data[x] + ')');
                            log('Auto-population : [name="' + popupHidden + '"]).val(' + id + ')');

                            form.find('[name="' + dependentName + '"]').val(data[x]).trigger('change');
                            form.find('[name="' + popupHidden + '"]').val(id).trigger('change');

                        }
                    });
                }
            }
            catch (err)
            {
                log(err);
            }
        }

        // function to generate simple 'q'

        var onChangeFieldList = [];
        // loop of each match element in set
        var plugin = this.each(function(k, v) {
            try {

                var dependencyName = $(this).attr('name');
                // on whcih field its dependent on.
                var onChangeField = (settings.on_change_field != null ? settings.on_change_field : $(this).attr('on_change_field'));
                // try to localy dependednt on element.
                onChangeField = $(this).closest('form').find('[name="' + settings.name_formatter(onChangeField) + '"]');
                onChangeFieldList.push(onChangeField);
                // find list containing all dependencies, else create an empty list.
                var dependentList = onChangeField.data('dependent_list');
                var isset = true;
                if (!$.isArray(dependentList)) {
                    dependentList = [];
                    isset = false;
                }
                // add to dependency list and save it back into element.
                dependentList.push(dependencyName);
                onChangeField.data('dependent_list', dependentList);
                // if element is not informed that others are dependent on it, then inform it so that it can inform back with cahnge data.
                if (isset === false) {
                    // code to be executed when field changes it value.
                    onChangeField.change(function(event) {
                        var onChangeField = $(this);
                        var id = [];
                        // changed value
                        var onChangeFieldValue = onChangeField.val();
                        var oldFieldValue = onChangeField.attr('oldFieldValue');
                        if (onChangeFieldValue != "" && oldFieldValue == onChangeFieldValue) {
                            return;
                        } else {
                            onChangeField.attr('oldFieldValue', onChangeFieldValue);
                        }

                        if (onChangeFieldValue != false) {
                            // find source which can be a
                            //1. JSON data

                            var dataSource = settings.data_source;
                            // if source is function then call it.
                            if (typeof (dataSource) == "function") {

                                dataSource = dataSource.call(onChangeField, onChangeFieldValue);
                            }


                            // if source is URL then make get/json call.
                            if (typeof (dataSource) == "string") {
                                // fetch data from server.
                                if (dataSource.indexOf('?') == -1) {
                                    // If URL doesnt not contain ID then append as get parameter...
                                    dataSource += "?id=" + onChangeFieldValue;
                                }
                                // manipulation on data source to collect its id to pass as where in our 'q'
                                dataSource = dataSource.split('/');
                                dataSource.pop();
                                id[0] = dataSource.pop();
                                dataSource.push(id[0]);
                                dataSource = dataSource.join('/');
                                dataSource += '/index.json'


                                if (typeof (id[0]) == 'string') {
                                    id[0] += '.id';
                                    id[1] = onChangeFieldValue;
                                }


                                //function to generate 'q' by scanning the fields which are dependent
                                var rule_Q = generate_Q(onChangeField);
                                // after q is generated under rule_q we need to bring data and populate it
                                bringData(rule_Q, dataSource, id, onChangeField);
                            }

                        } else {
                            $.populateValue(onChangeField, false);
                        }

                    });
                }
            }
            catch (err)
            {
                log(err);
            }
        });
        if (settings.populate_on_create == 1) {
            var action = $(onChangeFieldList[0]).closest("form").attr('action');
            if (typeof (action) !== 'undefined') {
                if (action.indexOf("add") != -1) {

                    $.each(onChangeFieldList, function(k, v) {
                        try {
                            if ($(v).val() !== '') {
                                $(v).trigger('change');
                            }
                        }
                        catch (err)
                        {
                            log(err);
                        }
                    });
                }
            }
        }
        return plugin;
    }
}(jQuery));

/* FILENAME:/js/jquery.filter_by.js*/
/*
 fetch_filtered_value_set:
 
 While creating form fields we will specify a property called "filter_by_fields",
 this will be fully qualified name of other form field its data to be filtered by.
 You can specify a comma separated list of one or more fields...
 e.g.: State will be filtered by country.
 Any call made to state data will auto append country criteria.
 Also a trigger will be fired called "beforeSearch()" as its happening right now.
 On change of country, reset state.
 
 Filter example 1;
 <input name="data[invoices][country_id]" value="">
 <input name="data[invoices][state_id]" filter_by_fields="invoices.country_id" >
 
 Filter example 2;
 If sql column name cant be retrive from form field name, then sepecify "form_field_name|sql_column_name"
 <input name="data[invoices][country_id]" value="">
 <input name="data[invoices][state_id]" filter_by_fields="invoices.country_id|custom_country_id" >
 
 Filter example 2;
 Comma seperated list of column in case of multiple filter by
 <input name="data[invoices][country_id]" value="">
 <input name="data[invoices][state_id]" value="" filter_by_fields="invoices.country_id|custom_country_id" >
 <input name="data[invoices][city_id]" filter_by_fields="invoices.country_id|custom_country_id,invoices.state_id|state_id" >
 
 $(['filter_by_fields'])
 .filterBy(
 {
 'form_field_name':function(name){
 var name=name.split(".");
 return name="data["+name.join("][")+"]";
 },'sql_column_name':function(name){
 var name=name.replace('[','.').replace(']','.').split('.');
 var found = false;   
 while(name.length > 0 && found===false){
 var tempName=name.pop();
 if(tempName !=""){   
 found=tempName;
 }
 }
 return found;
 }
 }
 );
 */







(function($) {

    $(document).bind('document_update', function(event, dom) {

        //code for grid it will modify the attribute on_change_field in grid
        dom.find("[name]").not('.template-element').each(function() {
            try {
                if (typeof ($(this).attr('filter_by_fields')) != undefined) {
                    var filter = $(this).attr('filter_by_fields');
                }

                if (filter != null && filter != '') {
                    // take the ROW or COLUMN out
                    filter = filter.split('|');
                    // pick the first part of array which is the filter definition
                    filter = filter[0];
                    var filter_fullname = filter.split(".");
                    filter_fullname = "data[" + filter_fullname.join("][") + "]";
                    // above 2 could have been written as var filter_fullname = "data[" + filter.split(".").join("][") + "]";
                    // pick the closest form as maax supports multiple forms per page
                    var form = $(this).closest('form');
                    // @TODO This is a slow operation, better to go by ID for any DOM element
                    var filter_name = form.find('[name="' + filter_fullname + '"]').attr('name');
                    // filter_name is undefined
                    var name = $(this).attr('name');
                    name = name.split('][');
                    // throw away the last
                    name.pop();
                    // grid element number
                    var grid = name.pop();
                    grid = parseInt(grid);
                    // @TODO bad logic here.  Grids are 0 based and && grid checks for TRUE / FALSE and 0 = FALSE
                    // Such a scenario is only used before typeof to avoid if throwing an error
                    // Read shortcut evaluation 
                    // ~~ if (typeof (grid) == 'number' && grid && typeof (filter_name) == 'undefined') { ~~
                    if (typeof (grid) == 'number' && typeof (filter_name) == 'undefined') {
                        $(this).attr('filter_by_fields', Grid(filter, grid)).removeAttr('disabled').filter('[is_disabled="1"]').attr('disabled', 'disabled');
                    }
                }
                function Grid(filter, count) {
                    filter = filter.split('.');
                    r = filter.pop();
                    filter.push(count);
                    filter.push(r);
                    filter = filter.join('.');
                    return filter;

                }
            }
            catch (err)
            {
                log(err);
            }

        });
        if (typeof (dom) != 'undefined') {

            dom.find("[filter_by_fields]").not('.template-element').filterBy({
                'search': function(name) {
                    return '[__name="' + name + '"]';
                },
                'sql_column_name': function(name) {
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
                ,
                'form_field_name': function(name) {
                    var name = name.split(".");
                    return name = "data[" + name.join("][") + "]";
                }

            });
        }
    });

    // plugin name
    $.fn.filterBy = function(options) {
        // defaults for plugin
        var defaults = {
            // translate column name into form field name.
            'form_field_name': function(name) {
                return name;
            },
            // convert form field name into sql column name.
            'sql_column_name': function(name) {
                return name;
            },
            'filter_by_fields': null
        };
        // merged settings;
        var settings = $.extend({}, defaults, options);
        // loop of each match element in set
        var plugin = this.each(function(k, v) {
            // alias for current element;
            var element = $(this);
            // All fields which have the attribute filter_by_field associated with it
            var fieldName = element.attr('name');
            // All fields on which current element need to be filtered by.
            // Comma seperated list.
            // If sql column name cant be retrive from form field name, then sepecify "form_field_name|sql_column_name"
            var filterByFields = (settings.filter_by_fields != null ? settings.filter_by_fields : element.attr('filter_by_fields'));
            // field on whose value other fields need to be filtered by
            if (filterByFields != "") {
                filterByFields = filterByFields.split(',');
                // find form containing element that defines scope of filtered by fields.
                var form = element.closest('form');
                var filterByFieldsObj = [];
                $.each(filterByFields, function(k, filterByField) {
                    try {
                        // split form field name and any sql column name
                        filterByField = filterByField.split('|');
                        filterByField[0] = $.trim(filterByField[0]);

                        var sqlColumnName = '';
                        if (typeof (filterByField[1]) != "undefined") {
                            // if sql column name is defined.
                            sqlColumnName = filterByField[1];
                        } else {
                            // else compute sql column name from form field name.
                            sqlColumnName = settings.sql_column_name(filterByField[0]);
                        }
                        // find all parent fields and set change event so when they change, all to be filtered fields get reset.
                        var formFieldName = form
                                .find('[name="' + settings.form_field_name(filterByField[0]) + '"]')
                                .change(function() {
                                    element.val("").trigger('change');
                                }).attr('name');
                        // formFieldName is the fully qualified name of field based on its value other form field needs to be filtered by

                        /* we will maintain a registry of filter by field and on its sql_column_name index we will store the column name
                         and at the index form_field_name we will store name of form field on change of which othe filds need to filter by */
                        filterByFieldsObj[k] = {
                            'sql_column_name': sqlColumnName,
                            'form_field_name': formFieldName
                        };
                    }
                    catch (err)
                    {
                        log(err);
                    }
                });
                // we will assign this sql name and name odf the field to tha data attribute of each associated with field
                element.data('filter_by_fields_obj', filterByFieldsObj);
                element.bind('beforeSearch', function() {
                    try {
                        var q = $(this).data('q');
                        /*  if(!$.isArray(q)){
                         q=[q];   
                         } */
                        $(this).data('filter_by_fields_obj').forEach(function(k, v) {
                            var con = {};
                            con[k['sql_column_name']] = form.find('[name="' + k['form_field_name'] + '"]').val();
                            $.extend(q['where'], con);
                            //new code for grid
                            if (typeof (q['controller']) == 'undefined') {
                                var id = form.find('[name="' + k['form_field_name'] + '"]').val();
                                if (id != null && id != '') {
                                    var where = {};
                                    where[k['sql_column_name']] = id;
                                    q['where'] = where;
                                }
                            }

                        });
                        $(this).data('q', q);
                    }
                    catch (err)
                    {
                        log(err);
                    }
                });
            }
        });
        return plugin;
    }
}(jQuery));



/* FILENAME:/js/jquery.aggregation.js*/


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







/* FILENAME:/node_modules/clipboard/dist/clipboard.js*/
/*!
 * clipboard.js v2.0.8
 * https://clipboardjs.com/
 *
 * Licensed MIT © Zeno Rocha
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ClipboardJS"] = factory();
	else
		root["ClipboardJS"] = factory();
})(this, function() {
return /******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 134:
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": function() { return /* binding */ clipboard; }
});

// EXTERNAL MODULE: ./node_modules/tiny-emitter/index.js
var tiny_emitter = __webpack_require__(279);
var tiny_emitter_default = /*#__PURE__*/__webpack_require__.n(tiny_emitter);
// EXTERNAL MODULE: ./node_modules/good-listener/src/listen.js
var listen = __webpack_require__(370);
var listen_default = /*#__PURE__*/__webpack_require__.n(listen);
// EXTERNAL MODULE: ./node_modules/select/src/select.js
var src_select = __webpack_require__(817);
var select_default = /*#__PURE__*/__webpack_require__.n(src_select);
;// CONCATENATED MODULE: ./src/clipboard-action.js
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


/**
 * Inner class which performs selection from either `text` or `target`
 * properties and then executes copy or cut operations.
 */

var ClipboardAction = /*#__PURE__*/function () {
  /**
   * @param {Object} options
   */
  function ClipboardAction(options) {
    _classCallCheck(this, ClipboardAction);

    this.resolveOptions(options);
    this.initSelection();
  }
  /**
   * Defines base properties passed from constructor.
   * @param {Object} options
   */


  _createClass(ClipboardAction, [{
    key: "resolveOptions",
    value: function resolveOptions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.action = options.action;
      this.container = options.container;
      this.emitter = options.emitter;
      this.target = options.target;
      this.text = options.text;
      this.trigger = options.trigger;
      this.selectedText = '';
    }
    /**
     * Decides which selection strategy is going to be applied based
     * on the existence of `text` and `target` properties.
     */

  }, {
    key: "initSelection",
    value: function initSelection() {
      if (this.text) {
        this.selectFake();
      } else if (this.target) {
        this.selectTarget();
      }
    }
    /**
     * Creates a fake textarea element, sets its value from `text` property,
     */

  }, {
    key: "createFakeElement",
    value: function createFakeElement() {
      var isRTL = document.documentElement.getAttribute('dir') === 'rtl';
      this.fakeElem = document.createElement('textarea'); // Prevent zooming on iOS

      this.fakeElem.style.fontSize = '12pt'; // Reset box model

      this.fakeElem.style.border = '0';
      this.fakeElem.style.padding = '0';
      this.fakeElem.style.margin = '0'; // Move element out of screen horizontally

      this.fakeElem.style.position = 'absolute';
      this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px'; // Move element to the same position vertically

      var yPosition = window.pageYOffset || document.documentElement.scrollTop;
      this.fakeElem.style.top = "".concat(yPosition, "px");
      this.fakeElem.setAttribute('readonly', '');
      this.fakeElem.value = this.text;
      return this.fakeElem;
    }
    /**
     * Get's the value of fakeElem,
     * and makes a selection on it.
     */

  }, {
    key: "selectFake",
    value: function selectFake() {
      var _this = this;

      var fakeElem = this.createFakeElement();

      this.fakeHandlerCallback = function () {
        return _this.removeFake();
      };

      this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;
      this.container.appendChild(fakeElem);
      this.selectedText = select_default()(fakeElem);
      this.copyText();
      this.removeFake();
    }
    /**
     * Only removes the fake element after another click event, that way
     * a user can hit `Ctrl+C` to copy because selection still exists.
     */

  }, {
    key: "removeFake",
    value: function removeFake() {
      if (this.fakeHandler) {
        this.container.removeEventListener('click', this.fakeHandlerCallback);
        this.fakeHandler = null;
        this.fakeHandlerCallback = null;
      }

      if (this.fakeElem) {
        this.container.removeChild(this.fakeElem);
        this.fakeElem = null;
      }
    }
    /**
     * Selects the content from element passed on `target` property.
     */

  }, {
    key: "selectTarget",
    value: function selectTarget() {
      this.selectedText = select_default()(this.target);
      this.copyText();
    }
    /**
     * Executes the copy operation based on the current selection.
     */

  }, {
    key: "copyText",
    value: function copyText() {
      var succeeded;

      try {
        succeeded = document.execCommand(this.action);
      } catch (err) {
        succeeded = false;
      }

      this.handleResult(succeeded);
    }
    /**
     * Fires an event based on the copy operation result.
     * @param {Boolean} succeeded
     */

  }, {
    key: "handleResult",
    value: function handleResult(succeeded) {
      this.emitter.emit(succeeded ? 'success' : 'error', {
        action: this.action,
        text: this.selectedText,
        trigger: this.trigger,
        clearSelection: this.clearSelection.bind(this)
      });
    }
    /**
     * Moves focus away from `target` and back to the trigger, removes current selection.
     */

  }, {
    key: "clearSelection",
    value: function clearSelection() {
      if (this.trigger) {
        this.trigger.focus();
      }

      document.activeElement.blur();
      window.getSelection().removeAllRanges();
    }
    /**
     * Sets the `action` to be performed which can be either 'copy' or 'cut'.
     * @param {String} action
     */

  }, {
    key: "destroy",

    /**
     * Destroy lifecycle.
     */
    value: function destroy() {
      this.removeFake();
    }
  }, {
    key: "action",
    set: function set() {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'copy';
      this._action = action;

      if (this._action !== 'copy' && this._action !== 'cut') {
        throw new Error('Invalid "action" value, use either "copy" or "cut"');
      }
    }
    /**
     * Gets the `action` property.
     * @return {String}
     */
    ,
    get: function get() {
      return this._action;
    }
    /**
     * Sets the `target` property using an element
     * that will be have its content copied.
     * @param {Element} target
     */

  }, {
    key: "target",
    set: function set(target) {
      if (target !== undefined) {
        if (target && _typeof(target) === 'object' && target.nodeType === 1) {
          if (this.action === 'copy' && target.hasAttribute('disabled')) {
            throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
          }

          if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
            throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
          }

          this._target = target;
        } else {
          throw new Error('Invalid "target" value, use a valid Element');
        }
      }
    }
    /**
     * Gets the `target` property.
     * @return {String|HTMLElement}
     */
    ,
    get: function get() {
      return this._target;
    }
  }]);

  return ClipboardAction;
}();

/* harmony default export */ var clipboard_action = (ClipboardAction);
;// CONCATENATED MODULE: ./src/clipboard.js
function clipboard_typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { clipboard_typeof = function _typeof(obj) { return typeof obj; }; } else { clipboard_typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return clipboard_typeof(obj); }

function clipboard_classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function clipboard_defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function clipboard_createClass(Constructor, protoProps, staticProps) { if (protoProps) clipboard_defineProperties(Constructor.prototype, protoProps); if (staticProps) clipboard_defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (clipboard_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }




/**
 * Helper function to retrieve attribute value.
 * @param {String} suffix
 * @param {Element} element
 */

function getAttributeValue(suffix, element) {
  var attribute = "data-clipboard-".concat(suffix);

  if (!element.hasAttribute(attribute)) {
    return;
  }

  return element.getAttribute(attribute);
}
/**
 * Base class which takes one or more elements, adds event listeners to them,
 * and instantiates a new `ClipboardAction` on each click.
 */


var Clipboard = /*#__PURE__*/function (_Emitter) {
  _inherits(Clipboard, _Emitter);

  var _super = _createSuper(Clipboard);

  /**
   * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
   * @param {Object} options
   */
  function Clipboard(trigger, options) {
    var _this;

    clipboard_classCallCheck(this, Clipboard);

    _this = _super.call(this);

    _this.resolveOptions(options);

    _this.listenClick(trigger);

    return _this;
  }
  /**
   * Defines if attributes would be resolved using internal setter functions
   * or custom functions that were passed in the constructor.
   * @param {Object} options
   */


  clipboard_createClass(Clipboard, [{
    key: "resolveOptions",
    value: function resolveOptions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.action = typeof options.action === 'function' ? options.action : this.defaultAction;
      this.target = typeof options.target === 'function' ? options.target : this.defaultTarget;
      this.text = typeof options.text === 'function' ? options.text : this.defaultText;
      this.container = clipboard_typeof(options.container) === 'object' ? options.container : document.body;
    }
    /**
     * Adds a click event listener to the passed trigger.
     * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
     */

  }, {
    key: "listenClick",
    value: function listenClick(trigger) {
      var _this2 = this;

      this.listener = listen_default()(trigger, 'click', function (e) {
        return _this2.onClick(e);
      });
    }
    /**
     * Defines a new `ClipboardAction` on each click event.
     * @param {Event} e
     */

  }, {
    key: "onClick",
    value: function onClick(e) {
      var trigger = e.delegateTarget || e.currentTarget;

      if (this.clipboardAction) {
        this.clipboardAction = null;
      }

      this.clipboardAction = new clipboard_action({
        action: this.action(trigger),
        target: this.target(trigger),
        text: this.text(trigger),
        container: this.container,
        trigger: trigger,
        emitter: this
      });
    }
    /**
     * Default `action` lookup function.
     * @param {Element} trigger
     */

  }, {
    key: "defaultAction",
    value: function defaultAction(trigger) {
      return getAttributeValue('action', trigger);
    }
    /**
     * Default `target` lookup function.
     * @param {Element} trigger
     */

  }, {
    key: "defaultTarget",
    value: function defaultTarget(trigger) {
      var selector = getAttributeValue('target', trigger);

      if (selector) {
        return document.querySelector(selector);
      }
    }
    /**
     * Returns the support of the given action, or all actions if no action is
     * given.
     * @param {String} [action]
     */

  }, {
    key: "defaultText",

    /**
     * Default `text` lookup function.
     * @param {Element} trigger
     */
    value: function defaultText(trigger) {
      return getAttributeValue('text', trigger);
    }
    /**
     * Destroy lifecycle.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.listener.destroy();

      if (this.clipboardAction) {
        this.clipboardAction.destroy();
        this.clipboardAction = null;
      }
    }
  }], [{
    key: "isSupported",
    value: function isSupported() {
      var action = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ['copy', 'cut'];
      var actions = typeof action === 'string' ? [action] : action;
      var support = !!document.queryCommandSupported;
      actions.forEach(function (action) {
        support = support && !!document.queryCommandSupported(action);
      });
      return support;
    }
  }]);

  return Clipboard;
}((tiny_emitter_default()));

/* harmony default export */ var clipboard = (Clipboard);

/***/ }),

/***/ 828:
/***/ (function(module) {

var DOCUMENT_NODE_TYPE = 9;

/**
 * A polyfill for Element.matches()
 */
if (typeof Element !== 'undefined' && !Element.prototype.matches) {
    var proto = Element.prototype;

    proto.matches = proto.matchesSelector ||
                    proto.mozMatchesSelector ||
                    proto.msMatchesSelector ||
                    proto.oMatchesSelector ||
                    proto.webkitMatchesSelector;
}

/**
 * Finds the closest parent that matches a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @return {Function}
 */
function closest (element, selector) {
    while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
        if (typeof element.matches === 'function' &&
            element.matches(selector)) {
          return element;
        }
        element = element.parentNode;
    }
}

module.exports = closest;


/***/ }),

/***/ 438:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var closest = __webpack_require__(828);

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function _delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Delegates event to a selector.
 *
 * @param {Element|String|Array} [elements]
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(elements, selector, type, callback, useCapture) {
    // Handle the regular Element usage
    if (typeof elements.addEventListener === 'function') {
        return _delegate.apply(null, arguments);
    }

    // Handle Element-less usage, it defaults to global delegation
    if (typeof type === 'function') {
        // Use `document` as the first parameter, then apply arguments
        // This is a short way to .unshift `arguments` without running into deoptimizations
        return _delegate.bind(null, document).apply(null, arguments);
    }

    // Handle Selector-based usage
    if (typeof elements === 'string') {
        elements = document.querySelectorAll(elements);
    }

    // Handle Array-like based usage
    return Array.prototype.map.call(elements, function (element) {
        return _delegate(element, selector, type, callback, useCapture);
    });
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;


/***/ }),

/***/ 879:
/***/ (function(__unused_webpack_module, exports) {

/**
 * Check if argument is a HTML element.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.node = function(value) {
    return value !== undefined
        && value instanceof HTMLElement
        && value.nodeType === 1;
};

/**
 * Check if argument is a list of HTML elements.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.nodeList = function(value) {
    var type = Object.prototype.toString.call(value);

    return value !== undefined
        && (type === '[object NodeList]' || type === '[object HTMLCollection]')
        && ('length' in value)
        && (value.length === 0 || exports.node(value[0]));
};

/**
 * Check if argument is a string.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.string = function(value) {
    return typeof value === 'string'
        || value instanceof String;
};

/**
 * Check if argument is a function.
 *
 * @param {Object} value
 * @return {Boolean}
 */
exports.fn = function(value) {
    var type = Object.prototype.toString.call(value);

    return type === '[object Function]';
};


/***/ }),

/***/ 370:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

var is = __webpack_require__(879);
var delegate = __webpack_require__(438);

/**
 * Validates all params and calls the right
 * listener function based on its target type.
 *
 * @param {String|HTMLElement|HTMLCollection|NodeList} target
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listen(target, type, callback) {
    if (!target && !type && !callback) {
        throw new Error('Missing required arguments');
    }

    if (!is.string(type)) {
        throw new TypeError('Second argument must be a String');
    }

    if (!is.fn(callback)) {
        throw new TypeError('Third argument must be a Function');
    }

    if (is.node(target)) {
        return listenNode(target, type, callback);
    }
    else if (is.nodeList(target)) {
        return listenNodeList(target, type, callback);
    }
    else if (is.string(target)) {
        return listenSelector(target, type, callback);
    }
    else {
        throw new TypeError('First argument must be a String, HTMLElement, HTMLCollection, or NodeList');
    }
}

/**
 * Adds an event listener to a HTML element
 * and returns a remove listener function.
 *
 * @param {HTMLElement} node
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNode(node, type, callback) {
    node.addEventListener(type, callback);

    return {
        destroy: function() {
            node.removeEventListener(type, callback);
        }
    }
}

/**
 * Add an event listener to a list of HTML elements
 * and returns a remove listener function.
 *
 * @param {NodeList|HTMLCollection} nodeList
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenNodeList(nodeList, type, callback) {
    Array.prototype.forEach.call(nodeList, function(node) {
        node.addEventListener(type, callback);
    });

    return {
        destroy: function() {
            Array.prototype.forEach.call(nodeList, function(node) {
                node.removeEventListener(type, callback);
            });
        }
    }
}

/**
 * Add an event listener to a selector
 * and returns a remove listener function.
 *
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Object}
 */
function listenSelector(selector, type, callback) {
    return delegate(document.body, selector, type, callback);
}

module.exports = listen;


/***/ }),

/***/ 817:
/***/ (function(module) {

function select(element) {
    var selectedText;

    if (element.nodeName === 'SELECT') {
        element.focus();

        selectedText = element.value;
    }
    else if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        var isReadOnly = element.hasAttribute('readonly');

        if (!isReadOnly) {
            element.setAttribute('readonly', '');
        }

        element.select();
        element.setSelectionRange(0, element.value.length);

        if (!isReadOnly) {
            element.removeAttribute('readonly');
        }

        selectedText = element.value;
    }
    else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);

        selectedText = selection.toString();
    }

    return selectedText;
}

module.exports = select;


/***/ }),

/***/ 279:
/***/ (function(module) {

function E () {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    function listener () {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;
module.exports.TinyEmitter = E;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(134);
/******/ })()
.default;
});
/* FILENAME:/js/script.js*/
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function getString(arr) {
    log('getString');
    if (typeof arr == 'string') {
        return arr;
    }
    else {
        var str = '';
        for (var i in arr) {
            str += ' ' + i + '="' + arr[i] + '"';
        }
        return str;
    }
    return '';
}
function log(message) {
    if (CONFIG.debug_js && typeof console != undefined) {
        console.log(message);
    }

}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */



function html_entity_decode(string, quote_style) {
    //return string.replace('&lt;','<').replace('&gt;','>');
    string = string.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
    return string;
}

/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function showMessage(response, params) {
    log('showMessage');
    if (typeof (params) == 'undefined') {
        params = {};
    }
    if (!$.isset(response)) {
        return;
    } else if (typeof response != 'object') {
        params = $.extend({
            height: 300,
            width: 700,
            title: 'Could not process server response'
        }, params);
        response = "<div style='text-align:left;' class='ui-state-error-text'>" + response + "</div>";
        $.jsContainer(response, params);
        return;
    }



    var msg = "";
    var message = '';
    var addClass = '';
    var removeClass = '';
    if ($.isset(response.errors) && !$.isEmpty(response.errors)) {
        var msg = response.errors;
        addClass = 'ui-state-error';
        removeClass = 'ui-state-highlight';
        params['title'] = "Server response";
    } else if ($.isset(response.message) && !$.isEmpty(response.message)) {
        var msg = response.message;
        addClass = 'ui-state-highlight';
        removeClass = 'ui-state-error';
    }
    if ($.isArray(msg)) {
        var length = msg.length;
        for (var i = 0; i < length; i++) {
            message += msg[i] + '<br />';
        }
    } else {
        message += msg;
    }
    var text = "";
    if (!$.isArray(msg)) {
        text = $("<div>" + message + "</div>");
        text = text.text();
    } else if (typeof (msg[0]) != 'undefined') {
        text = $("<div>" + msg[0] + "</div>");
        text = text.text();
    }
    if (($.isArray(msg) && msg.length > 1) || text.length > 150) {
        params = $.extend({
            height: 300,
            width: 400
        }, params);
        $.jsContainer(message, params);
    } else {
        var titlebar = $('.ui-dialog:visible').find('.content');
        if (titlebar.length > 0) {
            var next = $(titlebar).find('.message-panel:first').remove();
            var top = $(titlebar).position();
            titlebar.prepend('<div class="message-panel" align="center" style="position:fixed;";><div class="' + addClass + '">' + message + '</div></div>');
            $(titlebar).find('.message-panel:first').show()
            .removeClass(removeClass)
            .addClass(addClass).delay(4000).hide('highlight', {}, 1000);
            var left = 30 + $(titlebar).width() / 2 - $(titlebar).find('.message-panel:first').width() / 2;
            $(titlebar).find('.message-panel:first').css({
                'top': '8px',
                'left': left + 'px'
            });
        } else {
            $("#message-panel").removeClass('ui-helper-hidden').removeClass(removeClass)

            .addClass(addClass).html(message).show().delay(60000).hide('highlight', {}, 1000);

        }
    }


//}

}
function parseJSON(string) {
    log('parseJSON');
    var json = '';
    try {
        json = JSON.parse(string);
    }
    catch (e) {

    }
    return json;
}
function extractJSON(string) {
    log('extractJSON');
    string = string.split('{"');
    string.shift();
    string = string.join('{"').split("}");
    string.pop()
    string.join("}");
    return string;
}
function initMessagePanel() {
    log('initMessagePanel');
    $("#message-panel:visible").show().delay(4000).hide('highlight', {}, 1000);
}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
function hideMessage() {
    log('hideMessage');
    $("#message-panel").addClass('ui-helper-hidden').html('');
}
function addThemeRoller() {
    log('addThemeRoller');
    if (!/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
        alert('Sorry, this tool only works in Firefox');
        return false;
    }
    ;
    if (window.jquitr) {
        jquitr.addThemeRoller();
    } else {
        jquitr = {};
        jquitr.s = document.createElement('script');
        jquitr.s.src = $.config['base'] + 'js/themeroller.js';
        document.getElementsByTagName('head')[0].appendChild(jquitr.s);
    }
}
function extractName(name) {
    log('extractName');
    name = name.replace(/[\[\]]/g, ':').split(':');
    if (name[(name.length - 1)] == '') {
        name = name.slice(0, -1);
    }
    return name;
}

function setClipboard(value) {
    console.log(value);
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}



jQuery.fn.valJSON = function(value, text, merge) {
    log('valJSON');

    if (typeof merge == 'undefined') {
        merge = true;
    }
    if (typeof value == 'undefined') {
        return $(this).val();
    } else {
        return $(this).each(function() {
            var v = [];
            if (merge === true) {
                v = $.parseJSON($(this).val());
                if (!$.isArray(v)) {
                    v = [];
                }
                v.push([value, text]);
            }
            $(this).val(JSON.stringify(v));
        });
    }
}
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
jQuery('document').ready(function($) {

    /**
     * check if variable defined
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     * @param mixed variable
     * @return boolean true/false
     */
    $.isset = function(variable) {
        return (typeof variable != 'undefined' && variable != 'undefined');
    };
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.ucWords = function(str) {
        log('ucWords');

        // split string on spaces
        var arrStr = str.split(" ");

        var strOut = "";

        for (var i = 0, length = arrStr.length; i < length; i++) {
            // split string
            var firstChar = arrStr[i].substring(0, 1);
            var remainChar = arrStr[i].substring(1);

            // convert case
            firstChar = firstChar.toUpperCase();
            remainChar = remainChar.toLowerCase();

            strOut += firstChar + remainChar + ' ';
        }

        // return string, but drop the last space
        return strOut.substring(0, strOut.length - 1);
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.ccWords = function(str) {
        log('ccWords');

        // split string on spaces
        var arrStr = str.split(" ");
        var strOut = [arrStr[0].toLowerCase()];
        for (var i = 1, length = arrStr.length; i < length; i++) {
            strOut.push(arrStr[i].substring(0, 1).toUpperCase() + arrStr[i].substring(1).toLowerCase());
        }
        // return string, but drop the last space
        return strOut.join('');
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */


    $.getConfig = function(key, value) {
        value = ($.isset(value) ? value : "");
        keys = key.split(".");
        return $.getValue(keys, value, $.projectConfiguration);
    }

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.getValue = function(path, value, data) {
        var value = value || "";
        var requiredValue = data;
        $.each(path, function(k, v) {
            if (!$.isset(requiredValue[v])) {
                return value;
            }
            else {
                requiredValue = requiredValue[v];
            }
        });
        return requiredValue;
    }


    /**
     * Check if input is empty
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.isEmpty = function(str) {
        log('isEmpty');

        if ($.isArray(str) && str.length == 0) {
            return true;
        } else if ($.isPlainObject(str) && $.isEmptyObject(str)) {
            return true;
        } else if ($.trim(str) == '')
            return true;
        return false;
    };

    $.mergeAll = function(arguments) {
        log('mergeAll');

        var data = {
            'array': [],
            'object': {}
        };
        var length = arguments.length;
        for (var i = 0; i < length; i++) {
            if ($.isPlainObject(arguments[i])) {
                data['object'] = $.extend(true, data['object'], arguments[i]);
            } else {
                data['array'] = $.merge(data['array'], arguments[i]);
            }
        }
        var objectEmpty = $.isEmpty(data['object']);
        var arrayEmpty = $.isEmpty(data['array']);
        if (!objectEmpty && !arrayEmpty) {
            data['object'][0] = data['array'];
            return data['object'];
        } else if (!objectEmpty) {
            return data['object'];
        } else if (!arrayEmpty) {
            return data['array'];
        }
        return {};
    }
    $.fn.outer = function() {
        return $($('<div></div>').html(this.clone())).html();
    }
    $.fn.disable = function(partial) {
        var partial = (typeof (partial) != 'undefined' ? partial : false);
        return this.each(function() {
            if (partial == true) {
                $(this)
                .addClass('ui-state-disabled')
                .filter('[button]')
                .addClass('ui-button-disabled');
            } else {
                $(this)
                .attr('disabled', 'disabled')
                .addClass('ui-state-disabled')
                .filter('[button]')
                .addClass('ui-button-disabled')
                .button('disable');
            }
        });
    }

    $.fn.enable = function() {
        return this.each(function() {
            $(this).removeAttr('disabled')
            .removeClass('ui-state-disabled')
            .removeClass('ui-button-disabled')
            .button('enable');
        });
    }

    $.string_repeat = function(string, multiplier) {
        for (var i = 0; i < multiplier; i++) {
            string += string;
        }
        return string;
    }

    /**
     * Initialize default ajax loader.
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $("body").append('<div id="ajax-loader" class="ui-state-highlight" style="display:none;z-index:100002">Loading...</div>');
    var bodyWidth = $("body").width();
    var ajaxLoaderWidth = $("#ajax-loader").width();
    var ajaxLoaderTop = 1;
    var ajaxLoaderLeft = (bodyWidth / 2) - (ajaxLoaderWidth / 2);
    var ajaxLoaderCounter = 0;
    $("#ajax-loader").css({
        "top": ajaxLoaderTop,
        "left": ajaxLoaderLeft,
        "position": "fixed"
    })
    .ajaxStart(function() {
        $.showLoader();
    })
    .ajaxStop(function() {
        $.hideLoader();
    });
    $.showLoader = function(stat) {
        if ($.isset(stat))
            ajaxLoaderCounter += stat;
        var obj = $("#ajax-loader");
        $(obj).html('Loading...').show();
        setTimeout(function() {
            if (obj.is(':visible')) {
                obj.html('Still Loading...');
            }
        }, 3000);
    }
    $.hideLoader = function(stat) {
        if ($.isset(stat))
            ajaxLoaderCounter -= stat;

        if (ajaxLoaderCounter <= 0) {
            $("#ajax-loader").hide();
        }
    }
    $(document).ajaxError(function(e, xhr, settings, exception) {
        log('ajaxError');
        var responseText = xhr.responseText;
        if (typeof (responseText) == "undefined") {
            showMessage('Your request could not be completed as server returned "503 Service Unavailable"', {
                'title': '503 Service Unavailable'
            });
        } else if (typeof responseText == 'string' && $.isEmpty(responseText)) {
        //showMessage('Your request could not be processed');
        } else {
            if (
                typeof responseText == 'string'
                && responseText.indexOf('{"errors"') == -1
                && responseText.indexOf('{"message"') == -1
                ) {
                var data = $(responseText);
                $.initAjaxForm({
                    'data': data,
                    'listview_table_id': false,
                    'twisty': false,
                    'href': $(data).attr('action')
                });
            } else {
                if (typeof responseText == 'string'
                    &&
                    (responseText.indexOf('{"errors"') != -1
                        ||
                        responseText.indexOf('{"message"') != -1
                        )
                    ) {
                    responseText = $.parseJSON(responseText);
                }
                showMessage(responseText);
            }
        }
    });

    $(document).on('click', '.action-list-trigger', function(event) {
        var id = $(this).attr('id');
        var menu = $("." + id).show().position({
            my: "right top",
            at: "right bottom",
            of: this
        });
        $(document).one("click", function() {
            menu.hide();
        });
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;

    });


    /**
     * implement bulk select in listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.lco', function() {
        log('click -> .lco');
        if ($(this).is(':checked')) {
            $.setActionMenu(this, 'active');
        } else if ($(this).closest('.listview').find('.lco:checked').length == 0) {
            $.setActionMenu(this, 'inactive');
        }
    //$.setActionMenu(this,'active');
    });
    $(document).on('click', ".lca", function() {
        log('click-> .lca');
        var index = $(this).closest('td').index();
        var listview = $(this).closest('.listview');
        var checkboxes = listview.find('.lco');

        $('#select_all_records-' + listview.attr("id")).remove();
        if ($(this).is(':checked')) {
            checkboxes.attr('checked', 'checked');
            $.setActionMenu(this, 'active', true);
            if (listview.find('.pagination-row a.paginate-link:not(.ui-state-disabled)').not('.active-paginate-link').length > 0) {
                listview.before('<div class="all-records-selection ui-state-default" id="select_all_records-' + listview.attr("id") + '"><input name="select_all_records" type="checkbox" value="1">' + (listview.attr("select_all_label").replace('%s', listview.find('.paginate_count').outer())) + '</div>');
                $('#select_all_records-' + listview.attr("id")).find('a.paginate_count').trigger('click');
            }
        } else {
            checkboxes.removeAttr('checked');
            $.setActionMenu(this, 'inactive', false);
        }
    });
    $.setActionMenu = function(obj, action) {
        log('setActionMenu');

        var searchView = $(obj).closest('.listview').attr('id');
        var actionBar = $('.action-bar[search_view="' + searchView + '"]');
        if (actionBar.length > 0) {
            if (action == 'active') {
                //console.log(action);
                actionBar.find('.sub-action')
                .show();//.enable();
            } else if (action == 'inactive') {
                //console.log(action);
                actionBar.find('.sub-action').not('.track-unchecked')
                .hide();//.disable();
            }
        }
    }
    /**
     * implement column search in listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('keypress', '.search_inline_column', function(event) {
        log('keypress,.search_inline_column');

        if (event.which == 13) {
            event.preventDefault();
            var col = $(this);
            var table = $(this).closest('.listview');
            var searchInline = [];
            var name = extractName(col.attr('name'));
            searchInline.push({
                'column': col.attr('name'),
                'value': col.val()
            });
            $.listviewSearch(table, {
                'search_inline': searchInline //,'reset':1
            });
            event.stopPropagation();
            return false;
        }
    });

    $(document).on('keypress', '#advance_search input', function(event) {
        log('keypress,#advance_search input');
        if (event.which == 13) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

    /*
     $(document).on('submit','.search_inline_form',function(event){
     var col=$(this).find('.search_inline_column');
     var table=$(this).closest('.listview');
     var searchInline=[];
     var name=extractName(col.attr('name'));
     searchInline.push({
     'column':col.attr('name'),
     'value':col.val()
     });
     $.listviewSearch(table, {
     'search_inline':searchInline,
     'reset':1
     });
     event.stopPropagation();
     return false;
     });
     */


    /**
     * Intercepts click event for finding result count incase of lazy pagination.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', "a.paginate_count", function(event) {
        log('click-> a.paginate_count');

        var paginateCountObj = this;
        $.get($(this).attr('href'), {}, function(data) {
            $(paginateCountObj).replaceWith('<span class="paginate_count">' + data + '</span>');
        });
        event.stopPropagation();
        return false;
    });



    /**
     * Intercept twisty-close click event
     * Used in case of categorized/tree listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.twisty-close,.twisty-close-last', function(event, href, tobeDeleted) {
        log('click -> .twisty-close,.twisty-close-last');
        if ($(this).hasClass('ui-state-disabled'))
            return false;

        var $this = this;
        var tobeDeleted = tobeDeleted;
        var table = $(this).addClass('ui-state-disabled').closest('table');
        var query = table.attr('query');
        var collapseCategoryColumns = table.attr('collapse_category_columns');
        if (typeof collapseCategoryColumns == 'undefined') {
            collapseCategoryColumns = 0;
        }
        if (typeof href == 'undefined') {
            var href = table.attr('href');
        }
        href = href.replace('page=', 'old_page=');
        var active_level = $(this).attr('active_level');
        active_level = parseInt(active_level) + 1;
        query = parseJSON(decodeURIComponent(query));
        query['active_level'] = active_level;
        var td = $(this).closest('td');
        var tr = td.closest('tr');
        var where = {};
        var treeNode = $(td).hasClass('tree-node');
        if (treeNode) {
            where[$(this).closest('table').attr('foreign_column_name')] = $.trim($(this).closest('tr').attr('primary_key'));
        } else {
            var val = $.trim(td.text());
            if (td.is('[value]')) {
                val = td.attr('value');
            }

            if (val == '') {
                where[0] = {
                    'OR': [td.attr('column_name') + ' IS NULL', td.attr('column_name') + '=""']
                };
            } else {
                where[td.attr('column_name')] = val;
            }
        }


        if (collapseCategoryColumns == 1) {
            var tr_active_level = tr.attr('active_level');
            if (!$.isset(tr_active_level)) {
                tr_active_level = 0;
            }
            tr_active_level = parseInt(tr_active_level);
            var ptar = tr.prev();
            if (ptar.hasClass('record-row')) {
                var ctr_active_level = '';
                while (typeof ptar == 'object') {
                    ctr_active_level = ptar.attr('active_level');
                    ctr_active_level = parseInt(!$.isset(ctr_active_level) ? 0 : ctr_active_level);
                    if (ctr_active_level < tr_active_level) {
                        ptar.find('.category').each(function() {
                            var val = $.trim($(this).text());
                            if ($(this).is('[value]')) {
                                val = $(this).attr('value');
                            }
                            where[$(this).attr('column_name')] = $.trim(val);
                        });
                        tr_active_level = ctr_active_level;
                    }
                    if (ptar.hasClass('record-row') && !$.isset(ptar.attr('active_level'))) {
                        break;
                    }
                    ptar = ptar.prev();
                }
            }

        } else {
            td.prevAll('.category').each(function() {
                var val = $.trim($(this).text());
                if ($(this).is('[value]')) {
                    val = $(this).attr('value');
                }
                where[$(this).attr('column_name')] = $.trim(val);
            });

        }
        if (typeof query['where'] == 'undefined')
            query['where'] = {};
        if ($.isArray(query['where']))
            query['where'].push(where);
        else
            query['where'] = $.extend(query['where'], where);

        href = href.split('q:')[0];
        href = href.split('q=')[0];

        if (typeof query['search_basic'] != undefined) {
            delete(query['search_basic']);
        }
        if (typeof query['search_advance'] != undefined) {
            delete(query['search_advance']);
        }
        if (typeof query['search'] != undefined) {
            delete(query['search']);
        }
        href = href.replace('search_basic', 'sb').replace('search_advance', 'sa').replace('[search]', 'il');
        //href.indexOf('current_listview=') != -1 &&
        if ($.isset(query['fields'])) {
            delete(query['fields']);
        }
        $.get(href, {
            "q": encodeURIComponent(JSON.stringify(query))
        }, function(data) {
            if (typeof tobeDeleted != 'undefined' && tobeDeleted.length > 0) {
                for (var i = 0, max = tobeDeleted.length; i < max; i++) {
                    tobeDeleted[i].remove();
                }
            }
            var data = $(data);
            var padding = '';
            var treeMarkup = '';
            if (treeNode || collapseCategoryColumns == 1) {
                for (var k = 0; k < active_level; k++) {
                    padding += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                    treeMarkup += '<div class="twisty-i" ></div>';
                }
            }

            if (treeNode || collapseCategoryColumns == 1) {
                var paginationRow = data.find('.pagination-row');
                var tds = data.find('.record-row:first>td');
                var colspan = parseInt(tds.length);
                var actionTdMarkup = false;
                if (tds.last().hasClass('list-row-action')) {
                    colspan--;
                    //style="background-color: white;"
                    actionTdMarkup = '<td >&nbsp;</td>';
                }
                var tdMarkup = false;
                if (tds.first().find('.lco').length > 0) {
                    colspan--;
                    //style="background-color: white;"
                    tdMarkup = '<td >&nbsp;</td>';
                }


                if (paginationRow.find('.paginate-link').not('.active-paginate-link').length > 0) {
                    paginationRow.attr({
                        'active_level': active_level
                    }).find('td:first').attr('colspan', colspan).prepend('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + padding).end();
                    if (tdMarkup !== false) {
                        paginationRow.prepend(tdMarkup);
                    }
                    if (actionTdMarkup !== false) {
                        paginationRow.append(actionTdMarkup);
                    }
                    paginationRow.insertAfter(tr);
                }
                var activeLevels = [];
                var num = 0;
                tr.nextAll().not('.pagination-row').each(function(k, v) {
                    num = parseInt($(this).attr('active_level'));
                    activeLevels.push((isNaN(num) ? 0 : num));
                });
                //data.find('.record-row').find('.tree-node,.category').prepend(padding).end().attr('active_level',active_level).insertAfter(tr);
                data.find('.record-row').each(function() {
                    var row = $(this);
                    if (!$(this).is('[active_level]')) {
                        $(this).find('.tree-node,.category').prepend(treeMarkup);
                        $(this).attr('active_level', active_level);
                    }
                    row.find('.twisty-i').each(function(k, v) {
                        var found = 0;
                        for (var kk = 0; kk < activeLevels.length; kk++) {
                            if (activeLevels[kk] == k) {
                                found = 1;
                            }
                            if (activeLevels[kk] < k) {
                                break;
                            }
                        }
                        if (found == 0) {
                            $(this).removeClass('twisty-i').addClass('twisty-b');
                        }
                    });
                }).insertAfter(tr);
            //data.find('.record-row').attr('active_level',active_level).insertAfter(tr);
            } else {
                if (data.find('.pagination-row').find('.paginate-link').not('.active-paginate-link').length > 0) {
                    var tdMarkup = '';
                    for (var k = 0; k < active_level; k++) {

                        //style="background-color: white;"
                        tdMarkup += '<td >&nbsp;</td>';
                    }
                    var tds = data.find('.record-row:first>td');
                    var colspan = parseInt(tds.length) - active_level;
                    var paginationRow = data.find('.pagination-row');
                    var actionTdMarkup = false;
                    if (tds.last().hasClass('list-row-action')) {
                        colspan--;
                        //style="background-color: white;"
                        actionTdMarkup = '<td >&nbsp;</td>';
                    }
                    paginationRow.attr({
                        'active_level': active_level
                    }).find('td:first').attr('colspan', colspan).end().prepend(tdMarkup);
                    if (actionTdMarkup !== false) {
                        paginationRow.append(actionTdMarkup);
                    }
                    paginationRow.insertAfter(tr);
                }
                var recordsCount = data.find('.record-row').length;
                data.find('.record-row').attr('active_level', active_level).insertAfter(tr);
                if (recordsCount > 0)
                    $($this).closest('tr').removeClass('ui-state-default').addClass('tree-color');//.find('.list-row-action:first').css('background-color','white').end().end().closest('td').prevAll().css('background-color','white');
            }
            $($this).removeClass('ui-state-disabled');
        });
        if ($(this).hasClass('twisty-close-last')) {
            $(this).removeClass('twisty-close-last').addClass('twisty-open-last').next('.twisty-fclose').removeClass('twisty-fclose').addClass('twisty-fopen');

        } else {
            $(this).removeClass('twisty-close').addClass('twisty-open').next('.twisty-fclose').removeClass('twisty-fclose').addClass('twisty-fopen');

        }
        event.stopPropagation();
        return false;
    });

    /**
     * Intercept twisty-open click event
     * Used in case of categorized/tree listview.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.twisty-fopen,.twisty-fclose', function(event) {
        log('click -->.twisty-fopen,.twisty-fclose');

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', '.twisty-open,.twisty-open-last', function(event) {
        log('click -> .twisty-open,.twisty-open-last');

        if ($(this).hasClass('ui-state-disabled'))
            return false;
        var tr = $(this).addClass('ui-state-disabled').closest('tr');
        var active_level = tr.attr('active_level');
        var tobeDeleted = [];
        if (typeof active_level == 'undefined') {
            active_level = 0;
        }
        active_level = parseInt(active_level);
        tr = tr.next();
        var level = tr.attr('active_level');
        while (level != 'undefined' && parseInt(level) > active_level) {
            tobeDeleted.push(tr);
            tr = tr.next();
            level = tr.attr('active_level');
        }
        if (tobeDeleted.length > 0) {
            var max = 0;
            for (var i = 0, max = tobeDeleted.length; i < max; i++) {
                tobeDeleted[i].remove();
            }
        }
        $(this).closest('tr').removeClass('ui-state-default').removeClass('tree-color');

        if ($(this).hasClass('twisty-open-last')) {
            $(this).removeClass('ui-state-disabled').removeClass('twisty-open-last').addClass('twisty-close-last')
            .next('.twisty-fopen').removeClass('twisty-fopen').addClass('twisty-fclose');
        } else {
            $(this).removeClass('ui-state-disabled').removeClass('twisty-open').addClass('twisty-close')
            .next('.twisty-fopen').removeClass('twisty-fopen').addClass('twisty-fclose');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });


    $(document).on('click', '.search_trigger', function(event) {
        log('click -> .search_trigger');

        var val = $(this).parents(':first').find('[name="search_basic"]').val();
        var searchView = '#' + $(this).attr('search_view');
        var params = {
            'search_basic': val
        };
        $.listviewSearch(searchView, params);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('click', '.reset-search', function() {
        $(this).parents(':first').find('[name=\'search_basic\']').val('');
        jQuery.listviewSearch('#' + $(this).attr('search_view'), {});
    });
    $.listviewSearch = function(searchView, params, object) {
        log('listviewSearch');
        var href = $(searchView).attr('href');
        if (!$.isset(href)) {
            href = $(searchView).find('.paginate-link:first').attr('href');
        }
        if (href.indexOf('?') == -1) {
            href += '?';
        }
        href = href.replace(/page:[0-9]*/, '').replace('search_advance', 's').replace('search_basic', 's').replace('[search]', '[si]');
        if ($.isset(params['search_inline'])) {
            $.each(params['search_inline'], function(k, v) {
                href += '&' + v['column'] + '=' + v['value'];
            });
        }
        if ($.isset(params['search_basic'])) {
            href += '&search_basic=' + params['search_basic'];
        }
        if ($.isset(params['search_advance'])) {
            if ($.isArray(params['search_advance']) || $.isPlainObject(params['search_advance'])) {
                params['search_advance'] = encodeURIComponent(JSON.stringify(params['search_advance']))
            }
            href += '&search_advance=' + params['search_advance'];
        }
        href += '&page=1';


        href += '&related_to=' + $(searchView).closest('form').find('.form_document_id').val();

        if ($.isset(params['reset'])) {
            href += '&reset=' + params['reset'];
        }
        if ($.isset(params['params'])) {
            href += params['params'];
        }
        log(href);

        $.get(href, {}, function(data) {
            $.replaceListview($(searchView), data);
            if (typeof (object) != 'undefined') {
                $(object).closest('.ui-dialog').find('.ui-dialog-titlebar-close').trigger('click');
            }
        //document.location.href=href;
        });
    //link.attr('href',href).trigger('click');
    }


    /**
     * Intercept paginate-link click event
     * Used in case of categorized/tree listview sublevels pagination.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.paginate-link', function(event) {
        log('click -> .paginate-link');

        var paginateLink = $(this);
        if (typeof $(this).closest('tr').attr('active_level') != 'undefined') {
            if ($(this).hasClass('ui-state-disabled'))
                return false;
            var tr = $(this).siblings('.paginate-link').addClass('ui-state-disabled').end().addClass('ui-state-disabled').closest('tr');
            var active_level = tr.attr('active_level');
            var tobeDeleted = [tr];
            var href = $(this).attr('href');
            if (typeof active_level != 'undefined') {
                active_level = parseInt(active_level);
                tr = tr.prev();
                var level = tr.attr('active_level');
                while (level != 'undefined' && parseInt(level) >= active_level) {
                    tobeDeleted.push(tr);
                    tr = tr.prev();
                    level = tr.attr('active_level');
                }
            }
            tr.find('.twisty-open,.twisty-open-last').each(function() {
                if ($(this).hasClass('twisty-open-last')) {
                    $(this).removeClass('twisty-open-last').addClass('twisty-close-last').trigger('click', [href, tobeDeleted]);
                } else {
                    $(this).removeClass('twisty-open').addClass('twisty-close').trigger('click', [href, tobeDeleted]);
                }
            });
        } else {
            if ($(this).hasClass('ui-state-disabled'))
                return false;
            var tr = $(this).siblings('.paginate-link').addClass('ui-state-disabled').end().addClass('ui-state-disabled').closest('tr');
            var href = $(this).attr('href');
            var table = $(this).closest('table');
            $.get(href, {}, function(data) {
                if (typeof (data) === "object") {
                    showMessage(data);
                    var oldUrl = paginateLink.attr('old_href');
                    if ($.isset(oldUrl))
                        paginateLink.attr('href', oldUrl);
                    $(tr).find('.paginate-link').removeClass('ui-state-disabled');
                } else {
                    $.replaceListview(table, data);


                }
            });
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });
    $.replaceListview = function(replacedView, data) {
        log('replaceListview');

        var data = $(data);
        var requiredTable = (data.hasClass('listview') ? data : data.find('.listview:first'));
        if (replacedView.hasClass('table-no-td-border')) {
            requiredTable.addClass('table-no-td-border');
        }
        if (replacedView.prev('.all-records-selection').length > 0) {
            replacedView.prev('.all-records-selection').remove();
        }
        var viewId = replacedView.attr('id');
        replacedView.replaceWith(requiredTable);
        if ($.isset(viewId)) {
            $(requiredTable).attr({
                'id': viewId
            });
        }

        initChart(data);
    //$.tableColResizable(requiredTable);
    }
    /*
     $.tableColResizable=function(table){
     table.parents(":first").find('.JCLRgrips').remove();
     if(!table.find('tr:first').hasClass('search_criteria')){
     $(table).colResizable();
     if(table.is("[search_criteria]")) {
     table.before('<div class="search_criteria">'+table.attr('search_criteria')+'</div>');
     }
     }
     }
     $('.listview.index').colResizable();
     */


    /**
     * Intercept sort-link click event
     * Used in case of all listviews.
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.sort', function(event) {
        log('click -> .sort');
        var href = $(this).attr('href');
        var table = $(this).parents('table:eq(1)');
        $.get(href, {}, function(data) {
            $.replaceListview(table, data);
        });
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    //$.address.change(function(event){
    //    $(".tab").tabs( "select" , window.location.hash )
    //});

    $(document).on('click', '.date_toggle', function(event) {
        log('click -> .date_toggle');
        if ($(this).hasClass('toggle_enabled')) {
            $(this).parents(':first').find('.date').datepicker("destroy").removeClass('date datetime number');
            $(this).removeClass('toggle_enabled').addClass('toggle_disabled').text('Show Picker');
        } else {
            $(this).parents(':first').find('.date').datepicker();
            $(this).removeClass('toggle_disabled').addClass('toggle_enabled').text('Enter manually');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });
    $(document).on('click', '.datetime_toggle', function(event) {
        log('click -> .datetime_toggle');
        if ($(this).hasClass('toggle_enabled')) {
            $(this).parents(':first').find('.datetime').datepicker("destroy");
            $(this).removeClass('toggle_enabled').addClass('toggle_disabled').text('Show Picker');
        } else {
            var ampm = false;
            if ($.isset($.config) && $.isset($.config.hour_format))
                ampm = $.config.hour_format;
            $(this).parents(':first').find('.datetime').datetimepicker({
                "ampm": ampm,
                "timeFormat": "hh:mm:ss TT",
                "showSecond": true
            });
            $(this).removeClass('toggle_disabled').addClass('toggle_enabled').text('Enter manually');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    if(ClipboardJS.isSupported()){

        new ClipboardJS('.copy-to-clipboard-action');
        new ClipboardJS('.copy_to_clipboard_link');
        var clipboard=new ClipboardJS('.copy_to_clipboard');
        clipboard.on('success', function(e) {
            setTimeout(function(){
                jQuery(e.trigger).parents("div.ui-widget-content:first").dialog('destroy').remove();
            },500);
        });
    }
    


        

     

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '.select', function(event) {
        log('click -> .select');
        var href = $(this).attr('href');
        if (!$.isset(href))
            return false;
        href = href.split('?');
        var base = href[0] || '';
        var get = href[1] || '';
        var length = 0;
        base = base.split('/');
        var params = {};
        var index = '';
        var p1 = '';
        var p2 = '';
        for (var i = 0, length = base.length; i < length; i++) {
            index = base[i].indexOf(':');
            if (index != -1) {
                p1 = base[i].substring(0, index);
                p2 = base[i].substring(index + 1);
                if (!$.isEmpty(p1) && !$.isEmpty(p2))
                    params[p1] = p2;
            }
        }
        if (!$.isEmpty(get))
            get = get.split('&');
        var getParams = {};
        var pair = [];
        for (var i = 0, length = get.length; i < length; i++) {
            pair = get[i].split('=');
            if ($.isset(pair[0]) && $.isset(pair[1]) && !$.isEmpty(pair[0]) && !$.isEmpty(pair[1]))
                getParams[pair[0]] = pair[1];
        }
        if ($.isset(params['id']) && $.isset(getParams['trigger'])) {
            var listview = $(this).parents("table.listview:first");
            var displayField = listview.attr('display_field');
            var primaryKey = listview.attr('primary_key');
            if ($('#' + getParams['trigger']).hasClass('tokeninput-popup-add')) {
                var label = (displayField == primaryKey ? params['id'] : $(this).closest('tr').find("[column_name='" + displayField + "']").text());
                var td = $('#' + getParams['trigger']).parents(':first');
                $(this).parents("div.ui-widget-content:first").dialog('destroy').remove();

                var list = [];
                td.find('.token-input-list').find('.key').each(function() {
                    if ($(this).closest('li').find('[name*="[deleted]"]').val() != 1) {
                        list.push($(this).val());
                    }
                });
                if ($.inArray(params['id'], list) != -1) {
                    $.jsContainer("<p>" + label + " is already selected</p>");
                } else {
                    td.find('.tokeninput-popup-autocomplete').tokenInput("add", {
                        'key': params['id'],
                        'name': label,
                        'model': td.find('.tokeninput-popup-select').val()
                    }).trigger('change');
                }

            } else {
                var td = $('#' + getParams['trigger']).parents(':first');
                $(this).parents("div.ui-widget-content:first").dialog('destroy').remove();
                var popupSelect = td.find('.popup-select');
                var popupHidden = td.find('.popup-hidden:first');
                var popupAutocomplete = td.find('.popup-autocomplete:first');
                var selectedModel = popupSelect.find('option:selected').attr('model');
                var href = '';
                if (popupSelect.length > 0) {
                    href = popupSelect.find("option:selected").attr('href');
                } else {
                    href = $(this.element[0]).attr('href');
                }
                var label = (displayField == primaryKey ? params['id'] : $(this).closest('tr').find("[column_name='" + displayField + "']").text());
                if ($.isEmpty(label)) {
                    if (!$.isEmpty(href)) {
                        var q = {};
                        q["paginate_as"] = "lazy";
                        q['limit'] = 1;
                        q['fields'] = ['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}', '{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'];
                        q['autocomplete'] = 1;
                        var where = {};
                        where['{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'] = params['id'];
                        q['where'] = where;
                        href = href.split('?');
                        href[0] += '.json';
                        href = href.join('?')
                        log('calling ' + href);
                        $.getJSON(href, {
                            'q': encodeURIComponent(JSON.stringify(q))
                        }, function(paginateResponse) {
                            var paginate = {};
                            if ($.isset(paginateResponse['paginate'])) {
                                paginate = paginateResponse['paginate'];
                            }
                            var primaryKey = paginate['primary_key'];
                            var displayField = paginate['display_field'];

                            var v = paginate.data.pop();
                            if (popupHidden.attr('multiselect') == 1) {
                                var terms = popupAutocomplete.val();
                                terms = terms.split(/,\s*/);
                                terms.pop();
                                if (popupHidden.attr('postfix_label') == 1) {
                                    terms.push(v[displayField] + "[" + selectedModel.substring(0, 1) + "]");
                                } else {
                                    terms.push(v[displayField]);
                                }
                                terms.push("");
                                popupAutocomplete.val(terms.join(", "));
                                if (popupHidden.attr('prefix_id') == 1) {
                                    popupHidden.valJSON(selectedModel.substring(0, 1) + v[primaryKey], v[displayField]).trigger('change');
                                } else {
                                    popupHidden.valJSON(v[primaryKey], v[displayField]).trigger('change');
                                }
                                return false;
                            } else {
                                popupAutocomplete.val($.trim(v[displayField]));
                                popupHidden.val(v[primaryKey]).attr('for_text', $.trim(v[displayField])).trigger('change');
                                return false;
                            }


                        });
                    }
                } else {
                    v = {};
                    v[primaryKey] = params['id'];
                    v[displayField] = label;
                    if (popupHidden.attr('multiselect') == 1) {
                        var terms = popupAutocomplete.val();
                        terms = terms.split(/,\s*/);
                        terms.pop();
                        if (popupHidden.attr('postfix_label') == 1) {
                            terms.push(v[displayField] + "[" + selectedModel.substring(0, 1) + "]");
                        } else {
                            terms.push(v[displayField]);
                        }
                        terms.push("");
                        popupAutocomplete.val(terms.join(", "));
                        if (popupHidden.attr('prefix_id') == 1) {
                            popupHidden.valJSON(selectedModel.substring(0, 1) + v[primaryKey], v[displayField]).trigger('change');
                        } else {
                            popupHidden.valJSON(v[primaryKey], v[displayField]).trigger('change');
                        }
                        return false;
                    } else {
                        popupAutocomplete.val($.trim(v[displayField]));
                        popupHidden.val(v[primaryKey]).attr('for_text', $.trim(v[displayField])).trigger('change');
                        return false;
                    }
                }
            }
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '.popup-add', function(event) {
        console.log('click -> .popup-add');
        log('click -> .popup-add');
        var uuid = $.uu();
        $(this).attr('id', uuid);
        var href = '';
        var q = '';
        var td = $(this).parents(':first');
        var popupSelect = td.find('.popup-select');
        if (popupSelect.length > 0) {
            var popupAutocomplete = td.find('.popup-autocomplete');
            if (popupSelect.find("option:selected").length == 0) {
                popupSelect.get(0).selectedIndex = 0;
            }
            var option = popupSelect.find("option:selected");
            href = option.attr('href');
            q = option.attr('q');
        } else {
            var popupAutocomplete = td.find('.popup-autocomplete');
            href = popupAutocomplete.attr('href');
            q = popupAutocomplete.attr('q');
        }
        q = decodeURIComponent(q);
        console.log(href);
        if (typeof (href) != 'undefined' && $.trim(href) != '') {
            if ($.trim(q) == '' || !$.isset(q))
                q = '{}';
            q = parseJSON(q);
            if (!$.isPlainObject(q)) {
                q = {};
            }
            q['limit'] = 16;
            q['actions'] = ['select'];
            if (!$.isset(q['where'])) {
                q['where'] = [];
            }
            q['fetch'] = 1;
            q['merge_paginate'] = 1;

            var where = {};
            var fieldDependsOn = popupAutocomplete.attr('field_value_depends_on');
            var message = popupAutocomplete.attr('message_if_empty_dependent_on_field');
            if (fieldDependsOn != '') {
                $(fieldDependsOn).each(function() {
                    var name = $.extractName($(this).attr('name'));
                    var val = $(this).val();
                    var fieldName = name.slice(-2).join('.');
                    if (message == '') {
                        var label = $('[for="' + name.join('-') + '"]').text();
                        if (label == "") {
                            label = fieldName;
                        }
                        message = "Please enter value for field " + label;
                    }
                    where[fieldName] = val;

                });
            }
            q['where'] = $.mergeAll([q['where'], where]);
            $(popupAutocomplete).data('q', q);
            $(popupAutocomplete).triggerHandler('beforeSearch');
            q = $(popupAutocomplete).data('q');
            href += (href.indexOf('?') == -1 ? '?' : '') + '&action_menu_bar=1';

            if (q !== false) {
                $.get(href, {
                    'q': encodeURIComponent(JSON.stringify(q)),
                    'trigger': uuid
                }, function(data) {
                    var params = {
                        "width": ((parseInt($('body').width()) / 100) * (CONFIG.popup_width_percent || 80)),
                        "height": ((parseInt(screen.height) / 100) * (CONFIG.popup_height_percent ? CONFIG.popup_height_percent : 80))
                    };
                    params['title'] = popupTitle(href);
                    var uuid = $.jsContainer(data, params);
                    $.initFields($('#' + uuid));

                });
            }
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });



    $(document).on('click', '.tokeninput-popup-add', function(event) {
        log('click -> .tokeninput-popup-add');
        var uuid = $.uu();
        $(this).attr('id', uuid);
        var href = '';
        var q = '';
        var td = $(this).parents(':first');
        var popupSelect = td.find('.popup-select');

        if (popupSelect.length > 0) {
            var popupAutocomplete = td.find('.tokeninput-popup-autocomplete');
            if (popupSelect.find("option:selected").length == 0) {
                popupSelect.get(0).selectedIndex = 0;
            }
            var option = popupSelect.find("option:selected");
            href = option.attr('href');
            q = option.attr('q');
        } else {
            var popupAutocomplete = td.find('.tokeninput-popup-autocomplete');
            href = popupAutocomplete.attr('href');
            q = popupAutocomplete.attr('q');
        }
        q = decodeURIComponent(q);
        if ($.trim(href) != '') {
            if ($.trim(q) == '' || !$.isset(q))
                q = '{}';
            q = parseJSON(q);
            if (!$.isPlainObject(q)) {
                q = {};
            }
            q['limit'] = 16;
            q['actions'] = ['select'];
            if (!$.isset(q['where'])) {
                q['where'] = [];
            }
            q['fetch'] = 1;
            q['merge_paginate'] = 1;

            where = {};
            var fieldDependsOn = popupAutocomplete.attr('field_value_depends_on');
            var message = popupAutocomplete.attr('message_if_empty_dependent_on_field');
            if (fieldDependsOn != '') {
                $(fieldDependsOn).each(function() {
                    var name = $.extractName($(this).attr('name'));
                    var val = $(this).val();
                    var fieldName = name.slice(-2).join('.');
                    if (message == '') {
                        var label = $('[for="' + name.join('-') + '"]').text();
                        if (label == "") {
                            label = fieldName;
                        }
                        message = "Please enter value for field " + label;
                    }
                    where[fieldName] = val;

                });
            }
            q['where'] = $.mergeAll([q['where'], where]);
            $(popupAutocomplete).data('q', q);
            $(popupAutocomplete).triggerHandler('beforeSearch');
            q = $(popupAutocomplete).data('q');
            href += (href.indexOf('?') == -1 ? '?' : '') + '&action_menu_bar=1';
            if (q !== false) {
                $.get(href, {
                    'q': encodeURIComponent(JSON.stringify(q)),
                    'trigger': uuid
                }, function(data) {
                    var params = {
                        "width": ((parseInt($('body').width()) / 100) * (CONFIG.popup_width_percent || 80)),
                        "height": ((parseInt(screen.height) / 100) * (CONFIG.popup_height_percent ? CONFIG.popup_height_percent : 80))
                    };
                    params['title'] = popupTitle(href);
                    var uuid = $.jsContainer(data, params);
                    $.initFields($('#' + uuid));

                });
            }
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });


    $(document).on('click', '.popup-open-record', function(event) {
        console.log('click -> .popup-open-record');
        log('click -> .popup-open-record');
        var href = '';
        var q = '';
        var td = $(this).parents(':first');
        var popupSelect = td.find('.popup-select');
        var popupHidden = td.find('.popup-hidden');
        if (popupSelect.length > 0) {
            var popupAutocomplete = td.find('.popup-autocomplete');
            if (popupSelect.find("option:selected").length == 0) {
                popupSelect.get(0).selectedIndex = 0;
            }
            var option = popupSelect.find("option:selected");
            href = option.attr('href');
            q = option.attr('q');
        } else {
            var popupAutocomplete = td.find('.popup-autocomplete');
            href = popupAutocomplete.attr('href');
            q = popupAutocomplete.attr('q');
        }
        

        if ($.trim(href) != '' && ($(this).hasClass('popup-open-record-always') || popupHidden.val() != '') ) {
            href += (href.indexOf('?') == -1 ? '?' : '');//+'&id='+popupHidden.val();
            href = href.replace('/index', '/view');
            href = href.replace('?', '/id:' + popupHidden.val() + '?');

        
            $(popupAutocomplete).data('q_open', href);
            $(popupAutocomplete).triggerHandler('beforeOpen');
            var href = $(popupAutocomplete).data('q_open');
            $(this).attr('href', href);
            if ($.trim(href) != ''){
                $.ajaxPopup($(this).attr('ajax', 1));
            }
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });



    function popupTitle(href) {
        log('popupTitle');
        if (typeof href == 'string') {
            href = href.split($.config['base']);
            href.shift();
            href = href.join($.config['base']);
            href = href.split('?')[0].split("/");
            href.shift();
            for (i = 0; i < href.length; i++) {
                if (href[i].indexOf(':') != -1) {
                    href[i] = href[i].substring(href[i].indexOf(':') + 1, href[i].length);
                }
            }
            return href.join(" » ").replace('_', ' ');
        }
        else {
            return'';
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '.popup-clear', function(event) {
        log('click -> .popup-clear');
        $(this).closest('td')
        .find('.popup-autocomplete').val('').end()
        .find('.popup-hidden').val('').trigger('change').end()
        .find('.popup-open-record').hide().end();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('change', '.popup-select', function(event) {
        log('change -> .popup-select');

        var td = $(this).closest('td');
        if (parseInt(td.find('.popup-hidden').attr('multiselect')) != 1) {
            td.find('.popup-autocomplete').val('').end()
            .find('.popup-hidden').val('').trigger('change').end();
            //.find('.popup-open-record').hide().end();
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('change', '.geocoder', function(event) {
        var block = $(this).closest('.block');
        var latitude = block.find('[name *="[latitude]" ]');
        var longitude = block.find('[name *="[longitude]" ]');
        var locationType = block.find('[name *="[location_type]" ]');
        var geocodeType = block.find('[name *="[geocode_type]" ]');
        if (latitude.length > 0 && latitude.is(':input') && latitude.val() == "") {
            var address = [];
            var line1 = block.find('[name *="address_line_1" ]').val();
            var line2 = block.find('[name *="address_line_2" ]').val();
            var city = block.find('[name *="city" ]').val();
            var state = block.find('[name *="__state" ]').val();
            var country = block.find('[name *="__country" ]').val();
            if (line1 != '' && city != '' && state != '' && country != '') {
                address.push(line1);
                address.push(line2);
                address.push(city);
                address.push(state);
                address.push(country);
                address = address.join(', ');
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'address': address
                }, function(results, status) {
                    latitude.val("");
                    longitude.val("");
                    if (locationType.length > 0) {
                        locationType.val("");
                    }
                    if (geocodeType.length > 0) {
                        geocodeType.val("");
                    }

                    if (status == google.maps.GeocoderStatus.OK) {
                        latitude.val(results[0].geometry.location.lat());
                        longitude.val(results[0].geometry.location.lng());
                        if (locationType.length > 0) {
                            locationType.val(results[0].geometry.location_type);
                        }
                        if (geocodeType.length > 0) {
                            geocodeType.val(results[0].types.join(', '));
                        }
                    }
                });
            }
        }
    });

    /*
     $(document).bind('document_update',function(event,dom){
     console.log(dom);
     });
     */

    /*
     $(document).bind('document_update',function(event,dom){
     console.log(dom);
     });
     */

    $.initFields = function(container, init) {
        log('initFields');

        /**
         * Initialize jquery tab
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        var init = init || false;


        /*
         if (container.find('[name="data[forms][properties][formula]"]').length > 0) {
         container.find('[name="data[forms][properties][formula]"]').val(container.find('[name="data[forms][properties][formula]"]').val().replace(/&quot;/g, '"'));
         }
         container.find('form').ready(function() {
         container.find('form').each(function() {
         // Form validation using jquery.validate plugin
         $.validate_form($(this));
         });
         // Formula Computation
         container.find('[formula]').compute();
         });
         */


        container.find(".tab").not('.template-element').each(function() {
            var selected = $(this).attr("selected");
            var op = {};
            op["cookie"] = {};
            if (init == true) {
                op["cookie"] = null;
            }
            op['activate'] = function(event, ui) {
                if ($.isset(ui.newPanel) && $(ui.newPanel).index() > 1 && !$(ui.panel).hasClass('resized')) {
                    $(ui.newPanel).addClass('resized').find('.listview').each(function() {
                        if ($(this).find('.chart').length > 0) {
                            initChart($(this));
                        }
                    });
                }
            };

            $(this).tabs(op).bind("tabsselect", function(event, ui) {
                //window.location.hash = ui.tab.hash;
                });
        // when the tab is selected update the url with the hash
        });
        // invoke a global handler for initialising new added dom elements with plugin.
        log('$(document).triggerHandler(document_update, [container])');
        log(container);
        $(document).triggerHandler('document_update', [container]);
        // Usage:
        // $(document).bind('document_update',function(event,dom){
        // 
        // });

        if ($(".row-template-overflow").length > 0) {
            $(".row-template-overflow").each(function() {
                if ($(this)[0].scrollHeight > 0) {
                    if ($(this).height() < $(this)[0].scrollHeight) {
                        $(this).closest("td").append('<span class="row-template-more" style="color:GREY;">more...</span>');
                    }
                }
            });
        }
        $('.row-template-more').on('click', function(event) {
            if ($(this).prev().find('.row-template-overflow').attr('style') != '') {
                $(this).prev().find('.row-template-overflow').attr('style', '');
                t = $(this).clone(true);
                t.text('less...');
                $(this).replaceWith(t);
            }
            else {
                $(this).prev().find('.row-template-overflow').attr('style', 'height:115px;overflow:hidden;');
                t = $(this).clone(true);
                t.text('more...');
                $(this).replaceWith(t);
            }
        });

        container.find("button")
        .removeClass('ui-state-active').each(function() {
            if ($(this).is('button')) {
                $(this).css({
                    'padding': '1px'
                });
            }

            if ($(this).hasClass('action-list-trigger')) {
                $(this).button({
                    icons: {
                        secondary: "ui-icon-triangle-1-s"
                    }
                });
            } else {
                var iconClass = $(this).attr('icon_class');
                var iconPosition = $(this).attr('icon_position');
                if (iconClass != "") {
                    var icon = {};
                    if (typeof (iconPosition) == 'undefined' || iconPosition == '') {
                        iconPosition = 'secondary';
                    }
                    icon[iconPosition] = iconClass;
                    $(this).button({
                        icons: icon
                    });
                } else {
                    $(this).button();
                }
            }

            if ($(this).hasClass('ui-helper-hidden')) {
                $(this).hide();
            }
            if ($(this).hasClass('track-unchecked')) {
                $(this).show();
            }
        });

        /**
         * Initialize WYSIWYG editor
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('[editor="WYSIWYG"]').not('.template-element').each(function() {
            var properties = {};
            var height = parseInt($(this).css('height'));
            if ($.isset(height) && height > 250)
                properties['height'] = height;

            //var width=parseInt($(this).css('width'));
            //if($.isset(width) && width > 500)
            //    properties['width'] =width;
            //else

            //properties['width'] =parseInt($(this).parents(':visible:first').css('width'));
            //console.log()
            $(this).cleditor(properties);
        });

        /**
         * Initialize WYSIWYG editor
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        var aceEditor = container.find('[editor="code_editor"]').not('.template-element');
        if (aceEditor.length > 0) {
            var initAceEditor = function() {
                aceEditor.each(function() {
                    var properties = {};
                    var height = parseInt($(this).css('height'));
                    if ($.isset(height) && height > 250)
                        properties['height'] = height;

                    var width = parseInt($(this).css('width'));
                    if ($.isset(width) && width > 500)
                        properties['width'] = width;
                    else
                        properties['width'] = '100%';
                    $(this).ace({
                        theme: 'eclipse',
                        lang: 'php'
                    });
                });
            }
            if (typeof (window.jQueryAce) == "undefined") {
                var oHead = document.getElementsByTagName('head')[0];
                var oScript = document.createElement('script');
                oScript.type = 'text/javascript';
                oScript.src = CONFIG.base + "module/ace/jquery-ace.js";
                // most browsers
                oScript.onload = initAceEditor;
                // IE 6 & 7
                oScript.onreadystatechange = function() {
                    if (this.readyState == 'complete') {
                        initAceEditor();
                    }
                }
                oHead.appendChild(oScript);
            } else {
                initAceEditor();
            }
        }



        container.find('[editor="markup"]').not('.template-element').each(function() {
            var base = ($.isset($.config) && $.isset($.config.base) ? $.config.base : false);
            $(this).markItUp(mySettings);
            $('#emoticons a').click(function() {
                emoticon = $(this).attr("title");
                $.markItUp({
                    replaceWith: emoticon
                });
            });
        });

        /**
         * Initialize date picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */

        var dateFormat = $.config['date_format'];
        container.find('input.date')
        .not('.template-element').each(function() {
            if ($(this).attr('is_readonly') != 0) {
                $(this).attr('readonly', 'readonly');
            } else {
                $(this).parents(':first').find('.date_toggle').remove();
                $(this).after('<a href="#" class="date_toggle toggle_enabled">Enter manually</a>');
            }
        })
        .datepicker().next().after('<span class="field-help">' + (dateFormat != '' ? "(" + dateFormat + ")" : "") + '</span>');

        container.find('span.date')
        .not('.template-element')
        .after('<span class="field-help">' + (dateFormat != '' ? "(" + dateFormat + ")" : "") + '</span>');

        /**
         * Initialize date time picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('input.datetime')
        .not('.template-element')
        .each(function() {

            var ampm = false;
            if ($.isset($.config) && $.isset($.config.hour_format) && parseInt($.config.hour_format) == 12) {
                ampm = true;
            }
            if ($(this).attr('is_readonly') != 0) {
                $(this).attr('readonly', 'readonly');
            } else {
                $(this).parents(':first').find('.datetime_toggle').remove();
                $(this).after('<a href="#" class="datetime_toggle toggle_enabled" >Enter manually</a>');
            }
            var datetimeValue = $(this).val().split(' ');
            if (typeof (datetimeValue[1]) != 'undefined') {
                datetimeValue = datetimeValue[1].split(':');
            } else {
                datetimeValue = [];
            }
            $(this).datetimepicker({
                "ampm": ampm,
                "timeFormat": "hh:mm:ss TT",
                "showSecond": true,
                "hour": datetimeValue[0] | 0,
                "minute": datetimeValue[1] | 0,
                "second": datetimeValue[2] | 0
            });
        }).next().after('<span class="field-help">' + (dateFormat != '' ? "(" + dateFormat + " hh:mm:ss)" : "") + '</span>');


        container.find('span.datetime').not('.template-element')
        .after('<span class="field-help">' + (dateFormat != '' ? "(" + dateFormat + " hh:mm:ss)" : "") + '</span>');

        /**
         * Initialize time picker
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */
        container.find('input.time').not('.template-element').attr('readonly', 'readonly').each(function() {
            var ampm = (parseInt($(this).attr('ampm')) == 1 ? true : false);
            $(this).timepicker({
                "ampm": ampm,
                "timeFormat": "hh:mm:ss tt",
                "showSecond": true
            });
        });


        container.find('.button-set').buttonset();
        container.find('.action-list').menu();






        /**
         * Initialize jquery autocomplete
         *
         * @author Tushar Takkar<ttakkar@primarymodules.com>
         */


        container.find(".popup-autocomplete").not('.template-element').not('[readonly]')
        .each(function() {

            var properties = {
                minLength: 0,
                select: function(event, ui) {
                    var popupSelect = $(this).closest('td').find('.popup-select');
                    var popupHidden = $(this).closest('td').find('.popup-hidden:first');
                    var popupAutocomplete = $(this).closest('td').find('.popup-autocomplete:first');
                    if (popupHidden.attr('multiselect') == 1) {
                        var terms = this.value.split(/,\s*/);
                        terms.pop();
                        // add the selected item
                        terms.push(ui.item.value);
                        // add placeholder to get the comma-and-space at the end
                        terms.push("");
                        this.value = terms.join(", ");
                        popupHidden.valJSON(ui.item.id, ui.item.value.split('[')[0]).trigger('change');

                        return false;
                    } else {
                        this.value = ui.item.value;
                        popupHidden.val(ui.item.id).attr('for_text', ui.item.value).trigger('change');
                        return false;
                    }

                },
                source: function(request, response) {
                    var href = '';
                    var q = '';
                    var element = this.element[0];
                    log(this.element[0]);
                    var td = $(this.element[0]).closest('td');
                    log(td);
                    log(td.html());
                    var term = [];
                    var termP = request.term.split("/");
                    for (var i = 0; i < termP.length; i++) {
                        term.push($.trim(termP[i].split('[')[0]));
                    }
                    term = term.join('/');
                    var popupHidden = td.find('.popup-hidden:first');
                    log(popupHidden);
                    var forText = popupHidden.attr('for_text');
                    if (typeof (forText) == 'undefined') {
                        forText = "";
                    }
                    forText = forText.split('[')[0];

                    var searchTerm = request.term;
                    if (popupHidden.attr('multiselect') == 1) {
                        searchTerm = request.term.split(/,\s*/).pop();
                    } else {
                        if ($.trim(forText) != term) {
                            td.find('.popup-hidden').val('').trigger('change');
                        }
                    }
                    var popupSelect = td.find('.popup-select');
                    if (popupSelect.length > 0) {
                        var option = popupSelect.find("option:selected");
                        href = option.attr('href');
                        q = option.attr('q');
                    } else {
                        href = $(this.element[0]).attr('href');
                        q = $(this.element[0]).attr('q');
                    }
                    var inline_search = $(this.element[0]).attr('inline_search');
                    if ($.isset(inline_search) && inline_search == 0) {
                        return false;
                    }



                    q = decodeURIComponent(q);
                    if (typeof (href) != 'undefined' && href != '') {
                        if ($.trim(q) == '' || !$.isset(q))
                            q = '{}';
                        q = parseJSON(q);
                        if (!$.isPlainObject(q))
                            q = {};
                        q["paginate_as"] = "lazy";
                        q['limit'] = 20;
                        q['fields'] = ['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}', '{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'];
                        if (!$.isset(q['where'])) {
                            q['where'] = [];
                        }
                        where = {};
                        if (!$.isEmpty(searchTerm)) {
                            where['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}' + ' LIKE '] = searchTerm;
                        }

                        q['fetch'] = 1;
                        q['autocomplete'] = 1;
                        q['where'] = $.mergeAll([q['where'], where]);

                        var concatTextValue = parseInt($(this.element[0]).attr('concat_text_value'));


                        $(this.element[0]).data('q', q);
                        $(this.element[0]).triggerHandler('beforeSearch');
                        q = $(this.element[0]).data('q');
                        if (q !== false) {
                            if (href.indexOf('?') !== -1) {
                                href = href.replace('?', '.json?');
                            } else {
                                href = href + '.json';
                            }
                            $.getJSON(href, {
                                'q': encodeURIComponent(JSON.stringify(q))
                            }, function(paginateResponse, status, xhr) {
                                var paginate = {};
                                if ($.isset(paginateResponse['paginate'])) {
                                    paginate = paginateResponse['paginate'];
                                }
                                var list = [];
                                if ((typeof (paginate) != 'undefined') && (typeof (paginate['data']) != 'undefined')) {
                                    var primaryKey = paginate['primary_key'];
                                    var displayField = paginate['display_field'];
                                    if (concatTextValue == 1) {
                                        $.each(paginate.data, function(k, v) {
                                            list.push({
                                                'id': v[primaryKey],
                                                'value': (v[displayField] != v[primaryKey] ? v[displayField] + ' [' + v[primaryKey] + ']' : v[displayField])
                                            });

                                        });
                                    } else {
                                        $.each(paginate.data, function(k, v) {
                                            list.push({
                                                'id': v[primaryKey],
                                                'value': v[displayField]
                                            });

                                        });
                                    }
                                }
                                $(element).data('option_list', list);

                                response(list);
                            });
                        }

                    }

                }
            };

            var autocomplete = $.extend({}, properties);
            if ($(this).attr('multiselect') == 1) {
                $(this).bind("keydown", function(event) {
                    if (event.keyCode === $.ui.keyCode.TAB &&
                        $(this).data("autocomplete").menu.active) {
                        event.preventDefault();
                    }
                });
                autocomplete['focus'] = function() {
                    // prevent value inserted on focus
                    return false;
                }
            }
            $(this).autocomplete(autocomplete);
        }).click(function() {
            $(this).autocomplete('search');
        }).keydown(function(event) {
            if (event.keyCode === $.ui.keyCode.TAB
                &&
                $(this).closest('td').find('.popup-hidden:first').val() == ""
                &&
                $(this).closest('td').find('.popup-autocomplete:first').val() != ""
                ) {
                var option = $(this).data('option_list');
                if (typeof (option) != 'undefined' && typeof (option[0]) != 'undefined') {
                    $(this).closest('td').find('.popup-hidden:first').val(option[0]['id']);
                    $(this).closest('td').find('.popup-autocomplete:first').val(option[0]['value']);
                }
            }
        });

        container.find(".popup-hidden")
        .not('.template-element')
        .not('[readonly]')
        .bind('data_source_url', function(event, id) {
            var href = '';
            var td = $(this).closest('td');
            var popupSelect = td.find('.popup-select');
            if (popupSelect.length > 0) {
                href = popupSelect.find("option:selected").attr('href');
            } else {
                href = $(this.element[0]).attr('href');
            }
            href.replace('/index', '/view');
            href += ".json?id=" + id;
            return href;
        });

        container.find(".popup-hidden")
        .not('.template-element')
        .not('[readonly]')
        .bind('data_source_url', function(event, id) {
            var href = '';
            var td = $(this).closest('td');
            var popupSelect = td.find('.popup-select');
            if (popupSelect.length > 0) {
                href = popupSelect.find("option:selected").attr('href');
            } else {
                href = $(this.element[0]).attr('href');
            }
            href = href.replace('/index', '/view');

            href += ".json?id=" + id;


            $(this).data('data_source_url', href);
            event.preventDefault();
            return false;
        });
        /*
         $('.popup-autocomplete').on('focusout', function() {
         var popup = $(this);
         var popupHidden = popup.closest('td').find('.popup-hidden');
         //case 1: when the field is a combo box and user can also type value in it
         if (popup.attr('is_combo_box') == '1' && popupHidden.val() == '' && popup.val() != '') {
         popupHidden.val(popup.val());
         }
         //case 2: when the field is not a combo box and user should not type value in it
         else {
         if (popup.attr('is_combo_box') != '1' && popupHidden.val() == '') {
         popup.val('');
         }
         }
         });
         */
        container.find('[aggregation_formula]')
        .not('.template-element')
        .not('[readonly]')
        .aggregation({
            'grid_row_class_name': 'last-data-row',
            'grid_cell_class_name': 'cell-info-grid'
        });

        container.find(".tokeninput-popup-autocomplete").not('.template-element').not('[readonly]')
        .each(function() {

            var element = $(this);
            var prepopulate = JSON.parse($(this).attr('prepopulate'));
            var counter = 0;
            var properties = {
                processPrePopulate: true,
                prePopulate: prepopulate,
                onAdd: function(hidden_input, token, item) {
                    element.trigger('change');
                    element.closest('form').trigger('change');
                },
                onDelete: function(hidden_input, token_data, token) {
                    element.trigger('change');
                    element.closest('form').trigger('change');
                },
                tokenFormatter: function(item) {
                    var grid_row_number = element.attr('grid_row_number');
                    var str = '';
                    var column = '';
                    var stdColumns = {
                        'model_column': 1,
                        'key_column': 1,
                        'label_column': 1,
                        'deleted_column': 1,
                        'id_column': 1
                    };

                    var list = [];
                    element.prev().find('.key').each(function() {
                        if ($(this).closest('li').find('[name*="[deleted]"]').val() != 1) {
                            list.push($(this).val());
                        }
                    });
                    if (typeof (item['key']) != 'undefined' && $.inArray(item['key'], list) != -1) {
                        $.jsContainer("<p>" + item['name'] + " is already selected</p>");
                        return false;
                    }
                    try {
                        $.each(element.attrs(), function(k, v) {
                            if (k.indexOf('_column') != -1) {
                                if (typeof (stdColumns[k]) == 'undefined') {
                                    column = k.replace('_column', '');
                                    str += "<input type='hidden'  name='" + v.replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + ($.isset(item[column]) && item[column] != "" ? item[column] : "") + "' >"
                                }
                            }
                        });
                    } catch (e) {

                    }
                    return "<li class='li-token-item'>"
                    + "<input type='hidden' class='model' name='" + element.attr('model_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + ($.isset(item['model']) && item['model'] != "" ? item['model'] : "") + "' >"
                    + "<input type='hidden' class='key' name='" + element.attr('key_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + item['key'] + "' >"
                    + "<input type='hidden' class='name' name='" + element.attr('label_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + item['name'] + "' >"
                    + ($.isset(item['deleted']) && item['deleted'] != "" ? "<input class='deleted' type='hidden' name='" + element.attr('deleted_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + item['deleted'] + "' >" : "")
                    + ($.isset(item['id']) && item['id'] != "" ? "<input class='id' type='hidden' name='" + element.attr('id_column').replace('_X_', grid_row_number).replace('[]', '[' + item['key'] + ']') + "' value='" + item['id'] + "' >" : "")
                    + str
                    + "<p class='value'>" + item['name'] + "</p></li>";
                    counter++;

                },
                onResult: function(result) {
                    var rows = [];
                    if ($.isset(result) && $.isset(result.paginate) && $.isset(result.paginate.data) && $.isArray(result.paginate.data)) {
                        var popupSelect = element.closest('td').find('.tokeninput-popup-select');
                        $.each(result.paginate.data, function(k, v) {
                            rows.push({
                                'key': v[result.paginate.primary_key],
                                'name': v[result.paginate.display_field],
                                'model': popupSelect.val()
                            });
                        });
                    } else {
                        rows = result;
                    }
                    return rows;
                }
            };
            $(this).removeClass('.tokeninput').tokenInput(
                function(searchTerm) {
                    var href = '';
                    var q = '';
                    var td = $(element).closest('td');
                    var term = [];
                    var termP = [];
                    for (var i = 0; i < termP.length; i++) {
                        term.push($.trim(termP[i].split('[')[0]));
                    }
                    term = term.join('/');
                    var popupSelect = td.find('.tokeninput-popup-select');
                    if (popupSelect.length > 0) {
                        var option = popupSelect.find("option:selected");
                        href = option.attr('href');
                        q = option.attr('q');
                    } else {
                        href = $(element).attr('href');
                        q = $(element).attr('q');
                    }
                    var inline_search = $(element).attr('inline_search');
                    if ($.isset(inline_search) && inline_search == 0) {
                        return false;
                    }
                    q = decodeURIComponent(q);
                    if (href != '') {
                        if ($.trim(q) == '' || !$.isset(q))
                            q = '{}';
                        q = parseJSON(q);
                        if (!$.isPlainObject(q))
                            q = {};
                        q["paginate_as"] = "lazy";
                        q['limit'] = 20;
                        q['fields'] = ['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}', '{{MODEL}}' + '.' + '{{PRIMARY_KEY}}'];
                        if (!$.isset(q['where'])) {
                            q['where'] = [];
                        }
                        where = {};
                        if (searchTerm != '') {
                            where['{{MODEL}}' + '.' + '{{DISPLAY_FIELD}}' + ' LIKE '] = searchTerm;
                        }
                        q['fetch'] = 1;
                        q['autocomplete'] = 1;
                        q['where'] = $.mergeAll([q['where'], where]);
                        var concatTextValue = parseInt(element.attr('concat_text_value'));
                        $(element).data('q', q);
                        $(element).triggerHandler('beforeSearch');
                        q = $(element).data('q');
                        if (href.indexOf('?') !== -1) {
                            href = href.replace('?', '.json?');
                        } else {
                            href = href + '.json?';
                        }
                        href = href + '&q=' + encodeURIComponent(JSON.stringify(q));
                        return href;
                    }
                }, properties);

        });


        container.find("input.tagsinput").not('.template-element').not('[readonly]')
        .each(function() {
            //var element = $(this);
            //var prepopulate = JSON.parse($(this).attr('prepopulate'));
            var url = $(this).attr('autocomplete_url') + '.json';
            var properties = {
            //   'autocomplete_url':url
            };
            $(this).tagsInput(properties);
        });




        var blocks = container.find('.block');

        blocks.not('.grid').not('.listview-block').each(function() {
            $(this).find('tr:last>td').css('border-bottom', '0px');

        });
        //ui-state-highlight
        container.find('.field-tooltip').each(function() {
            if ($(this).is('span') || $(this).is('th')) {
                var iconClass = $(this).attr('icon_class');
                if ($.trim(iconClass) == "") {
                    iconClass = " ui-icon-info ";
                }
                if (iconClass != 'no-icon') {
                    $(this).html("");
                    $(this).addClass('ui-icon ' + iconClass + ' display-inline-block');
                } else {
                    $(this).addClass(' ' + iconClass + ' display-inline-block');
                }
                $(this).wrap('<div class="field-tooltip-container">');
                var title = $(this).attr('title');
                $(this).tooltip({
                    'content': title,
                    'hide': {
                        'duration': parseInt(CONFIG.tooltip_fadeout_duration)
                    }
                });
            } else if ($(this).is('[disabled]')) {
                var position = $(this).position();
                var overlay = $('<div style="position:absolute;width:' + ($(this).width() + 5) + 'px;height:' + ($(this).height() + 5) + 'px;top:' + position.top + 'px;left:' + position.left + 'px;z-index:1000;"></div>');
                $(this).before(overlay);
                overlay.tooltip({
                    'content': $(this).attr('title'),
                    'hide': {
                        'duration': parseInt(CONFIG.tooltip_fadeout_duration)
                    }
                });
                $(this).removeAttr('title').removeClass('field-tooltip');
            } else {
                $(this).tooltip({
                    'hide': {
                        'duration': parseInt(CONFIG.tooltip_fadeout_duration)
                    }
                });
            }
        });

        container.find('.ui-tabs').each(function(){
            $tab=jQuery(this);
            $tab.find(".ui-tabs-anchor").each(function(){
                $tabAnchor=jQuery(this);
                var url=$tabAnchor.attr('url');
                if($tab.find(url).is(":empty")){
                    $tab.find(url).remove();
                   $tabAnchor.parents("li:first").remove();
                }
            });
        });

        container.find('textarea[editor="form-builder"]').each(function(){
            $textarea=jQuery(this);
            $textarea.hide();
            var iframe = document.createElement('iframe');
            var iframeID=uuidv4();
            iframe.src = '/node_modules/formBuilder/form-builder.html?uuid='+iframeID;
            iframe.style='height:600px;width:100%;border:none;';
            iframe.id="form-builder-editor-"+iframeID;
            $textarea.after(iframe);
        
            var modelFields=jQuery('[name="data[web_forms][model_fields]"]').val();
            if(modelFields==""){
                modelFields='[]';
            }
            modelFields=JSON.parse(modelFields);
            var formData=$textarea.val();
            if(formData ==""){
                formData='[]';
            }
            formData=JSON.parse(formData);
            var formOptions=JSON.stringify({"mode":($textarea.is(":disabled")?"render":"edtor"),"modelFields":modelFields,"formData":formData});
            var receiveMessage=function(event) {
                    if(event.data =="init"){
                        iframe.contentWindow.postMessage(formOptions,"*");
                    }else{
                        $textarea.val(event.data);
                    }
            };
            window.addEventListener('message',receiveMessage, true);
        });

        

        container.find('.cell-info-grid').has('.block').not('.mp').css({
            'margin': 0,
            'padding': 0
        });
        //for triggering click on first tab to open the listview on the first tab having class open_on_focus

        var form = container.find('form');
        if (form.length > 0) {
            var reload_triggered_by = form.attr('reload_triggered_by');
            var tabsActive = [];
            if (reload_triggered_by != '') {
                var id = form.find('[name="' + reload_triggered_by + '"]').closest('.ui-tabs-panel').attr('id');
                if (id != "") {
                    tabsActive = form.find('.ui-tabs-anchor').filter('[url=#' + id + ']');
                    if (tabsActive.length > 0) {
                        tabsActive.trigger('click');
                    }
                }
            }
            if(tabsActive.length ==0){
                form.find('.ui-tabs-active').find('a').trigger('click');
            }
        }
        initChart(container);




    }




    /**
     * Initialize form fields for first load of document
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.initFields($('body'));


    /**
     * UUID generator
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.uu = function() {
        var c = "89ab";
        var u = [];
        for (var i = 0; i < 36; i++) {
            u[i] = (Math.random() * 16 | 0).toString(16);
        }
        u[8] = u[13] = u[18] = u[23] = "-";
        u[14] = "4";
        u[19] = c.charAt((Math.random() * 4 | 0));
        return u.join("");
    };
    /**
     * Initialize model view
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.jsContainer = function(html, params) {
        log('jsContainer');

        var uuid = $.uu();
        var params = params || {};
        var defaults = {
            autoOpen: false,
            modal: true,
            width: 'auto',
            dialogClass: 'no-close',
            buttons: {}
        };
        var setting = $.extend(false, defaults, params);
        var pos = $('.ui-dialog:visible').filter(':last').position();
        $("body").append('<div id="' + uuid + '" class="js-container"><span class="content">Records</span></p></div>');
        $("#" + uuid).find(".content").html(html);
        if ($.isset(setting['maxHeight'])) {
            if ($('#' + uuid).height() > setting['maxHeight']) {
                //setting['height']=setting['maxHeight']
            }
        }
        if ($.isset(setting['maxWidth'])) {
            if ($('#' + uuid).width() > setting['maxWidth']) {
                setting['width'] = setting['maxWidth']
            }
        }
        var isChildDialogWindow=$('.ui-dialog:visible').filter(':last').length > 0?true:false;
        if(!isChildDialogWindow && (setting['width']=='auto' || setting['width'] > 700)){
            setting['width'] = $(document).width()-10;
            setting['height'] = $(window).height()-10;
            setting['top'] = '0px';
            setting['left'] ='0px';
        }

        setting["close"] = function(event, ui) {
            $('#main-panel').removeClass('passive');
            $(this).dialog('destroy').remove();
        }
        $("#" + uuid).dialog(setting).dialog('open');
        $('#main-panel').addClass('passive');
        //To remove this hidden property and activate the default property of overflow the changes are made on line number 9519 in jquery-ui.js
        $('body').css('overflow', 'auto');
        if(!isChildDialogWindow && (setting['width']=='auto' || setting['width'] > 700)){
            $('.ui-dialog:visible').filter(':last').css('top', 0).css('left', 0);
        }
        if ($.isPlainObject(pos)) {
            var ld = $('.ui-dialog:visible').filter(':last');
            if(isChildDialogWindow){
                if (ld.width() > 400 && $(document).width() > (pos.left + 30 + ld.width() + 30)) {
                    ld.css('top', pos.top + 30).css('left', pos.left + 30);
                }
            }
        }
        return uuid;
    };

    /**
     * Serializes form input into object
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.fn.serializeObject = function() {
        log('serializeObject');

        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            }
            else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    /**
     *
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     * @eg. $.addObserver({"name":"tushar","onChanged":function(url){console.log(this.name+"--->"+url);}});
     */

    $.observers = {};
    $.addObserver = function(key, observer) {
        $.observers[key] = observer;
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.notifyObservers = function(url, ignore) {
        var url = $.trim(url);
        var ignore = ignore || [];
        if ($.isset($.observers)) {
            $.each($.observers, function(key, object) {
                if ($.inArray(key, ignore) == -1 && $.isset(object) && typeof object.notify == "function") {
                    object.notify(url);
                }
            });
        }
    }

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */








    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.splitHtmlScript = function(data) {
        log('splitHtmlScript');
        if (typeof data == undefined)
            data = '';
        var html = "";
        var script = "";
        var urls = [];
        try {
            var html = data.replace(/<script\s*[^>]*>([\S\s]*?)<\/script>/ig, "").replace(/<link\s*[^>]*>/ig, "");   //data.split('<script type="text/javascript">')[0];
            var match = data.match(/<script\s*[^>]*>([\S\s]*?)<\/script>/ig);
            if (match != null) {
                $.each(match, function(k, v) {
                    if (v.indexOf("src=") !== -1) {
                        var src = $(v).attr("src");
                        if (src != "")
                            ;
                        urls.push(src);
                    }
                });
            }
            script = (match != null ? match.join("").replace(/<script\s*[^>]*>/ig, "").replace(/<\/script>/ig, "") : "");
            var match = data.match(/<link\s*[^>]*>/ig);
            if (match != null) {
                $.each(match, function(k, v) {
                    if (v.indexOf("stylesheet") !== -1) {
                        $("head").append(v);
                    }
                });
            }
        } catch (e) {

        }
        return {
            "html": html,
            "script": script,
            urls: urls
        };
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.loadFiles = function(params) {
        log('loadFiles');

        var defaults = {
            oncomplete: {},
            params: {}
        };
        this.settings = $.extend(true, defaults, params);
        this.filesToLoad = this.settings.files.length;
        this.filesLoaded = 0;
        if (this.filesLoaded != this.filesToLoad) {
            (function(obj) {
                $.each(obj.settings.files, function(k, url) {
                    $.ajax({
                        url: url,
                        dataType: 'script',
                        success: function() {
                            obj.filesLoaded++;
                            if (obj.filesToLoad == obj.filesLoaded) {
                                if (typeof obj.settings.oncomplete == "function") {
                                    obj.settings.oncomplete.call(obj, obj.settings.params);
                                }
                            }
                        }
                    });
                });
            })(this);
        } else {
            if (typeof this.settings.oncomplete == "function") {
                this.settings.oncomplete.call(this, this.settings.params);
            }
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', '.ajax-filter-popup', function(event) {
        var href = $(this).attr('href');
        var searchView = $(this).attr('search_view');
        var _query = $('#' + searchView).attr('_query');
        $.ajaxPopup($(this).attr('ajax', 1), href + '&_query=' + _query);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', ".save-list-record", function(event) {
        var row = $(this).closest('.record-row');
        var primaryKey = row.attr('primary_key');
        var href = row.attr('href');
        console.log(href);
        if (href.indexOf('/view') !== -1) {
            href = href.replace('/view', '/edit_selected').split('?')[0];
        } else if (href.indexOf('/edit') !== -1) {
            href = href.replace('/edit', '/edit_selected').split('?')[0];
        } else {
            href = href.replace('/index', '/edit_selected').split('?')[0];
        }
        console.log(href);
        var payload = row.find(':input').serializeObject();
        $.post(href + '?id=' + primaryKey, payload, function(data) {
            if ($.isset(data)) {
                if (typeof (data) === "object") {
                    showMessage(data);
                }
            }
        });
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $(document).on('click', ".click-record-column,[ajax_popup=1],.ajax-popup,.delete,[ajax=1],button[href],.require_confirmation", function(event) {
        log('click -> .click-record-column,[ajax_popup=1],.ajax-popup,.delete,[ajax=1],button[href]');
        if (!$(event.target).hasClass('ignore-click')) {
            if ($(this).hasClass('click-record-column') || $(this).hasClass('ajax-popup') || $(this).hasClass('delete') || $(this).is('[ajax_popup=1]') || $(this).is('[ajax=1]')) {
                if ($(this).hasClass('no-ajax-popup')) {
                    $.ajaxPopup($(this).attr('ajax', 0));
                } else {
                    $.ajaxPopup($(this).attr('ajax', 1));

                }
            } else if ($(this).hasClass('require_confirmation')) {
                $.ajaxPopup($(this));
            } else {
                document.location.href = $(this).attr('href');
            }
            event.stopImmediatePropagation();
            event.stopPropagation();
            return false;

        }
    });
    $(document).on('click', '#controller-action-panel button[href]', function(event) {
        log('click -> #controller-action-panel button[href]');
        document.location.href = $(this).attr('href');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '[name ="data[action][cancel]"]', function(event) {
        log('click -> [name ="data[action][cancel]"]');
        var jscontainer = $(this).closest('.js-container');
        if (jscontainer.length > 0) {
            $('#' + jscontainer.attr('id')).dialog("destroy").remove();
        } else {
            var http_referer = $(this).attr('href');
            if (typeof (http_referer) == 'undefined' || http_referer == "") {
                http_referer = $("#http_referer").val();
                if (http_referer == "") {
                    http_referer = $.config['base'] + $.config['module'] + "/" + $.config['controller'];
                }
                if (http_referer.indexOf('/edit') != -1) {
                    http_referer = http_referer.replace('/edit', '/index');
                }
            }
            document.location.href = http_referer;

        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */
    $.buildURL = function(href, part) {
        if (href.indexOf('?') == -1) {
            href += '?';
        }
        $.each(part, function(k, v) {
            if ($.isArray(v)) {
                var vLength = v.length;
                for (var i = 0; i < vLength; i++) {
                    href += '&' + k + '[]=' + v[i];
                }
            }
            else {
                href += '&' + k + '=' + v;
            }
        });
        return href;
    }

    $.deleteRecord = function(object, href, table) {
        log('deleteRecord');

        //var href=$(object).attr('href');
        var ajax = $(object).attr('ajax');
        var tr = $(object).closest('tr');
        if (!$.isset(table)) {
            var table = $(object).closest('table.listview');
        }

        var isTree = table.hasClass('tree');
        var twisty = false;
        if (isTree) {
            var active_level = tr.attr('active_level');
            if ($.isset(active_level) && parseInt(active_level) > 0) {
                active_level = parseInt(active_level);
                active_level = active_level - 1;
                tr = tr.prev();
                var level = tr.attr('active_level');
                if (!$.isset(level))
                    level = 0;
                while (parseInt(level) >= active_level) {
                    if (parseInt(level) == active_level) {

                        twisty = (tr.find('.twisty-open').length > 0 ? tr.find('.twisty-open') : (tr.find('.twisty-close').length > 0 ? tr.find('.twisty-close') : false));
                        if (twisty === false) {
                            twisty = (tr.find('.twisty-open-last').length > 0 ? tr.find('.twisty-open-last') : (tr.find('.twisty-close-last').length > 0 ? tr.find('.twisty-close-last') : false));

                        }
                        break;
                    }
                    tr = tr.prev();
                    level = tr.attr('active_level');
                    if (!$.isset(level))
                        level = 0;
                }
            }

        }
        var params = {
            "width": 250 + "px"
        };

        params['href'] = href;
        params['table_id'] = $(table).attr('id');
        params['panel'] = $(object).closest('.panel');

        params['buttons'] = {
            'Yes': function() {
                $(this).dialog('destroy').remove();
                if (href.indexOf('?') == -1) {
                    href += '?';
                }
                href += '&is_confirm=1';
                if ($.isset(ajax) && ajax == "0") {
                    document.location.href = href;
                } else {
                    $.get(href, function(data) {
                        if (typeof (data) === "object") {
                            showMessage(data);
                            if (typeof (data['javascript']) != 'undefined') {
                                try {
                                    eval(data['javascript']);
                                } catch (e) {

                                }
                            }
                            if (twisty !== false) {
                                if (twisty.hasClass('twisty-open') || twisty.hasClass('twisty-open-last')) {
                                    var tr = $(object).closest('tr');
                                    var al = tr.attr('active_level');
                                    var paginationRow = tr.nextAll('[active_level="' + al + '"]').filter('.pagination-row:first');
                                    if (paginationRow.length > 0) {
                                        paginationRow.find('.active-paginate-link').trigger('click');
                                    } else {
                                        twisty.trigger('click').trigger('click');
                                    }
                                } else {
                                    twisty.trigger('click');
                                }
                            } else {
                                if ($("#" + params['table_id']).length > 0) {
                                    $("#" + params['table_id']).trigger('reload');
                                } else if (params['panel'].length > 0) {
                                    document.location.href = href.replace('/delete', '/index');
                                }
                            //find('.active-paginate-link:first').trigger('click');
                            }

                        }
                    });
                }
            },
            'No': function() {
                $(this).dialog('destroy').remove();
            }
        };

        var confirmationMessage = $(object).attr('confirmation_message');
        if ($.isEmpty(confirmationMessage)) {
            confirmationMessage = 'Do you want to delete';
        }
        var uuid = $.jsContainer(confirmationMessage, params);

    }
    $.ajaxPopup = function(object, href, table) {
        log('ajaxPopup');

        if ($(object).is(':disabled') || $(object).hasClass('ui-state-disabled')) {
            return false;
        }
        if (!$.isset(href)) {
            var href = $(object).attr('href');
        }
        if (!$.isset(href)) {
            var href = $(object).parents(':first').attr('href');
        }
        $(object).triggerHandler('urlParameters');
        var parameters = $(object).data('url_parameters');
        if ($.isset(parameters)) {
            href += (href.indexOf('?') == -1 ? '?' : '');
            if ($.isPlainObject(parameters)) {
                $.each(parameters, function(k, v) {
                    href += '&' + k + '=' + v;
                });
            } else {
                href += '&' + parameters;
            }
        }

        var twisty = false;
        var listviewTableId = false;
        var baseTableID='';
        var form = $(object).closest('form');
        if(form.length){
            var parser = document.createElement("a");
            parser.href = form.attr('action');
            var searchParams=parser.search.substring(1);
            var urlParams={};
            if(searchParams){
                jQuery.each(searchParams.split("&"),function(k,v){
                    var v=v.split("=");
                    if(v.length==2){
                        urlParams[v[0]]=v[1];
                    }
                });
            }
            if(urlParams["search_view"]){
                var tempBaseTable=$('#'+urlParams["search_view"]);
                if (tempBaseTable.hasClass('listview')) {
                    baseTableID =  tempBaseTable.attr('id');
                } else {
                    baseTableID =  tempBaseTable.find('.listview').attr('id');
                }                   
            }
        }

        if (!$.isset(table)) {
            var table = $(object).closest('table');
        }
        var ajax = $(object).attr('ajax');
        var needConfirmation = false;

        var method = 'get';
        var payload = {};

        // || $(object).hasClass('action')
        var isDeleteAction = false;
        if ($(object).hasClass('delete') || href.indexOf('/delete') != -1) {
            isDeleteAction = true;
        }
        if ($(object).hasClass('sub-action')) {
            var ids = [];
            var uids = [];
            var searchView = $(object).closest('.action-bar').attr('search_view');
            table = $('#' + searchView);
            table.find('.lco').each(function(k, v) {
                if ($(this).is(':checked')) {
                    payload['id[' + k + ']'] = $(this).val();
                    ids.push($(this).val());
                } else {
                    payload['uid[' + k + ']'] = $(this).val();
                //uids.push($(this).val());
                }
            });
            var form_document_id = $(object).closest('form').find('.form_document_id').val();
            var select_all_records_query = parseJSON(decodeURIComponent(table.find('.lca').val()));
            select_all_records_query['fields'] = ["{{MODEL}}.{{PRIMARY_KEY}}"];
            if (document.location.href.indexOf('/_report') == -1) {
                select_all_records_query['view_controller'] = 'core/listviews';
            } else {
                select_all_records_query['view_controller'] = 'analytics/reports';
            }
            select_all_records_query['view_id'] = table.attr('listview_id');
            console.log(select_all_records_query);
            var select_all_records = $('#select_all_records-' + searchView).find(':checked').length;
            if (isDeleteAction) {
                href = $.buildURL(href, {
                    'id': ids,
                    'related_to': form_document_id,
                    'select_all_records': select_all_records,
                    'q': encodeURIComponent(JSON.stringify(select_all_records_query))
                });
            } else {
                href = $.buildURL(href, {
                    'related_to': form_document_id,
                    'select_all_records': select_all_records,
                    'q': encodeURIComponent(JSON.stringify(select_all_records_query))
                });
            }
            payload['data[action][reload]'] = "reload";
            payload['data[listview_id]'] = table.attr('listview_id');
            method = 'post';
        }
        if (isDeleteAction) {
            $.deleteRecord(object, href, table);
            return;
        }
        var isTree = table.hasClass('tree') || table.hasClass('categorized');
        var tr = $(object).closest('tr');


        if (isTree) {
            if ($(object).hasClass('add')) {
                href = href.split('/id:')[0];
                href += '?related_id=' + $(object).closest('tr').attr('primary_key')
                + '&related_model=' + $(object).closest('.listview').attr('parent');
                twisty = (tr.find('.twisty-open').length > 0 ?
                    tr.find('.twisty-open') : (tr.find('.twisty-close').length > 0 ? tr.find('.twisty-close') : false));
                if (twisty === false) {
                    twisty = (tr.find('.twisty-open-last').length > 0 ?
                        tr.find('.twisty-open-last') : (tr.find('.twisty-close-last').length > 0 ? tr.find('.twisty-close-last') : false));

                }
            } else {
                var active_level = tr.attr('active_level');
                if ($.isset(active_level) && parseInt(active_level) > 0) {
                    active_level = parseInt(active_level);
                    active_level = active_level - 1;
                    tr = tr.prev();
                    var level = tr.attr('active_level');
                    if (!$.isset(level))
                        level = 0;
                    while (parseInt(level) >= active_level) {
                        if (parseInt(level) == active_level) {
                            twisty = (tr.find('.twisty-open').length > 0 ? tr.find('.twisty-open') : (tr.find('.twisty-close').length > 0 ? tr.find('.twisty-close') : false));
                            if (twisty === false) {
                                twisty = (tr.find('.twisty-open-last').length > 0 ? tr.find('.twisty-open-last') : (tr.find('.twisty-close-last').length > 0 ? tr.find('.twisty-close-last') : false));
                            }
                            break;
                        }
                        tr = tr.prev();
                        level = tr.attr('active_level');
                        if (!$.isset(level))
                            level = 0;
                    }
                }
            }
        }
        needConfirmation = $(object).hasClass('delete') || $(object).hasClass('require_confirmation');
        if (twisty === false) {
            if (table.hasClass('listview')) {
                listviewTableId = table.attr('id');
            } else {
                listviewTableId = table.find('.listview').attr('id');
            }
            if (listviewTableId === false || $.trim(listviewTableId) == "") {
                var listviews = $('table.listview');
                if (listviews.length == 1) {
                    listviewTableId = listviews.attr('id');
                }
            }
        }


        if (needConfirmation == true) {
            var params = {
                "width": 250 + "px"
            };

            params['href'] = href;
            params['table_id'] = $(object).closest('table.listview').attr('id');
            params['buttons'] = {
                'Yes': function() {
                    $(this).dialog('destroy').remove();
                    if (href.indexOf('?') == -1) {
                        href += '?';
                    }
                    href += '&is_confirm=1';
                    if ($.isset(ajax) && ajax == "0") {
                        document.location.href = href;
                    } else {
                        $[method](href, payload, function(data) {

                            if ($(object).attr('close_dialog') == 1) {
                                $(object).closest('.js-container').dialog("destroy").remove();
                            }
                            
                            if (typeof data == 'object') {
                                $.afterSaveAjaxForm({
                                    'object': object,
                                    'data': data,
                                    'uuid': 'xxx',
                                    'listview_table_id': listviewTableId,
                                    'base_table_id':baseTableID,
                                    'twisty': twisty,
                                    'href': href
                                });
                            } else {
                                $.initAjaxForm({
                                    'object': object,
                                    'data': data,
                                    'listview_table_id': listviewTableId,
                                    'base_table_id':baseTableID,
                                    'twisty': twisty,
                                    'href': href,
                                    'init': true
                                });
                            }
                        });
                    }
                },
                'No': function() {
                    $(this).dialog('destroy').remove();
                }
            };
            var confirmationMessage = $(object).attr('confirmation_message');
            if ($.isEmpty(confirmationMessage)) {
                confirmationMessage = 'Do you want continue';
            }
            var uuid = $.jsContainer(confirmationMessage, params);
        } else {
            if ($.isset(ajax) && ajax == "0") {
                document.location.href = href;
            }
            else {
                $[method](href, payload, function(data) {
                    if ($(object).attr('close_dialog') == 1) {
                        $(object).closest('.js-container').dialog("destroy").remove();
                    }
                    if (typeof data == 'object') {
                        $.afterSaveAjaxForm({
                            'object': object,
                            'data': data,
                            'uuid': 'xxx',
                            'listview_table_id': listviewTableId,
                            'base_table_id':baseTableID,
                            'twisty': twisty,
                            'href': href
                        });
                    } else {
                        $.initAjaxForm({
                            'object': object,
                            'data': data,
                            'listview_table_id': listviewTableId,
                            'base_table_id':baseTableID,
                            'twisty': twisty,
                            'href': href,
                            'init': true
                        });
                    }
                });
            }
        }


    }





    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.initAjaxForm = function(settings) {
        log('initAjaxForm');
        var data = settings['data'] || false;
        var listviewTableId = settings['listview_table_id'] || false;
        var baseTableID = settings['base_table_id']||false;
        var twisty = settings['twisty'] || false;
        var href = settings['href'] || false;
        var containerParams = settings['container_params'] || false;
        var object = settings['object'] || false;
        var init = settings['init'] || false;
        var scripts = settings['scripts'] || {};

        var params = {
            "width": ((parseInt($('body').width()) / 100) * (CONFIG.popup_width_percent || 80)),
            "height": ((parseInt(screen.height) / 100) * (CONFIG.popup_height_percent ? CONFIG.popup_height_percent : 80))
        };

        if ($.isset(containerParams)) {
            params = $.extend(params, containerParams);
        }


        if ($.isset(href)) {
            params['title'] = popupTitle(href);
        }
        if (object !== false && $(object).hasClass('close-dialog')) {
            $(object).closest('.js-container').dialog("destroy").remove();
        }

        var uuid = $.jsContainer(data, params);
        //@tushar Takkar: Load files and eval script once dom is created.
        $.loadFiles({
            files: (typeof (scripts.urls) != "undefined" ? scripts.urls : []),
            params: (typeof (scripts.script) != "undefined" ? scripts.script : ""),
            oncomplete: function(script) {
                if ($.trim(script) != "") {
                    eval(script);
                }
            }
        });
        //@tushar Takkar: Once form is initialized, then invoke plugins.
        $.initFields($('#' + uuid), init);

        var form = $('#' + uuid).find('form:first');
        form.find('[type="submit"]').addClass('ajax-popup-form');
        //if form has file input, activate iframe form submit
        var frame = false;
        if (form.find('input[type="file"]').length > 0 || form.hasClass('iframe')) {
            frame = $.uu();
        }
        if (frame !== false) {
            $('body').append('<iframe name="' + frame + '" id="' + frame + '"  style="display:none" ></iframe>');
            form.attr('target', frame);
            var action = form.attr('action');
            form.attr('action', action + (action.indexOf('?') == -1 ? '?ajax=1' : '&ajax=1'));
        }
        //else use post to submit
        var should_validate = (typeof (settings.href) != 'undefined' && settings.href.split('?')[0].indexOf('edit_selected') == -1) ? true : false;
        if (frame !== false) {
            form.submit(function(event) {
                var form = $(this);
                // Validation on form submit
                if (should_validate === true) {
                    if (!form.valid()) {
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }
                if (form.find('[name="data[forms][properties][formula]"]').length > 0) {
                    form.find('[name="data[forms][properties][formula]"]').val(form.find('[name="data[forms][properties][formula]"]').val().replace(/"/g, '&quot;'));
                }
                $("#ajax-loader").show();

                setTimeout(function() {
                    form.find('[type="submit"]').disable();
                }, 100);
                form.find('.grid-template-row').remove();
                $('#' + frame).one('load', function() {
                    var contents = $('#' + frame).contents().find('body').html();
                    //log(contents);

                    var tags = ['pre', 'textarea'];
                    for (var kkk = 0; kkk < tags.length; kkk++) {
                        var tag = '<' + tags[kkk] + '>';
                        //log(contents.substring(0, (tag.length)));
                        //log(contents.substring(contents.length-tag.length-1));
                        if (contents.substring(0, tag.length) == tag) {
                            contents = contents.substring(tag.length, contents.length - tag.length - 1);
                            break;
                        }
                    }
                    log(contents);
                    contents = html_entity_decode(contents);
                    var contentsObj = parseJSON(contents);

                    if (typeof (contentsObj) === "object") {
                        contents = contentsObj;
                    } else if (contents.substring(0, 1) == '{' && contents.substring(contents.length - 1) == "}") {
                        contents = "";
                    }

                    if (contents == "") {
                        contents = {};
                    }
                    $("#ajax-loader").hide();
                    $.afterSaveAjaxForm({
                        'object': object,
                        'data': contents,
                        'uuid': uuid,
                        'listview_table_id': listviewTableId,
                        'base_table_id':baseTableID,
                        'twisty': twisty,
                        'href': href
                    });
                    $('#' + frame).remove();

                });
            });
        } else {
            form.find('[type="submit"]').click(function(event) {
                var form = $(this).closest('form');
                // Form Validation befor submit
                if (should_validate === true) {
                    if (!form.valid()) {
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    }
                }
                if (form.find('[name="data[forms][properties][formula]"]').length > 0) {
                    form.find('[name="data[forms][properties][formula]"]').val(form.find('[name="data[forms][properties][formula]"]').val().replace(/"/g, '&quot;'));
                }
                var data = $(form).serializeObject();
                data[$(this).attr('name')] = $(this).val();
                setTimeout(function() {
                    form.find('[type="submit"]').disable();
                }, 100);

                /*
                 form.find('[type="submit"]')
                 .click(function(event){
                 event.stopPropagation();
                 event.preventDefault();
                 return false;
                 }).disable(true);
                 */
                form.find('.grid-template-row').remove();
                $.post($(form).attr('action').replace('?ajax=1', '?').replace('&ajax=1', ''), data, function(data) {
                    $.afterSaveAjaxForm({
                        'object': object,
                        'data': data,
                        'uuid': uuid,
                        'listview_table_id': listviewTableId,
                        'base_table_id':baseTableID,
                        'twisty': twisty,
                        'href': href
                    });
                });
                event.stopPropagation();
                return false;
            });
        }
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $.afterSaveAjaxForm = function(settings) {
        log('afterSaveAjaxForm');
        var data = settings['data'] || false;
        var listviewTableId = settings['listview_table_id'] || false;
        var baseTableID = settings['base_table_id']||false;
        var uuid = settings['uuid'] || false;
        var twisty = settings['twisty'] || false;
        var href = settings['href'] || false;
        var containerParams = settings['container_params'] || false;
        var object = settings['object'] || false;

        if ($.isset(uuid))
            $('#' + uuid).dialog("destroy").remove();
        if ($.isset(data)) {
            if (typeof (data) === "object") {
                if (typeof (data['redirect_to_url']) != 'undefined') {
                    var uid = $.uu();
                    $('body').append('<a href="' + data['redirect_to_url'] + '" id="' + uid + '" style="display:none;" class="ajax-popup">Next Action</a>')
                    $('#' + uid).trigger('click');
                    return;
                }

                if (typeof (data['javascript']) != 'undefined') {
                    try {
                        eval(data['javascript']);
                    } catch (e) {

                    }
                }
                showMessage(data);
                if (typeof data['reload'] !== undefined && data['reload'] !== null && data['reload'] == false) {
                    $(object).attr('reload', 0);
                } else if ($.isset(twisty) && twisty !== false) {
                    var tr = twisty.closest('tr');
                    var active_level = tr.attr('active_level');

                    var paginationRow = false;
                    if ($.isset(active_level) && active_level > 0) {
                        active_level = parseInt(active_level);
                        active_level = active_level + 1;
                        tr = tr.next();
                        var level = tr.attr('active_level');
                        if (!$.isset(level))
                            level = 0;
                        while (parseInt(level) >= active_level) {
                            if (parseInt(level) == active_level && tr.hasClass('pagination-row')) {
                                paginationRow = tr.find('.active-paginate-link:first');
                                if (paginationRow.length <= 0) {
                                    paginationRow = false;
                                }
                                break;
                            }
                            tr = tr.next();
                            level = tr.attr('active_level');
                            if (!$.isset(level))
                                level = 0;
                        }
                    }

                    if (paginationRow !== false) {
                        paginationRow.click();
                    } else {
                        if (twisty.hasClass('twisty-open') || twisty.hasClass('twisty-open-last')) {
                            twisty.trigger('click').trigger('click');
                        } else {
                            twisty.trigger('click');
                        }
                        var listview = twisty.closest('.listview');
                        var model = listview.attr('model');
                        if (typeof data['data'] != undefined && data['data'] != null && typeof data['data'][model] != undefined && typeof data['data'][model]['parent_id'] != undefined) {
                            var ptc = listview.find("tr[primary_key=" + data['data'][model]['parent_id'] + "]");
                            var ptwisty = false;
                            ptwisty = ptc.find('.twisty-open');
                            if (ptwisty.length == 0) {
                                ptwisty = ptc.find('.twisty-open-last');
                            }
                            if (ptwisty.length > 0) {
                                ptwisty.trigger('click').trigger('click');
                            } else {
                                ptwisty = ptc.find('.twisty-close');
                                if (ptwisty.length == 0) {
                                    ptwisty = ptc.find('.twisty-close-last');
                                }
                                if (ptwisty.length > 0) {
                                    ptwisty.trigger('click');
                                }
                            }
                        }
                    }
                } else if ($.isset(listviewTableId) && listviewTableId != false) {
                    $("#" + listviewTableId).trigger('reload');
                } else if ($.isset(baseTableID) && baseTableID != false) {
                    $("#" + baseTableID).trigger('reload');
                }

                $(object).trigger('request_end');

            } else {
                var a = $.splitHtmlScript(data);
                $.initAjaxForm({
                    'object': object,
                    'data': a.html,
                    'listview_table_id': listviewTableId,
                    'base_table_id':baseTableID,
                    'twisty': twisty,
                    'href': href,
                    'scripts': a
                });

            }
        }
    }

    $(document).on('reload', '.listview', function() {
        log('reload -> .listview');

        var active_paginate_link = $(this).find('.active-paginate-link:first');
        if (active_paginate_link.length > 0) {
            active_paginate_link.trigger('click');
        } else {
            active_paginate_link = $(this).attr('active_paginate_link');
            if (!$.isEmpty(active_paginate_link)) {
                $(this).find('th:first').append('<a href="' + active_paginate_link + '" class="active-paginate-link ui-helper-hidden">reload</a>');
                $(this).find('.active-paginate-link:first').trigger('click');
            }
        }
    });
    $(document).on('request_end', '.ui-button[ajax=1]', function() {
        log('request_end -> .ui-button[ajax=1]');
        if ($(this).attr('reload') != 0) {
            var actionMenu = $(this).closest('[search_view]');
            if (actionMenu.length > 0) {
                $('#' + actionMenu.attr('search_view')).trigger('reload');
            }
        } else {
            $(this).removeAttr('reload');
        }
    });


    /*
     *	@author	tushar takkar
     *	@todo
     *	@access public
     *	@param .
     *	@return
     *	@internal . This function is use to get list of all attributes of note as a javascript object.
     */
    $.fn.attrs = function(events) {
        var events = events || false;
        var attributes = {};
        var attrs = $(this).get(0).attributes;
        $.each(attrs, function(k, v) {
            if (events === true)
                attributes[v.nodeName] = v.nodeValue;
            else {
                if (v.nodeName.indexOf('on') == -1)
                    attributes[v.nodeName] = v.nodeValue;
            }
        });
        return attributes;
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    function resizeHomePanel() {
        log('resizeHomePanel');

        var homePanelWidth = $('.home-panel').width() / 3;
        homePanelWidth = homePanelWidth - 10;
        $('.home-panel').find('td').each(function() {
            $(this).width((homePanelWidth * $(this).attr('colspan')));
        });

        $('.home-content-container').each(function() {
            var width = $(this).parents(':first').width();
            $(this).width(width - 5);
            $(this).find('div:first').width(width - 5);
        });
    }
    //resizeHomePanel();


    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    //initChart($(document));

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */



    $(document).on('click', '.grid-row-up', function(event) {
        log('click -> .grid-row-up');
        var grid = $(this).closest('.grid');
        var tr = $(this).closest('.last-data-row');
        if (!tr.prev().hasClass('grid-template-row')) {
            tr.prev().before(tr);
            gridSequence(grid);
            grid.trigger('row_moveup');
            grid.trigger('change');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', '.grid-row-down', function(event) {
        log('click -> .grid-row-down');
        var grid = $(this).closest('.grid');
        var tr = $(this).closest('.last-data-row');
        if (!tr.next().hasClass('grid-action-row')) {
            tr.next().after(tr);
            gridSequence(grid);
            grid.trigger('row_movedown');
            grid.trigger('change');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', '.grid-row-delete', function(event) {
        $(this).closest('.last-data-row').trigger('grid_row_delete');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('grid_row_delete', '.last-data-row', function(event) {
        log('click -> .grid-row-delete');
        var grid = $(this).closest('.grid');
        var min = grid.attr('min');
        var tr = $(this);
        if (!isNaN(min)) {
            if ((gridRows(grid) <= min)) {
                $.jsContainer('<span>Minimum number of allowed rows are ' + min + '</span>');
                return;
            }
        }
        var primary = tr.find(".primary:first").val();
        if (!$.isset(primary) || primary == '') {
            tr.remove();
        } else {
            tr.removeClass('last-data-row').hide().find(".deleted:first").val(1).end();
        }
        gridSequence(grid);
        grid.trigger('row_delete');
        if (grid.attr('trigger_change') != 0) {
            grid.trigger('change');
        }

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    //$(document).on('grid_row_add', '.grid', function(event) {
    //    $(this).find('.grid-row-add:first').triggerHandler('click');
    //});

    $(document).on('click', '.grid-row-add', function(event) {
        log('click -> .grid-row-add');
        $(this).closest('.grid').trigger('grid_row_add');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('grid_row_add', '.grid', function(event,data) {
        var grid = $(this);
        console.log(data);
        var gridId = grid.attr('id');
        var max = grid.attr('max');
        if (!isNaN(max)) {
            if (!(gridRows(grid) < max)) {
                $.jsContainer('<span>Maximum number of allowed rows are ' + max + '</span>');
                return;
            }
        }
        var count = $('#row_counter_' + gridId).val();
        if (count == null) {
            count = -1;
        }
        count++;

        $('#row_counter_' + gridId).val(count);
        var after = {};
        if (grid.find('.last-data-row:last').length > 0) {
            after = grid.find('.last-data-row:last')
        } else {
            after = grid.find('.grid-template-row:last');
        }
        var clone = grid.find('.grid-template-row').clone(true).removeClass('grid-template-row')
        .addClass('last-data-row')
        .find(':input').each(function() {

            var name = $(this).attr('name');
            var id = $(this).attr('id');
            if (name != null && name != '') {
                $(this).attr('name', name.replace('[_X_]', '[' + count + ']'))
                .removeAttr('disabled').filter('[is_disabled="1"]')
                .attr('disabled', 'disabled');
            }
            if (id != null && id != '') {
                $(this).attr('id', id.replace('_X_', '' + count + ''));
            }
            $(this).attr('grid_row_number', count);
            $(this).removeClass('template-element');

        }).end().insertAfter(after);
        $.initFields(grid.find('.last-data-row:last').show());
        gridSequence(grid);
        //$.initFields(clone);
        grid.trigger('row_add');
        if (grid.attr('trigger_change') != 0) {
            grid.trigger('change');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });


    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    function gridSequence(grid) {
        log('gridSequence');

        grid.find('.last-data-row').each(function(i, k) {
            $.each($(this).find('.cell-seq-grid:first').find('.sequence'), function(k, v) {
                if ($(this).is('input')) {
                    $(this).val((i + 1));
                } else {
                    $(this).text((i + 1));
                }
            });
        });
    }
    function gridRows(grid) {
        log('gridRows');

        var count = 0;
        grid.find('.last-data-row').each(function(i, k) {
            if ($(this).find(".deleted:first").val() != 1) {
                count++;
            }
        });
        return count;
    }
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $('.continuous-paginate').scroll(function(event) {
        log('continuous-paginate');
        var scrollHeight = $(this).get(0).scrollHeight;
        var scrollTop = $(this).scrollTop();
        var href = $(this).attr('href');
        var is_paging = $(this).attr('is_paging');
        var scroll = $(this);
        if (is_paging != null && is_paging == 1)
            return;
        if (scrollHeight - scrollTop > 600) {
            return;
        } else {
            if (href == '')
                return;
            scroll.attr('is_paging', 1);
            href = href.split('/page:');
            var param = href[1].split('?');
            var page = (parseInt(param[0]) + 1);
            href = href[0] + '/page:' + page + '?' + param[1];
            scroll.find('.pagination-row > td').append('&nbsp;<a class="continuous-paginate-link" href="#">' + page + '</a>&nbsp;');
            $.get(href, function(data) {
                var data = $(data);
                scroll.attr('href', data.attr('href'));
                data.find('.listview:first').find('.record-row').addClass('continuous-page-' + page).insertBefore(scroll.find('.listview:first').find('tr:last'));
                scroll.attr('is_paging', 0);
            });
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    /**
     * @author Tushar Takkar<ttakkar@primarymodules.com>
     */

    $(document).on('click', '.continuous-paginate-link', function(event) {
        log('click -> .continuous-paginate-link');
        var continuousPaginate = $(this).closest('.continuous-paginate');
        var page = parseInt($(this).text());
        var scrollTop = continuousPaginate.find('.continuous-page-' + page).position();
        scrollTop = Math.ceil(scrollTop['top']) - 200;
        continuousPaginate.scrollTop(scrollTop);

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    //$('#calculator').calculator({showOn: 'focus'});

    $("#reset-current-filter").click(function(event) {
        log('#reset-current-filter');

        $('#current-filter-id').val('');
        $('#current-filter').val('');

        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });



    $('#data-current_listview').change(function() {
        document.location.href = $.config['base'] + $.config['module'] + '/' + $.config['controller'] + '/index?current_listview=' + $(this).val();
    });

    $(document).on('change', '[on_change_reload_form=1]', function(event) {
        log('change -> [on_change_reload_form=1]');

        var form = $(this)
        .closest('form');
        // preventing form jquery form validation 
        form.validate().currentForm = '';
        var button = form.find('input[name="data[action][reload]"]:first');
        if (button.length == 0) {
            form.prepend('<input type="hidden" name="data[action][reload]" value="' + $(this).attr('name') + '" >');
        } else {
            button.val($(this).attr('name'));
        }
        var button = form.find('[type="submit"]:first');
        if (button.length == 0) {
            form.prepend('<input type="submit" name="submit" style="display:none;">');
            button = form.find('[type="submit"]:first');
        }

        if (button.hasClass('ajax-popup-form')) {
            button.trigger('click');
        //button.triggerHandler('click');
        } else {
            button.trigger('click');
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $('.no-enter-submit').bind('keypress', function(event) {
        if (event.which == 13)
            event.preventDefault();
    });


    $(document).on('keypress', '.search_basic_view_set', function(event) {
        log('keypress -> .search_basic_view_set');

        if (event.which == 13) {
            event.preventDefault();
            $(this).parents(':first').find('.search_trigger').trigger('click');
        }
    });

    initMessagePanel();

    $(document).on('click', '.ui-tabs-anchor', function(event) {
        log('click -> .ui-tabs-anchor');
        $($(this).attr('href')).find('.show-dashboard-listview').trigger('click');
    });

    $(document).on('click', '.ui-tabs-anchor', function(event) {
        log('click -> .ui-tabs-anchor');
        $($(this).attr('href')).find('.show-listview').each(function() {
            if ($(this).hasClass('open_on_focus')) {
                $(this).closest('fieldset').find('.collapsible').trigger('click');
            }
        });
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;

    });


    $(document).on('click', '.collapsible', function(event) {
        log('click -> .collapsible');
        var block = '';
        if ($(this).parents('legend').length > 0) {
            block = $(this).closest('fieldset').find('.block:first');
            if (block.length == 0) {
                block = $(this).closest('fieldset').find('div:first');
            }
        } else {
            block = $(this).closest('.block');
        }

        if ($(this).hasClass('ui-icon-circle-plus')) {
            $(this).removeClass('ui-icon-circle-plus')
            .addClass('ui-icon-circle-minus');
            if (block.is('div')) {
                block.removeClass('collapsible-hide').show().find('.show-listview').trigger('click')
            } else {
                block.find('tr:first').parents(':first').children('tr.collapsible-hide').removeClass('collapsible-hide').show().end().find('.show-listview').trigger('click');
            }
            block.find('[editor="WYSIWYG"]').not('.template-element').each(function() {
                var editor = $(this).cleditor()[0];
                editor.refresh();
            });
        } else {
            $(this).removeClass('ui-icon-circle-minus').addClass('ui-icon-circle-plus');
            if (block.is('div')) {
                block.addClass('collapsible-hide').hide();
            } else {
                block.find('tr:first').parents(':first').children('tr:visible').not('.block-header').addClass('collapsible-hide').hide();
            }

        }
        event.preventDefault();
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    setTimeout(function() {
        $('.sub-listview .twisty-close,.sub-listview .twisty-close-last').trigger('click');

    }, CONFIG['delay_load_left_panel']);

    $(document).on('click', '.search-row-trigger', function(event) {
        log('click -> .search-row-trigger');
        var searchRow = $(this).closest('.listview').find('.search-row:first');
        if (searchRow.is(':visible')) {
            searchRow.hide();
        } else {
            searchRow.show();
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
    $(document).on('click', '.erase_search_inline_column', function(event) {
        log('click -> .erase_search_inline_column');
        $(this).parents('.search_inline_table').find('.search_inline_column').val('');


        var table = $(this).closest('.listview');
        var col = $(this).closest('.search_inline_table').find('.search_inline_column');
        var searchInline = [];
        var name = extractName(col.attr('name'));
        searchInline.push({
            'column': col.attr('name'),
            'value': col.val()
        });
        $.listviewSearch(table, {
            'search_inline': searchInline //,'reset':1
        });



        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('click', '.load-listviews a', function(event) {
        log('click -> .load-listviews a');
        document.location.href = $.config['base'] + $.config['module'] + "/" + $.config['controller'] + '/index?current_listview=' + $(this).closest('tr').attr('primary_key');
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('click', '.load-reports a', function(event) {
        log('click -> .load-reports a');
        $.ajaxPopup(this);
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });

    $(document).on('propertychange keyup input paste', '.data_field', function() {
        var io = $(this).val().length ? 1 : 0;
        $(this).next('.icon_clear').stop().fadeTo(300, io);
    }).on('click', '.icon_clear', function() {
        $(this).delay(300).fadeTo(300, 0).prev('input').val('');
    });

    /**
     * To make the "Click here" shown in form validations failure go to the desired field
     * @author Shubham Singh<ssingh@primarymodules.com>
     * @link https://github.com/primod/maax/issues/583
     * @since 2013-12-28
     * @internal
     *  1. Intercept event and get the id of element to be focussed
     *  2. If its a hidden field append __ before the id
     *  3. Find index of the tab which should be focussed before focussing the field
     *  4. Now trigger click on that tab li element
     *  5. At last focus the field because it is now shown and not hidden
     */
    $(document).on('click', '.error-element-anchor', function(event) {
        // id of element to be focussed
        var elementID = '';
        if ($(this).attr("href")) {
            elementID = $(this).attr("href");
        }
        if (elementID != '') {
            // in case element was not found or is a hidden field try using __ before field name because it can be a hidden field
            if ($(elementID).length === 0 || $(elementID).attr("type") === "hidden") {
                elementID = elementID.split('-');
                elementID[elementID.length - 1] = "__" + elementID[elementID.length - 1];
                elementID = elementID.join("-");
            }
            elementID = $(elementID);
            var index = elementID.closest('.ui-tabs-panel').index() - 1;
            elementID.closest('.tab').find('.ui-tabs-nav:first').find('li:eq(' + index + ')').find('a').trigger('click');
            // now focus the field as it is exposed now
            elementID.focus();
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
    /**
     * To make the "Click here" vanish once the user clicks on it
     * @author Shubham Singh<ssingh@primarymodules.com>
     * @link https://github.com/primod/maax/issues/583
     * @since 2014-09-01
     * @internal
     *  1. Intercept event and get the closest anchor
     *  2. If the click is on that anchor add the style for vanishing the message
     */
    $('.message-panel-container').find('#message-panel').click(function(event) {
        if (
            typeof ($(event.target)["context"]) != "undefined"
            &&
            typeof ($(this).closest("a")["context"]) != "undefined"
            )
            {
            if ($(event.target)["context"] != $(this).closest("a")["context"])
            {
                $(this).attr("style", "display:none;");
            }
        }
    });

    $(document).on('click', '.go_to_prev_page', function() {
        $(this).closest('form').find('.page-body').hide().end().find('.page-action').hide().end().end().closest('.page').prev().find('.page-body').show().end().find('.page-action').show();
    });
    $(document).on('click', '.go_to_next_page', function() {
        $(this).closest('form').find('.page-body').hide().end().find('.page-action').hide().end().end().closest('.page').next().find('.page-body').show().end().find('.page-action').show();
    });
    
    $(document).on('click','.compute-file-diff',function(event){
        var url=$(this).attr('url'); 
        var diff=$(this).closest('.diff-container').find('#diff').load(url);
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
    $(document).on('click','.action-comet',function(event){
        var url=$(this).attr('url');
        //var comet=$(this).attr('comet')
        var diff=$(this).closest('form').next('iframe').attr('src',url);
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return false;
    });
    
    
    
    
    
});

/* FILENAME:/js/common.js*/
/**
 * @author Tushar Takkar<ttakkar@primarymodules.com>
 */
var googleMapList = {};
var currentPositionMarkers = {};
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function urlParam(url, param) {
    if (url.indexOf("?") != -1) {
        url = url.split('?')[1];
    }
    var params = url.split('&');
    for (var i = 0; i < params.length; i++) {
        if (params[i].indexOf(param + '=') != -1) {
            return params[i].replace(param + '=', '');
        }
    }
    return false;
}

function setChartProperties(options, k, v) {
    if (k.length > 0) {
        var key = k.shift();
        if (!$.isset(options[key])) {
            options[key] = (k.length > 0 ? {} : v);
        }
        setChartProperties(options[key], k, v);
    }
}
function getCategoryColumns(fields) {
    var categoryColumn = [];
    if (jQuery.isArray(fields)) {
        var length = fields.length;
        for (var i = 0; i < length; i++) {
            if (jQuery.isPlainObject(fields[i])) {
                jQuery.each(fields[i], function(k, v) {
                    if (jQuery.isPlainObject(v) && jQuery.isset(v['render_type']) && v['render_type'] == 'category') {
                        categoryColumn.push(k); //.split('.').slice(-2).join('.')
                    }
                }
                );

            }
        }

    }
    return categoryColumn;
}
var google_exportProperty = {};
function randomColors(total)
{
    var i = 360 / (total - 1); // distribute the colors evenly on the hue range
    var r = []; // hold the generated colors
    for (var x = 0; x < total; x++)
    {
        r.push(hsvToRgb(i * x, i * x, 100)); // you can also alternate the saturation and value for even more contrast between the colors
    }
    return r;
}
function hsvToRgb(h, s, v) {
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v, g = t, b = p;
            break;
        case 1:
            r = q, g = v, b = p;
            break;
        case 2:
            r = p, g = v, b = t;
            break;
        case 3:
            r = p, g = q, b = v;
            break;
        case 4:
            r = t, g = p, b = v;
            break;
        case 5:
            r = v, g = p, b = q;
            break;
    }

    return [r * 255, g * 255, b * 255];
}
function randomHexColor() {
    var x, c = '#';
    var i = 3;
    while (i--) {
        x = (Math.random() * 256 | 0).toString(16).toUpperCase();
        c += (x.length < 2 ? '0' : '') + x;
    }
    return c;
}
function GetTrueCoords(evt, SVGRoot)
{
    // find the current zoom level and pan setting, and adjust the reported
    //    mouse position accordingly
    var newScale = SVGRoot.currentScale;
    var translation = SVGRoot.currentTranslate;
    coords = {};
    coords.x = (evt.clientX - translation.x) / newScale;
    coords.y = (evt.clientY - translation.y) / newScale;
    return coords;
}
function getAttributes(target) {
    var attributes = target.attributes;
    var attributesLength = attributes.length;
    var name = '';
    var value = '';
    var keys = [];
    var values = [];
    for (var k = 0; k < attributesLength; k++) {
        name = (attributes[k].name || attributes[k].nodeName);
        if (name.indexOf('property_') != -1) {
            if (name.indexOf('_value') != -1) {
                value = attributes[k].value || attributes[k].nodeValue;
                values.push(value);
            } else {
                value = attributes[k].value || attributes[k].nodeValue;
                keys.push(value);
            }
        }
    }
    var attributes = {};
    var keysLength = keys.length;
    for (var kl = 0; kl < keysLength; kl++) {
        attributes[keys[kl]] = values[kl];
    }
    return attributes;
}

/*
 *	@author	tushar takkar
 *	@todo
 *	@access public
 *	@param .
 *	@return
 *	@internal . This function is use to get list of all attributes of note as a javascript object.
 */
var attrs = function(target) {
    var attributes = {};
    var attrs = target.attributes;
    $.each(attrs, function(k, v) {
        if (v.nodeName.indexOf('on') == -1)
            attributes[v.nodeName] = v.nodeValue;

    });
    return attributes;
}

var uu = function() {
    var c = "89ab";
    var u = [];
    for (var i = 0; i < 36; i++) {
        u[i] = (Math.random() * 16 | 0).toString(16);
    }
    u[8] = u[13] = u[18] = u[23] = "-";
    u[14] = "4";
    u[19] = c.charAt((Math.random() * 4 | 0));
    return u.join("");
}
function log(message) {
    if (CONFIG.debug_js && typeof console != undefined) {
        console.log(message);
    }
}
$(document).ready(function() {
    $(document).on('click', '.map-marker', function(event) {
        var mapID = $(this).attr('map_id');
        var latitude = $(this).attr('latitude');
        var longitude = $(this).attr('longitude');
        if (typeof (googleMapList[mapID]) != 'undefined' && latitude != null && longitude != null) {
            googleMapList[mapID].panTo(new google.maps.LatLng(parseFloat(latitude), parseFloat(longitude)));
        }
        event.stopImmediatePropagation();
        event.stopPropagation();
        return false;
    });
});
function getColumnIndex(data) {
    var numberOfRows = data.getNumberOfRows();
    var numberOfColumns = data.getNumberOfColumns();
    var latitude = false;
    var longitude = false;
    var icon = false;
    var url = false;
    var info = false
    var geometricBoundary = false
    var boundaryProperties = false;
    var label = '';
    for (var rowIndex = 0; rowIndex < 1; rowIndex++) {
        for (var columnIndex = 1; columnIndex < numberOfColumns; columnIndex++) {
            label = data.getColumnLabel(columnIndex).toLowerCase();
            if (label.indexOf('latitude') != -1) {
                latitude = columnIndex;
            }
            if (label.indexOf('longitude') != -1) {
                longitude = columnIndex;
            }
            if (label.indexOf('icon') != -1) {
                icon = columnIndex;
            }
            if (label.indexOf('url') != -1) {
                url = columnIndex;
            }
            if (label.indexOf('infowindow') != -1) {
                info = columnIndex;
            }
            if (label.indexOf('geometric_boundary') != -1) {
                geometricBoundary = columnIndex;
            }
            if (label.indexOf('boundary_properties') != -1) {
                boundaryProperties = columnIndex;
            }
        }
    }
    return {
        'latitude': latitude,
        'longitude': longitude,
        'icon': icon,
        'url': url,
        'info': info,
        'geometricBoundary': geometricBoundary,
        'boundaryProperties': boundaryProperties,
        'numberOfRows': numberOfRows,
        'numberOfColumns': numberOfColumns
    }
}
function getMapMarkup(uuid, options, map, data, primaryKeys, infowindow, zoomToFitMarkers, showMarkerIndex, href) {
    var href = (typeof (href) != 'undefined' ? href : options['href'].split('?')[0].replace('/index', '/edit') + '/id:');
    var columnIndex = getColumnIndex(data);
    var latitude = columnIndex.latitude;
    var longitude = columnIndex.longitude;
    var icon = columnIndex.icon;
    var url = columnIndex.url;
    var info = columnIndex.info;
    var geometricBoundary = columnIndex.geometricBoundary;
    var boundaryProperties = columnIndex.boundaryProperties;
    var numberOfRows = columnIndex.numberOfRows;
    var numberOfColumns = columnIndex.numberOfColumns;
    var markers = '';
    if (zoomToFitMarkers === true) {
        var bounds = new google.maps.LatLngBounds();
    }
    if (latitude !== false && longitude !== false) {
        for (var rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
            var lat = data.getValue(rowIndex, latitude);
            var log = data.getValue(rowIndex, longitude);
            if (lat != "" && log != "" && (lat != 0 || log != 0)) {
                var mOptions = {
                    position: new google.maps.LatLng(lat, log),
                    map: map
                }
                if (zoomToFitMarkers === true) {
                    bounds.extend(mOptions["position"]);
                }
                mOptions["title"] = data.getValue(rowIndex, 0)
                if (showMarkerIndex) {
                    markers += '<li><a href="#" map_id="' + uuid + '" class="map-marker" latitude="' + lat + '"  longitude="' + log + '" >' + data.getValue(rowIndex, 0) + '</a></li>';
                }
                if (icon !== false) {
                    mOptions['icon'] = data.getValue(rowIndex, icon);
                }
                var marker = new google.maps.Marker(mOptions);
                if (info !== false) {
                    infoContent = data.getValue(rowIndex, info);
                } else {
                    infoContent = "<div>" + data.getValue(rowIndex, 0) + "</div>";
                }
                if (url !== false) {
                    clickURL = data.getValue(rowIndex, url);
                    if (clickURL != false) {
                        clickURL = CONFIG.base + clickURL;
                    }
                } else if (typeof (primaryKeys[rowIndex]) != 'undefined') {
                    clickURL = href + primaryKeys[rowIndex];
                }


                if ($.isset(options['is_mobile']) && options['is_mobile'] == 1) {
                    infoContent += 'For more details <a href="' + clickURL + '" data-ajax="false">click here</a>';
                } else {
                    infoContent += 'For more details <a href="' + clickURL + '" class="ajax-popup">click here</a>';
                }

                marker.set("info", infoContent);
                google.maps.event.addListener(marker, 'click', function() {
                    var info = this.get('info');
                    if (info != "") {
                        infowindow.setContent(info);
                        infowindow.open(this.getMap(), this);
                    }
                });
            }
            if (geometricBoundary !== false) {
                var boundary = data.getValue(rowIndex, geometricBoundary);
                var boundaryProp = null;
                if (boundary != "") {
                    try {
                        boundary = JSON.parse(boundary);
                        if ($.isArray(boundary)) {
                            var yyy = boundary.length;
                            for (var xxx = 0; xxx < yyy; xxx++) {
                                if (typeof (boundary[xxx][0]) != 'undefined' && typeof (boundary[xxx][1]) != 'undefined') {
                                    boundary[xxx] = new google.maps.LatLng(parseFloat(boundary[xxx][0]), parseFloat(boundary[xxx][1]));
                                }
                            }
                            if (boundaryProperties !== false) {
                                boundaryProp = data.getValue(rowIndex, boundaryProperties);
                                if (boundaryProp != false) {
                                    boundaryProp = JSON.parse(boundaryProp);
                                }
                            }
                            var prop = {
                                strokeColor: '#FF0000',
                                strokeOpacity: 0.8,
                                strokeWeight: 3,
                                fillColor: '#FAFAFA',
                                fillOpacity: 0.1
                            };
                            if ($.isPlainObject(boundaryProp)) {
                                prop = $.extend(prop, boundaryProp);
                            }
                            prop['paths'] = boundary;
                            var polygon = new google.maps.Polygon(prop);
                            polygon.setMap(map);
                        }
                    } catch (e) {
                        console.log(e.message + " for " + data.getValue(rowIndex, 0));
                    }
                }
            }

            if (zoomToFitMarkers === true) {
                map.fitBounds(bounds);
            }
        }
    }
    return markers;
}
function initChart(container) {
    var charts = $(container).find(".chart");
    var height = $(document).height();
    var minHeight = 0;
    charts.each(function() {
        minHeight = ((height / 100) * 70);
        minHeight = minHeight > 300 ? 300 : minHeight;
        $(this).parents(':first').css('min-height', minHeight + 'px');
    });
    if (charts.length > 0) {
        if (typeof (google) == 'undefined' || typeof (google['visualization']) == 'undefined' || typeof (google['visualization']['DataTable']) == 'undefined') {  // $.find('#jsapi').length ==0
            if (typeof $.showLoader != 'undefined') {
                $.showLoader(1);
            }
            charts.hide();
            var callAPI = false;
            if (typeof ($['charts_queue']) == 'undefined') {
                $['charts_queue'] = [];
                callAPI = true;
            }
            $['charts_queue'].push(container);
            if (callAPI) {
                $.ajax({
                    url: '//www.google.com/jsapi',
                    dataType: 'script',
                    cache: true,
                    success: function() {
                        google.load('visualization', '1', {
                            'packages': ['default', 'geochart', 'gauge', 'corechart'],
                            'callback': function() {
                                while ($['charts_queue'].length > 0) {
                                    var container = $['charts_queue'].shift();
                                    initChart(container);
                                }
                            }
                        });
                    }
                });
            }
            return;
        }
    } else {
        return;
    }
    


    charts.each(function() {
        //log("START RENDERING GRAPH");
        var chartObj = $(this);
        var defaults = {
            'is_mobile': false,
            'is3D': true,
            'visibleInLegend': true,
            'legend': {
                'position': 'in',
                'textStyle': {
                    'fontSize': 8
                }
            },
            'hAxis': {
                'slantedText': false
            },
            'chartArea': {
                width: "80%"
            }

        };
        //,
        //            'height':300
        // Set chart options
        var options = {};
        var list = [[], {}];
        $.each(attrs($(this).get(0)), function(k, v) {
            list[0].push(k);
            list[1][k] = v;
        });
        var keys = list[0];
        $.each(keys.sort(), function(kk, k) {
            var v = list[1][k];
            var kl = k.replace('--', '.').split('-');
            if (kl.length > 1) {
                k = $.ccWords(kl.join(' '));
            } else {
                k = kl.join('');
            }
            if (k.indexOf('.') != -1) {
                setChartProperties(options, k.split('.'), v);
            } else {
                options[k] = v;
            }
        });
        var longitudeAttr = $(this).attr('longitude');
        if (longitudeAttr != null) {
            options['longitude'] = longitudeAttr;
        }

        options['track_current_position'] = $(this).attr('track_current_position');
        options['current_position_infowindow'] = $(this).attr('current_position_infowindow');


        if ($(this).is('[resolution]')) {
            options['resolution'] = $(this).attr('resolution');
        }
        if ($(this).is('[region]')) {
            options['region'] = $(this).attr('region');
        }

        var graphType = options['graph_type'];
        if (graphType == 'PieChart') {
            defaults['legend']['position'] = '';
        }
        options = $.extend(true, defaults, options);
        //log("RAW PROPERTIES:");
        //log(options);
        $.each(options, function(k, v) {
            if (typeof v == 'string' && (v.indexOf('[') != -1 || v.indexOf('{') != -1)) {
                try {

                    options[k] = JSON.parse(v);

                } catch (e) {
                    //log("POSSIBLE ERROR(In case invalid json):");
                    //log(e);
                    var xx = {}
                    xx[k] = v
                    //log(xx);

                }
            }
        });

        //log("PROCESSED PROPERTIES:");
        //log(options);


        if (typeof $.hideLoader != 'undefined')
            $.hideLoader(1);


        var mapUrl = '';
        if (graphType == 'GeoChart') {
            var query = options['query'];
            var mapSubtype = '';
            var pivotColumn = $(this).find('tr:eq(0)').find('th:eq(0)').attrs();
            if ($.isset(pivotColumn['column_name'])) {
                mapSubtype = pivotColumn['column_name'].split('.').pop();
            }
            query = parseJSON(decodeURIComponent(options['query']));
            if ($.isset(options['region']) && options['region'].indexOf('svg/') != -1) {
                mapUrl = jQuery.config['base'] + options['region'];
            } else {
                var string = JSON.stringify(query['where']);
                var result = string.match(/[\w\. ]*/gi);
                var length = result.length;
                var countryName = false;
                for (var ln = 0; ln < length; ln++) {
                    result[ln] = $.trim(result[ln]);
                    if (result[ln] != "") {
                        if (result[ln].indexOf('country_name') !== false) {
                            countryName = true;
                        }
                        if (countryName === true) {
                            countryName = result[ln];
                        }
                    }
                }
                if (typeof countryName == 'string') {
                    mapUrl = countryName + '_' + mapSubtype + '.svg';
                    mapUrl = mapUrl.replace(/ /g, '_');
                    mapUrl = mapUrl.toLowerCase();
                    mapUrl = jQuery.config['static_url'] + 'svg/' + mapUrl;
                }
            }
        }
        //console.log("Custom GEO graph URL:"+mapUrl);


        var title = options['title'];
        var expr = 'tr:gt(0)';
        var pointer = 0;
        var primaryKeys = [];
        do {
            var uuid = uu();
            if (graphType == 'PieChart') {
                pointer++;
            }
            // Create the data table.
            var data = new google.visualization.DataTable();
            var dataType = 'number';
            // set headers;
            var types = [];
            var columnName = '';
            var multiAxis = [];
            var isGoogleMap = (graphType == 'GoogleMap');
            $(this).find('tr:eq(0)')
                    .find('th:eq(0),' + (pointer == 0 ? 'th:gt(' + pointer + ')' : 'th:eq(' + pointer + ')'))
                    .each(function(k, v) {
                        dataType = 'number';
                        if (isGoogleMap) {
                            dataType = 'string';
                        }
                        switch ($(this).attr('data_type')) {
                            case 'VAR_STRING':
                                dataType = 'string';
                        }
                        columnName = $(this).text();
                        if (graphType == 'BarChart') {
                            if (!$.isset(options['vAxis'])) {
                                options['vAxis'] = {};
                            }
                            if (!$.isset(options['vAxis']['title']) || $.isEmpty(options['vAxis']['title'])) {
                                options['vAxis']['title'] = columnName;
                            }
                        } else {
                            if (!$.isset(options['hAxis'])) {
                                options['hAxis'] = {};
                            }
                            if (!$.isset(options['hAxis']['title']) || $.isEmpty(options['hAxis']['title'])) {
                                options['hAxis']['title'] = columnName;
                            }
                        }
                        if (k > 0) {
                            multiAxis.push({
                                'title': columnName
                            });
                        }

                        types.push(dataType);
                        data.addColumn(dataType, columnName);
                    });
            if (graphType == 'BarChart') {
                if (!$.isset(options['hAxis']) || $.isEmpty(options['hAxis'])) {
                    //options['hAxis']=multiAxis;
                }
            } else {
                if (!$.isset(options['vAxis']) || $.isEmpty(options['vAxis'])) {
                    //options['vAxis']=multiAxis;
                }
            }

            if ($.isset(options['is_mobile']) && options['is_mobile'] == 1 && !$.isset(options['title']) || options['title'] == '') {
                if ($.isset(options['header_title'])) {
                    options['title'] = options['header_title'];
                }
            }
            if (graphType == 'PieChart') {
                var tit = [];
                if ($.isset(title)) {
                    tit.push(title);
                }
                if ($.isset(columnName)) {
                    tit.push(columnName);
                }
                options['title'] = tit.join('/ ');
            } else {
                if (!$.isset(options['title'])) {
                    options['title'] = '';
                }
                if ($.isset(options['subtitle'])) {
                    if (!$.isEmpty(options['title'])) {
                        options['title'] += ' (' + options['subtitle'] + ')';
                    } else {
                        options['title'] += options['subtitle'];
                    }
                }
            }

            var colorAxis = '';
            if ($.isset(options['colorAxis']) && $.isset(options['colorAxis']['values'])) {
                colorAxis = options['colorAxis']['values'];
            }
            var ranges = [];
            for (var i = 10; i > 0; i--) {
                if ($.isset(options['range_' + i]) && $.isset(options['range_' + i + '_color'])) {
                    ranges.push([parseFloat(options['range_' + i]), options['range_' + i + '_color']]);
                }
            }
            if (ranges.length > 0) {
                ranges = ranges.sort(function(a, b) {
                    return b[0] - a[0];
                });
            }

            $(this).find('tr:gt(0)').each(function() {
                var row = [];
                var i = 0;
                var val = '';
                $(this).find('td:eq(0),' + (pointer == 0 ? 'td:gt(' + pointer + ')' : 'td:eq(' + pointer + ')')).each(function() {
                    if (isGoogleMap) {
                        val = $(this).html();
                    } else {
                        val = $(this).text();
                        if (types[i] == 'number') {
                            val = parseFloat(val);
                        }
                    }

                    row.push(val);
                    i++;
                });
                data.addRow(row);
                primaryKeys.push($(this).attr('primary_key'));
            });
            $(this).parents(':first').find('.graph-panel-container').remove();


            var chart = false;
            var drilldown = function(evt, showLastStage) {
                if (options['render_as'] == 'categorized') {
                    var query = options['query'];
                    if (typeof (showLastStage) == 'undefined') {
                        showLastStage = false;
                    }
                    var showLastStage = showLastStage || false;
                    query = parseJSON(decodeURIComponent(options['query']));
                    query['active_level'] = parseInt(options['active_level']);
                    //console.log(query);

                    var categoryColumns = getCategoryColumns(query['fields']);
                    var where = {};
                    if (showLastStage === true) {
                        query['active_level'] = categoryColumns.length;
                    } else {
                        if (jQuery.isset(categoryColumns[query['active_level']])) {
                            if (chart !== false) {
                                where[categoryColumns[query['active_level']]] = data.getValue(chart.getSelection()[0].row, 0);
                                chart.setSelection([0]);
                            } else {
                                where[categoryColumns[query['active_level']]] = evt.target.getAttribute('id');
                            }
                        }
                        query['active_level']++;
                    }
                    if (!jQuery.isset(categoryColumns[query['active_level']])) {
                        query['ui_helper'] = '';
                    }
                    if (typeof query['where'] == 'undefined') {
                        query['where'] = {};
                    }
                    if ($.isArray(query['where'])) {
                        query['where'].push(where);
                    } else {
                        query['where'] = $.extend(query['where'], where);
                    }
                    if (!jQuery.isset(query['where'])) {
                        query['where'] = {};
                    }
                    var href = options['href'];
                    href = href.replace('page=', 'old_page=');
                    href = href.split('q:')[0];
                    href = href.split('q=')[0];
                    href = href.replace('search_basic', 'sb').replace('search_advance', 'sa').replace('[search]', 'il');
                    href += href.indexOf('?') != -1 ? '' : '?';
                    href += "&drilldown=1";
                    $.get(href, {
                        "q": encodeURIComponent(JSON.stringify(query))
                    }, function(data) {
                        var params = {};
                        data = $(data);
                        if (data.is('[header_title]')) {
                            params['title'] = data.attr('header_title');
                        }
                        var width = $('body').width();
                        var popup_width = CONFIG.popup_width_percent || 80;
                        width = (width / 100) * popup_width;
                        params["width"] = width + "px";
                        var uuid = $.jsContainer(data, params);
                        initChart($('#' + uuid));
                    });
                } else {
                    var query = options['query'];
                    query = parseJSON(decodeURIComponent(options['query']));
                    var childListview = query['child_listview'] | false;
                    if (!jQuery.isEmpty(childListview)) {
                        var where = {};
                        if (jQuery.isset(query['group']) && jQuery.isArray(query['group']) && jQuery.isset(query['group'][0])) {
                            if (chart !== false) {
                                where[query['group'][0]] = data.getValue(chart.getSelection()[0].row, 0);
                                chart.setSelection([0]);
                            } else {
                                where[query['group'][0]] = evt.target.getAttribute('id');
                            }
                        }
                        var query = {};
                        query['where'] = where;
                        var href = options['href'];
                        href = href.replace('page=', 'old_page=');
                        href = href.split('q:')[0];
                        href = href.split('q=')[0];
                        href = href.replace('current_listview', 'cl').replace('search_basic', 'sb').replace('search_advance', 'sa').replace('[search]', 'il');
                        href += href.indexOf('?') != -1 ? '' : '?';
                        href += '&current_listview=' + childListview;
                        href += "&drilldown=1";
                        $.get(href, {
                            "q": encodeURIComponent(JSON.stringify(query))
                        }, function(data) {
                            data = $(data);
                            var params = {};
                            if (data.is('[header_title]')) {
                                params['title'] = data.attr('header_title');
                            }
                            var width = $('body').width();
                            var popup_width = CONFIG.popup_width_percent || 80;
                            width = (width / 100) * popup_width;
                            params["width"] = width + "px";
                            var uuid = $.jsContainer(data, params);
                            initChart($('#' + uuid));
                        });
                    }
                }
                return false;
            }
            var zoomToFitMarkers = false;
            if (typeof (options['auto_zoom_to_fit_markers']) != 'undefined' && parseInt(options['auto_zoom_to_fit_markers']) == 1) {
                zoomToFitMarkers = true;
            }
            var showMarkerIndex = false;
            if (typeof (options['show_marker_index']) != 'undefined' && parseInt(options['show_marker_index']) == 1 && options['is_mobile'] == false) {
                showMarkerIndex = true;
            }
            var markerIndexID = uu();
            if (graphType == 'GoogleMap' && showMarkerIndex == true) {
                $(this).hide().before('<div  class="graph-panel-container" style="margin:5px;">\n\
    <table style="margin:0px;padding:0px;width:100%;"><tr style="margin:0px;padding:0px;">\n\
<td  class="no-mp" style="margin:0px;padding:0px;">\n\
<div id="' + uuid + '" class="graph-panel graph-' + graphType + '" ></div>\n\
</td>\n\
<td id="' + markerIndexID + '" style="margin:0px;padding:0px;width:200px;overflow:hide;"></td>\n\
</tr>\n\
</table>\n\
</div>').parents(':first').css('padding', 0);
            } else {
                $(this).hide().before('<div  class="graph-panel-container" style="margin:5px;' + (options['is_mobile'] == true ? 'min-height:300px;' : '') + '">\n\
    <div id="' + uuid + '" class="graph-panel graph-' + graphType + '" style="' + (options['is_mobile'] == true ? 'min-height:300px;' : '') + '"></div>\n\
</div>').parents(':first').css('padding', 0);
            }
            if (graphType == 'GoogleMap') {
                var columnIndex = getColumnIndex(data);
                var latitude = columnIndex.latitude;
                var longitude = columnIndex.longitude;
                var icon = columnIndex.icon;
                var url = columnIndex.url;
                var info = columnIndex.info;
                var geometricBoundary = columnIndex.geometricBoundary;
                var boundaryProperties = columnIndex.boundaryProperties;
                var numberOfRows = columnIndex.numberOfRows;
                var numberOfColumns = columnIndex.numberOfColumns;
                var latLang = new google.maps.LatLng(-34.397, 150.644);

                if (typeof (options['latitude']) != 'undefined' && typeof (options['longitude']) != 'undefined') {
                    var latLang = new google.maps.LatLng(parseFloat(options['latitude']), parseFloat(options['longitude']));
                } else if (latitude !== false && longitude !== false) {
                    for (var rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
                        var lat = data.getValue(rowIndex, latitude);
                        var log = data.getValue(rowIndex, longitude);
                        if (lat != "" && log != "" && (lat != 0 || log != 0)) {
                            latLang = new google.maps.LatLng(lat, log);
                            break;
                        }
                    }
                }
                if (typeof (options['center']) == 'undefined') {
                    options['center'] = latLang;
                }
                if (typeof (options['zoom']) != 'undefined') {
                    options['zoom'] = parseInt(options['zoom']);
                } else {
                    options['zoom'] = 18;
                }
                options['mapTypeControlOptions'] = {
                    'style': google.maps.MapTypeControlStyle.DROPDOWN_MENU
                };
                if (typeof (options['panControl']) == 'undefined') {
                    options['panControl'] = true;
                }
                if (typeof (options['zoomControl']) == 'undefined') {
                    options['zoomControl'] = true;
                }
                if (typeof (options['mapTypeControl']) == 'undefined') {
                    options['mapTypeControl'] = true;
                }
                if (typeof (options['scaleControl']) == 'undefined') {
                    options['scaleControl'] = true;
                }
                if (typeof (options['streetViewControl']) == 'undefined') {
                    options['streetViewControl'] = true;
                }
                if (typeof (options['overviewMapControl']) == 'undefined') {
                    options['overviewMapControl'] = true;
                }
                var showCurrentPosition = false;
                if (typeof (options['track_current_position']) != 'undefined' && parseInt(options['track_current_position']) == 1 && navigator.geolocation) {
                    showCurrentPosition = true;
                }
                var markers = '';
                var map = new google.maps.Map($('#' + uuid).get(0), options);
                googleMapList[uuid] = map;
                var infowindow = new google.maps.InfoWindow();
                var infoContent = "";
                var clickURL = "";

                if (showCurrentPosition) {
                    currentPositionMarkers[uuid] = {
                        'options': options,
                        'marker': false
                    };
                    navigator.geolocation.watchPosition(function(position) {
                        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        $.each(currentPositionMarkers, function(k, v) {
                            if (v.marker === false) {
                                currentPositionMarkers[k]['marker'] = new google.maps.Marker({
                                    position: latLng,
                                    map: googleMapList[k]
                                });
                                if (typeof (v.options['current_position_infowindow'])) {
                                    currentPositionMarkers[k]['marker'].set('info', v.options['current_position_infowindow']);
                                }
                                google.maps.event.addListener(currentPositionMarkers[k]['marker'], 'click', function() {
                                    var currentMarker = this;
                                    var geocoder = new google.maps.Geocoder();
                                    geocoder.geocode({
                                        'latLng': this.getPosition()
                                    }, function(results, status) {
                                        if (status == google.maps.GeocoderStatus.OK) {
                                            if (results[1]) {
                                                var info = currentMarker.get('info');
                                                if (typeof (info) == 'undefined' || info == "") {
                                                    info = " Your current position is \n\
                                                    <div>Address line : __ADDRESS_LINE__</div>\n\
                                                    <div>City : __CITY__</div>\n\
                                                    <div>State : __STATE__</div>\n\
                                                    <div>Country : __COUNTRY__</div>\n\
                                                    ";
                                                }
                                                var ac = results[1].address_components;
                                                $.getJSON(CONFIG.base + 'masters/countries/index.json', {
                                                    q: JSON.stringify({
                                                        'method': 'find',
                                                        'fields': ['country_name', 'id'],
                                                        'where': {
                                                            'countries.iso2': ac[3]['short_name']
                                                        }
                                                    })
                                                }, function(response) {
                                                    var countryID = country = '';
                                                    if (typeof (response['paginate']) != 'undefined' && typeof (response['paginate']['data']) != 'undefined' && typeof (response['paginate']['data'][0]) != 'undefined') {
                                                        countryID = response['paginate']['data'][0]['id'];
                                                        country = response['paginate']['data'][0]['country_name'];
                                                    }
                                                    info = info.replace(/__ADDRESS_LINE__/gi, ac[0]['long_name'])
                                                            .replace(/__CITY__/gi, ac[1]['long_name'])
                                                            .replace(/__STATE__/gi, ac[2]['short_name'])
                                                            .replace(/__COUNTRY_ID__/gi, countryID)
                                                            .replace(/__COUNTRY__/gi, country)
                                                            .replace(/__LATITUDE__/gi, currentMarker.get('latitude'))
                                                            .replace(/__LONGITUDE__/gi, currentMarker.get('longitude'))
                                                            .replace(/__LOCATION_TYPE__/gi, results[1].geometry.location_type)
                                                            .replace(/__GEOCODE_TYPE__/gi, results[1].types.join(', '))
                                                            .replace(/__GEOCODE_STATUS__/gi, google.maps.GeocoderStatus.OK)
                                                            .replace(/__BASE_URL__/gi, CONFIG.base);
                                                    var html = $('<div>' + info + '</div>');
                                                    if ($.isset(options['is_mobile']) && options['is_mobile'] == 1) {
                                                        html.find('a').attr('data-ajax', "false");
                                                    } else {
                                                        html.find('a').addClass('ajax-popup');
                                                    }
                                                    info = html.html();
                                                    infowindow.setContent(info);
                                                    infowindow.open(currentMarker.getMap(), currentMarker);
                                                });
                                            } else {
                                                alert('No results found');
                                            }
                                        } else {
                                            alert('Geocoder failed due to: ' + status);
                                        }
                                    });
                                });
                            } else {
                                v.marker.setPosition(latLang);
                            }
                            currentPositionMarkers[k]['marker'].set('latitude', position.coords.latitude);
                            currentPositionMarkers[k]['marker'].set('longitude', position.coords.longitude);
                            googleMapList[k].panTo(latLng);
                        });
                    });
                }
                markers = getMapMarkup(uuid, options, map, data, primaryKeys, infowindow, zoomToFitMarkers, showMarkerIndex);
                if (showMarkerIndex) {
                    $('#' + markerIndexID).html('<ol style="max-height:200px;overflow:auto;padding: 0px; margin: 0px;padding-left: 30px;">' + markers + '</ol>');
                }
                //options['data_source']='53a7ee53-0d9c-401a-948b-0a52ac1007cc';
                $.each(options, function(k, v) {
                    if (k.indexOf('data_source') != -1 && k.indexOf('__data_source') == -1 && v != 'listviews') {
                        $.getJSON(CONFIG.base + 'core/listviews/view.json', {
                            'id': v
                        }, function(response) {
                            if (typeof (response['data']) != 'undefined' && typeof (response['data']['listviews']) != 'undefiend') {
                                var controller = response['data']['listviews']['controller'];
                                var id = response['data']['listviews']['id'];
                                $.getJSON(CONFIG.base + controller + '/index.json', {
                                    'current_listview': id
                                }, function(response) {
                                    if (typeof (response['paginate']) != 'undefined' && typeof (response['paginate']['data']) != 'undefined' && typeof (response['paginate']['data'][0]) != 'undefined') {
                                        var records = response['paginate']['data'];
                                        var data = new google.visualization.DataTable();
                                        var columns = [];
                                        var idColumn = false;
                                        var rowLength = records.length;
                                        $.each(records[0], function(k, v) {
                                            columns.push(k);
                                            data.addColumn('string', k);
                                            if (k.indexOf('.id') != -1) {
                                                idColumn = k;
                                            }
                                        });
                                        var columnLength = columns.length;
                                        var primaryKeys = [];
                                        for (var yyy = 0; yyy < rowLength; yyy++) {
                                            var row = [];
                                            for (var xxx = 0; xxx < columnLength; xxx++) {
                                                row.push(records[yyy][columns[xxx]]);

                                            }
                                            if (idColumn !== false) {
                                                primaryKeys.push(records[yyy][idColumn]);
                                            }
                                            data.addRow(row);
                                        }
                                        markers = getMapMarkup(uuid, options, map, data, primaryKeys, infowindow, false, showMarkerIndex, CONFIG.base + response['paginate']['controller'] + '/view/id:');
                                        if (showMarkerIndex) {
                                            $('#' + markerIndexID).find('ol:first').append(markers);
                                        }
                                    }
                                });


                            }
                        });
                    }
                });


                setTimeout(function() {
                    $('#' + markerIndexID).find('ol').css('max-height', $('#' + markerIndexID).height() + 'px');
                }, 500);
                if (options['is_mobile'] == true) {
                    setTimeout(function() {
                        $('#' + uuid).removeAttr('style');
                    }, 500);
                }
            } else if (mapUrl != false) {
                //log("Custom GEO graph URL:"+mapUrl);
                $('#' + uuid).append('<iframe width="' + $('#' + uuid).width() + '" height="400px;" id="' + uuid + '-map" src="' + mapUrl + '" style="visibility: visible; overflow: hidden;"  scrolling="no" frameborder="0" marginheight="0" marginwidth="0" ></iframe>')
                document.getElementById(uuid + "-map").onload = function() {
                    //log("CUSTOM CALL START");
                    //log("DATA:");
                    //log(data);
                    //log("OPTIONS:");
                    //log(options);

                    var numberOfRows = data.getNumberOfRows();
                    var numberOfColumns = data.getNumberOfColumns();
                    // var rowColors=randomColors(numberOfRows);
                    var map_state;
                    var iframe = document.getElementById(uuid + "-map");
                    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (innerDoc.getElementsByTagName('svg').length > 0) {
                        var colorMap = {};
                        for (var rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
                            map_state = innerDoc.getElementById(data.getValue(rowIndex, 0));
                            if (map_state && typeof map_state.style.fill != null) {
                                for (var columnIndex = 1; columnIndex < numberOfColumns; columnIndex++) {
                                    map_state.setAttributeNS(null, 'property_' + columnIndex, data.getColumnLabel(columnIndex));
                                    map_state.setAttributeNS(null, 'property_' + columnIndex + '_value', data.getValue(rowIndex, columnIndex));
                                }
                                if ($.isset(colorAxis) && colorAxis == 'percentile') {
                                    var rate = data.getValue(rowIndex, 1);
                                    var color = '';
                                    var length = ranges.length;
                                    for (var kk = 0; kk < length; kk++) {
                                        if (rate > ranges[kk][0]) {
                                            color = ranges[kk][1];
                                            break;
                                        }
                                    }
                                } else if ($.isset(colorAxis) && colorAxis == 'identical') {
                                    var rate = data.getValue(rowIndex, 1);
                                    if (!$.isset(colorMap[rate])) {
                                        colorMap[rate] = randomHexColor();
                                    }
                                    var color = colorMap[rate];
                                } else {
                                    var color = randomHexColor();

                                }
                                map_state.setAttribute("style", map_state.getAttribute('style') + ";fill:" + color);
                                //map_state.style.fill = color;
                                var SVGRoot = innerDoc.getElementsByTagName('svg')[0];
                                var toolTip = document.createElementNS("http://www.w3.org/2000/svg", "g");
                                toolTip.setAttributeNS(null, "id", 'tooltip');
                                toolTip.setAttributeNS(null, "opacity", '0.8');
                                toolTip.setAttributeNS(null, "visibility", 'hidden');
                                toolTip.setAttributeNS(null, "pointer-events", 'none');
                                SVGRoot.appendChild(toolTip);


                                var tipBox = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                                tipBox.setAttributeNS(null, "id", 'tipbox');
                                tipBox.setAttributeNS(null, "x", '0');
                                tipBox.setAttributeNS(null, "y", '5');
                                tipBox.setAttributeNS(null, "width", '88');
                                tipBox.setAttributeNS(null, "height", '20');
                                tipBox.setAttributeNS(null, "rx", '2');
                                tipBox.setAttributeNS(null, "ry", '2');
                                tipBox.setAttributeNS(null, "fill", 'white');
                                tipBox.setAttributeNS(null, "stroke", 'black');
                                toolTip.appendChild(tipBox);

                                var tipText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                                tipText.setAttributeNS(null, "id", 'tiptext');
                                tipText.setAttributeNS(null, "x", '5');
                                tipText.setAttributeNS(null, "y", '20');
                                tipText.setAttributeNS(null, "font-family", 'Arial');
                                tipText.setAttributeNS(null, "font-size", '12');
                                toolTip.appendChild(tipText);


                                map_state.onmousemove = function(evt) {
                                    //evt.target.setAttributeNS(null, "stroke-width", '3');
                                    var mouseovertext = [];
                                    var attributes = getAttributes(evt.target);

                                    var TrueCoords = GetTrueCoords(evt, SVGRoot);
                                    if ($.isset(TrueCoords) && $.isset(TrueCoords.x)) {
                                        var tipScale = 1 / SVGRoot.currentScale;
                                        var textWidth = 0;
                                        var tspanWidth = 0;
                                        var boxHeight = 20;
                                        var toolTip = innerDoc.getElementById('tooltip');
                                        var tipBox = innerDoc.getElementById('tipbox');
                                        var tipText = innerDoc.getElementById('tiptext');


                                        tipBox.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')');
                                        tipText.setAttributeNS(null, 'transform', 'scale(' + tipScale + ',' + tipScale + ')');
                                        var xPos = TrueCoords.x + (10 * tipScale);
                                        var yPos = TrueCoords.y + (10 * tipScale);

                                        var tipTitle = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                                        tipTitle.setAttributeNS(null, "id", 'tipTitle');
                                        tipTitle.setAttributeNS(null, "x", '5');
                                        tipTitle.setAttributeNS(null, "font-weight", 'bold');
                                        tipTitle.setAttributeNS(null, 'visibility', 'visible');
                                        tipText.appendChild(tipTitle);
                                        tipText.textContent = evt.target.getAttribute('id');


                                        $.each(attributes, function(k, v) {
                                            var tipDesc = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
                                            tipDesc.setAttributeNS(null, "class", 'tipDesc');
                                            tipDesc.setAttributeNS(null, "x", '5');
                                            tipDesc.setAttributeNS(null, "dy", '15');
                                            //tipDesc.setAttributeNS(null, "fill", 'blue');
                                            tipDesc.setAttributeNS(null, 'visibility', 'visible');
                                            tipText.appendChild(tipDesc);
                                            tipDesc.textContent = k + " : " + v;
                                        });




                                        var outline = tipText.getBBox();
                                        tipBox.setAttributeNS(null, 'width', Number(outline.width) + 10);
                                        tipBox.setAttributeNS(null, 'height', Number(outline.height) + 10);
                                        // update position
                                        if (SVGRoot.getAttributeNS(null, 'width') < (xPos + Number(outline.width) + 10)) {
                                            xPos -= Number(outline.width) + 10;
                                        }
                                        if (SVGRoot.getAttributeNS(null, 'height') < (yPos + Number(outline.height) + 10)) {
                                            yPos -= Number(outline.height) + 10;
                                        }

                                        toolTip.setAttributeNS(null, 'transform', 'translate(' + xPos + ',' + yPos + ')');
                                        toolTip.setAttributeNS(null, 'visibility', 'visible');

                                    }
                                }
                                map_state.onmouseout = function(evt) {
                                    innerDoc.getElementById('tooltip').setAttributeNS(null, 'visibility', 'hidden');
                                    var tspan = innerDoc.getElementsByTagName('tspan');
                                    var length = tspan.length;
                                    for (var i = 0; i < length; i++) {
                                        tspan[i].setAttributeNS(null, 'visibility', 'hidden');
                                    }
                                }
                                map_state.onclick = drilldown;


                            }
                        }
                    } else {
                        $('#' + uuid).remove();
                        //chartObj.show();
                        var html = chartObj.find('tbody').html();
                        var tr = chartObj.closest('.chart-container').parents(':first');
                        if (tr.is('tr')) {
                            if (options['render_as'] == 'categorized') {
                                var jscontainer = chartObj.closest('.js-container');
                                if (jscontainer.length > 0) {
                                    //     $('#'+jscontainer.attr('id')).dialog("destroy").remove();
                                    $('#' + jscontainer.attr('id')).find('.chart-container').append('<span valign="top">Server does not have geo map for area with url "' + mapUrl + '". Contact your system admin to install map for specified area.</span>');
                                }
                                drilldown({}, true);
                            } else {
                                var ptable = tr.closest('table').addClass('listview  ui-listview');
                                tr.replaceWith(html);
                                ptable.find('th').css({
                                    'height': '30px',
                                    'padding': '5px',
                                    'text-align': 'left'
                                });
                            }
                        } else {
                            chartObj.show();
                            chartObj.css({
                                'margin': '10px'
                            });
                            if (options['render_as'] == 'categorized') {
                                drilldown({}, true);
                            }
                        }



                        //innerDoc.getElementsByTagName('body')[0].innerHTML='<p style="text-align:center;margin:0px;">Count not find requested graph</p>';
                    }
                    //var dialog=$('#'+uuid).closest('.ui-dialog-content').attr('id');
                    //if(dialog!=''){
                    //    $("#"+dialog).dialog( "option", "position", "center" );
                    //}
                    //log("CUSTOM CALL END");
                    if (typeof (hideLoader) != 'undefined') {
                        hideLoader();
                    }
                }
                chart = false;
            } else {
                //log("GOOGLE CALL START");
                //log("DATA:");
                //log(data);
                //log("OPTIONS:");
                //log(options);
                chart = false;
                // Instantiate and draw our chart, passing in some options.
                if (typeof (google.visualization[graphType]) != 'undefined') {
                    chart = new google.visualization[graphType](document.getElementById(uuid));
                    chart.draw(data, options);
                }

                //log("GOOGLE CALL END");
                var dialog = $('#' + uuid).closest('.ui-dialog-content').attr('id');
                if (dialog != '') {
                    $("#" + dialog).dialog("option", "position", "center");
                }
            }
            if (
                    chart !== false &&
                    (
                            (jQuery.isset(options['render_as']) && options['render_as'] == 'categorized')
                            ||
                            (jQuery.isset(options['child_listview']) && !jQuery.isEmpty(options['child_listview']))
                            )
                    ) {
                google.visualization.events.addListener(chart, 'select', drilldown);
            }

        } while (graphType == 'PieChart' && $(this).find('tr:eq(0)>th:eq(' + (pointer + 1) + ')').length > 0);
    });
}


(function($) {

    var rotateLeft = function(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    var addUnsigned = function(lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4)
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000)
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            else
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    var F = function(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    var G = function(x, y, z) {
        return (x & z) | (y & (~z));
    }

    var H = function(x, y, z) {
        return (x ^ y ^ z);
    }

    var I = function(x, y, z) {
        return (y ^ (x | (~z)));
    }

    var FF = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var GG = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var HH = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var II = function(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };

    var convertToWordArray = function(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWordsTempOne = lMessageLength + 8;
        var lNumberOfWordsTempTwo = (lNumberOfWordsTempOne - (lNumberOfWordsTempOne % 64)) / 64;
        var lNumberOfWords = (lNumberOfWordsTempTwo + 1) * 16;
        var lWordArray = Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };

    var wordToHex = function(lValue) {
        var WordToHexValue = "", WordToHexValueTemp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValueTemp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValueTemp.substr(WordToHexValueTemp.length - 2, 2);
        }
        return WordToHexValue;
    };

    var uTF8Encode = function(string) {
        string = string.replace(/\x0d\x0a/g, "\x0a");
        var output = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                output += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                output += String.fromCharCode((c >> 6) | 192);
                output += String.fromCharCode((c & 63) | 128);
            } else {
                output += String.fromCharCode((c >> 12) | 224);
                output += String.fromCharCode(((c >> 6) & 63) | 128);
                output += String.fromCharCode((c & 63) | 128);
            }
        }
        return output;
    };

    $.extend({
        md5: function(string) {
            var x = Array();
            var k, AA, BB, CC, DD, a, b, c, d;
            var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
            var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
            var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
            var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
            string = uTF8Encode(string);
            x = convertToWordArray(string);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;
            for (k = 0; k < x.length; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = addUnsigned(a, AA);
                b = addUnsigned(b, BB);
                c = addUnsigned(c, CC);
                d = addUnsigned(d, DD);
            }
            var tempValue = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
            return tempValue.toLowerCase();
        }
    });
})(jQuery);

/*
 jQuery('document').ready(function($){
 var time=600000;
 //var time=10000;
 setInterval(function(){
 $.get(CONFIG['base']+'keep_alive_session_call',function(){
 //console.log("Session Call");
 });
 },time);
 })*/

