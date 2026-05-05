angular.module("todoApp", [])
  .controller("TodoCtrl", function ($scope) {
    $scope.tasks = [
      { text: "Practice HTML", done: false },
      { text: "Revise JS", done: false }
    ];

    $scope.addTask = function () {
      if (!$scope.newTask) return;
      $scope.tasks.push({ text: $scope.newTask, done: false });
      $scope.newTask = "";
    };

    $scope.toggleTask = function (task) {
      task.done = !task.done;
    };

    $scope.updateTask = function (task) {
      const newText = prompt("Update task", task.text);
      if (newText) {
        task.text = newText;
      }
    };

    $scope.removeTask = function (index) {
      $scope.tasks.splice(index, 1);
    };
  });
