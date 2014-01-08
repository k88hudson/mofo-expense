'use strict';


angular.module('mofoExpenseApp')
  .directive('currencyInput', function($filter, $browser) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl) {

        function rawToCurrency(raw) {
          var currency = $filter('currency')(raw
            .replace(/,/g, '')
            .replace(/\$/g, '')
          );
          if (currency) {
            ctrl.$setValidity('currency', true);
            return currency.replace(/\$/g, '');
          } else {
            ctrl.$setValidity('currency', false);
          }
        }

        // This runs when we update the text field
        ctrl.$parsers.push(function(viewValue) {
          return rawToCurrency(viewValue);
        });

        // This runs when the model gets updated on the scope directly and keeps our view in sync
        ctrl.$render = function() {
          element.val(ctrl.$viewValue);
        };

        var listener = function() {
          var raw = element.val()
          element.val(rawToCurrency(raw));
        };

        element.bind('change', listener);
      }
    };
  })

  .controller('MainCtrl', function($scope, $http) {

    // Todo: pull from user settings
    function ExpenseConstructor(options) {
      var self = this;

      self.currency = "USD";
      self.rate = 1;
      self.exchangedAmount = function() {
        return +$scope.expense.total * (1 / self.rate);
      };

      for (var option in options) {
        self[option] = options[option];
      }

    }

    // Grab currencies from server
    $http.get('/currencies')
      .success(function(data) {
        $scope.currencies = data;
      })
      .error(function(err) {
        console.log(err);
      });

    // The list of all expenses
    $scope.expenses = [];

    // Set a default expense
    $scope.expense = new ExpenseConstructor();

    $scope.formattedDate = function(date) {
      date = date || '';
      var formatted = chrono.parse(date);
      if (!formatted[0]) {
        return 'Not a valid date';
      } else {
        return (formatted[0].start.month + 1) + '/' + formatted[0].start.day + '/' + formatted[0].start.year;
      }
    };

    $scope.setCurrency = function() {
      $scope.expense.rate = +$scope.currencies[$scope.expense.currency] || 1;
    };

    $scope.addExpense = function() {
      var oldCurrencyCode = $scope.expense.currency;
      var oldCurrencyRate = $scope.expense.rate;
      var newExpense = angular.copy($scope.expense);
      $scope.expenses.push(newExpense);
      $scope.expense = new ExpenseConstructor({
        currency: oldCurrencyCode,
        rate: oldCurrencyRate
      });
    };

    $scope.deptProjectList = [
      "Engagement/MozFest",
      "Engagement/None",
      "Labs/Collusion (Ford Foundation Grant)",
      "Labs/Mozilla Ignite (Ignite 1)",
      "Labs/Mozilla Ignite (Ignite 2)",
      "Labs/Mozilla Ignite (Ignite 3)",
      "Labs/OpenNews",
      "Labs/Open(Art) (NEA Grant)",
      "Labs/Telefonica/Hacking Popular Culture",
      "Labs/Science Lab (Sloan Foundation Grant)",
      "Operations",
      "Webmaker/Hive NYC (SSRC Grant)",
      "Webmaker/Hive Toronto",
      "Webmaker/Hive Chicago",
      "Webmaker/None",
      "Webmaker/Open Badges/CSOL",
      "Webmaker/Open Badges",
      "Webmaker/NWP Summer Campaign"
    ];

    $scope.expenseTypeList = [
      "Events (costs like catering, etc.)",
      "Merchandise stock",
      "Travel & Entertainment - Staff",
      "Travel & Entertainment - Non staff",
      "General administration"
    ];
  });
