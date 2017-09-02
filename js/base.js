var fbc = {};

$(document).ready(function() {
    $.each(fbc, function() {
        if (
            this.hasOwnProperty("initialize") &&
            $.isFunction(this["initialize"])
        ) {
            this["initialize"]();
        }
    });
});

(function(fbc) {
    fbc.base = {
        token: ""
    };

    fbc.params.initialize = function() {
        ///<summary></summary>
    };
})(fbc);
