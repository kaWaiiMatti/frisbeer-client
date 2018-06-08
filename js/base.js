var fbc = {};

$(document).ready(function() {
    $.each(fbc, function() {
        if (
            this.hasOwnProperty('initialize') &&
            $.isFunction(this['initialize'])
        ) {
            this['initialize']();
        }
    });
});

(function(fbc) {
    fbc.base = {
        parameters: {
            server: 'https://t3mu.kapsi.fi/frisbeer/',
            token: '',
            maxPlayers: 6
        },

        ol: {
            defaultCenter: {
                latitude: 65.016667,
                longitude: 25.466667
            },
            decimalPlaces: 5,
            zoom: 15,
            marker: $('<span>', {
                class: 'glyphicon glyphicon-map-marker'
            })[0]
        },

        initialize: function() {
            ///<summary>Common initializations</summary>
            $('.container-fluid')
                .children()
                .hide();

            $('[data-open-menu="true"]').click(fbc.base.menu.open);
            $('[data-toggle-menu="true"]').click(fbc.base.menu.toggle);
            $('[data-close-menu="true"]').click(fbc.base.menu.close);

            $('.side-menu > ul.menu-items').on(
                'click',
                'li > a',
                null,
                fbc.base.menu.click
            );

            fbc.base.login.checkExisting();

            var params = fbc.base.query.get();

            // Show tab based on url param or first as default
            if (
                params.hasOwnProperty('tab') &&
                $('.side-menu > ul.menu-items > li').find(
                    'a[data-target-tab="' + params['tab'] + '"]'
                ).length > 0
            ) {
                $('.side-menu > ul.menu-items > li')
                    .find('a[data-target-tab="' + params['tab'] + '"]')
                    .click();
            } else {
                $('.side-menu > ul.menu-items > li > a')
                    .first()
                    .click();
            }
        },

        menu: {
            open: function() {
                $('.side-menu').addClass('open');
            },
            close: function() {
                $('.side-menu').removeClass('open');
            },
            toggle: function() {
                $('.side-menu').toggleClass('open');
            },
            click: function(e) {
                var targetTabData = $(e.target).data();
                if (targetTabData.hasOwnProperty('targetTab')) {
                    var targetTab = targetTabData['targetTab'];
                    switch (targetTab) {
                        case 'login':
                            fbc.base.login.openDialog();
                            break;
                        case 'logout':
                            fbc.base.logout.openConfirmDialog();
                            break;
                        default:
                            $('.container-fluid')
                                .children()
                                .hide();
                            var $target = $('.container-fluid').children(
                                '#' + targetTab
                            );
                            fbc.base.query.updateUrl({ tab: targetTab });
                            $target.show();
                    }
                }
                fbc.base.menu.close();
            }
        },

        cookies: {
            // found at http://www.w3schools.com/js/js_cookies.asp
            set: function(cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
                var expires = 'expires=' + d.toUTCString();
                document.cookie = cname + '=' + cvalue + '; ' + expires;
            },
            get: function(cname) {
                var name = cname + '=';
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
                return '';
            }
        },

        login: {
            checkExisting: function() {
                ///<summary></summary>
                var auth_token = fbc.base.cookies.get('token');
                if (auth_token !== null && auth_token.length > 0) {
                    fbc.base.parameters.token = auth_token;
                    fbc.base.login.success();
                } else {
                    $('[data-logged-in="true"]').hide();
                }
            },
            perform: function() {
                var username = $('#username').val();
                var password = $('#password').val();

                var usernameRegex = /^[a-zA-Z0-9@.+_\-]+$/;

                if (
                    username.match(usernameRegex) === null ||
                    username !== username.match(usernameRegex)[0]
                ) {
                    fbc.base.login.showMessage(
                        'Username contains invalid characters!'
                    );
                    return;
                }

                fbc.base.login.showMessage('');

                $.ajax({
                    url: fbc.base.parameters.server + 'API/token-auth/',
                    method: 'POST',
                    data: {
                        username: username,
                        password: password
                    },
                    beforeSend: function() {
                        // TODO: set some kind of loader
                    },
                    complete: function(xhr, status) {
                        // TODO: remove loader
                    },
                    success: function(data) {
                        fbc.base.parameters.token = data.token;
                        fbc.base.cookies.set(
                            'token',
                            fbc.base.parameters.token,
                            1
                        );
                        fbc.base.login.success();
                    },
                    error: function() {
                        fbc.base.login.showMessage('Failed to login!');
                    }
                });
            },
            showMessage: function(message) {
                var $body = $('#password').closest('.modal-body');
                var $elem = $('<p>', {
                    text: message
                });
                $body.children('p').remove();
                $body.append($elem);
                setTimeout(function() {
                    $elem.fadeOut(500, function() {
                        $elem.remove();
                    });
                }, 3000);
            },
            success: function() {
                $('[data-logged-in="false"]').hide();
                $('[data-logged-in="true"]').show();

                $('#password')
                    .closest('.modal')
                    .modal('hide');
            },
            openDialog: function() {
                var dialog = $('<div>', {
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
                                            text: 'Login'
                                        })
                                    ]
                                }),
                                $('<div>', {
                                    class: 'modal-body',
                                    html: $('<div>', {
                                        class: 'row',
                                        html: $('<div>', {
                                            class: 'col-xs-12',
                                            html: $('<form>', {
                                                html: $('<div>', {
                                                    class: 'form-group',
                                                    html: [
                                                        $('<label>', {
                                                            for: 'username',
                                                            text: 'Username'
                                                        }),
                                                        $('<input>', {
                                                            id: 'username',
                                                            class:
                                                                'form-control',
                                                            type: 'text'
                                                        }),
                                                        $('<label>', {
                                                            for: 'password',
                                                            text: 'Password'
                                                        }),
                                                        $('<input>', {
                                                            id: 'password',
                                                            class:
                                                                'form-control',
                                                            type: 'password',
                                                            keyup: function(e) {
                                                                if (
                                                                    e.keyCode ===
                                                                    13
                                                                ) {
                                                                    $(this)
                                                                        .closest(
                                                                            '.modal'
                                                                        )
                                                                        .find(
                                                                            '.modal-footer'
                                                                        )
                                                                        .find(
                                                                            'button[data-do-login="true"]'
                                                                        )
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
                                    class: 'modal-footer',
                                    html: [
                                        $('<button>', {
                                            type: 'button',
                                            class:
                                                'btn btn-primary float-right',
                                            'data-do-login': 'true',
                                            text: 'Login',
                                            click: function() {
                                                fbc.base.login.perform();
                                            }
                                        }),
                                        $('<button>', {
                                            type: 'button',
                                            class: 'btn btn-danger float-right',
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

                dialog.one('hidden.bs.modal', function() {
                    dialog.remove();
                });
            }
        },

        logout: {
            openConfirmDialog: function() {
                var dialog = $('<div>', {
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
                                            text: 'Confirm'
                                        })
                                    ]
                                }),
                                $('<div>', {
                                    class: 'modal-body',
                                    html: $('<p>', {
                                        text: 'Logout?'
                                    })
                                }),
                                $('<div>', {
                                    class: 'modal-footer',
                                    html: [
                                        $('<button>', {
                                            type: 'button',
                                            class:
                                                'btn btn-primary float-right',
                                            text: 'Logout',
                                            click: function() {
                                                fbc.base.logout.perform();
                                            }
                                        }),
                                        $('<button>', {
                                            type: 'button',
                                            class: 'btn btn-danger float-right',
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

                dialog.one('hidden.bs.modal', function() {
                    dialog.remove();
                });
            },
            perform: function() {
                fbc.base.parameters.token = null;
                fbc.base.cookies.set('token', '');
                $('[data-logged-in="true"]').hide();
                $('[data-logged-in="false"]').show();
                $('.modal').modal('hide');
            }
        },

        element: {
            disable: function($elem) {
                $elem.addClass('disabled');
                $elem.prop('disabled', true);
            },
            enable: function($elem) {
                $elem.removeClass('disabled');
                $elem.prop('disabled', false);
            }
        },

        showDialog: function(options) {
            options = options || {};

            if (!options.hasOwnProperty('header')) {
                options.header = '';
            }

            if (!options.hasOwnProperty('body')) {
                options.body = [];
            }

            if (!options.hasOwnProperty('buttons')) {
                options.buttons = [];
            }

            if (!options.hasOwnProperty('closeButton')) {
                options.closeButton = null;
            }

            if (!options.hasOwnProperty('modalClasses')) {
                options.modalClasses = [];
            }

            if (!options.hasOwnProperty('dialogShown')) {
                options.dialogShown = null;
            }

            if (options.closeButton !== null) {
                options.buttons.push(
                    $('<button>', {
                        type: 'button',
                        class: 'btn btn-danger float-right',
                        'data-dismiss': 'modal',
                        text: options.closeButton
                    })
                );
            }

            var dialog = $('<div>', {
                class: 'modal fade',
                html: $('<div>', {
                    class: 'modal-dialog ' + options.modalClasses.join(' '),
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
                                        text: options.header
                                    })
                                ]
                            }),
                            $('<div>', {
                                class: 'modal-body',
                                html: [
                                    $('<div>', {
                                        html: options.body
                                    })
                                ]
                            }),
                            $('<div>', {
                                class: 'modal-footer',
                                html: [
                                    $('<div>', {
                                        html: options.buttons
                                    })
                                ]
                            })
                        ]
                    })
                })
            });

            if ($.isFunction(options.dialogShown)) {
                dialog.one('shown.bs.modal', function() {
                    options.dialogShown();
                });
            }

            dialog.one('hidden.bs.modal', function() {
                dialog.remove();
            });

            $('body').append(dialog);
            dialog.modal();
        },

        openMapDialog: function(options) {
            options = options || {};

            if (!options.hasOwnProperty('center')) {
                options.center = {
                    latitude: fbc.base.ol.defaultCenter.latitude,
                    longitude: fbc.base.ol.defaultCenter.longitude
                };
            }

            if (!options.hasOwnProperty('markCenter')) {
                options.overlayCoords = false;
            }

            if (!options.hasOwnProperty('modalClasses')) {
                options.modalClasses = ['modal-lg'];
            }

            var $map = $('<div>');

            if (!options.hasOwnProperty('dialogShown')) {
                options.dialogShown = function() {
                    var coords = ol.proj.fromLonLat([
                        options.center.longitude,
                        options.center.latitude
                    ]);

                    var map = new ol.Map({
                        layers: [
                            new ol.layer.Tile({
                                source: new ol.source.OSM()
                            })
                        ],
                        target: $map[0],
                        controls: ol.control.defaults({
                            attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                                collapsible: false
                            })
                        }),
                        view: new ol.View({
                            center: coords,
                            zoom: fbc.base.ol.zoom
                        })
                    });

                    if (options.markCenter) {
                        map.addOverlay(
                            new ol.Overlay({
                                position: coords,
                                positioning: 'bottom-center',
                                element: fbc.base.ol.marker,
                                stopEvent: false
                            })
                        );
                    }

                    if (
                        options.hasOwnProperty('mapClick') &&
                        $.isFunction(options.mapClick)
                    ) {
                        map.on('click', options.mapClick);
                    }
                };
            }

            var body = [];

            if (options.hasOwnProperty('beforeMap')) {
                $.each(options.beforeMap, function(index, element) {
                    body.push(element);
                });
            }

            body.push($map);

            if (options.hasOwnProperty('afterMap')) {
                $.each(options.afterMap, function(index, element) {
                    body.push(element);
                });
            }
            options.body = body;

            fbc.base.showDialog(options);
        },

        sorting: {
            score: function(a, b) {
                return a.score - b.score;
            },
            name: function(a, b) {
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return 0;
            },
            date: function(a, b) {
                return new Date(a.date) - new Date(b.date);
            }
        },

        query: {
            defaults: {
                tab: 'players',
                psort: 'score'
            },
            get: function(stringify) {
                var params = {};
                stringify = stringify || false;

                if (location.search.length > 0) {
                    $.each(location.search.substr(1).split('&'), function() {
                        var temp = this.split('=');
                        params[temp[0]] = temp[1];
                    });
                }

                return stringify
                    ? $.map(params, function(value, key) {
                          return key + '=' + value;
                      }).join('&')
                    : params;
            },
            updateUrl: function(parameters, callback) {
                if (typeof history.pushState !== 'undefined') {
                    return;
                }
                // TODO: SET PARAMETERS TO URL
                //location.search = '?' + $.param(params);

                var pageName = location.pathname.substr(
                    location.pathname.lastIndexOf('/') + 1
                );
                var updatedSearch = getSearchParameters(paramUpdate, true);

                var obj = {
                    search: updatedSearch,
                    page: pageName,
                    url: pageName + '?' + updatedSearch
                };
                history.pushState(obj, obj.page, obj.url);

                if ($.isFunction(callback)) {
                    callback(parameters);
                }
            }
        },

        loader: {
            set: function(tab) {
                var $parent = $('.container-fluid').children('#' + tab);

                if ($parent.children('.loader-icon').length > 0) {
                    return;
                }

                $parent
                    .children()
                    .first()
                    .before(
                        $('<div>', {
                            class: 'loader-icon',
                            html: $('<table>', {
                                html: $('<tbody>', {
                                    html: $('<tr>', {
                                        html: $('<td>', {
                                            html: $('<img>', {
                                                src: 'img/beer_ajax128.gif',
                                                alt: ''
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    );
            },
            remove: function(tab) {
                var $parent = $('.container-fluid').children('#' + tab);
                $parent.children('.loader-icon').remove();
            }
        },

        changeActiveButton: function($btn) {
            $btn
                .parent()
                .siblings()
                .children('button.btn-primary')
                .removeClass('btn-primary');

            $btn.addClass('btn-primary');
        },

        disableValuesFromOtherSelects: function($selects) {
            $selects.children('option').prop('disabled', false);

            $selects.each(function() {
                var $this = $(this);
                var value = $this.val();

                if (value === '') {
                    return;
                }

                $selects
                    .not($this)
                    .children('option[value="' + value + '"]')
                    .prop('disabled', true);
            });
        },

        hideElementAfter: function($element, time) {
            setTimeout(function() {
                $element.fadeOut(500, function() {
                    $element.remove();
                });
            }, time);
        }
    };
})(fbc);
