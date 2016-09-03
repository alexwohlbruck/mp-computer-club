/* global angular */
var app = angular.module('club');

app.controller('MainCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    
    class Window {
        constructor(width, height) {
            this.width = width || 700;
            this.height = width || 500;
            this.top = (window.innerHeight / 2) - (this.height / 2) + ($rootScope.windows.items.length * 40);
            this.left = (window.innerWidth / 2) - (this.width / 2) + ($rootScope.windows.items.length * 40);
            this.title = "Terminal";
            this.output = ['Welcome to the myers park computer club web interface'];
            this.program = 'terminal';
        }
    }
    
    function init() {
        $rootScope.windows.items = [];
        $rootScope.windows.create();
    }
    
    $rootScope.windows = {
        create: function() {
            var newWindow = new Window();
                newWindow.index = $rootScope.windows.items.length;
                
            $rootScope.windows.items.push(newWindow);
        },
        close: function(i) {
            if ($rootScope.windows.items.length !== 1) {
                $rootScope.windows.items.splice(i, 1);
            }
        }
    };
    
    init();
}]);