/* global angular */
var app = angular.module('club');

app.service('ChatService', ['$rootScope', '$firebaseArray', function($rootScope, $firebaseArray) {
    var messages = $rootScope
        .firebaseRef
        .child('messages')
        .limitToLast(20)
    ;

    this.messages = $firebaseArray(messages);
    
}]);