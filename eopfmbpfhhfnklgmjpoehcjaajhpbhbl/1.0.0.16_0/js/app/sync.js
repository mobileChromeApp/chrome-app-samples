'use strict';
(function (angular, _)
{
    var module = angular.module('game.host');

    module.service('sync', ['$http', '$q', 'bridgeServices', 'slug', 'online', 'gamePlayer', '$location',
                            function ($http, $q, bridgeServices, slug, online, gamePlayer, $location)
    {
        var that = this;
        var testItem = 'gameStats';
        var testURL = '/api/v1/user-data/read/' + testItem;
        var finaliseGameSession = angular.noop;
        var gameSessionId = false;

        var downloadUserData = function ()
        {
            var fetchActions = [], syncActions = [];

            bridgeServices.startSyncing();

            bridgeServices.removeAllEvents();
            bridgeServices.removeAllItems();
            bridgeServices.removeAllBadges();

            fetchActions.push($http.get('/api/v1/user-data/read', {
                params: { gameSessionId: gameSessionId }
            }).then(function (result)
            {
                _.forEach(result.data.array, function (key)
                {
                    syncActions.push($http.get('/api/v1/user-data/read/' + key, {
                        params: { gameSessionId: gameSessionId }
                    }).then(function (result)
                    {
                        if (key === 'AdventureIncGameState')
                        {
                            var saveData = JSON.parse(result.data.value);
                            if (Number(saveData.saveVersionNumber) > 1.0)
                            {
                                gamePlayer.stopGame();
                                $location.path('/version');
                            }
                        }
                        bridgeServices.setItem(key, result.data.value);
                    }));
                });
            }));

            fetchActions.push($http.get('/api/v1/badges/progress/read/' + slug).then(function (result)
            {
                _.forEach(result.data.data, function (badge)
                {
                    bridgeServices.setBadge(badge.badge_key, badge.current);
                });
            }));

            return $q.all(fetchActions).then(function ()
            {
                return $q.all(syncActions).always(function ()
                {
                    bridgeServices.endSyncing();
                });
            });
        };

        var flushEvent = function (event)
        {
            event.data.gameSessionId = gameSessionId;
            return $http.post(event.url, event.data);
        };

        var uploadUserData = function ()
        {
            bridgeServices.startSyncing();

            return $http.post('/api/v1/user-data/remove-all', {
                gameSessionId: gameSessionId
            }).then(function ()
            {
                var syncActions = [];
                _.forEach(bridgeServices.getItemList(), function (key)
                {
                    syncActions.push($http.post('/api/v1/user-data/set/' + key, {
                        gameSessionId: gameSessionId,
                        value: bridgeServices.getItem(key)
                    }));
                });

                _.forEach(bridgeServices.getBadgeList(), function (key)
                {
                    syncActions.push($http.post('/api/v1/badges/progress/add/' + slug, {
                        gameSessionId: gameSessionId,
                        badge_key: key,
                        current: bridgeServices.getBadge(key)
                    }));
                });

                _.forEach(bridgeServices.getEventList(), function (event)
                {
                    syncActions.push(flushEvent(event));
                });

                return $q.all(syncActions).always(function ()
                {
                    bridgeServices.removeAllEvents();
                    bridgeServices.endSyncing();
                    // re-cache last-seen state to make sure it all matches up
                    return $http.get(testURL, {
                        params: { gameSessionId: gameSessionId }
                    });
                });
            });
        };

        var initGameSession = function ()
        {
            var startNewSession = function ()
            {
                return $http.post('/api/v1/games/create-session/' + slug + '/canvas').then(function (response)
                {
                    var sessionId = response.data.gameSessionId;
                    that.setGameSession(sessionId);
                    finaliseGameSession = function ()
                    {
                        finaliseGameSession = angular.noop;
                        $http.post('/api/v1/games/destroy-session', {
                            gameSessionId: sessionId
                        });
                        //assert(sessionId == gameSessionId);
                        gameSessionId = false;
                    };
                });
            };

            if (gameSessionId)
            {
                return $http.get('/api/v1/user-data/read', {
                    params: { gameSessionId: gameSessionId }
                }).then(function ()
                {
                }, function ()
                {
                    return startNewSession();
                });
            }
            else
            {
                return startNewSession();
            }
        };

        this.getLocalSaveInfo = function ()
        {
            var data = {};
            var time = (JSON.parse(this.localResponse) || {}).totalTimePlayed || 0;
            data.hours = Math.floor(time / 3600);
            data.minutes = Math.floor((time / 60) % 60);
            data.totalXP = (JSON.parse(bridgeServices.getItem('progress')) || {}).xp || 0;
            return data;
        };

        this.getRemoteSaveInfo = function ()
        {
            var data = {};
            var time = (JSON.parse(this.serverResponse) || {}).totalTimePlayed || 0;
            data.hours = Math.floor(time / 3600);
            data.minutes = Math.floor((time / 60) % 60);
            return initGameSession().then(function ()
            {
                return $http.get('/api/v1/user-data/read/progress', {
                    params: { gameSessionId: gameSessionId }
                }).then(function (response)
                {
                    data.totalXP = (JSON.parse(response.data.value) || {}).xp || 0;
                    return data;
                });
            }).always(function ()
            {
                finaliseGameSession();
            });
        };

        this.resolve = function (params)
        {
            return initGameSession().then(function ()
            {
                if (params && params.keepLocal)
                {
                    return uploadUserData();
                }
                else
                {
                    return downloadUserData();
                }
            }).always(function ()
            {
                finaliseGameSession();
            });
        };

        this.setGameSession = function (sessionId)
        {
            finaliseGameSession();
            gameSessionId = sessionId;
        };

        this.clearGameSession = function ()
        {
            $http.get(testURL, {
                params: { gameSessionId: gameSessionId }
            });
            finaliseGameSession();
            gameSessionId = false;
        };

        this.test = function ()
        {
            var getData = [];

            if (bridgeServices.syncing)
            {
                // In the middle of resolving a merge, just let it carry on
                return $q.when();
            }

            getData.push($http({method: 'get', url: testURL, fromCache: true}).then(function (response)
            {
                that.lastSeenResponse = (response && response.data && response.data.value) || null;
            }, function ()
            {
                that.lastSeenResponse = null;
            }));
            getData.push(initGameSession().then(function ()
            {
                return $http({
                    method: 'get',
                    url: testURL,
                    params: { gameSessionId: gameSessionId },
                    doNotCache: true
                }).then(function (response)
                {
                    that.serverResponse = (response && response.data && response.data.value) || null;
                }, function ()
                {
                    that.serverResponse = null;
                });
            }));

            return $q.all(getData).then(function ()
            {
                that.localResponse = bridgeServices.getItem(testItem) || null;

                if (that.localResponse === that.serverResponse)
                {
                    // Data is synchronised, just flush any cached events
                    _.forEach(bridgeServices.getEventList(), flushEvent);
                    bridgeServices.removeAllEvents();
                    return $q.when();
                }
                else
                {
                    // Data is unsynchronised, lets do something about that...
                    if (that.serverResponse === that.lastSeenResponse)
                    {
                        // Stuff has changed locally but the server looks like it did when we last synched
                        // safe to upload
                        return uploadUserData();
                    }
                    else
                    {
                        if (that.localResponse && that.localResponse !== that.lastSeenResponse)
                        {
                            // The server state is not what is expected AND the game has changed locally since the last
                            // sync - time to ask the user what to do!
                            return $q.reject();
                        }
                        else
                        {
                            // No game locally OR Stuff has changed on server but the local data looks like it did when
                            // we last synched. Game has been played on server since last sync, but not played locally.
                            // safe to download
                            return downloadUserData();
                        }
                    }
                }
            }, function ()
            {
                // can't go online to get the data, so can't sync or resolve mismatch - best thing to do is to stay
                // offline!
                online.forceOffline();
            }).always(function ()
            {
                finaliseGameSession();
            });
        };
    }]);
})(window.angular, window._);
