angular.module("userApp", [])
  .controller("UserCtrl", function ($scope) {
    const saved = JSON.parse(localStorage.getItem("ngUsers") || "[]");
    $scope.users = saved;

    $scope.register = function () {
      if (!$scope.reg || !$scope.reg.username || !$scope.reg.password) {
        $scope.regMsg = "All fields required";
        return;
      }
      $scope.users.push({
        name: $scope.reg.name,
        email: $scope.reg.email,
        username: $scope.reg.username,
        password: $scope.reg.password
      });
      localStorage.setItem("ngUsers", JSON.stringify($scope.users));
      $scope.regMsg = "Registered";
    };

    $scope.loginUser = function () {
      const user = $scope.users.find(
        (u) => u.username === $scope.login.username && u.password === $scope.login.password
      );
      if (user) {
        $scope.currentUser = user;
        $scope.loginMsg = "Login success";
      } else {
        $scope.loginMsg = "Invalid credentials";
      }
    };
  });
