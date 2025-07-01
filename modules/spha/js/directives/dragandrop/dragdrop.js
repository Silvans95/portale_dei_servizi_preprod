angular.module('sphaApp')
    .directive('drag', function () {
        return {
            restrict: 'A',
            scope: {
                code: '@',
                startContainer: "@startContainer"
            },
            link: function (scope, element, attrs) {
                attrs.$observe('drag', function () {
                    {
                        if (attrs.drag === "true") {
                            element.attr("draggable",true);
                            element[0].addEventListener('dragstart', scope.handleDragStart, false);
                            element[0].addEventListener('dragend', scope.handleDragEnd, false);
                        } else {
                            element.attr("draggable",false);
                            element[0].removeEventListener('dragstart', scope.handleDragStart);
                            element[0].removeEventListener('dragend', scope.handleDragEnd);

                        }
                    }
                });
            },
            controller: function ($scope) {
                $scope.handleDragStart = function (e) {
                    const dragData = {companySis: $scope.code, startContainer: $scope.startContainer};
                    this.style.opacity = '0.9';
                    e.dataTransfer.setData("data",JSON.stringify(dragData));

                };

                $scope.handleDragEnd = function (e) {
                    this.style.opacity = '1.0';
                };
            }
        }
    })
    .directive('droppable', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                attrs.$observe('droppable', function () {
                    {
                        if (attrs.droppable === "true") {
                            element[0].addEventListener('drop', scope.handleDrop, false);
                            element[0].addEventListener('dragover', scope.handleDragOver, false);
                        } else {
                            element[0].removeEventListener('drop', scope.handleDrop);
                            element[0].removeEventListener('dragover', scope.handleDragOver);

                        }
                    }
                });

            }

        }
    });
/*    .directive('dragMe', dragMe)
    .directive('dropOnMe', dropOnMe);

dragMe.$inject = [];

function dragMe() {
    var DDO = {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.prop('draggable', true);
            element.on('dragstart', function (event) {
                event.dataTransfer.setData('text', event.target.id)
            });
        }
    };
    return DDO;
}

dropOnMe.$inject = [];

function dropOnMe() {
    var DDO = {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('dragover', function (event) {
                event.preventDefault();
            });
            element.on('drop', function (event) {
                event.preventDefault();
                var data = event.dataTransfer.getData("text");
                event.target.appendChild(document.getElementById(data));
            });
        }
    };
    return DDO;
}*/

/*.directive('draggable', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element[0].addEventListener('dragstart', scope.handleDragStart, false);
            element[0].addEventListener('dragend', scope.handleDragEnd, false);
        }
    }
}).directive('droppable', function () {
return {
    restrict: 'A',
    link: function (scope, element, attrs) {
        element[0].addEventListener('drop', scope.handleDrop, false);
        element[0].addEventListener('dragover', scope.handleDragOver, false);
    }
}*/
/*
 * ngDragDrop - HTML5 Drag & Drop
 * http://github.com/ajainvivek/ngDragDrop
 * (c) 2015 MIT License, https://chaicode.com
 */

