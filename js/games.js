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

            $("#add-new-game").click(fbc.games.openGameDialog);
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
                    gamesObject = {};
                    for (var i = 0; i < data.length; i++) {
                        gamesObject[data[i].id] = data[i];
                    }
                    fbc.games.dict = gamesObject;

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
            var games = fbc.games.getList().slice();

            games.sort(fbc.base.sorting.date);
            games.reverse();

            $("#games-table")
                .children("tbody")
                .first()
                .html(
                    $.map(games, function(elem) {
                        return $("<tr>", {
                            html: [
                                $("<td>", {
                                    text: new Date(elem.date).toLocaleString()
                                }),
                                $("<td>", {
                                    text:
                                        elem.location_repr !== null
                                            ? elem.location_repr.name
                                            : ""
                                }),
                                $("<td>", {
                                    html: fbc.games.getPlayerNames(elem)
                                }),
                                $("<td>", {
                                    text: fbc.games.getStatusText(elem)
                                }),
                                $("<td>", {
                                    html: [
                                        elem.state === 0 || elem.state === 1
                                            ? $("<input>", {
                                                  "data-logged-in": "true",
                                                  type: "button",
                                                  class: "btn btn-primary",
                                                  value: "Modify",
                                                  click: function() {
                                                      // TODO: OPEN MODIFY DIALOG
                                                  }
                                              })
                                            : null,
                                        elem.state === 1
                                            ? $("<input>", {
                                                  type: "button",
                                                  class: "btn btn-primary",
                                                  value: "Enter result",
                                                  click: function() {
                                                      // TODO: OPEN ENTER RESULT DIALOG
                                                  }
                                              })
                                            : null
                                    ]
                                })
                            ]
                        });
                    })
                );
        },
        getPlayerNames: function(game) {
            switch (game.state) {
                case 0:
                    return $("<ul>", {
                        html: $.map(game.players, function(player) {
                            return $("<li>", { text: player.name });
                        })
                    });
                case 1:
                case 2:
                case 4:
                    var team1 = [];
                    var team2 = [];
                    var noTeam = [];

                    for (var i = 0; i < game.players.length; i++) {
                        var player = game.players[i];
                        switch (player.team) {
                            case 1:
                                team1.push[player.id];
                                break;
                            case 2:
                                team2.push[player.id];
                                break;
                            default:
                                noTeam.push(player.id);
                        }
                    }

                    var result = [];

                    if (noTeam.length > 0) {
                        if (team1.length > 0 || team2.length > 0) {
                            result.push($("<p>", { text: "No team" }));
                        }

                        result.push(
                            $("<ul>", {
                                html: $.map(noTeam, function(player) {
                                    return $("<li>", { text: player.name });
                                })
                            })
                        );
                    }

                    if (team1.length > 0) {
                        result.push($("<p>", { text: "Team 1" }));

                        result.push(
                            $("<ul>", {
                                html: $.map(team1, function(player) {
                                    return $("<li>", { text: player.name });
                                })
                            })
                        );
                    }

                    if (team2.length > 0) {
                        result.push($("<p>", { text: "Team 2" }));

                        result.push(
                            $("<ul>", {
                                html: $.map(team2, function(player) {
                                    return $("<li>", { text: player.name });
                                })
                            })
                        );
                    }

                    return result;
                default:
                    return "";
            }
        },
        getStatusText: function(game) {
            switch (game.state) {
                case 0:
                    return (
                        "Game is missing " +
                        (fbc.base.parameters.maxPlayers - game.players.length) +
                        " players"
                    );
                case 1:
                    return "Game is full";
                case 2:
                    return (
                        "Result " +
                        game.team1_score +
                        "-" +
                        game.team2_score +
                        " is waiting for confirmation"
                    );
                case 4:
                    return (
                        "Result " +
                        game.team1_score +
                        "-" +
                        game.team2_score +
                        " has been confirmed"
                    );
                default:
                    return "";
            }
        },
        openGameDialog: function(parameters) {
            parameters = parameters || {};
            if (!parameters.hasOwnProperty("id")) {
                parameters["new"] = true;
            }

            var players = fbc.players.getList();

            var dialog = $("<div>", {
                id: "gameModal",
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
                                        text:
                                            parameters.new === true
                                                ? "Create new game"
                                                : "Modify game"
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
                                                        id: "game-info",
                                                        class: "form-group",
                                                        html: [
                                                            $("<label>", {
                                                                text: "Name"
                                                            }),
                                                            $("<input>", {
                                                                type: "text",
                                                                class:
                                                                    "form-control",
                                                                "data-form-key":
                                                                    "name"
                                                            }),
                                                            $("<label>", {
                                                                text:
                                                                    "Date and time"
                                                            }),
                                                            $("<input>", {
                                                                type:
                                                                    "datetime-local",
                                                                class:
                                                                    "form-control",
                                                                "data-form-key":
                                                                    "date"
                                                            }),
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
                                            parameters.new === true
                                                ? $("<button>", {
                                                      type: "button",
                                                      class:
                                                          "btn btn-primary float-right",
                                                      text: "Create",
                                                      click: function() {
                                                          var $btn = $(this);
                                                          $btn.addClass(
                                                              "disabled"
                                                          );
                                                          $btn.prop(
                                                              "disabled",
                                                              true
                                                          );

                                                          var $modal = $btn.closest(
                                                              ".modal"
                                                          );

                                                          var data = fbc.games.gatherGameInfo(
                                                              $modal
                                                                  .find(
                                                                      $(
                                                                          "#game-info"
                                                                      )
                                                                  )
                                                                  .first()
                                                          );

                                                          fbc.games.postNew(
                                                              data,
                                                              function() {
                                                                  $modal.modal(
                                                                      "hide"
                                                                  );
                                                              },
                                                              function() {
                                                                  $btn.removeClass(
                                                                      "disabled"
                                                                  );

                                                                  $btn.prop(
                                                                      "disabled",
                                                                      false
                                                                  );
                                                              }
                                                          );
                                                      }
                                                  })
                                                : $("<button>", {
                                                      type: "button",
                                                      class:
                                                          "btn btn-primary float-right",
                                                      text: "Modify",
                                                      click: function() {
                                                          // TODO: POST CHANGES

                                                          // TODO: ON SUCCESS:
                                                          $(elem)
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

            var gameInfo = dialog.find("#game-info");

            var locationSelect = gameInfo
                .find('select[data-form-key="location"]')
                .first();

            locationSelect.html(
                $.map(fbc.locations.getList(), function(item) {
                    return $("<option>", {
                        value: item.id,
                        text: item.name
                    });
                })
            );

            locationSelect.prepend(
                $("<option>", {
                    value: "",
                    text: ""
                })
            );

            locationSelect.val("");

            if (
                gameInfo.children('select[data-form-key="player"]').length <
                fbc.base.parameters.maxPlayers
            ) {
                gameInfo.append(
                    $("<select>", {
                        class: "form-control",
                        "data-form-key": "player"
                    })
                );
            }

            var $playerSelects = dialog.find('select[data-form-key="player"]');

            $playerSelects.append(
                $("<option>", {
                    value: "",
                    text: ""
                })
            );

            for (var i = 0; i < players.length; i++) {
                $playerSelects.append(
                    $("<option>", {
                        value: players[i].id,
                        text: players[i].name + " (" + players[i].score + ")"
                    })
                );
            }

            dialog.on("change", 'select[data-form-key="player"]', function(e) {
                var $target = $(e.currentTarget);

                var $emptySelections = $playerSelects.filter(function() {
                    return $(this).val() === "";
                });

                if ($target.val() === "") {
                    // player selection was removed

                    // remove other empty selections
                    var $otherEmptySelections = $emptySelections.not($target);
                    $otherEmptySelections.remove();
                    $playerSelects = $playerSelects.not($otherEmptySelections);

                    // move the current target to last
                    gameInfo.append($target);
                } else {
                    // player selection was added
                    if (
                        $emptySelections.length === 0 &&
                        $playerSelects.length < fbc.base.parameters.maxPlayers
                    ) {
                        var $newSelect = $target.clone();
                        $newSelect.val("");

                        $playerSelects = $playerSelects.add($newSelect);
                        gameInfo.append($newSelect);
                    }
                }

                var selectedValues = $.grep(
                    $playerSelects
                        .map(function() {
                            return $(this).val();
                        })
                        .get(),
                    function(item) {
                        return item !== "";
                    }
                );

                $playerSelects.children("option").prop("disabled", false);

                $playerSelects.each(function() {
                    $this = $(this);
                    var selectedValue = $this.val();

                    var disableValues = $.grep(selectedValues, function(item) {
                        return item !== selectedValue;
                    });

                    $.each(disableValues, function(index, item) {
                        $this
                            .children('option[value="' + item + '"]')
                            .prop("disabled", true);
                    });
                });
            });

            $("body").append(dialog);
            dialog.modal();

            dialog.one("hidden.bs.modal", function() {
                dialog.remove();
            });
        },
        gatherGameInfo: function($element) {
            var name = $element
                .children('input[data-form-key="name"]')
                .first()
                .val();

            var date = $element
                .children('input[data-form-key="date"]')
                .first()
                .val();

            var location = $element
                .children('select[data-form-key="location"]')
                .first()
                .val();

            var players = $element
                .children('select[data-form-key="player"]')
                .filter(function() {
                    return $(this).val() !== "";
                })
                .map(function() {
                    return {
                        id: parseInt($(this).val())
                    };
                })
                .get();

            return {
                name: name,
                date: date !== "" ? new Date(date).toISOString() : "",
                location: location !== '' ? parseInt(location) : '',
                players: players
            };
        },
        postNew: function(data, successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + "API/games/",
                method: "POST",
                contentType: "application/json",
                headers: {
                    Authorization: "Token " + fbc.base.parameters.token
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
                                                                                    elem
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
                                                                                    elem
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
                                                                                    elem
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
                                                                                    elem
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
                                            var $result = $(elem)
                                                .closest(".modal")
                                                .find(
                                                    "button.btn-primary[data-team1-score][data-team2-score]"
                                                );
                                            if ($result.length === 0) {
                                                enterResultMessage(
                                                    $(elem)
                                                        .closest(".modal")
                                                        .find(".modal-body"),
                                                    "Select game result!"
                                                );
                                                return;
                                            }

                                            var gameId = $(elem).data("gameId");

                                            var data = {
                                                team1: $(elem)
                                                    .data("team1")
                                                    .split(","),
                                                team2: $(elem)
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

                                            // TODO: IMPLEMENT
                                            postResult(data, function() {
                                                $(elem)
                                                    .closest(".modal")
                                                    .modal("hide");
                                            });
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
                                            var gameId = $(elem)
                                                .siblings("[data-game-id]")
                                                .data("gameId");
                                            removeOngoingGame(gameId);
                                            $(elem)
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
