google.charts.load('current', { packages: ['corechart', 'line'] });
google.charts.setOnLoadCallback(drawBasic);

function drawBasic() {
  fetch('http://localhost:3032/data', {
    method: 'get',
    headers: {
      'content-type': 'text/csv;charset=UTF-8'
    }
  })
    .then(response => response.text())
    .then(raw => {
      var data = new google.visualization.DataTable();
      data.addColumn('number', 'X');
      data.addColumn('number', 'Value');
      const result = raw.split('\n').map(row => {
        row = row.split(',')
        row[0] = parseFloat(row[0])
        row[1] = parseFloat(row[1])
        return row
      })
      result.shift()
      result.pop()
      data.addRows(result)

      var options = {
        hAxis: {
          title: 'Timestamp',
          textStyle: {
            color: '#f5f5f5',
            fontName: 'Barlow'
          },
          titleTextStyle: {
            color: '#f5f5f5',
            fontName: 'Barlow Bold'
          }
        },
        vAxis: {
          title: 'Humidity',
          textStyle: {
            color: '#f5f5f5',
            fontName: 'Barlow'
          },
          titleTextStyle: {
            color: '#f5f5f5',
            fontName: 'Barlow Bold'
          }
        },
        backgroundColor: '#000000'
      };

      var chart = new google.visualization.LineChart(document.getElementById('chart'));

      chart.draw(data, options);
    })
}
