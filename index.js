import { ajax } from 'rxjs/ajax';
import { map, catchError, filter, mergeMap, exhaustMap, switchMapTo} from 'rxjs/operators';
import { of, interval, fromEvent, timer } from 'rxjs';

// Functions
function drawChart() {
  var data = google.visualization.arrayToDataTable(dataArray$);
  var options = {
    //title: 'Bitcoin history rates',
    curveType: 'function',
    legend: { position: 'bottom' },
    width :800,
    height:320
  };
  chart = new google.charts.Line(document.getElementById('chart_div'));
  chart.draw(data, google.charts.Line.convertOptions(options));
}

// Vaiables
const rate$ = document.getElementById('rate');
var cont$ = 0;
var dataArray$ = [ ['Última hora', 'Rate'] ];
var chart;
var minValue$;
var maxValue$;
var lastValue$;

const ajax$ = {
  url: "https://www.bitstamp.net/api/v2/ticker/btcusd/", // https://www.bitstamp.net/api/v2/ticker/btcusd
  crossDomain: true,
  withCredentials: false,
  method: 'POST'
}

document.getElementById('chart_div').style.display = 'none';

const ready$ = fromEvent(window, 'load').pipe(
  exhaustMap(() => // When the previous Observable has completed.
    timer(0, 3000).pipe( // Interval
      switchMapTo( // Switch to a new Observable each time.
        ajax(ajax$).pipe( // Ajax
          map( (jsonObject) => { // mapResponse
            
            minValue$ = parseFloat(jsonObject.response["low"]).toFixed(4);
            maxValue$ = parseFloat(jsonObject.response["high"]).toFixed(4);
            const rateDec = parseInt(jsonObject.response["last"]).toFixed(4);
            rate$.innerHTML = rateDec.toString();
            lastValue$ = parseFloat(rateDec).toFixed(4);
            if ( cont$ == 0 ) {
              // Load the Visualization API and the corechart package.
              google.charts.load('current', {'packages':['line']});
              // Set a callback to run when the Google Visualization API is loaded.
              google.charts.setOnLoadCallback(drawChart);
            }else{
              document.getElementById('chart_div').style.display = 'block';
              var coor$ = [ cont$.toString(), parseFloat(lastValue$)]; // Example: ["1",  41.6] / String and float
              dataArray$.push(coor$);
              console.log(coor$);
              var newData = google.visualization.arrayToDataTable(dataArray$);
              var options = {
                //title: 'Bitcoin history rates',
                curveType: 'function',
                legend: { position: 'bottom' },
                //vAxis: { minValue: parseFloat(minValue$), maxValue: parseFloat(maxValue$) },
                //vAxis: { minValue: 30.0, maxValue: 50.0 },
                vAxis: { format: 'decimal' },
                width:800,
                height:320
              };
              chart.draw(newData, options);
            }
            cont$++;
            
          }) // End map ajax
        ) // End ajax
      ) // End switchMapTo
    ) // End timer
  ) // End exhaustMap
).subscribe(
  (data) => {
    //console.log("Document ready...");
  }
);