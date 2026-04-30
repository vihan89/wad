angular.module("todoApp", [])
  .controller("TodoCtrl", function ($scope) {
    $scope.tasks = [
      { text: "Practice HTML" },
      { text: "Revise JS" }
    ];

    $scope.addTask = function () {
      if (!$scope.newTask) return;
      $scope.tasks.push({ text: $scope.newTask });
      $scope.newTask = "";
    };

    $scope.removeTask = function (index) {
      $scope.tasks.splice(index, 1);
    };
  });
