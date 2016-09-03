/* global angular */
var app = angular.module('club');

app.directive('window', function() {
    return {
        restrict: 'E',
        templateUrl: '/views/directives/window.directive.html',
        controller: 'WindowCtrl',
        scope: {
            windowData: '='
        }
    }
});