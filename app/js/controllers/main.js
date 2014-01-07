'use strict';


angular.module('mofoExpenseApp')

  .controller('MainCtrl', function($scope, $http) {

    $scope.settings = {};
    $scope.currencies = {};

    $http.get('/currencies')
      .success(function(data){
        $scope.currencies = data
      })
      .error(function(err) {
        console.log(err);
      });

    $scope.expenses = [{
      currency: "USD",
      date: "03/14/2013",
      dept_project: "Engagement/None",
      expense_type: "Events (costs like catering, etc.)",
      description: "London Undergroud travel",
      location: "London, UK",
      total: "31.04"
    }];

    $scope.expense = {
      currencyCode: 'USD',
      currencyToUSD: 1
    };

    $scope.formattedDate = function(date) {
      date = date || '';
      var formatted = chrono.parse(date);
      if (!formatted[0]) {
        return 'Not a valid date';
      } else {
        return (formatted[0].start.month + 1) + '/' + formatted[0].start.day + '/' + formatted[0].start.year;
      }
    };

    $scope.expense.exchangedAmount = function() {
      var rate = +$scope.currencies[$scope.expense.currencyCode] || 1;
      var amt = +$scope.expense.total || 0;
      return amt * 1/rate;
    };

    $scope.setCurrency = function() {
      $scope.expense.currencyToUSD = +$scope.currencies[$scope.expense.currencyCode] || 1;
    };

    $scope.addCurrency = function() {
      $scope.currencies[$scope.new_currency_code] = $scope.new_currency_to_usd;
      $scope.new_currency_code = '';
      $scope.new_currency_to_usd = '';
    };

    $scope.deleteCurrency = function(code) {
      delete $scope.currencies[code];
    };

    $scope.addExpense = function() {
      var oldCurrencyCode = $scope.expense.currencyCode;
      var oldCurrencyRate = $scope.expense.currencyToUSD;
      var newExpense =  angular.copy($scope.expense);
      $scope.expenses.push(newExpense);
      $scope.expense = {
        currencyCode: oldCurrencyCode,
        currencyToUSD: oldCurrencyRate,
        show: 0
      };
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
