'use strict';
(function (angular, _)
{
    var module = angular.module('engine.services');

    module.service('storeService', ['$http', '$q', '$rootScope', 'chrome', 'bridge', 'google', 'online', 'slug',
                                    function ($http, $q, $rootScope, chrome, bridge, google, online, slug)
    {
        var currencies = {
            "JPY": {
                "currencyName": "Yen",
                "alphabeticCode": "JPY",
                "numericCode": 392,
                "minorUnitPrecision": 0
            },
            "USD": {
                "currencyName": "US Dollar",
                "alphabeticCode": "USD",
                "numericCode": 840,
                "minorUnitPrecision": 2
            },
            "GBP": {
                "currencyName": "Pound Sterling",
                "alphabeticCode": "GBP",
                "numericCode": 826,
                "minorUnitPrecision": 2
            },
            "EUR": {
                "currencyName": "Euro",
                "alphabeticCode": "EUR",
                "numericCode": 978,
                "minorUnitPrecision": 2
            }
        };
        var basket = {};
        var storeOfferings = {};
        var storeResources = {};

        this.consumeUserItems = function (data, callback)
        {
            if (!online.test())
            {
                callback({
                    status: 404
                });
            }
        };


        this.fetchStoreMeta = function ()
        {
            $http.get('/api/v1/store/items/read/' + slug).then(function (results)
            {
                var response = results;
                var currencyInfo = currencies;
                var currencyCode = 'USD';
                var currency = currencyInfo[currencyCode];
                var alphabeticCode = currency.alphabeticCode;
                var storeMeta = response.data.data;

                storeOfferings = storeMeta.items;
                storeResources = storeMeta.resources;
                _.forEach(storeOfferings, function (item) {
                    item.price = item.prices[alphabeticCode] / 100.0;
                });

                bridge.emit('store.meta.v2', JSON.stringify({
                    currency: currency,
                    offerings: storeMeta.items,
                    resources: storeMeta.resources
                }));
            });
        };

        this._resetBasket = function (newBasketItems)
        {
            basket = newBasketItems;
        };

        this._calculateBasket = function (callback)
        {
            var currencyCode = 'USD';
            var currency = currencies[currencyCode];
            var total = 0;

            if (_.isEmpty(basket))
            {
                // .. and if it's empty, do an early out ..
                callback({}, total, currency);
            }
            else
            {
                // .. otherwise calculate totals and return them
                var storeItem, storeItemPrice, amount, lineTotal;
                var calculatedItems = _.reduce(basket, function (dict, item, key) {

                    storeItem = storeOfferings[key];
                    // dont add any items that are no longer in the store
                    // possible if developer changes store item keys
                    if (storeItem && storeItem.available)
                    {
                        storeItemPrice = storeItem.prices[currencyCode];
                        amount = item.amount;
                        if (amount > 999)
                        {
                            amount = 999;
                        }
                        lineTotal = storeItemPrice * amount;

                        dict[key] = {
                            amount: amount,
                            price: storeItemPrice,
                            lineTotal: lineTotal,
                            output: storeItem.output
                        };
                        total = total + lineTotal;
                    }
                    return dict;
                }, {});

                this._resetBasket(calculatedItems);

                callback(calculatedItems, total, currency);
            }
        },

        this.onUpdateBasket = function (jsonParams)
        {
            var newBasketItems;
            var token;
            if (jsonParams)
            {
                var params = JSON.parse(jsonParams);
                newBasketItems = params.basketItems;
                token = params.token;
            }

            // .. overwrite the basket contents with what the game has set it to, ..
            if (!_.isUndefined(newBasketItems))
            {
                this._resetBasket(newBasketItems);
            }

            // .. calculate the basket contents ..
            this._calculateBasket(function (basketItems, total, currency)
                {
                    var out = JSON.stringify({
                        currency: currency,
                        total: total / 100.0,//total.toMajorUnit(),

                        items: _.reduce(basketItems, function (dict, item, key) {
                            dict[key] = {
                                amount: item.amount,
                                price: item.price / 100.0,
                                lineTotal: item.lineTotal / 100.0,
                                output: item.output
                            };
                            return dict;
                        }, {}),
                        token: token
                    });

                    // .. and tell everybody about it
                    bridge.emit('basket.site.update', out);
                });
        };

        this._confirmPurchase = function (basketItems /*, total, currency */)
        {
            var transactionId;

            function fail(msg)
            {
                window.console.error(msg);
            }

            if (!basketItems)
            {
                fail('Could not process basket items');
                return;
            }

            var basketData = _.reduce(basketItems, function (dict, item, key) {
                dict[key] = {
                    amount: item.amount,
                    price: item.price,
                    output: item.output
                };
                return dict;
            }, {});

            if (_.isEmpty(basketData))
            {
                fail('Basket is Empty');
                return;
            }

            $http.post('/api/v1/store/transactions/checkout', {
                    gameSlug: slug,
                    basket: JSON.stringify(basketData),
                    paymentProvider: 'googlewallet'
                }).then(function (response) {
                    var responseData = response.data.data;
                    transactionId = responseData.transactionId;
                    var paymentData = responseData.paymentData;
                    var paymentJWT = paymentData.paymentJWT;
                    var productionEnv = paymentData.production;

                    //Success handler
                    var successHandler = function (purchaseAction) {
                        var payAttemptsRemaining = 3;
                        var payDelay = 500;

                        function pay()
                        {
                            // we have to pay in this window because the user might close the parent window.
                            var transactionId = purchaseAction.request.sellerData;
                            $http.post('/api/v1/store/transactions/pay/' + transactionId,
                                {
                                    paymentParameters: purchaseAction.jwt
                                }).then(function successFn(/* response */)
                                {
                                    // Success send bridge events
                                    bridge.emit('purchase.confirmed');
                                },
                                function errorFn(response, status)
                                {
                                    payAttemptsRemaining -= 1;
                                    if (payAttemptsRemaining > 0 && (
                                            status === 0 ||
                                            status === 408 ||
                                            status === 480 ||
                                            status === 503))
                                    {
                                        setTimeout(pay, payDelay);
                                        payDelay *= 2;
                                    }
                                    else
                                    {
                                        // Deal with failure
                                    }
                                }
                            );
                        }

                        $rootScope.safeApply(pay);
                    };

                    //Failure handler
                    var failureHandler = function (/* purchaseActionError */) {
                        // Deal with failure
                        bridge.emit('purchase.rejected');
                    };

                    google.payments.inapp.buy({
                        parameters: { env: productionEnv ? 'prod' : 'sandbox' },
                        jwt       : paymentJWT,
                        success   : successHandler,
                        failure   : failureHandler
                    });
                });
        },

        this._rejectPurchase = function ()
        {
            bridge.emit('purchase.rejected');
        },

        this.purchaseShowConfirm = function ()
        {
            if (!online.test())
            {
                bridge.emit('purchase.rejected');
                return;
            }
            var that = this;
            // calculate the associated basket contents
            this._calculateBasket(function (basketItems, total, currency) {
                // Modal to confirm checkout????
                that._confirmPurchase(basketItems, total, currency);
            });
        };
    }]);

    module.run(['storeService', 'bridgeServices', 'bridge', function (storeService, bridgeServices, bridge)
    {
        bridgeServices.registerService('store.useritems', bridgeServices.getCachedResponse);
        bridgeServices.registerService('store.useritems-consume', storeService.consumeUserItems, storeService);

        bridge.on('fetch.store.meta', function () { storeService.fetchStoreMeta(); });
        bridge.on('purchase.show.confirm', function () { storeService.purchaseShowConfirm(); });
        bridge.on('basket.game.update.v2', function (event, jsonParams) { storeService.onUpdateBasket(jsonParams); });

    }]);
})(window.angular, window._);
