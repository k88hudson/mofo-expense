'use strict';


angular.module('mofoExpenseApp')
  .directive('currencyInput', function($filter) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ctrl) {

        // Converts a currency in any format to 00.00, if possible.
        // If a conversion can't be made, the input is set to invalid with a 'currency' error.
        function rawToCurrency(raw) {
          var currency = $filter('currency')(raw
            .replace(/,/g, '')
            .replace(/\$/g, '')
          );

          if (currency) {
            ctrl.$setValidity('currency', true);
            return currency
              .replace(/\$/g, '')
              .replace(/,/g, '');
          } else {
            ctrl.$setValidity('currency', false);
            return currency;
          }
        }

        // Update the model after user input
        ctrl.$parsers.push(function(viewValue) {
          return rawToCurrency(viewValue);
        });

        // Runs when the model gets updated directly
        ctrl.$render = function() {
          element.val(ctrl.$viewValue || '');
        };

        // Update the actual input element
        element.bind('change', function() {
          var raw = element.val()
          element.val(rawToCurrency(raw));
        });

      }
    };
  })

  .controller('MainCtrl', function($scope, $http) {

    // Todo: pull from user settings
    function ExpenseConstructor(options) {
      var self = this;

      self.currency = "USD";
      self.rate = 1;

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

    $scope.exchangedAmount = function(amt, rate) {
      return +amt * (1 / rate);
    };

    $scope.formattedDate = function(date) {
      date = date || '';
      var formatted = chrono.parseDate(date);
      if (!formatted) {
        return 'Not a valid date';
      } else {
        return moment(formatted).format('MMMM Do YYYY');
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
      $scope.new_expense.$setPristine();
    };

    $scope.grandTotal = function() {
      var total = 0;
      $scope.expenses.forEach(function(item) {
        total += $scope.exchangedAmount(item.total, item.rate);
      });
      return total;
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
