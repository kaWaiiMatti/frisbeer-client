(function(fbc) {
    fbc.locations = {
        dict: {},
        getList: function() {
            var locations = $.map(fbc.locations.dict, function(location) {
                return location;
            });

            locations.sort(fbc.base.sorting.name);
            return locations;
        },
        initialize: function() {
            $('#add-new-location').click(fbc.locations.openNewDialog);

            $('#refresh-locations').click(function() {
                fbc.locations.update(fbc.locations.updateTable);
            });

            $('#refresh-locations').click();
        },
        update: function(successCallback, errorCallback) {
            ///<summary>Update fbc.locations.dict from server</summary>
            $.ajax({
                url: fbc.base.parameters.server + 'API/locations/',
                method: 'GET',
                beforeSend: function() {
                    fbc.base.loader.set('locations');
                },
                complete: function() {
                    fbc.base.loader.remove('locations');
                },
                success: function(data) {
                    locationObject = {};
                    for (var i = 0; i < data.length; i++) {
                        locationObject[data[i].id] = data[i];
                    }
                    fbc.locations.dict = locationObject;

                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function(xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                }
            });
        },
        updateTable: function() {
            ///<summary>Update locations table</summary>
            var locations = fbc.locations.getList().slice();

            locations.sort(fbc.base.sorting.name);

            $('#locations-table')
                .children('tbody')
                .first()
                .html(
                    $.map(locations, function(elem) {
                        return $('<tr>', {
                            html: [
                                $('<td>', {
                                    text: elem.name
                                }),
                                $('<td>', {
                                    text:
                                        elem.latitude.length > 0 &&
                                        elem.longitude.length > 0
                                            ? 'lat:' +
                                              elem.latitude +
                                              ' long:' +
                                              elem.longitude
                                            : ''
                                }),
                                $('<td>', {
                                    html: $('<button>', {
                                        class: 'btn btn-primary',
                                        text: 'Show on map',
                                        click: function() {
                                            fbc.locations.showOnMap(elem);
                                        }
                                    })
                                })
                            ]
                        });
                    })
                );
        },

        openNewDialog: function() {
            var $form = $('<form>', {
                html: [
                    $('<div>', {
                        class: 'form-group',
                        html: [
                            $('<label>', {
                                text: 'Name'
                            }),
                            $('<input>', {
                                name: 'newLocation',
                                class: 'form-control',
                                'data-form-key': 'name'
                            }),
                            $('<label>', {
                                text: 'Latitude'
                            }),
                            $('<input>', {
                                name: 'newLocation',
                                class: 'form-control',
                                type: 'number',
                                step: 0.00001,
                                'data-form-key': 'latitude'
                            }),
                            $('<label>', {
                                text: 'Longitude'
                            }),
                            $('<input>', {
                                name: 'newLocation',
                                class: 'form-control',
                                type: 'number',
                                step: 0.00001,
                                'data-form-key': 'longitude'
                            })
                        ]
                    })
                ]
            });

            $form.on(
                'change',
                'input[data-form-key="latitude"], input[data-form-key="longitude"]',
                function() {
                    // TODO: MOVE MAP MARKER TO GIVEN COORDS AND CENTER MAP AROUND THAT SPOT
                }
            );

            fbc.base.openMapDialog({
                header: 'Add new location',
                beforeMap: [$form],
                buttons: [
                    $('<button>', {
                        type: 'button',
                        class: 'btn btn-primary float-right',
                        text: 'Add',
                        click: function() {
                            // TODO: VALIDATE NAME NOT EMPTY
                            var $modal = $(this).closest('.modal');

                            var data = {};
                            $(
                                'form input[name="newLocation"]'
                            ).each(function() {
                                data[$(this).data('formKey')] = $(this).val();
                            });
                            fbc.locations.postNew(
                                data,
                                function() {
                                    $modal.modal('hide');
                                },
                                function() {
                                    // FAIL
                                    var error = $('<p>', {
                                        class: 'modal-help bg-danger', // TODO: COME UP WITH BETTER THAN BG DANGER?
                                        text: 'Error adding new location!'
                                    });
                                    $modal.find('.modal-body').append(error);
                                    setTimeout(function() {
                                        error.fadeOut(400, function() {
                                            $(this).remove();
                                        });
                                    }, 3000);
                                }
                            );
                        }
                    })
                ],
                closeButton: 'Cancel',
                mapClick: function(e) {
                    var coordinates = ol.proj.toLonLat(e.coordinate);
                    var $modal = $(e.originalEvent.target).closest('.modal');

                    $modal
                        .find('.modal-body')
                        .find('input[data-form-key="longitude"]')
                        .val(coordinates[0].toFixed(fbc.base.ol.decimalPlaces));

                    $modal
                        .find('.modal-body')
                        .find('input[data-form-key="latitude"]')
                        .val(coordinates[1].toFixed(fbc.base.ol.decimalPlaces));
                }
            });
        },
        postNew: function(param, successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + 'API/locations/',
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    Authorization: 'Token ' + fbc.base.parameters.token
                },
                data: JSON.stringify(param),
                success: function(data) {
                    fbc.locations.update(fbc.locations.updateTable);
                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function(xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                }
            });
        },
        showOnMap: function(location) {
            if (typeof location === 'number') {
                location = fbc.locations.dict[location];
            }

            fbc.base.openMapDialog({
                header: location.name,
                center: {
                    latitude: Number(location.latitude),
                    longitude: Number(location.longitude)
                },
                markCenter: true,
                closeButton: 'Close'
            });
        }
    };
})(fbc);
