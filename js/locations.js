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
            console.log("initializing locations...");

            $("#add-new-location").click(fbc.locations.openNewDialog);

            $("#refresh-locations").click(function() {
                fbc.locations.update(fbc.locations.updateTable);
            });

            $("#refresh-locations").click();
        },
        update: function(successCallback, errorCallback) {
            ///<summary>Update fbc.locations.dict from server</summary>
            $.ajax({
                url: fbc.base.parameters.server + "API/locations/",
                method: "GET",
                beforeSend: function() {
                    fbc.base.loader.set("locations");
                },
                complete: function() {
                    fbc.base.loader.remove("locations");
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

            $("#locations-table")
                .children("tbody")
                .first()
                .html(
                    $.map(locations, function(elem) {
                        return $("<tr>", {
                            html: [
                                $("<td>", {
                                    text: elem.name
                                }),
                                $("<td>", {
                                    text:
                                        elem.latitude.length > 0 &&
                                        elem.longitude.length > 0
                                            ? "lat:" +
                                              elem.latitude +
                                              " long:" +
                                              elem.longitude
                                            : ""
                                })
                            ]
                        });
                    })
                );
        },
        openNewDialog: function() {
            var dialog = $("<div>", {
                class: "modal fade",
                html: $("<div>", {
                    class: "modal-dialog",
                    html: $("<div>", {
                        class: "modal-content",
                        html: [
                            $("<div>", {
                                class: "modal-header",
                                html: [
                                    $("<button>", {
                                        type: "button",
                                        class: "close",
                                        "data-dismiss": "modal",
                                        html: "&times;"
                                    }),
                                    $("<h4>", {
                                        class: "modal-title",
                                        text: "Add new location"
                                    })
                                ]
                            }),
                            $("<div>", {
                                class: "modal-body",
                                html: [
                                    $("<form>", {
                                        html: [
                                            $("<div>", {
                                                class: "form-group",
                                                html: [
                                                    $("<label>", {
                                                        for: "newLocationName",
                                                        text: "Name"
                                                    }),
                                                    $("<input>", {
                                                        id: "newLocationName",
                                                        class: "form-control",
                                                        name: "newLocation",
                                                        "data-form-key": "name"
                                                    }),
                                                    $("<label>", {
                                                        for:
                                                            "newLocationLatitude",
                                                        text: "Latitude"
                                                    }),
                                                    $("<input>", {
                                                        id:
                                                            "newLocationLatitude",
                                                        class: "form-control",
                                                        name: "newLocation",
                                                        type: "number",
                                                        step: 0.00001,
                                                        "data-form-key":
                                                            "latitude"
                                                    }),
                                                    $("<label>", {
                                                        for:
                                                            "newLocationLongitude",
                                                        text: "Longitude"
                                                    }),
                                                    $("<input>", {
                                                        id:
                                                            "newLocationLongitude",
                                                        class: "form-control",
                                                        name: "newLocation",
                                                        type: "number",
                                                        step: 0.00001,
                                                        "data-form-key":
                                                            "longitude"
                                                    }),
                                                    $("<p>", {
                                                        class: "help-block"
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            $("<div>", {
                                class: "modal-footer",
                                html: [
                                    $("<button>", {
                                        type: "button",
                                        class: "btn btn-primary float-right",
                                        text: "Add",
                                        click: function() {
                                            // TODO: VALIDATE NAME NOT EMPTY
                                            var $modal = $(this).closest(
                                                ".modal"
                                            );

                                            var data = {};
                                            $(
                                                'form input[name="newLocation"]'
                                            ).each(function() {
                                                data[
                                                    $(this).data("formKey")
                                                ] = $(this).val();
                                            });
                                            fbc.locations.postNew(
                                                data,
                                                function() {
                                                    $modal.modal("hide");
                                                },
                                                function() {
                                                    // FAIL
                                                    var error = $("<p>", {
                                                        class:
                                                            "modal-help bg-danger", // TODO: COME UP WITH BETTER THAN BG DANGER?
                                                        text:
                                                            "Error adding new location!"
                                                    });
                                                    $modal
                                                        .find(".modal-body")
                                                        .append(error);
                                                    setTimeout(function() {
                                                        error.fadeOut(
                                                            400,
                                                            function() {
                                                                $(
                                                                    this
                                                                ).remove();
                                                            }
                                                        );
                                                    }, 3000);
                                                }
                                            );
                                        }
                                    }),
                                    $("<button>", {
                                        type: "button",
                                        class: "btn btn-danger float-right",
                                        "data-dismiss": "modal",
                                        text: "Cancel"
                                    })
                                ]
                            })
                        ]
                    })
                })
            });

            $("body").append(dialog);
            dialog.modal();

            dialog.one("hidden.bs.modal", function() {
                dialog.remove();
            });
        },
        postNew: function(param, successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + "API/locations/",
                method: "POST",
                contentType: "application/json",
                headers: {
                    Authorization: "Token " + fbc.base.parameters.token
                },
                data: JSON.stringify(param),
                beforeSend: function() {
                    // TODO: do something
                },
                complete: function(xhr, status) {
                    // TODO: do something
                },
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
                    console.log(
                        "ERROR POSTING NEW LOCATION:" + xhr + status + error
                    );
                }
            });
        }
    };
})(fbc);
