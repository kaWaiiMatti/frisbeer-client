var token;
var server = 'http://127.0.0.1:8000/';
//var server = 'https://moetto.duckdns.org/frisbeer/';
var ongoingGames = [];

var playerObject = {};
var gameList = [];

var imageNames = {
    'Klipsu I': 'silver1.png',
    'Klipsu II': 'silver2.png',
    'Klipsu III': 'silver3.png',
    'Klipsu IV': 'silver4.png',
    'Klipsu Mestari': 'silver5.png',
    'Klipsu Eliitti Mestari': 'silverem.png',
    'Kultapossu I': 'gold1.png',
    'Kultapossu II': 'gold2.png',
    'Kultapossu III': 'gold3.png',
    'Kultapossu Mestari': 'gold4.png',
    'Mestari Heittäjä I': 'mg1.png',
    'Mestari Heittäjä II': 'mg2.png',
    'Mestari Heittäjä Eliitti': 'mge.png',
    'Arvostettu Jallu Mestari': 'dmg.png',
    'Legendaarinen Nalle': 'eagle.png',
    'Legendaarinen Nalle Mestari': 'eagle2.png',
    'Korkein Ykkösluokan Mestari': 'supreme.png',
    'Urheileva Alkoholisti': 'global.png'
};

$(document).ready(function () {
    $('.container-fluid').children().hide();

    $('[data-open-menu="true"]').click(handleMenuOpen);
    $('[data-toggle-menu="true"]').click(handleMenuToggle);
    $('[data-close-menu="true"]').click(handleMenuClose);

    $('#add-new-player').click(openNewPlayerDialog);
    $('#refresh-players').click(function () {
        updatePlayerData(function () {
            updatePlayersList();
        })
    });

    $('#add-new-game').click(openNewGameDialog);
    $('#refresh-games').click(function () {
        updateGameData(function () {
            updateGamesList();
        })
    });

    $('#login').click(doLogin);
    $('#logout').click(openConfirmLogoutDialog);

    $('.side-menu > ul.menu-items').on('click', 'li > a', null, handleMenuClick);

    $('#players-table > thead > tr > th[data-sort-type]').click(function () {
        updateUrlParameters($(this));
    });

    updatePlayerData(function () {
        updatePlayersList();
        updateGameData(function () {
            updateGamesList();
            loadOngoingGamesFromCookies(function () {
                updateOngoingGamesList();
            });
        });
    });

    updatePlayersList(function () {
        updateGamesList();

    });

    var auth_token = getCookie('token');
    if (auth_token !== null && auth_token.length > 0) {
        token = auth_token;
        loginSuccess();
    } else {
        $('[data-logged-in="true"]').hide();
    }

    updateTableSortIcons();

    var params = getSearchParameters();

    if (params['tab'] !== undefined && $('.side-menu > ul.menu-items > li').find('a[data-target-tab="' + params['tab'] + '"]').length > 0) {
        $('.side-menu > ul.menu-items > li').find('a[data-target-tab="' + params['tab'] + '"]').click();
    } else {
        $('.side-menu > ul.menu-items > li > a').first().click();
    }
});

function changeUrl(parameters, callback) {
    if (typeof (history.pushState) !== 'undefined') {
        return;
    }
    // TODO: SET PARAMETERS TO URL
    //location.search = '?' + $.param(params);

    var pageName = location.pathname.substr(location.pathname.lastIndexOf('/') + 1);
    var updatedSearch = getSearchParameters(paramUpdate, true);

    var obj = {
        search: updatedSearch,
        page: pageName,
        url: pageName + '?' + updatedSearch
    };
    history.pushState(obj, obj.page, obj.url);

    if($.isFunction(callback)) {
        callback(parameters);
    }
}

