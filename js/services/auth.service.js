/* global angular */
var app = angular.module('club');

app.service('AuthService', ['$rootScope', '$firebaseAuth', function($rootScope, $firebaseAuth) {
    
    this.authObj = $firebaseAuth();
    
    this.signInAnonymously = function() {
        var promise = this.authObj.$signInAnonymously()
        
        promise.then(function(firebaseUser) {
            $rootScope.fireBaseUser = firebaseUser;
        }).catch(function(error) {
            console.error("Authentication failed:", error);
        });
        
        return promise;
    };
    
}]);