'use strict';
(function (angular)
{
    var app = angular.module('game.host');

    app.directive('tzModal', [function ()
    {

        return {
            replace: true,
            template: '<div class="modal-backdrop" ng-show="tzModalShow" ng-click="closeModal($event)"' +
                           'ng-animate="{enter: \'fade-in\', exit:\'fade-out\'}">' +
                          '<div ng-transclude ng-show="tzModalShow"  ng-click="preventDefault($event)" class="modal"' +
                                         'ng-animate="{enter: \'fade-in\', exit:\'fade-out\'}"></div>' +
                      '</div>',
            transclude: true,
            link: function (scope, element, attributes)
            {
                var closeModal = function ()
                {
                    if (attributes.tzModal)
                    {
                        scope.$eval(attributes.tzModal + ' = false');
                    }
                };

                scope.tzModalShow = false;

                scope.closeModal = function (event)
                {
                    event.stopPropagation();
                    closeModal();
                    return false;
                };

                scope.preventDefault = function (event)
                {
                    event.stopPropagation();
                    return false;
                };

                element.keyup(event, function (event)
                {
                    if (event.which === 81)
                    {
                        scope.$apply(function ()
                        {
                            closeModal();
                        });
                    }
                });

                scope.$watch(attributes.tzModal, function (show)
                {
                    scope.tzModalShow = show;
                });
            }
        };

    }]);

})(window.angular);
