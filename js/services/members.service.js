/* global angular */
var app = angular.module('club');

app.service('MembersService', ['$rootScope', '$firebaseArray', function($rootScope, $firebaseArray) {
    var members = $rootScope
        .firebaseRef
        .child('members')
        .limitToLast(20)
    ;

    this.members = $firebaseArray(members);
    
}]);