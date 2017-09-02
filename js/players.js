(function(fbc) {
    fbc.players = {
        dict: {},
        getList: function() {
            return $.map(fbc.players.dict, function(player) {
                return player;
            });
        },
        initialize: function() {
            ///<summary>Players initialization</summary>
            console.log("initializing players...");
            $("#add-new-player").click(fbc.players.openNewDialog);

            $("#refresh-players").click(function() {
                fbc.players.update(fbc.players.updateTable);
            });

            $("#players-table")
                .find("thead > tr > th[data-sort-type]")
                .click(function() {
                    // TODO: UPDATE URL BASED ON CLICKED ELEMENT
                });

            $("#refresh-players").click();
        },
        update: function(successCallback, errorCallback) {
            ///<summary>Update fbc.players.dict from server</summary>
            $.ajax({
                url: fbc.base.parameters.server + "API/players/",
                method: "GET",
                beforeSend: function() {
                    fbc.base.loader.set("players");
                },
                complete: function() {
                    fbc.base.loader.remove("players");
                },
                success: function(data) {
                    playerObject = {};
                    for (var i = 0; i < data.length; i++) {
                        playerObject[data[i].id] = data[i];
                    }
                    fbc.players.dict = playerObject;

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
            ///<summary>Update #Players table</summary>
            $("#players-table")
                .children("tbody")
                .children("tr")
                .remove();

            // TODO: copy player data to temp variable, perform sorting and present data

            $.each(fbc.players.getList(), function() {
                $("#players-table")
                    .children("tbody")
                    .append(
                        $("<tr>", {
                            html: [
                                $("<td>", {
                                    html: $("<img>", {
                                        src:
                                            this.rank !== null
                                                ? this.rank.image_url
                                                : "",
                                        title:
                                            this.rank !== null
                                                ? this.rank.name
                                                : ""
                                    })
                                }),
                                $("<td>", {
                                    text: this.name
                                }),
                                $("<td>", {
                                    text: this.score
                                })
                            ]
                        })
                    );
            });
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
                                        text: "Add new player"
                                    })
                                ]
                            }),
                            $("<div>", {
                                class: "modal-body", // TODO: ADD GENERAL HELP TEXT BLOCK TO MODAL BODY
                                html: [
                                    $("<form>", {
                                        html: [
                                            $("<div>", {
                                                class: "form-group",
                                                html: [
                                                    $("<label>", {
                                                        for: "newPlayerName",
                                                        text: "Name"
                                                    }),
                                                    $("<input>", {
                                                        id: "newPlayerName",
                                                        class: "form-control",
                                                        name: "newPlayer",
                                                        "data-form-key": "name"
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
                                            var data = {};
                                            $(
                                                'form input[name="newPlayer"]'
                                            ).each(function() {
                                                data[
                                                    $(this).data("formKey")
                                                ] = $(this).val();
                                            });
                                            fbc.players.postNew(
                                                data,
                                                function() {
                                                    // SUCCESS
                                                    $("#newPlayerName")
                                                        .closest(".modal")
                                                        .modal("hide");
                                                },
                                                function() {
                                                    // FAIL
                                                    var error = $("<p>", {
                                                        class:
                                                            "modal-help bg-danger", // TODO: COME UP WITH BETTER THAN BG DANGER?
                                                        text:
                                                            "Error adding new player!"
                                                    });
                                                    $("#newPlayerName")
                                                        .closest(".modal")
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
                url: fbc.base.parameters.server + "API/players/",
                method: "POST",
                contentType: "application/json",
                headers: {
                    Authorization: "Token " + token
                },
                data: JSON.stringify(param),
                beforeSend: function() {
                    // TODO: do something
                },
                complete: function(xhr, status) {
                    // TODO: do something
                },
                success: function(data) {
                    fbc.players.update(fbc.players.updateTable);
                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function(xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                    console.log(
                        "ERROR POSTING NEW PLAYER:" + xhr + status + error
                    );
                }
            });
        }
    };
})(fbc);
