(function (fbc) {
    fbc.games = {
        dict: {},
        getList: function () {
            return $.map(fbc.games.dict, function (game) {
                return game;
            });
        },
        initialize: function () {
            $('#add-new-game').click(fbc.games.openGameDialog);
            $('#refresh-games').click(function () {
                fbc.games.update(fbc.games.updateTable);
            });

            $('#refresh-games').click();
        },
        update: function (successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + 'API/games/',
                method: 'GET',
                beforeSend: function () {
                    fbc.base.loader.set('games');
                },
                complete: function () {
                    fbc.base.loader.remove('games');
                },
                success: function (data) {
                    gamesObject = {};
                    for (var i = 0; i < data.length; i++) {
                        gamesObject[data[i].id] = data[i];
                    }
                    fbc.games.dict = gamesObject;

                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function (xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                }
            });
        },
        updateTable: function () {
            var games = fbc.games.getList().slice();

            games.sort(fbc.base.sorting.date);
            games.reverse();

            $('#games-table')
                .children('tbody')
                .first()
                .html(
                    $.map(games, function (elem) {
                        var buttons = [];

                        if (elem.state === 0 && elem.players.length === 0) {
                            buttons.push(
                                $('<input>', {
                                    'data-logged-in': 'true',
                                    type: 'button',
                                    class: 'btn btn-primary',
                                    value: 'Remove game',
                                    click: function () {
                                        fbc.games.confirmRemoveGame(elem);
                                    }
                                })
                            );
                        }

                        if (
                            elem.state === 0 &&
                            elem.players.length ===
                            fbc.base.parameters.maxPlayers
                        ) {
                            buttons.push(
                                $('<input>', {
                                    'data-logged-in': 'true',
                                    type: 'button',
                                    class: 'btn btn-primary',
                                    value: 'Form teams',
                                    click: function () {
                                        fbc.games.confirmFormTeams(elem.id);
                                    }
                                })
                            );
                        }

                        if (elem.state === 0) {
                            buttons.push(
                                $('<input>', {
                                    'data-logged-in': 'true',
                                    type: 'button',
                                    class: 'btn btn-primary',
                                    value: 'Edit game',
                                    click: function () {
                                        fbc.games.openGameDialog(elem);
                                    }
                                })
                            );
                        }

                        if (elem.state === 1) {
                            buttons.push(
                                $('<input>', {
                                    'data-logged-in': 'true',
                                    type: 'button',
                                    class: 'btn btn-primary',
                                    value: 'Enter result',
                                    click: function () {
                                        fbc.games.openEnterResultDialog(elem);
                                    }
                                })
                            );
                        }

                        // hide action buttons if not logged in
                        if (
                            fbc.base.parameters.token === null ||
                            fbc.base.parameters.token.length === 0
                        ) {
                            $.each(buttons, function (index, button) {
                                button.hide();
                            });
                        }

                        return $('<tr>', {
                            html: [
                                $('<td>', {
                                    text: new Date(elem.date).toLocaleString()
                                }),
                                $('<td>', {
                                    text: elem.location_repr !== null ?
                                        elem.location_repr.name :
                                        ''
                                }),
                                $('<td>', {
                                    html: fbc.games.getPlayerNames(elem)
                                }),
                                $('<td>', {
                                    text: fbc.games.getStatusText(elem)
                                }),
                                $('<td>', {
                                    html: buttons
                                })
                            ]
                        });
                    })
                );
        },
        getPlayerNames: function (game) {
            switch (game.state) {
                case 0:
                    return $('<ul>', {
                        html: $.map(game.players, function (player) {
                            return $('<li>', {
                                text: player.name
                            });
                        })
                    });
                case 1:
                case 2:
                case 3:
                    return [
                        $('<p>', {
                            text: 'Team 1'
                        }),
                        $('<ul>', {
                            html: $.map(
                                $.grep(game.players, function (p) {
                                    return p.team === 1;
                                }),
                                function (p) {
                                    return $('<li>', {
                                        text: p.name
                                    });
                                }
                            )
                        }),
                        $('<p>', {
                            text: 'Team 2'
                        }),
                        $('<ul>', {
                            html: $.map(
                                $.grep(game.players, function (p) {
                                    return p.team === 2;
                                }),
                                function (p) {
                                    return $('<li>', {
                                        text: p.name
                                    });
                                }
                            )
                        })
                    ];
                default:
                    return '';
            }
        },
        getStatusText: function (game) {
            switch (game.state) {
                case 0:
                    return (
                        'Game is missing ' +
                        (fbc.base.parameters.maxPlayers - game.players.length) +
                        ' players'
                    );
                case 1:
                    return 'Game is full';
                case 2:
                    return (
                        'Result ' +
                        game.team1_score +
                        '-' +
                        game.team2_score +
                        ' is waiting for confirmation'
                    );
                case 3:
                    return (
                        'Result ' +
                        game.team1_score +
                        '-' +
                        game.team2_score +
                        ' has been confirmed'
                    );
                default:
                    return '';
            }
        },
        openGameDialog: function (game) {
            game = game || {};
            game.new = !game.hasOwnProperty('id');

            if (!game.hasOwnProperty('players')) {
                game.players = [];
            }

            var players = fbc.players.getList();

            var dialog = $('<div>', {
                id: 'gameModal',
                class: 'modal fade',
                html: $('<div>', {
                    class: 'modal-dialog',
                    html: $('<div>', {
                        class: 'modal-content',
                        html: [
                            $('<div>', {
                                class: 'modal-header',
                                html: [
                                    $('<button>', {
                                        type: 'button',
                                        class: 'close',
                                        'data-dismiss': 'modal',
                                        html: '&times;'
                                    }),
                                    $('<h4>', {
                                        class: 'modal-title',
                                        text: game.new === true ?
                                            'Create new game' :
                                            'Edit game'
                                    })
                                ]
                            }),
                            $('<div>', {
                                class: 'modal-body',
                                html: [
                                    $('<div>', {
                                        html: [
                                            $('<form>', {
                                                html: [
                                                    $('<div>', {
                                                        id: 'game-info',
                                                        class: 'form-group',
                                                        html: [
                                                            $('<label>', {
                                                                text: 'Name'
                                                            }),
                                                            $('<input>', {
                                                                disabled: !game.new,
                                                                type: 'text',
                                                                class: 'form-control',
                                                                'data-form-key': 'name'
                                                            }),
                                                            $('<label>', {
                                                                text: 'Date and time'
                                                            }),
                                                            $('<input>', {
                                                                disabled: !game.new,
                                                                type: 'datetime-local',
                                                                class: 'form-control',
                                                                'data-form-key': 'date'
                                                            }),
                                                            $('<label>', {
                                                                text: 'Location'
                                                            }),
                                                            $('<select>', {
                                                                disabled: !game.new,
                                                                class: 'form-control',
                                                                'data-form-key': 'location'
                                                            }),
                                                            $('<label>', {
                                                                text: 'Players'
                                                            })
                                                        ]
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            $('<div>', {
                                class: 'modal-footer',
                                html: [
                                    $('<div>', {
                                        html: [
                                            game.new === true ?
                                            $('<button>', {
                                                type: 'button',
                                                class: 'btn btn-primary float-right',
                                                text: 'Create',
                                                click: function () {
                                                    var $btn = $(this);
                                                    fbc.base.element.disable(
                                                        $btn
                                                    );

                                                    var $modal = $btn.closest(
                                                        '.modal'
                                                    );

                                                    var data = fbc.games.gatherGameInfo(
                                                        $modal
                                                        .find(
                                                            $(
                                                                '#game-info'
                                                            )
                                                        )
                                                        .first()
                                                    );

                                                    fbc.games.postNew(
                                                        data,
                                                        function () {
                                                            $modal.modal(
                                                                'hide'
                                                            );
                                                        },
                                                        function () {
                                                            fbc.base.element.enable(
                                                                $btn
                                                            );
                                                        }
                                                    );
                                                }
                                            }) :
                                            null,
                                            $('<button>', {
                                                type: 'button',
                                                class: 'btn btn-danger float-right',
                                                'data-dismiss': 'modal',
                                                text: game.new ?
                                                    'Cancel' :
                                                    'Close'
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                })
            });

            var gameInfo = dialog.find('#game-info');

            var locationSelect = gameInfo
                .find('select[data-form-key="location"]')
                .first();

            locationSelect.html(
                $.map(fbc.locations.getList(), function (item) {
                    return $('<option>', {
                        value: item.id,
                        text: item.name
                    });
                })
            );

            locationSelect.prepend(
                $('<option>', {
                    value: '',
                    text: ''
                })
            );

            if (game.new) {
                locationSelect.val('');
            } else {
                gameInfo
                    .find('input[data-form-key="name"]')
                    .first()
                    .val(game.name);

                var dateString = new Date(game.date).toISOString();

                gameInfo
                    .find('input[data-form-key="date"]')
                    .first()
                    .val(dateString.substr(0, dateString.length - 1));

                locationSelect.val(
                    game.location !== null ? game.location.id : ''
                );
            }

            for (var i = 0; i < game.players.length; i++) {
                gameInfo.append(
                    fbc.games.getPlayerSelect(players, game.players[i].id)
                );
            }

            if (game.players.length < fbc.base.parameters.maxPlayers) {
                gameInfo.append(fbc.games.getPlayerSelect(players));
            }

            fbc.base.disableValuesFromOtherSelects(
                dialog.find('select[data-form-key="player"]')
            );

            dialog.on('change', 'select[data-form-key="player"]', function (e) {
                var $target = $(e.currentTarget);

                var successCallback = function () {
                    var $playerSelects = dialog.find(
                        'select[data-form-key="player"]'
                    );

                    var $emptySelections = $playerSelects.filter(function () {
                        return $(this).val() === '';
                    });

                    if (
                        $emptySelections.length === 0 &&
                        $playerSelects.length < fbc.base.parameters.maxPlayers
                    ) {
                        gameInfo
                            .children('select[data-form-key="player"]')
                            .last()
                            .after(fbc.games.getPlayerSelect(players));
                    }

                    fbc.base.disableValuesFromOtherSelects($playerSelects);
                };

                if (game.new) {
                    successCallback();
                } else {
                    fbc.games.playerChange(game.id, $target, successCallback);
                }
            });

            $('body').append(dialog);
            dialog.modal();

            if (!game.new) {
                dialog.one('hidden.bs.modal', function () {
                    fbc.games.update(fbc.games.updateTable);
                });
            }

            dialog.one('hidden.bs.modal', function () {
                dialog.remove();
            });
        },
        confirmFormTeams: function (gameId) {
            fbc.base.showDialog({
                header: 'Form teams',
                body: [
                    $('<p>', {
                        text: 'Players:'
                    }),
                    $('<ul>', {
                        html: $.map(fbc.games.dict[gameId].players, function (
                            player
                        ) {
                            return $('<li>', {
                                text: player.name
                            });
                        })
                    })
                ],
                buttons: [
                    $('<button>', {
                        type: 'button',
                        class: 'btn btn-primary float-right',
                        text: 'Form',
                        click: function () {
                            var $btn = $(this);
                            fbc.base.element.disable($btn);

                            var $modal = $btn.closest('.modal');

                            fbc.games.formTeams(
                                gameId,
                                function () {
                                    $modal.modal('hide');
                                },
                                function () {
                                    fbc.base.element.enable($btn);
                                }
                            );
                        }
                    })
                ],
                closeButton: 'Cancel'
            });
        },
        gatherGameInfo: function ($element) {
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
                .filter(function () {
                    return $(this).val() !== '';
                })
                .map(function () {
                    return {
                        id: parseInt($(this).val())
                    };
                })
                .get();

            return {
                name: name,
                date: date !== '' ? new Date(date).toISOString() : '',
                location: location !== '' ? parseInt(location) : '',
                players: players
            };
        },
        postNew: function (data, successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + 'API/games/',
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    Authorization: 'Token ' + fbc.base.parameters.token
                },
                data: JSON.stringify(data),
                success: function (data) {
                    fbc.games.dict[data.id] = data;
                    fbc.games.updateTable();

                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function (xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                }
            });
        },
        confirmRemoveGame: function (game) {
            fbc.base.showDialog({
                header: 'Remove game',
                body: [
                    $('<p>', {
                        text: 'GameId: ' + game.id
                    }),
                    $('<p>', {
                        text: 'Name: ' + game.name
                    }),
                    $('<p>', {
                        text: 'Location: ' +
                            (game.location_repr !== null ?
                                game.location_repr.name :
                                '')
                    }),
                    $('<p>', {
                        text: 'Date: ' +
                            (game.date !== null ?
                                new Date(game.date).toLocaleString() :
                                '')
                    })
                ],
                buttons: [
                    $('<button>', {
                        type: 'button',
                        class: 'btn btn-primary float-right',
                        text: 'Remove',
                        click: function () {
                            var $btn = $(this);
                            fbc.base.element.disable($btn);

                            fbc.games.removeGame(
                                game.id,
                                function () {
                                    $btn.closest('.modal').modal('hide');
                                },
                                function () {
                                    fbc.base.element.enable($btn);
                                }
                            );
                        }
                    })
                ],
                closeButton: 'Cancel'
            });
        },
        removeGame: function (gameId, successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + 'API/games/' + gameId + '/',
                method: 'DELETE',
                headers: {
                    Authorization: 'Token ' + fbc.base.parameters.token
                },
                success: function (data) {
                    delete fbc.games.dict[gameId];
                    fbc.games.updateTable();

                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function (xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                }
            });
        },
        playerChange: function (gameId, $select, successCallback) {
            var messageColor = '';
            var successValue = null;

            var newValue = $select.val();
            var oldValue = $select.data('value');

            var method = oldValue === '' ? 'add' : 'remove';

            var errorMessage =
                'Error ' +
                (method === 'add' ? 'adding' : 'removing') +
                ' player!';
            var successMessage = '';

            var playerId = method === 'add' ? newValue : oldValue;

            switch (method) {
                case 'add':
                    successMessage = ' added';
                    messageColor = 'green';
                    successValue = playerId;
                    break;
                case 'remove':
                    successMessage = ' removed';
                    messageColor = 'red';
                    successValue = '';
                    break;
            }

            $.ajax({
                url: fbc.base.parameters.server +
                    'API/games/' +
                    gameId +
                    '/' +
                    method +
                    '_player/',
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    Authorization: 'Token ' + fbc.base.parameters.token
                },
                data: JSON.stringify({
                    id: playerId
                }),
                beforeSend: function () {
                    fbc.base.element.disable($select);
                },
                complete: function (xhr, status) {
                    fbc.base.element.enable($select);
                },
                success: function (data) {
                    var $msg = $('<p>', {
                        css: {
                            color: messageColor
                        },
                        text: fbc.players.dict[playerId].name + successMessage
                    });

                    $select.parent().append($msg);
                    fbc.base.hideElementAfter($msg, 3000);

                    $select.data('value', successValue);

                    if (method === 'remove') {
                        if (newValue === '') {
                            $select.remove();
                        } else {
                            fbc.games.playerChange(
                                gameId,
                                $select,
                                successCallback
                            );
                            return;
                        }
                    }

                    if ($.isFunction(successCallback)) {
                        successCallback();
                    }
                },
                error: function (xhr, status, error) {
                    $select.val($select.data('value'));
                }
            });
        },
        patchGame: function (gameId, data, successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + 'API/games/' + gameId + '/',
                method: 'PATCH',
                contentType: 'application/json',
                headers: {
                    Authorization: 'Token ' + fbc.base.parameters.token
                },
                data: JSON.stringify(data),
                success: function (data) {
                    fbc.games.dict[gameId] = data;
                    fbc.games.updateTable();

                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function (xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                }
            });
        },
        getPlayerSelect: function (players, value) {
            var $select = $('<select>', {
                class: 'form-control',
                'data-form-key': 'player',
                html: $('<option>', {
                    value: '',
                    text: ''
                })
            });

            $select.append(
                $.map(players, function (player) {
                    return $('<option>', {
                        value: player.id,
                        text: player.name + ' (' + player.score + ')'
                    });
                })
            );

            $select.val(value !== undefined ? value : '');
            $select.data('value', $select.val());

            return $select;
        },
        openEnterResultDialog: function (game) {
            var $saveButton = $('<button>', {
                type: 'button',
                disabled: true,
                class: 'btn btn-primary float-right disabled',
                text: 'Save result',
                click: function () {
                    var $btn = $(this);

                    fbc.base.element.disable($btn);

                    var $modal = $btn.closest('.modal');
                    var $selection = $modal
                        .find('.modal-body')
                        .find(
                            'button.active[data-team1-score][data-team2-score]'
                        );

                    var data = {
                        team1_score: $selection.data('team1Score'),
                        team2_score: $selection.data('team2Score'),
                        state: 2
                    };

                    fbc.games.patchGame(game.id, data, function() {
                            fbc.games.patchGame(game.id, { state: 3 }, function() {
                                    $modal.modal('hide');
                                }, function() {
                                    $modal.modal('hide');
                                });
                        }, function() {
                            fbc.base.element.enable($btn);
                        });
                }
            });

            var changeActiveButton = function ($btn) {
                $btn
                    .parent()
                    .siblings()
                    .children('button')
                    .removeClass('active btn-primary')
                    .addClass('btn-default');

                $btn.removeClass('btn-default').addClass('active btn-primary');

                fbc.base.element.enable($saveButton);
            };

            fbc.base.showDialog({
                header: 'Enter result',
                body: [
                    $('<div>', {
                        class: 'row',
                        html: [
                            $('<div>', {
                                class: 'col-xs-6',
                                html: [
                                    $('<p>', {
                                        text: 'Team 1'
                                    }),
                                    $('<ul>', {
                                        html: $.map(
                                            $.grep(game.players, function (
                                                player
                                            ) {
                                                return player.team === 1;
                                            }),
                                            function (player) {
                                                return $('<li>', {
                                                    text: player.name
                                                });
                                            }
                                        )
                                    })
                                ]
                            }),
                            $('<div>', {
                                class: 'col-xs-6',
                                html: [
                                    $('<p>', {
                                        text: 'Team 2'
                                    }),
                                    $('<ul>', {
                                        html: $.map(
                                            $.grep(game.players, function (
                                                player
                                            ) {
                                                return player.team === 2;
                                            }),
                                            function (player) {
                                                return $('<li>', {
                                                    text: player.name
                                                });
                                            }
                                        )
                                    })
                                ]
                            })
                        ]
                    }),
                    $('<div>', {
                        class: 'row',
                        html: [
                            $('<div>', {
                                class: 'col-xs-12',
                                html: $('<div>', {
                                    class: 'btn-group btn-group-justified',
                                    role: 'group',
                                    html: [
                                        $('<div>', {
                                            class: 'btn-group',
                                            role: 'group',
                                            html: $('<button>', {
                                                type: 'button',
                                                class: 'btn btn-default',
                                                click: function () {
                                                    changeActiveButton($(this));
                                                },
                                                'data-team1-score': 2,
                                                'data-team2-score': 0,
                                                text: '2-0'
                                            })
                                        }),
                                        $('<div>', {
                                            class: 'btn-group',
                                            role: 'group',
                                            html: $('<button>', {
                                                type: 'button',
                                                class: 'btn btn-default',
                                                click: function () {
                                                    changeActiveButton($(this));
                                                },
                                                'data-team1-score': 2,
                                                'data-team2-score': 1,
                                                text: '2-1'
                                            })
                                        }),
                                        $('<div>', {
                                            class: 'btn-group',
                                            role: 'group',
                                            html: $('<button>', {
                                                type: 'button',
                                                class: 'btn btn-default',
                                                click: function () {
                                                    changeActiveButton($(this));
                                                },
                                                'data-team1-score': 1,
                                                'data-team2-score': 2,
                                                text: '1-2'
                                            })
                                        }),
                                        $('<div>', {
                                            class: 'btn-group',
                                            role: 'group',
                                            html: $('<button>', {
                                                type: 'button',
                                                class: 'btn btn-default',
                                                click: function () {
                                                    changeActiveButton($(this));
                                                },
                                                'data-team1-score': 0,
                                                'data-team2-score': 2,
                                                text: '0-2'
                                            })
                                        })
                                    ]
                                })
                            })
                        ]
                    })
                ],
                buttons: [$saveButton],
                closeButton: 'Cancel'
            });
        },
        formTeams: function (gameId, successCallback, errorCallback) {
            $.ajax({
                url: fbc.base.parameters.server + 'API/games/' + gameId + '/create_teams/',
                method: 'POST',
                contentType: 'application/json',
                headers: {
                    Authorization: 'Token ' + fbc.base.parameters.token
                },
                success: function (data) {
                    fbc.games.dict[data.id] = data;
                    fbc.games.updateTable();

                    if ($.isFunction(successCallback)) {
                        successCallback(data);
                    }
                },
                error: function (xhr, status, error) {
                    if ($.isFunction(errorCallback)) {
                        errorCallback(xhr, status, error);
                    }
                }
            });
        }
    };
})(fbc);