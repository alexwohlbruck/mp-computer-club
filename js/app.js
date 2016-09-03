/* global angular */
var app = angular.module('club', ['ngMaterial', 'firebase', 'ngAnimate', 'ngDragDrop']);

app.config(['$mdThemingProvider', function($mdThemingProvider) {
    
    $mdThemingProvider.theme('default')
		.primaryPalette('grey', {
			'default': '900',
			'hue-1': '800',
			'hue-2': '700',
			'hue-3': '50'
		})
		.accentPalette('light-green', {
			'default': 'A700'
		})
		.dark();

	$mdThemingProvider.setDefaultTheme('default');
    
}]);

app.run(['$rootScope', function($rootScope) {
	/* global firebase, keys */
    firebase.initializeApp(keys.firebase);
    $rootScope.firebaseRef = firebase.database().ref();
}]);