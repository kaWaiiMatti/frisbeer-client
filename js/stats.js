(function(fbc) {
    fbc.stats = {
        updateListStats: function(season, players) {
            // return if either player or game data is missing
            if (
                Object.keys(fbc.players.dict).length === 0 ||
                Object.keys(fbc.games.dict).length === 0
            ) {
                return;
            }

            // initialize data            
            var stats = {};

            for (var playerId in fbc.players.dict) {
                // skip players if specific players are selected and id is not found on the object
                if (players !== undefined && !players.hasOwnProperty(playerId)) {
                    continue;
                }

                // initialize player specific object
                stats[playerId] = {};

                // initialize player specific data for each listStatsFunction
                fbc.stats.listStatsFunctions.playerWinLoss.initialize(
                    stats[playerId]
                );
            }

            // iterate over all games
            for (var gameId in fbc.games.dict) {
                var game = fbc.games.dict[gameId];

                // skip games from wrong seasons if season has been specified
                if (season !== undefined && game.season !== season) {
                    continue;
                }

                // call listStatsFunction for each game
                fbc.stats.listStatsFunctions.playerWinLoss.processGame(stats, game, players);
            }
        },
        listStatsFunctions: {
            playerWinLoss: {
                initialize: function(playerStats) {
                    playerStats.wins = 0;
                    playerStats.losses = 0;
                },
                processGame: function(stats, game, players) {
                    var winner = game.team1_score === 2 ? 1 : 2;

                    for (var player of game.players) {
                        if(players !== undefined && !players.hasOwnProperty(player.id)){

                        }

                        if (player.team === winner) {
                            stats[player.id].wins++;
                        } else {
                            stats[player.id].losses++;
                        }
                    }
                }
            }
        }
    };
})(fbc);
