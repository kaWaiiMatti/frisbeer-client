var token;
var server = 'http://127.0.0.1:8000/';
//var server = 'https://moetto.duckdns.org/frisbeer/';

var loginTextTimeout;

$(document).ready(function () {
    $('.container-fluid').children().hide();

    $('[data-open-menu="true"]').click(handleMenuOpen);
    $('[data-toggle-menu="true"]').click(handleMenuToggle);
    $('[data-close-menu="true"]').click(handleMenuClose);

    $('#add-new-player').click(openNewPlayerDialog);
    $('#refresh-players').click(updatePlayersList);

    $('#add-new-game').click(openNewGameDialog);
    $('#refresh-games').click(updateGamesList);

    $('#login').click(doLogin);
    $('#logout').click(openConfirmLogoutDialog);

    $('.side-menu > ul.menu-items').on('click', 'li > a', null, handleMenuClick);

    updatePlayersList(function () {
        updateGamesList();
    });

    $('[data-logged-in="true"]').hide();

    $('.side-menu > ul.menu-items > li > a').first().click();
});

function getPlayers(successCallback, errorCallback) {
    $.ajax({
        url: server + 'API/players/',
        method: 'GET',
        beforeSend: function () {
            setLoaderIcon('players', true);
        },
        complete: function (xhr, status) {
            setLoaderIcon('players', false);
        },
        success: function (data, status, xhr) {
            data.sort(eloSort);
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

function postNewPlayer(param, successCallback, errorCallback) {
    if (param === undefined || param === null) {
        console.log('no new player parameters');
        return;
    }

    $.ajax({
        url: server + 'API/players/',
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Token ' + token
        },
        data: JSON.stringify(param),
        beforeSend: function () {
            // TODO: do something
        },
        complete: function (xhr, status) {
            // TODO: do something
        },
        success: function (data, status, xhr) {
            updatePlayersList();
            if ($.isFunction(successCallback)) {
                successCallback(data);
            }
        },
        error: function (xhr, status, error) {
            if ($.isFunction(errorCallback)) {
                errorCallback(xhr, status, error);
            }
            console.log('ERROR POSTING NEW PLAYER:' + xhr + status + error)
        }
    })
}

function updatePlayersList(successCallback) {
    clearPlayersList();
    getPlayers(function (data) {
        $.each(data, function () {
            $('#players-table > tbody').append($('<tr>', {
                'data-player-id': this.id,
                html: [$('<td>', {
                    text: this.name
                }), $('<td>', {
                    text: this.elo
                })]
            }))
        });
        if ($.isFunction(successCallback)) {
            successCallback(data);
        }
    });
}

function clearPlayersList() {
    $('#players-table > tbody')
        .children('tr')
        .remove();
}

function getGames(successCallback, errorCallback) {
    $.ajax({
        url: server + 'API/games/',
        method: 'GET',
        beforeSend: function () {
            setLoaderIcon('games', true);
        },
        complete: function (xhr, status) {
            setLoaderIcon('games', false);
        },
        success: function (data, status, xhr) {
            //data.sort(dateSort);
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


function postNewGame(data, successCallback, errorCallback) {
    $.ajax({
        url: server + 'API/games/',
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Token ' + token
        },
        data: JSON.stringify(data),
        beforeSend: function () {
            // TODO: do something
        },
        complete: function (xhr, status) {
            // TODO: do something
        },
        success: function (data, status, xhr) {
            updateGamesList();
            updatePlayersList();
            if ($.isFunction(successCallback)) {
                successCallback(data);
            }
        },
        error: function (xhr, status, error) {
            if ($.isFunction(errorCallback)) {
                errorCallback(xhr, status, error);
            }
            console.log('ERROR POSTING NEW GAME:' + xhr + status + error)
        }
    })
}

function updateGamesList(successCallback) {
    clearGamesList();
    getGames(function (data) {
        $.each(data, function () {
            $('#games-table > tbody').append($('<tr>', {
                'data-game-id': this.id,
                html: [$('<td>', {
                    text: new Date(this.date).toDateString()
                }), $('<td>', {
                    text: getPlayerName(this.team1[0]) + ', ' + getPlayerName(this.team1[1]) + ', ' + getPlayerName(this.team1[2])
                }), $('<td>', {
                    text: getPlayerName(this.team2[0]) + ', ' + getPlayerName(this.team2[1]) + ', ' + getPlayerName(this.team2[2])
                }), $('<td>', {
                    text: this.team1_score + '-' + this.team2_score
                })]
            }))
        });
        if ($.isFunction(successCallback)) {
            successCallback(data);
        }
        ;
    });
}

function clearGamesList() {
    $('#games-table > tbody')
        .children('tr')
        .remove();
}

function getPlayerName(id) {
    var name = null;

    if (id === undefined || id === null) {
        return 'unnamed';
    }

    $.each($('#players-table > tbody > tr'), function () {
        if ($(this).data('playerId') === id) {
            name = $(this).eq(0).children().eq(0).text();
            return false;
        }
    });

    return name !== null ? name : 'id=' + id;
}

function handleMenuClick(e) {
    var data = $(e.target).data();
    if (data.targetTab !== undefined && data.targetTab !== null) {
        if (data.targetTab === 'logout') {
            openConfirmLogoutDialog();
        } else {

            $('.container-fluid').children().hide();
            $target = $('.container-fluid').children('#' + data.targetTab);
            $target.show();
            if ($target.data('headerText') !== undefined && $target.data('headerText') !== null && $target.data('headerText').length > 0) {
                $('header .title').text($target.data('headerText'));
            } else {
                $('header .title').text('');
            }
        }
    }
    handleMenuClose();
}

function setLoaderIcon(tab, visible) {
    if (tab === undefined || tab === null) {
        return;
    }

    tab = tab.startsWith('#')
        ? tab
        : '#' + tab;
    visible = (visible !== undefined && visible !== null && typeof visible === 'boolean')
        ? visible
        : true;

    $parent = $('.container-fluid > ' + tab);

    if (visible) {
        if ($parent.children('.loader-icon').length > 0) {
            return;
        }

        $parent
            .children()
            .first()
            .before($('<div>', {
                'class': 'loader-icon',
                html: $('<table>', {
                    html: $('<tbody>', {
                        html: $('<tr>', {
                            html: $('<td>', {
                                html: $('<img>', {
                                    src: 'img/beer_ajax128.gif',
                                    alt: ""
                                })
                            })
                        })
                    })
                })
            }))
    } else {
        $parent
            .children('.loader-icon')
            .remove();
    }
}

function handleMenuToggle() {
    $('.side-menu').toggleClass('open');
}

function handleMenuOpen(e) {
    $('.side-menu').addClass('open');
}

function handleMenuClose() {
    $('.side-menu').removeClass('open');
}

function openNewPlayerDialog() {
    var dialog = $('<div>', {
        'class': 'modal fade',
        html: $('<div>', {
            'class': 'modal-dialog modal-sm',
            html: $('<div>', {
                'class': 'modal-content',
                html: [
                    $('<div>', {
                        'class': 'modal-header',
                        html: [
                            $('<button>', {
                                type: 'button',
                                'class': 'close',
                                'data-dismiss': 'modal',
                                html: '&times;'
                            }),
                            $('<h4>', {
                                'class': 'modal-title',
                                text: 'Add new player'
                            })
                        ]
                    }),
                    $('<div>', {
                        'class': 'modal-body', // TODO: ADD GENERAL HELP TEXT BLOCK TO MODAL BODY
                        html: [
                            $('<form>', {
                                html: [
                                    $('<div>', {
                                        'class': 'form-group',
                                        html: [
                                            $('<label>', {
                                                'for': 'newPlayerName',
                                                text: 'Name'
                                            }),
                                            $('<input>', {
                                                id: 'newPlayerName',
                                                'class': 'form-control',
                                                name: 'newPlayer',
                                                'data-form-key': 'name'
                                            }),
                                            $('<p>', {
                                                'class': 'help-block'
                                            })
                                        ]
                                    })
                                ]

                            })
                        ]
                    }),
                    $('<div>', {
                        'class': 'modal-footer',
                        html: [

                            $('<button>', {
                                type: 'button',
                                'class': 'btn btn-primary float-right',
                                text: 'Add',
                                click: function () {
                                    // TODO: VALIDATE NAME NOT EMPTY
                                    var data = {};
                                    $('form input[name="newPlayer"]').each(function () {
                                        data[$(this).data('formKey')] = $(this).val();
                                    });
                                    postNewPlayer(
                                        data,
                                        function () { // SUCCESS
                                            $('#newPlayerName')
                                                .closest('.modal')
                                                .modal('hide');
                                        },
                                        function () { // FAIL
                                            var error = $('<p>', {
                                                'class': 'modal-help bg-danger', // TODO: COME UP WITH BETTER THAN BG DANGER?
                                                text: 'Error adding new player!'
                                            });
                                            $('#newPlayerName')
                                                .closest('.modal')
                                                .find('.modal-body')
                                                .append(error);
                                            setTimeout(function () {
                                                error.fadeOut(400, function () {
                                                    $(this).remove();
                                                })
                                            }, 3000);
                                        });
                                }
                            }),
                            $('<button>', {
                                type: 'button',
                                'class': 'btn btn-danger float-right',
                                'data-dismiss': 'modal',
                                text: 'Cancel'
                            })
                        ]
                    })
                ]
            })
        })
    });

    $('body').append(dialog);
    dialog.modal();

    dialog.one('hidden.bs.modal', function () {
        dialog.remove();
    })
}

function openNewGameDialog() {
    var dialog = $('<div>', {
        'id': 'newGameModal',
        'class': 'modal fade',
        html: $('<div>', {
            'class': 'modal-dialog modal-sm',
            html: $('<div>', {
                'class': 'modal-content',
                html: [
                    $('<div>', {
                        'class': 'modal-header',
                        html: [
                            $('<button>', {
                                type: 'button',
                                'class': 'close',
                                'data-dismiss': 'modal',
                                html: '&times;'
                            }),
                            $('<h4>', {
                                'class': 'modal-title',
                                'data-step': 1,
                                text: 'Select players'
                            }),
                            $('<h4>', {
                                'class': 'modal-title',
                                'data-step': 2,
                                text: 'Create teams'
                            }),
                            $('<h4>', {
                                'class': 'modal-title',
                                'data-step': 3,
                                text: 'Set result'
                            })
                        ]
                    }),
                    $('<div>', {
                        'class': 'modal-body',
                        html: [
                            $('<div>', {
                                'data-step': 1,
                                html: [
                                    $('<form>', {
                                        html: [
                                            $('<div>', {
                                                'class': 'form-group',
                                                html: [
                                                    $('<label>', {
                                                        text: 'Players'
                                                    }),
                                                    $('<select>', {
                                                        'class': 'form-control',
                                                        'data-form-key': 'player'
                                                    }),
                                                    $('<select>', {
                                                        'class': 'form-control',
                                                        'data-form-key': 'player'
                                                    }),
                                                    $('<select>', {
                                                        'class': 'form-control',
                                                        'data-form-key': 'player'
                                                    }),
                                                    $('<select>', {
                                                        'class': 'form-control',
                                                        'data-form-key': 'player'
                                                    }),
                                                    $('<select>', {
                                                        'class': 'form-control',
                                                        'data-form-key': 'player'
                                                    }),
                                                    $('<select>', {
                                                        'class': 'form-control',
                                                        'data-form-key': 'player'
                                                    }),
                                                    $('<p>', {
                                                        'class': 'help-block'
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            $('<div>', {
                                'data-step': 2,
                                html: [
                                    $('<div>', {
                                        'class': 'row',
                                        html: [
                                            $('<div>', {
                                                'class': 'col-xs-12 col-sm-6',
                                                html: $('<div>', {
                                                    'class': 'form-group',
                                                    html: [
                                                        $('<label>', {
                                                            text: 'Team 1'
                                                        }),
                                                        $('<select>', {
                                                            'class': 'form-control',
                                                            'data-form-key': 'player'
                                                        }),
                                                        $('<select>', {
                                                            'class': 'form-control',
                                                            'data-form-key': 'player'
                                                        }),
                                                        $('<select>', {
                                                            'class': 'form-control',
                                                            'data-form-key': 'player'
                                                        }),
                                                        $('<p>', {
                                                            html: [
                                                                $('<span>', {
                                                                    text: 'Team average: '

                                                                }),
                                                                $('<span>', {
                                                                    text: ''

                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            }),
                                            $('<div>', {
                                                'class': 'col-xs-12 col-sm-6',
                                                html: $('<div>', {
                                                    'class': 'form-group',
                                                    html: [
                                                        $('<label>', {
                                                            text: 'Team 2'
                                                        }),
                                                        $('<select>', {
                                                            'class': 'form-control',
                                                            'data-form-key': 'player'
                                                        }),
                                                        $('<select>', {
                                                            'class': 'form-control',
                                                            'data-form-key': 'player'
                                                        }),
                                                        $('<select>', {
                                                            'class': 'form-control',
                                                            'data-form-key': 'player'
                                                        }),
                                                        $('<p>', {
                                                            html: [
                                                                $('<span>', {
                                                                    text: 'Team average: '

                                                                }),
                                                                $('<span>', {
                                                                    text: ''

                                                                })
                                                            ]
                                                        })
                                                    ]
                                                })
                                            })
                                        ]
                                    })
                                ]
                            }),
                            $('<div>', {
                                'data-step': 3,
                                html: [
                                    $('<div>', {
                                        'class': 'row',
                                        html: [
                                            $('<div>', { // TEAM 1
                                                'class': 'col-xs-6',
                                                html: [
                                                    $('<p>', {text: 'Team 1'}),
                                                    $('<ul>', {'data-field-name': 'team1'})
                                                ]
                                            }),
                                            $('<div>', { // TEAM 2
                                                'class': 'col-xs-6',
                                                html: [
                                                    $('<p>', {text: 'Team 2'}),
                                                    $('<ul>', {'data-field-name': 'team2'})
                                                ]
                                            })
                                        ]
                                    }),
                                    $('<div>', {
                                        'class': 'row',
                                        html: [
                                            $('<div>', {
                                                'class': 'col-xs-12',
                                                html: $('<div>', {
                                                    'class': 'btn-group btn-group-justified',
                                                    'data-form-key': 'result',
                                                    role: 'group',
                                                    html: [
                                                        $('<div>', {
                                                            'class': 'btn-group',
                                                            'role': 'group',
                                                            html: $('<button>', {
                                                                type: 'button',
                                                                'class': 'btn btn-default',
                                                                'data-team1-score': 2,
                                                                'data-team2-score': 0,
                                                                text: '2-0'
                                                            })
                                                        }),
                                                        $('<div>', {
                                                            'class': 'btn-group',
                                                            'role': 'group',
                                                            html: $('<button>', {
                                                                type: 'button',
                                                                'class': 'btn btn-default',
                                                                'data-team1-score': 2,
                                                                'data-team2-score': 1,
                                                                text: '2-1'
                                                            })
                                                        }),
                                                        $('<div>', {
                                                            'class': 'btn-group',
                                                            'role': 'group',
                                                            html: $('<button>', {
                                                                type: 'button',
                                                                'class': 'btn btn-default',
                                                                'data-team1-score': 1,
                                                                'data-team2-score': 2,
                                                                text: '1-2'
                                                            })
                                                        }),
                                                        $('<div>', {
                                                            'class': 'btn-group',
                                                            'role': 'group',
                                                            html: $('<button>', {
                                                                type: 'button',
                                                                'class': 'btn btn-default',
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
                                ]
                            })
                        ]
                    }),
                    $('<div>', {
                        'class': 'modal-footer',
                        html: [
                            $('<div>', {
                                'data-step': 1,
                                html: [
                                    $('<button>', {
                                        type: 'button',
                                        'class': 'btn btn-primary float-right',
                                        text: 'Next',
                                        click: function () {
                                            if ($('.modal-body [data-step="1"] select[data-form-key="player"]').children(':selected').length < 6) {
                                                // TODO: SET ERROR TEXT WITH TIMEOUT
                                                console.log('not all selected');
                                                return;
                                            }

                                            var players = [];
                                            $.each($('.modal-body [data-step="1"] select[data-form-key="player"]').children(':selected'), function () {
                                                players.push({
                                                    name: $(this).data('name'),
                                                    elo: $(this).data('elo'),
                                                    id: $(this).val()
                                                })
                                            });
                                            var teams = calculateTeams(players);
                                            players.sort(eloSort);

                                            // Empty dropdown lists
                                            $('.modal-body [data-step="2"] select.form-control > option').remove();

                                            for (var i = 0; i < players.length; i++) { // TODO: DOES NOT WORK?
                                                $('.modal-body [data-step="2"] .form-control').append($('<option>', {
                                                    value: players[i].id,
                                                    'data-player-elo': players[i].elo,
                                                    'data-player-name': players[i].name,
                                                    text: players[i].name + ' (' + players[i].elo + ')'
                                                }));
                                            }

                                            $.each($('.modal-body [data-step="2"] .form-group'), function (teamIndex) {
                                                $.each($(this).children('select'), function (playerIndex) {
                                                    $(this).val(teams[teamIndex][playerIndex].id);
                                                    $(this).data('prev', $(this).val());
                                                });
                                            });
                                            updateEloAverages();

                                            $('.modal-body [data-step="2"] select.form-control').change(function () {
                                                var newId = $(this).val();
                                                var prev = $(this).data('prev');
                                                $.each($('.modal-body [data-step="2"] select.form-control'), function () {
                                                    if ($(this).data('prev') === newId && $(this).data('prev') === $(this).val()) {
                                                        $(this).val(prev);
                                                        $(this).data('prev', prev);
                                                        return false;
                                                    }
                                                });
                                                $(this).data('prev', newId);
                                                updateEloAverages();
                                            });

                                            changeModalStep(2);
                                        }
                                    }),
                                    $('<button>', {
                                        type: 'button',
                                        'class': 'btn btn-danger float-right',
                                        'data-dismiss': 'modal',
                                        text: 'Cancel'
                                    })
                                ]
                            }),
                            $('<div>', {
                                'data-step': 2,
                                html: [
                                    $('<button>', {
                                        type: 'button',
                                        'class': 'btn btn-primary float-right',
                                        text: 'Next',
                                        click: function () {
                                            $.each($('.modal-body [data-step="2"] .form-group'), function (index) {
                                                var $list = $('.modal-body [data-step="3"]').find('ul[data-field-name="team' + (index + 1) + '"]');
                                                $list.children().remove();
                                                $.each($(this).children('select'), function () {
                                                    $list.append($('<li>', {
                                                        text: $(this).children(':selected').data('playerName'),
                                                        'data-player-id': $(this).val()
                                                    }));
                                                });
                                            });
                                            $('.modal-body [data-step="3"] [data-form-key="result"] button').removeClass('btn-primary');
                                            changeModalStep(3);
                                        }
                                    }),
                                    $('<button>', {
                                        type: 'button',
                                        'class': 'btn btn-danger float-right',
                                        text: 'Back',
                                        click: function () {
                                            changeModalStep(1);
                                        }
                                    })
                                ]
                            }),
                            $('<div>', {
                                'data-step': 3,
                                html: [
                                    $('<button>', {
                                        type: 'button',
                                        'class': 'btn btn-primary float-right',
                                        text: 'Save',
                                        click: function () {
                                            if($('.modal-body [data-step="3"] [data-form-key="result"] button.btn-primary').length === 0) {
                                                var $errorMessage = $('<p>', {
                                                    'class': 'error-text',
                                                    text: 'No score selected!'
                                                });
                                                $('.modal-body [data-step="3"]').append($errorMessage);
                                                setTimeout(function() {
                                                    $errorMessage.fadeOut(400, function() {
                                                        $errorMessage.remove();
                                                    })
                                                }, 3000);
                                                return;
                                            }

                                            $scoreBtn = $('.modal-body [data-step="3"] [data-form-key="result"] button.btn-primary');

                                            var data = {
                                                team1: [],
                                                team2: []
                                            };

                                            data['team1_score'] = $scoreBtn.data('team1Score');
                                            data['team2_score'] = $scoreBtn.data('team2Score');

                                            $.each($('.modal-body [data-step="3"] ul[data-field-name="team1"] li'), function() {
                                                data['team1'].push($(this).data('playerId'));
                                            });

                                            $.each($('.modal-body [data-step="3"] ul[data-field-name="team2"] li'), function() {
                                                data['team2'].push($(this).data('playerId'));
                                            });

                                            console.log(data);
                                            postNewGame(data, function() {
                                                $('#newGameModal').modal('hide');
                                            });
                                            // TODO: POST THE GAME TO SERVER, UPDATE GAMES LIST ON SUCCESS
                                        }
                                    }),
                                    $('<button>', {
                                        type: 'button',
                                        'class': 'btn btn-danger float-right',
                                        text: 'Back',
                                        click: function () {
                                            changeModalStep(2);
                                        }
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
    $.each($('#players-table > tbody > tr'), function () {
        dialog
            .find('[data-step="1"] select[data-form-key="player"]')
            .append($('<option>', {
                'data-elo': $(this).children().eq(1).text(),
                'data-name': $(this).children().eq(0).text(),
                value: $(this).data('playerId'),
                text: $(this).children().eq(0).text() + ' (' + $(this).children().eq(1).text() + ')'
            }));
    });

    // disabled selected players from other select elements
    dialog
        .find('.modal-body [data-step="1"] select[data-form-key="player"]')
        .val(null)
        .change(function () {
            if ($(this).data('prev') !== undefined) {
                dialog
                    .find('.modal-body [data-step="1"] select[data-form-key="player"]')
                    .children('[value="' + $(this).data('prev') + '"]')
                    .prop('disabled', false);
            }
            $(this).data('prev', $(this).val());
            dialog
                .find('.modal-body [data-step="1"] select[data-form-key="player"]')
                .children('[value="' + $(this).val() + '"]')
                .prop('disabled', true);
        });

    dialog
        .find('.modal-body [data-step="3"] [data-form-key="result"] button')
        .click(function() {
            $(this)
                .addClass('btn-primary')
                .parent()
                .siblings()
                .children('button')
                .removeClass('btn-primary');
        });


    dialog.find('[data-step]').hide();
    dialog.find('[data-step="1"]').show();

    $('body').append(dialog);
    dialog.modal();

    dialog.one('hidden.bs.modal', function () {
        dialog.remove();
    })
}

function calculateTeams(players) {
    var best = {
        difference: null,
        team1: []
    };

    for (var i = 1; i < players.length; i++) {
        for (var j = i + 1; j < players.length; j++) {
            var team1 = [];
            team1.push(players[0]);
            team1.push(players[i]);
            team1.push(players[j]);

            var team2 = [];
            for (var k = 1; k < players.length; k++) {
                if (k !== i && k !== j) {
                    team2.push(players[k]);
                }
            }

            var team1_score = 0;
            for (var k = 0; k < team1.length; k++) {
                team1_score += team1[k].elo;
            }

            var team2_score = 0;
            for (var k = 0; k < team2.length; k++) {
                team2_score += team2[k].elo;
            }

            if (best.difference === null) {
                best.difference = Math.abs(team2_score - team1_score);
                best.team1.push(team1);
                continue;
            }

            if (best.difference < Math.abs(team2_score - team1_score)) {
                continue;
            }

            if (best.difference === Math.abs(team2_score - team1_score)) {
                best.team1.push(team1);
            }

            if (best.difference > Math.abs(team2_score - team1_score)) {
                best.difference = Math.abs(team2_score - team1_score);
                best.team1 = [team1];
            }
        }
    }

    var result = [];

    if (best.team1.length > 1) {
        result.push(best.team1[Math.floor(Math.random() * best.team1.length)]);
    } else {
        result.push(best.team1[0]);
    }

    result.push($.grep(players, function (p) {
        for (var i = 0; i < result[0].length; i++) {
            if (result[0][i].id === p.id) {
                return false;
            }
        }
        return true;
    }));

    // TODO: randomize team order

    return result;
}

function changeModalStep(step) {
    $('.modal').find('[data-step]').hide();
    $('.modal').find('[data-step="' + step + '"]').show();
}

function updateEloAverages() {
    $.each($('.modal-body [data-step="2"] .form-group'), function () {
        var teamSum = 0;
        $.each($(this).children('select[data-form-key="player"]'), function () {
            teamSum += $(this).children(':selected').data('playerElo');
        });

        $(this)
            .find('p')
            .children('span')
            .eq(1)
            .text(parseInt(teamSum / $(this).children('select[data-form-key="player"]').length));
    })
}

function doLogin() {
    var username = $('#username').val();
    var password = $('#password').val();

    var usernameRegex = /^[a-zA-Z0-9]+$/;
    var passwordRegex = usernameRegex;

    if (username.match(usernameRegex) === null || username !== username.match(usernameRegex)[0]) {
        loginMessage('Username contains invalid characters!');
        return;
    }

    if (password.match(passwordRegex) === null || password !== password.match(passwordRegex)[0]) {
        loginMessage('Password contains invalid characters!');
        return;
    }

    loginMessage('');

    $.ajax({
        url: server + 'API/token-auth/',
        method: 'POST',
        data: {
            username: username,
            password: password
        },
        beforeSend: function () {
            setLoaderIcon('home', true);
        },
        complete: function (xhr, status) {
            setLoaderIcon('home', false);
        },
        success: function (data, status, xhr) {
            token = data.token;
            loginSuccess();
        },
        error: function (xhr, status, error) {
            loginMessage('Failed to login!');
        }
    });
}

function loginMessage(message) {
    clearTimeout(loginTextTimeout);
    var $elem = $('#home button#login').siblings('p');
    $elem.text(message);
    loginTextTimeout = setTimeout(function () {
        $elem.fadeOut(500, function () {
            $elem
                .text('')
                .show();
        })
    }, 3000);
}
function loginSuccess() {
    $('#password').val('');

    $('[data-field="username"]').text($('#username').val());
    $('[data-logged-in="false"]').hide();
    $('[data-logged-in="true"]').show();
}

function openConfirmLogoutDialog() {
    var dialog = $('<div>', {
        'class': 'modal fade',
        html: $('<div>', {
            'class': 'modal-dialog modal-sm',
            html: $('<div>', {
                'class': 'modal-content',
                html: [
                    $('<div>', {
                        'class': 'modal-header',
                        html: [
                            $('<button>', {
                                type: 'button',
                                'class': 'close',
                                'data-dismiss': 'modal',
                                html: '&times;'
                            }),
                            $('<h4>', {
                                'class': 'modal-title',
                                text: 'Confirm'
                            })
                        ]
                    }),
                    $('<div>', {
                        'class': 'modal-body',
                        html: $('<p>', {
                            text: 'Logout?'
                        })
                    }),
                    $('<div>', {
                        'class': 'modal-footer',
                        html: [

                            $('<button>', {
                                type: 'button',
                                'class': 'btn btn-primary float-right',
                                text: 'Logout',
                                click: function () {
                                    logout();
                                }
                            }),
                            $('<button>', {
                                type: 'button',
                                'class': 'btn btn-danger float-right',
                                'data-dismiss': 'modal',
                                text: 'Cancel'
                            })
                        ]
                    })
                ]
            })
        })
    });

    $('body').append(dialog);
    dialog.modal();

    dialog.one('hidden.bs.modal', function () {
        dialog.remove();
    })
}

function logout() {
    token = null;
    $('[data-logged-in="true"]').hide();
    $('[data-logged-in="false"]').show();
    $('[data-field="username"]').text('');
    $('.modal').modal('hide');
}

function dateSort(a, b) {
    return b.elo - a.elo;
}

function eloSort(a, b) {
    return b.elo - a.elo;
}

/*

 $.each($('select[data-form-key="player"]'), function(index, item){
 $(this).val($(this).children().eq(index).val());
 });

 */