(function(fbc) {
    fbc.locations = {
        dict: {},
        getList: function() {
            return $.map(fbc.players.dict, function(location) {
                return location;
            });
        },
        initialize: function() {
            console.log('initializing locations...');
            // TODO: fill this
        },
        updateList: function(callback) {
            // TODO: fill this
        }
    };
})(fbc);