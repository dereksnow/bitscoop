if (Meteor.isServer) {
  var DAY_URL = "https://api.bitcoinaverage.com/history/USD/per_minute_24h_sliding_window.csv";
  var MONTH_URL = "https://api.bitcoinaverage.com/history/USD/per_hour_monthly_sliding_window.csv";
  var ALL_URL = "https://api.bitcoinaverage.com/history/USD/per_day_all_time_history.csv";

  var dayData = "";
  var monthData = "";
  var allData = "";
  
  // Get initial data upon starting server
  Meteor.startup(function () {
    getDayData();
    getMonthData();
    getAllData();
    console.log("startup");
  });  

  function getDayData() {
    dayData = HTTP.call("GET", DAY_URL);
    console.log("api for day");
  };

  function getMonthData() {
    monthData = HTTP.call("GET", MONTH_URL);
    console.log("api for month");
  };

  function getAllData() {
    allData = HTTP.call("GET", ALL_URL);
    console.log("api for all");
  };  

  // Fetch data at appropiate period

  // Get update every minute
  Meteor.setInterval(getDayData, 60000);
  
  // Get update every hour
  Meteor.setInterval(getMonthData, 3600000);
  
  // Get update every 24 hours
  Meteor.setInterval(getAllData, 3600000);

   Meteor.methods({
      chartData: function(period) {
        if (period === "DAY") { 
          return dayData.content;
        }
        else if (period === "MONTH") {
          return monthData.content;
        }
        else if (period === "ALL") {
          return allData.content;
        }
      },
      nowData: function() {
        var dataArray = dayData.content.split(",");
        var current = dataArray[dataArray.length - 1];
        return current;
      }
    });  
}

if (Meteor.isClient) {

  Template.hello.helpers({
    updateInfo: function(){
      var update = {"DAY": "minute", 
                    "MONTH": "hour",
                    "ALL": "day"};
      return update[Session.get("showChart")];
    },
    nowAvgData: function(){
      return Session.get("nowPrice");
    }

  });

  Session.set("showChart", "DAY");

  Meteor.startup(function () {

    var headerHeight = $(".navbar").height();

    $('a[href*=#]:not([href=#])').click(function() {
      if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') 
          || location.hostname == this.hostname) {

          var target = $(this.hash);
          var scrollPosition = target.selector === "#top" ? 0 : target.offset().top - headerHeight;
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target) {
               $('html,body').animate({
                   scrollTop: scrollPosition
              }, 1000);
            return false;
          }
      }
    });

  });

  Template.hello.greeting = function () {
    return "Welcome to bitcoinchart.";
  };

  Template.hello.events({
    'click input.dayChart': function () {
      if (Session.get("showChart") !== "DAY") {
        Session.set("showChart", "DAY");
      }
    },
    'click input.monthChart': function () {
      if (Session.get("showChart") !== "MONTH") {
        Session.set("showChart", "MONTH");
      }
    },
    'click input.allChart': function () {
      if (Session.get("showChart") !== "ALL") {
        Session.set("showChart", "ALL");
      }
    }  
        
  });

  Template.hello.rendered = function () {
     var self = this;

     if (! self.handle) {
       self.handle = Deps.autorun(function () {

        var formatDate = d3.time.format.utc("%Y-%m-%d %H:%M:%S");
        
        var chart = timeSeriesChart()
        .x(function(d) { return formatDate.parse(d.datetime); })
        .y(function(d) { return +d.average; });

         var updateChart = function() {
          Meteor.call('chartData', Session.get("showChart"), function(error, result) {
            var parsed = d3.csv.parse(result);
            d3.select("#avgChart")
              .datum(parsed)
              .call(chart);
          });
        };
        
        var upDateNowPrice = function() {
          Meteor.call('nowData', function(error,result){
            Session.set("nowPrice", result);
          });
        };

        upDateNowPrice();
        updateChart();

        Meteor.setInterval(upDateNowPrice, 60000);
        Meteor.setInterval(updateChart, 60000);        

       });
     }
   };

}


