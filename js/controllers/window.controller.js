/* global angular, $ */
var app = angular.module('club');

app.controller('WindowCtrl', ['$scope', '$rootScope', '$q', '$timeout', 'ChatService', 'MembersService', 'AuthService', '$firebaseArray', function($scope, $rootScope, $q, $timeout, ChatService, MembersService, AuthService, $firebaseArray) {
    function init() {
        $scope.focusWindow();
        $scope.messages = ChatService.messages;
        $scope.members = MembersService.members;
    }
    
    function writeLine(message) {
        $scope.windowData.output.push(message);
        
        // Sorry about DOM manipluation in controller, it's the easiest way
        $(".text").animate({ scrollTop: $('.text').prop("scrollHeight")}, 200);
    }
    
    function prompt(message, validateFn, validateType) {
        if (!validateFn) {
            validateFn = function() {
                return true;
            };
        }
        
        var deferred = $q.defer();
        
        writeLine(message);
        
        var listener = $scope.$on('programInput', function(event, data) {
            
            $timeout(function() {
                if (validateFn(data, validateType) == null) {
                    // Returned null, cancel the sign-up
                    listener(); // This removes the listener from this instance of the function
                    deferred.reject();
                } else if (validateFn(data, validateType)) {
                    // Validation passed
                    deferred.resolve(data);
                    listener(); // This removes the listener from this instance of the function
                } else {
                    // Validation failed
                    writeLine("Please provide a valid "+validateType);
                }
            }, 1);
        });
    
        return deferred.promise;
    }
    
    $scope.focusWindow = function() {
        var largest = 0;
        for (var i = 0; i < $rootScope.windows.items.length; i++) {
            if ($rootScope.windows.items[i].layer > largest) {
                largest = $rootScope.windows.items[i].layer;
            }
        }
        $scope.windowData.layer = ++largest;
    };
    
    $scope.runCommand = function() {
        
        var input = $scope.windowData.input;
        $scope.$broadcast('programInput', input);
        $scope.windowData.input = '';
        
        if (input.trim() == '') {
            return false;
        }
        
        if ($scope.windowData.program != 'chat') {
            writeLine(null);
            writeLine('> '+input);
        }
        
        switch ($scope.windowData.program) {
            case 'terminal':
                $scope.windowData.inputPlaceholder = "";
                
                switch (input.toLowerCase()) {
                    case 'chat':
                        $scope.programs.terminal.openChat();
                        break;
                        
                    case 'sign-up':
                        $scope.programs.terminal.signUp();
                        break;
                        
                    case 'about':
                        $scope.programs.terminal.openAbout();
                        break;
                        
                    case 'clear':
                        $scope.windowData.output = [];
                        break;
                        
                    case 'exit':
                        $scope.programs.terminal.exit();
                        break;
                        
                    case 'new':
                        $rootScope.windows.create();
                        writeLine('New window opened');
                        break;
                        
                    case 'list':
                        $scope.programs.terminal.listCommands();
                        break;
                        
                    case 'members':
                        $scope.programs.terminal.listMembers();
                        break;
                        
                    case 'help':
                        writeLine('Enter "list" for list of commands');
                        break;
                        
                    default:
                        $scope.programs.terminal.error(input);
                        break;
                }
                break;
                
            case 'chat':
                $scope.programs.chat(input);
                break;
            
            default:
                alert("You've broken my website, thanks.");
                break;
        } 
    };
    
    $scope.programs = {
        terminal: {
            openChat: function() {
                if (!AuthService.authObj.$getAuth() || !$scope.windowData.userName) {
                    prompt("Enter your name:")
                        .then(AuthService.signInAnonymously())
                        .then(function(userName) {
                            $scope.windowData.userName = userName;
                            $scope.windowData.program = 'chat';
                            $scope.windowData.inputPlaceholder = "Reply as "+userName+"...";
                            writeLine("Chat program started");
                        })
                        .catch(function(error) {
                            console.error(error);
                        });
                        
                } else {
                    $scope.windowData.program = 'chat';
                }
            },
            signUp: function() {
                
                var output = {};
                var promiseChain = $q.all([]);
                var prompts = [
                    {
                        message: "Enter your full name",
                        type: "name"
                    },
                    {
                        message: "Enter your grade (rising grade, if applicable)",
                        type: "grade"
                    },
                    {
                        message: "Enter your email",
                        type: "email"
                    },
                    {
                        message: "Enter your phone number",
                        type: "phone"
                    },
                    {
                        message: "You are about to sign up for the computer club. Continue? (Y/N)",
                        type: "y/n"
                    }
                ];
                
                $scope.windowData.takeAnyInput = true;
                    
                for (var i = 0; i < prompts.length; i++) {
                    (function(i) {
                        var promptData = prompts[i];
                        
                        promiseChain = promiseChain.then(function(response) {
                            if (i != 0) {
                                output[prompts[i - 1].type] = response;
                            }
                            
                            var promiseResult = prompt(promptData.message, validate, promptData.type);
                            return promiseResult;
                        });
                    })(i);
                }
                
                promiseChain.then(function() {
                    writeLine("Okay, "+output.name+", you have been signed for the computer club");
                    $scope.members.$add(output);
                }, function() {
                    writeLine("Sign up canceled");
                }).finally(function() {
                    $timeout(function() {
                        $scope.windowData.takeAnyInput = false;  
                    }, 0);
                })
                
                function validate(input, type) {
                    switch (type) {
                        case 'name':
                            console.log(typeof input == 'string');
                            return typeof input == 'string';
                        case 'grade':
                            console.log(!isNaN(input) && Number(input) <= 12 && Number(input) >= 9);
                            return !isNaN(input) && Number(input) <= 12 && Number(input) >= 9;
                        case 'email':
                            var regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                            console.log(regex.test(input));
                            return regex.test(input);
                        case 'phone':
                            var alphanumeric = input.replace(/\W/g, '')
                            console.log(!isNaN(alphanumeric) && (alphanumeric.length == 10 || alphanumeric.length == 11));
                            return !isNaN(alphanumeric) && (alphanumeric.length == 10 || alphanumeric.length == 11);
                        case 'y/n':
                            switch (input.trim().toLowerCase()) {
                                case 'y' || 'yes':
                                    return true;
                                case 'n' || 'no':
                                    return null;
                                default:
                                    return false;
                            }
                    }
                }
            },
            listMembers: function() {
                console.log('test');
                angular.forEach($scope.members, function(member) {
                    console.log(member);
                    writeLine(member.name);
                });
            },
            openAbout: function() {
                writeLine("In myers park computer club, we will discuss anything and everything about computers.\
                    You will learn to write your own software, and build your own hardware from scratch. \
                    We will NOT be gaming or fooling around in the club, your goal is to learn as much as possible. \
                    If you are already experienced in one area of technology, you can teach as well.\
                    This is an open community, welcoming beginners and experts, and anyone in between.");
                writeLine(null);
                writeLine("If you are interested in signing up for the club, enter \"sign-up\" in the command line below.");
            },
            exit: function() {
                if ($rootScope.windows.items.length !== 1) {
                    $rootScope.windows.close($scope.windowData.index);
                } else {
                    writeLine('You cannot exit the only remaining window');
                }
            },
            listCommands: function() {
                writeLine('"chat" - Open the chat program');
                writeLine('"sign-up" - Sign up for the computer club');
                writeLine('"about" - Get information about the computer club');
                writeLine('"members" - View a list of members of the club');
                writeLine('"clear" - Clear the terminal');
                writeLine('"exit" - Close the terminal');
                writeLine('"new" - Open new terminal');
            },
            error: function(input) {
                $timeout(function() {
                    if (!$scope.windowData.takeAnyInput) {
                        writeLine('Command "'+input+'" not recognized. Enter "list" for list of commands');
                    }
                }, 1);
            }
        },
        chat: function(input) {
            if (input == 'exit') {
                $scope.windowData.program = 'terminal';
            } else {
                $scope.messages.$add({
                    user: $scope.windowData.userName,
                    text: input
                });
            }
        }
    };
    
    init();
}]);