function getSearchParameters(paramUpdate, stringify) {
    var params = {};
    stringify = stringify || false;

    if (location.search.length > 0) {
        $.each(location.search.substr(1).split('&'), function () {
            var temp = this.split('=');
            params[temp[0]] = temp[1];
        });
    }

    if (paramUpdate != null) {
        $.each(paramUpdate, function (key, value) {
            params[key] = value;
        });
    }

    return stringify
        ? $.map(params, function (value, key) {
            return key + '=' + value;
        }).join('&')
        : params;
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
        success: function (data) {
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

function updatePlayerData(successCallback, errorCallback) {
    $.ajax({
        url: server + 'API/players/',
        method: 'GET',
        beforeSend: function () {
            setLoaderIcon('players', true);
        },
        complete: function () {
            setLoaderIcon('players', false);
        },
        success: function (data) {
            playerObject = {};
            for (var i = 0; i < data.length; i++) {
                playerObject[data[i].id] = data[i];
            }
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

function getPlayerList() {
    return $.map(playerObject, function (player) {
        return player
    });
}

function updatePlayersList() {
    $('#players-table > tbody')
        .children('tr')
        .remove();

    // TODO: copy game data to temp variable, perform sorting and present data

    $.each(getPlayerList(), function () {
        $('#players-table > tbody').append($('<tr>', {
            html: [
                $('<td>', {
                    html: $('<img>', {
                        src: this.rank !== null ? this.rank.image_url : '',
                        title: this.rank !== null ? this.rank.name : ''
                    })
                }), $('<td>', {
                    text: this.name
                }), $('<td>', {
                    text: this.score
                })]
        }))
    });
}

function postNewGame(data, successCallback, errorCallback) {
    if (token === undefined || token === null || token.length === 0) {
        // TODO: SET ERROR MESSAGE
        return;
    }
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
        success: function (data) {
            updatePlayerData(function () {
                updatePlayersList();
                updateGameData(function () {
                    updateGamesList();
                });
            });

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

function updateGameData(successCallback, errorCallback) {
    $.ajax({
        url: server + 'API/games/',
        method: 'GET',
        beforeSend: function () {
            setLoaderIcon('games', true);
        },
        complete: function () {
            setLoaderIcon('games', false);
        },
        success: function (data) {
            gameList = data;
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

function getTeamPlayerNames(game, team) {
    var players = [];
    for (var i = 0; i < game.players.length; i++) {
        var player = game.players[i];
        if (player.team == team) {
            players.push(player.name);
        }
    }

    return players.join(', ');
}

function updateGamesList() {
    $('#games-table > tbody')
        .children('tr')
        .remove();

    // TODO: copy game data to temp variable, perform sorting and present data

    $.each(gameList, function () {
        $('#games-table > tbody').append($('<tr>', {
            html: [$('<td>', {
                text: new Date(this.date).toDateString()
            }), $('<td>', {
                text: getTeamPlayerNames(this, 1)
            }), $('<td>', {
                text: getTeamPlayerNames(this, 2)
            }), $('<td>', {
                text: this.team1_score + '-' + this.team2_score
            })]
        }));
    });
}

function getPlayerName(id) {
    var player = playerObject[id];

    if (player === undefined) {
        return 'id=' + id;
    }

    return player.name;
}

function getPlayerNames(idList, liItems) {
    var names = [];

    if (liItems === undefined) {
        for (var i = 0; i < idList.length; i++) {
            names.push(getPlayerName(idList[i]));
        }
        return names.join(', ');
    }

    for (var i = 0; i < idList.length; i++) {
        names.push($('<li>', {
            text: getPlayerName(idList[i])
        }));
    }

    return names;
}

function removeOngoingGame(gameId) {
    ongoingGames = ongoingGames.filter(function (game) {
        return game.id !== gameId;
    });
    storeOngoingGamesToCookies();
    updateOngoingGamesList();
}

function loadOngoingGamesFromCookies(callback) {
    var cookie = getCookie('ongoingGames');
    if (cookie !== '') {
        ongoingGames = JSON.parse(cookie);
    }
    if ($.isFunction(callback)) {
        callback();
    }
}

function storeOngoingGamesToCookies() {
    setCookie('ongoingGames', JSON.stringify(ongoingGames), 365);
}

function updateOngoingGamesList() {
    $('#ongoing-games-table tbody > tr').remove();

    if (ongoingGames.length === 0) {
        $('#ongoing-games-table').parent().hide();
        return;
    }

    for (var i = 0; i < ongoingGames.length; i++) {
        $('#ongoing-games-table tbody').append($('<tr>', {
            html: [
                $('<td>', {
                    text: new Date(ongoingGames[i].date).toDateString()
                }),
                $('<td>', {
                    text: getPlayerNames(ongoingGames[i].team1)
                }),
                $('<td>', {
                    text: getPlayerNames(ongoingGames[i].team2)
                }),
                $('<td>', {
                    html: $('<button>', {
                        'class': 'btn btn-primary float-right',
                        'data-game-id': ongoingGames[i].id,
                        'data-logged-in': true,
                        text: 'Enter result',
                        click: function () {
                            openEnterResultDialog($(this));
                        }
                    })
                })
            ]
        }));
    }

    if (token === undefined || token === null) {
        $('#ongoing-games-table')
            .find('[data-logged-in="true"]')
            .hide();
    }

    $('#ongoing-games-table').parent().show();
}

function handleMenuClick(e) {
    var targetTab = $(e.target).data('targetTab');
    if (targetTab !== undefined && targetTab !== null) {
        switch (targetTab) {
            case 'login':
                openLoginDialog();
                break;
            case 'logout':
                openConfirmLogoutDialog();
                break;
            default:
                $('.container-fluid').children().hide();
                var $target = $('.container-fluid').children('#' + targetTab);
                changeUrl({tab: targetTab});
                $target.show();
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

    var $parent = $('.container-fluid > ' + tab);

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
            'class': 'modal-dialog',
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
    });
}

function openNewGameDialog() {
    var dialog = $('<div>', {
        'id': 'newGameModal',
        'class': 'modal fade',
        html: $('<div>', {
            'class': 'modal-dialog',
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
                                                                    text: 'Team score average: '

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
                                                                    text: 'Team score average: '

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
                                            // Liian vähän pelaajia valittuna
                                            var selectedPlayers = $('.modal-body [data-step="1"] select[data-form-key="player"]').children(':selected');
                                            if (selectedPlayers.length < 6) {
                                                // TODO: SET ERROR TEXT WITH TIMEOUT
                                                console.log('not all selected');
                                                return;
                                            }

                                            // Kerää pelaajien ID:t ja muodosta joukkueet
                                            // TODO: TEST IF THIS WORKS
                                            var players = selectedPlayers
                                                .map(function () {
                                                    return parseInt($(this).val());
                                                })
                                                .get();

                                            calculateTeams(players, function (response) {
                                                // Lisää step2 valintoihin kaikki pelin pelaajat ja alustaa valinnat joukkueiden perusteella
                                                // $('.modal-body [data-step="2"] select.form-control > option').remove();
                                                //
                                                // for (var i = 0; i < players.length; i++) { // TODO: DOES NOT WORK?
                                                //     $('.modal-body [data-step="2"] .form-control').append($('<option>', {
                                                //         value: players[i],
                                                //         text: playerObject[players[i]].name + ' (' + playerObject[players[i]].score + ')'
                                                //     }));
                                                // }
                                                //
                                                // $.each($('.modal-body [data-step="2"] .form-group'), function (teamIndex) {
                                                //     $.each($(this).children('select'), function (playerIndex) {
                                                //         $(this).val(teams['team' + (teamIndex + 1)][playerIndex]);
                                                //         $(this).data('prev', $(this).val());
                                                //     });
                                                // });
                                                //
                                                // // Päivittää score keskiarvot joukkueille
                                                // updateScoreAverages();
                                                //
                                                // // Jos pelaaja vaihdetaan manuaalisesti päivitetään muut niin, että jokainen pelaaja on vain kerran
                                                // $('.modal-body [data-step="2"] select.form-control').change(function () {
                                                //     var newId = $(this).val();
                                                //     var prev = $(this).data('prev');
                                                //     $.each($('.modal-body [data-step="2"] select.form-control'), function () {
                                                //         if ($(this).data('prev') === newId && $(this).data('prev') === $(this).val()) {
                                                //             $(this).val(prev);
                                                //             $(this).data('prev', prev);
                                                //             return false;
                                                //         }
                                                //     });
                                                //     $(this).data('prev', newId);
                                                //     updateScoreAverages();
                                                // });
                                                //
                                                // changeModalStep(2);
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
                            }),
                            $('<div>', {
                                'data-step': 2,
                                html: [
                                    $('<button>', {
                                        type: 'button',
                                        'class': 'btn btn-primary float-right',
                                        text: 'Start game',
                                        click: function () {
                                            var game = {
                                                date: new Date(),
                                                id: getNextGameId(),
                                                team1: [],
                                                team2: []
                                            };

                                            $.each($('.modal-body [data-step="2"] .form-group'), function (index) {
                                                $.each($(this).children('select'), function () {
                                                    game['team' + (index + 1)].push(parseInt($(this).val()));
                                                });
                                            });

                                            ongoingGames.push(game);
                                            storeOngoingGamesToCookies();
                                            updateOngoingGamesList();
                                            $(this).closest('.modal').modal('hide');
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
                            })
                        ]
                    })
                ]
            })
        })
    });

    // add players to step 1 dropdowns
    var players = getPlayerList().slice();

    players.sort(nameSort);

    for (var i = 0; i < players.length; i++) {
        dialog
            .find('[data-step="1"] select[data-form-key="player"]')
            .append($('<option>', {
                value: players[i].id,
                text: players[i].name + ' (' + players[i].score + ')'
            }));
    }

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

    dialog.find('[data-step]').hide();
    dialog.find('[data-step="1"]').show();

    $('body').append(dialog);
    dialog.modal();

    dialog.one('hidden.bs.modal', function () {
        dialog.remove();
    });
}

function getNextGameId() {
    var id = 0;
    for (var i = 0; i < ongoingGames.length; i++) {
        if (ongoingGames[i].id === id) {
            id++;
            i = 0;
        }
    }
    return id;
}

function openEnterResultDialog($elem) {

    var gameId = $elem.data('gameId');
    var gameIndex = null;

    for (var i = 0; i < ongoingGames.length; i++) {
        if (parseInt(ongoingGames[i].id) === gameId) {
            gameIndex = i;
            break;
        }
    }

    if (gameIndex === null) {
        console.log('Unable to find game with given id from ongoing games!');
        return;
    }

    var dialog = $('<div>', {
        'class': 'modal fade',
        html: $('<div>', {
            'class': 'modal-dialog',
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
                                text: 'Enter result'
                            })
                        ]
                    }),
                    $('<div>', {
                        'class': 'modal-body',
                        html: $('<div>', {
                            html: [
                                $('<div>', {
                                    'class': 'row',
                                    html: [
                                        $('<div>', { // TEAM 1
                                            'class': 'col-xs-6',
                                            html: [
                                                $('<p>', {text: 'Team 1'}),
                                                $('<ul>', {
                                                    'data-field-name': 'team1',
                                                    html: getPlayerNames(ongoingGames[gameIndex].team1, true)
                                                })
                                            ]
                                        }),
                                        $('<div>', { // TEAM 2
                                            'class': 'col-xs-6',
                                            html: [
                                                $('<p>', {text: 'Team 2'}),
                                                $('<ul>', {
                                                    'data-field-name': 'team2',
                                                    html: getPlayerNames(ongoingGames[gameIndex].team2, true)
                                                })
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
                                                            click: function () {
                                                                changeActiveButton($(this));
                                                            },
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
                                                            click: function () {
                                                                changeActiveButton($(this));
                                                            },
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
                                                            click: function () {
                                                                changeActiveButton($(this));
                                                            },
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
                            ]
                        })
                    }),
                    $('<div>', {
                        'class': 'modal-footer',
                        html: [

                            $('<button>', {
                                type: 'button',
                                'class': 'btn btn-primary float-right',
                                'data-game-id': gameId,
                                'data-team1': ongoingGames[gameIndex].team1,
                                'data-team2': ongoingGames[gameIndex].team2,
                                text: 'Post result',
                                click: function () {
                                    var $result = $(this)
                                        .closest('.modal')
                                        .find('button.btn-primary[data-team1-score][data-team2-score]');
                                    if ($result.length === 0) {
                                        enterResultMessage($(this).closest('.modal').find('.modal-body'), 'Select game result!');
                                        return;
                                    }

                                    var gameId = $(this).data('gameId');
                                    var game = ongoingGames.filter(function (game) {
                                        return game.id === gameId
                                    });

                                    var data = {
                                        team1: $(this).data('team1').split(','),
                                        team2: $(this).data('team2').split(','),
                                        team1_score: $result.data('team1Score'),
                                        team2_score: $result.data('team2Score')
                                    };

                                    if (game.length > 0) {
                                        data['date'] = new Date(game[0].date).toISOString()
                                    }

                                    postNewGame(data, function () {
                                        removeOngoingGame(gameId);
                                    });

                                    $(this)
                                        .closest('.modal')
                                        .modal('hide');
                                }
                            }),
                            $('<button>', {
                                type: 'button',
                                'class': 'btn btn-danger float-right',
                                'data-dismiss': 'modal',
                                text: 'Cancel'
                            }),
                            $('<button>', {
                                type: 'button',
                                'class': 'btn btn-danger float-left',
                                click: function () {
                                    var gameId = $(this)
                                        .siblings('[data-game-id]')
                                        .data('gameId');
                                    removeOngoingGame(gameId);
                                    $(this)
                                        .closest('.modal')
                                        .modal('hide');

                                },
                                text: 'Cancel game'
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
    });
}

function enterResultMessage($body, message) {
    var $elem = $('<p>', {
        'class': 'error-text',
        text: message
    });
    $body
        .children('p')
        .remove();
    $body.append($elem);
    setTimeout(function () {
        $elem.fadeOut(500, function () {
            $elem.remove();
        })
    }, 3000);
}

function changeActiveButton($btn) {
    $btn
        .parent()
        .siblings()
        .children('button.btn-primary')
        .removeClass('btn-primary');

    $btn.addClass('btn-primary');
}

function calculateTeams(players, callback) {

    $.ajax({
        url: server + 'API/teams/',
        method: 'POST',
        contentType: 'application/json',
        headers: {
            'Authorization': 'Token ' + token
        },
        data: {
            players: JSON.stringify(players)
        },
        beforeSend: function () {
            // TODO: set some kind of loader
        },
        complete: function (xhr, status) {
            // TODO: remove loader
        },
        success: function (data) {
            // TODO: set teams using callback
            console.log(data);
        },
        error: function () {
            // TODO: FAILED TO CONSTRUCT TEAMS
        }
    });
}

function changeModalStep(step) {
    $('.modal').find('[data-step]').hide();
    $('.modal').find('[data-step="' + step + '"]').show();
}

function updateScoreAverages() {
    // TODO: UPDATE
    $.each($('.modal-body [data-step="2"] .form-group'), function () {
        var teamSum = 0;
        $.each($(this).children('select[data-form-key="player"]'), function () {
            teamSum += playerObject[parseInt($(this).val())].score;
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

    var usernameRegex = /^[a-zA-Z0-9@.+_\-]+$/;

    if (username.match(usernameRegex) === null || username !== username.match(usernameRegex)[0]) {
        loginMessage('Username contains invalid characters!');
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
            // TODO: set some kind of loader
        },
        complete: function (xhr, status) {
            // TODO: remove loader
        },
        success: function (data) {
            token = data.token;
            setCookie('token', token, 1);
            loginSuccess();
        },
        error: function () {
            loginMessage('Failed to login!');
        }
    });
}

function loginMessage(message) {
    var $body = $('#password').closest('.modal-body');
    var $elem = $('<p>', {
        text: message
    });
    $body
        .children('p')
        .remove();
    $body.append($elem);
    setTimeout(function () {
        $elem.fadeOut(500, function () {
            $elem.remove();
        })
    }, 3000);
}
function loginSuccess() {
    $('[data-logged-in="false"]').hide();
    $('[data-logged-in="true"]').show();

    $('#password')
        .closest('.modal')
        .modal('hide');
}

function openLoginDialog() {
    var dialog = $('<div>', {
        'class': 'modal fade',
        html: $('<div>', {
            'class': 'modal-dialog',
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
                                text: 'Login'
                            })
                        ]
                    }),
                    $('<div>', {
                        'class': 'modal-body',
                        html: $('<div>', {
                            'class': 'row',
                            html: $('<div>', {
                                'class': 'col-xs-12',
                                html: $('<form>', {
                                    html: $('<div>', {
                                        'class': 'form-group',
                                        html: [
                                            $('<label>', {
                                                'for': 'username',
                                                text: 'Username'
                                            }),
                                            $('<input>', {
                                                id: 'username',
                                                'class': 'form-control',
                                                type: 'text'
                                            }),
                                            $('<label>', {
                                                'for': 'password',
                                                text: 'Password'
                                            }),
                                            $('<input>', {
                                                id: 'password',
                                                'class': 'form-control',
                                                type: 'password',
                                                keyup: function (e) {
                                                    if (e.keyCode === 13) {
                                                        $(this)
                                                            .closest('.modal')
                                                            .find('.modal-footer')
                                                            .find('button[data-do-login="true"]')
                                                            .click();
                                                    }
                                                }
                                            })
                                        ]
                                    })
                                })
                            })
                        })
                    }),
                    $('<div>', {
                        'class': 'modal-footer',
                        html: [

                            $('<button>', {
                                type: 'button',
                                'class': 'btn btn-primary float-right',
                                'data-do-login': 'true',
                                text: 'Login',
                                click: function () {
                                    doLogin();
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
    });
}

function openConfirmLogoutDialog() {
    var dialog = $('<div>', {
        'class': 'modal fade',
        html: $('<div>', {
            'class': 'modal-dialog',
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
    setCookie('token', '');
    $('[data-logged-in="true"]').hide();
    $('[data-logged-in="false"]').show();
    $('.modal').modal('hide');
}

// found at http://stackoverflow.com/a/6712080
function nameSort(a, b) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
    return 0;
}

var sortFunctions = {
    score: function (a, b) {
        return a.score - b.score;
    },
    name: function (a, b) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return 0;

    }
};

function updateUrlParameters($elem) {
    var prefix = '';
    switch ($elem.closest('table').attr('id')) {
        case 'players-table':
            prefix = 'p';
            break;
    }

    var prevSort = getQueryVariable(prefix + 'sort');
    var prevOrder = getQueryVariable(prefix + 'order');

    var newSort = $elem.data('sortType');

    var params = {};

    if (newSort !== prevSort) {
        params[prefix + 'sort'] = newSort;
        params[prefix + 'order'] = 'asc';
    } else if (newSort === prevSort) {
        params[prefix + 'sort'] = prevSort;
        if (prevOrder === false) {
            params[prefix + 'order'] = 'asc';
        } else {
            params[prefix + 'order'] = prevOrder === 'asc'
                ? 'desc'
                : 'asc';
        }
    }

    changeUrl(params);
}

function updateTableSortIcons() {
    var psort = getQueryVariable('psort');

    if (psort !== false) {
        var porder = getQueryVariable('porder');

        $('#players-table')
            .find('thead > tr > th[data-sort-type="' + psort + '"]')
            .append($('<span>', {
                'class': 'glyphicon glyphicon-triangle-' + (porder === 'desc' ? 'bottom' : 'top')
            }));
    }

}

function sortPlayersData(data) {
    var sortBy = getQueryVariable('psort') !== false
        ? getQueryVariable('psort')
        : 'score';

    var order = getQueryVariable('porder') !== false
        ? getQueryVariable('porder')
        : sortBy === 'score'
            ? 'desc'
            : 'asc';

    data.sort(sortFunctions[sortBy]);

    if (order === 'desc') {
        data.reverse();
    }

    return data;
}

// found at https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

/*

 $.each($('select[data-form-key="player"]'), function(index, item){
 $(this).val($(this).children().eq(index).val());
 });

 */

// found at http://www.w3schools.com/js/js_cookies.asp
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
