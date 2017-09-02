(function(fbc) {
    fbc.games = {
        dict: {},
        getList: function() {
            return $.map(fbc.games.dict, function(game) {
                return game;
            });
        },
        initialize: function() {
            console.log("initializing games...");

            $("#add-new-game").click(fbc.games.openNewDialog);
            $("#refresh-games").click(function() {
                fbc.games.update(fbc.games.updateTable);
            });

            $("#refresh-games").click();
        },
        update: function(successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + "API/games/",
                method: "GET",
                beforeSend: function() {
                    fbc.base.loader.set("games");
                },
                complete: function() {
                    fbc.base.loader.remove("games");
                },
                success: function(data) {
                    fbc.games.dict = data;
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
            $("#games-table")
                .children("tbody")
                .children("tr")
                .remove();

            // TODO: copy game data to temp variable, perform sorting and present data

            $.each(fbc.games.getList(), function() {
                $("#games-table")
                    .children("tbody")
                    .append(
                        $("<tr>", {
                            html: [
                                $("<td>", {
                                    text: new Date(this.date).toDateString()
                                }),
                                $("<td>", {
                                    text:
                                        this.location_repr !== null
                                            ? this.location_repr.name
                                            : ""
                                }),
                                $("<td>", {
                                    html: fbc.games.getPlayerNames(this)
                                }),
                                $("<td>", {
                                    text: fbc.games.getStatusText(this)
                                })
                            ]
                        })
                    );
            });
        },
        getPlayerNames: function(game) {
            switch (game.state) {
                case 0:
                    return $('<ul>', {
                        html: $.map(game.players, function(player) {
                            return $("<li>", { text: player.name });
                        })
                    })
            }
            return "TODO: implement getPlayerNames for this game state";
        },
        getStatusText: function(game) {
            return "TODO: implement getStatusText";
            // game.team1_score + "-" + game.team2_score
        },
        openNewDialog: function() {
            var dialog = $("<div>", {
                id: "newGameModal",
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
                                        text: "Create new game"
                                    })
                                ]
                            }),
                            $("<div>", {
                                class: "modal-body",
                                html: [
                                    $("<div>", {
                                        html: [
                                            $("<form>", {
                                                html: [
                                                    $("<div>", {
                                                        class: "form-group",
                                                        html: [
                                                            $("<label>", {
                                                                text: "Location"
                                                            }),
                                                            $("<select>", {
                                                                class:
                                                                    "form-control",
                                                                "data-form-key":
                                                                    "location"
                                                            }),
                                                            $("<label>", {
                                                                text: "Players"
                                                            }),
                                                            $("<select>", {
                                                                class:
                                                                    "form-control",
                                                                "data-form-key":
                                                                    "player"
                                                            }),
                                                            $("<input>", {
                                                                class:
                                                                    "btn btn-success",
                                                                click: function() {
                                                                    // TODO: ADD NEW PLAYER SELECT
                                                                    // TODO: MAKE SURE SAME OPTION CANNOT BE SELECTED TWICE
                                                                }
                                                            })
                                                        ]
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
                                    $("<div>", {
                                        html: [
                                            $("<button>", {
                                                type: "button",
                                                class:
                                                    "btn btn-primary float-right",
                                                text: "Create",
                                                click: function() {
                                                    // TODO: POST NEW GAME

                                                    // TODO: ON SUCCESS:
                                                    $(this)
                                                        .closest(".modal")
                                                        .modal("hide");
                                                }
                                            }),
                                            $("<button>", {
                                                type: "button",
                                                class:
                                                    "btn btn-danger float-right",
                                                "data-dismiss": "modal",
                                                text: "Cancel"
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                })
            });

            // add players to step 1 dropdowns
            var players = fbc.players.getList().slice();

            players.sort(nameSort);

            for (var i = 0; i < players.length; i++) {
                dialog.find('select[data-form-key="player"]').append(
                    $("<option>", {
                        value: players[i].id,
                        text: players[i].name + " (" + players[i].score + ")"
                    })
                );
            }

            dialog.on("change", 'select[data-form-key="player"]', function() {
                // TODO: REMOVE ALL BUT SELECTED VALUES, LIST ALL BUT ADDED PLAYERS, ADD LISTED PLAYERS TO EACH OPTION
            });

            $("body").append(dialog);
            dialog.modal();

            dialog.one("hidden.bs.modal", function() {
                dialog.remove();
            });
        },
        postNew: function(data, successCallback, errorCallback) {
            if (token === undefined || token === null || token.length === 0) {
                // TODO: SET ERROR MESSAGE
                return;
            }

            $.ajax({
                url: fbc.base.parameters.server + "API/games/",
                method: "POST",
                contentType: "application/json",
                headers: {
                    Authorization: "Token " + token
                },
                data: JSON.stringify(data),
                beforeSend: function() {
                    // TODO: do something
                },
                complete: function(xhr, status) {
                    // TODO: do something
                },
                success: function(data) {
                    fbc.games.update(fbc.games.updateTable);

                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function(xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                    console.log(
                        "ERROR POSTING NEW GAME:" + xhr + status + error
                    );
                }
            });
        },
        openEnterResultDialog: function($elem) {
            var gameId = $elem.data("gameId");

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
                                        text: "Enter result"
                                    })
                                ]
                            }),
                            $("<div>", {
                                class: "modal-body",
                                html: $("<div>", {
                                    html: [
                                        $("<div>", {
                                            class: "row",
                                            html: [
                                                $("<div>", {
                                                    // TEAM 1
                                                    class: "col-xs-6",
                                                    html: [
                                                        $("<p>", {
                                                            text: "Team 1"
                                                        }),
                                                        $("<ul>", {
                                                            "data-field-name":
                                                                "team1",
                                                            html: getPlayerNames(
                                                                ongoingGames[
                                                                    gameIndex
                                                                ].team1,
                                                                true
                                                            )
                                                        })
                                                    ]
                                                }),
                                                $("<div>", {
                                                    // TEAM 2
                                                    class: "col-xs-6",
                                                    html: [
                                                        $("<p>", {
                                                            text: "Team 2"
                                                        }),
                                                        $("<ul>", {
                                                            "data-field-name":
                                                                "team2",
                                                            html: getPlayerNames(
                                                                ongoingGames[
                                                                    gameIndex
                                                                ].team2,
                                                                true
                                                            )
                                                        })
                                                    ]
                                                })
                                            ]
                                        }),
                                        $("<div>", {
                                            class: "row",
                                            html: [
                                                $("<div>", {
                                                    class: "col-xs-12",
                                                    html: $("<div>", {
                                                        class:
                                                            "btn-group btn-group-justified",
                                                        "data-form-key":
                                                            "result",
                                                        role: "group",
                                                        html: [
                                                            $("<div>", {
                                                                class:
                                                                    "btn-group",
                                                                role: "group",
                                                                html: $(
                                                                    "<button>",
                                                                    {
                                                                        type:
                                                                            "button",
                                                                        class:
                                                                            "btn btn-default",
                                                                        click: function() {
                                                                            changeActiveButton(
                                                                                $(
                                                                                    this
                                                                                )
                                                                            );
                                                                        },
                                                                        "data-team1-score": 2,
                                                                        "data-team2-score": 0,
                                                                        text:
                                                                            "2-0"
                                                                    }
                                                                )
                                                            }),
                                                            $("<div>", {
                                                                class:
                                                                    "btn-group",
                                                                role: "group",
                                                                html: $(
                                                                    "<button>",
                                                                    {
                                                                        type:
                                                                            "button",
                                                                        class:
                                                                            "btn btn-default",
                                                                        click: function() {
                                                                            changeActiveButton(
                                                                                $(
                                                                                    this
                                                                                )
                                                                            );
                                                                        },
                                                                        "data-team1-score": 2,
                                                                        "data-team2-score": 1,
                                                                        text:
                                                                            "2-1"
                                                                    }
                                                                )
                                                            }),
                                                            $("<div>", {
                                                                class:
                                                                    "btn-group",
                                                                role: "group",
                                                                html: $(
                                                                    "<button>",
                                                                    {
                                                                        type:
                                                                            "button",
                                                                        class:
                                                                            "btn btn-default",
                                                                        click: function() {
                                                                            changeActiveButton(
                                                                                $(
                                                                                    this
                                                                                )
                                                                            );
                                                                        },
                                                                        "data-team1-score": 1,
                                                                        "data-team2-score": 2,
                                                                        text:
                                                                            "1-2"
                                                                    }
                                                                )
                                                            }),
                                                            $("<div>", {
                                                                class:
                                                                    "btn-group",
                                                                role: "group",
                                                                html: $(
                                                                    "<button>",
                                                                    {
                                                                        type:
                                                                            "button",
                                                                        class:
                                                                            "btn btn-default",
                                                                        click: function() {
                                                                            changeActiveButton(
                                                                                $(
                                                                                    this
                                                                                )
                                                                            );
                                                                        },
                                                                        "data-team1-score": 0,
                                                                        "data-team2-score": 2,
                                                                        text:
                                                                            "0-2"
                                                                    }
                                                                )
                                                            })
                                                        ]
                                                    })
                                                })
                                            ]
                                        })
                                    ]
                                })
                            }),
                            $("<div>", {
                                class: "modal-footer",
                                html: [
                                    $("<button>", {
                                        type: "button",
                                        class: "btn btn-primary float-right",
                                        "data-game-id": gameId,
                                        "data-team1":
                                            ongoingGames[gameIndex].team1,
                                        "data-team2":
                                            ongoingGames[gameIndex].team2,
                                        text: "Post result",
                                        click: function() {
                                            var $result = $(this)
                                                .closest(".modal")
                                                .find(
                                                    "button.btn-primary[data-team1-score][data-team2-score]"
                                                );
                                            if ($result.length === 0) {
                                                enterResultMessage(
                                                    $(this)
                                                        .closest(".modal")
                                                        .find(".modal-body"),
                                                    "Select game result!"
                                                );
                                                return;
                                            }

                                            var gameId = $(this).data("gameId");
                                            var game = ongoingGames.filter(
                                                function(game) {
                                                    return game.id === gameId;
                                                }
                                            );

                                            var data = {
                                                team1: $(this)
                                                    .data("team1")
                                                    .split(","),
                                                team2: $(this)
                                                    .data("team2")
                                                    .split(","),
                                                team1_score: $result.data(
                                                    "team1Score"
                                                ),
                                                team2_score: $result.data(
                                                    "team2Score"
                                                )
                                            };

                                            if (game.length > 0) {
                                                data["date"] = new Date(
                                                    game[0].date
                                                ).toISOString();
                                            }

                                            postNewGame(data, function() {
                                                removeOngoingGame(gameId);
                                            });

                                            $(this)
                                                .closest(".modal")
                                                .modal("hide");
                                        }
                                    }),
                                    $("<button>", {
                                        type: "button",
                                        class: "btn btn-danger float-right",
                                        "data-dismiss": "modal",
                                        text: "Cancel"
                                    }),
                                    $("<button>", {
                                        type: "button",
                                        class: "btn btn-danger float-left",
                                        click: function() {
                                            var gameId = $(this)
                                                .siblings("[data-game-id]")
                                                .data("gameId");
                                            removeOngoingGame(gameId);
                                            $(this)
                                                .closest(".modal")
                                                .modal("hide");
                                        },
                                        text: "Cancel game"
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
        }
    };
})(fbc);
