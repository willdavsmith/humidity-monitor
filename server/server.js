const fs = require('fs')
const express = require('express')
const zip = require('express-zip');
const app = express()
const port = 3032

app.use(express.json())
app.use(express.static('public'))
app.set('views', './views')
app.set('view engine', 'pug')

const dataDirectory = `${__dirname}/../data`
const filePath = `${dataDirectory}/data.csv`
let ready = true

setInterval(() => {
  ready = false
  fs.copyFileSync(filePath, `${dataDirectory}/snapshot-${new Date().toISOString()}.csv`)
  fs.unlinkSync(filePath)
  fs.copyFileSync(filePath, `${dataDirectory}/template.csv`, `${dataDirectory}/data.csv`)
  ready = true
}, (7 * 24 * 60 * 60 * 1000))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/', function (_, res) {
  getCurrentValue()
    .then((data) => {
      const timestamp = new Date(data[0])
      res.render('index', { value: data[1], timestamp: `${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}` })
    })
})

app.get('/download', function (_, res) {
  if (ready) res.download(filePath)
  else res.sendStatus(503)
})

app.get('/download-all', function (_, res) {
  if (ready) {
    const fileNames = []
    fs.readdirSync(dataDirectory).forEach(file => {
      fileNames.push({
        path: `${dataDirectory}/${file}`,
        name: `/${file}`
      })
    })
    res.zip(fileNames)
  } else {
    res.sendStatus(503)
  }
})

app.post('/update', function (req, res) {
  ready = false
  if (req.body && req.body['payload']) {
    const payload = req.body['payload']
    if (!isNaN(payload)) {
      const newValue = parseFloat(payload)
      if (newValue <= 100 && newValue >= 0) {
        var stream = fs.createWriteStream(filePath, { flags: 'a' })
        stream.write(`${new Date().valueOf()},${newValue}\n`)
        stream.end()
        ready = true
        res.sendStatus(201)
      }
    }
  }
  ready = true
  res.sendStatus(400)
})

app.get('/data', function (_, res) {
  if (ready) {
    const data = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' })
    res.send(data)
  } else {
    res.sendStatus(503)
  }
})

async function getCurrentValue() {
  if (ready) {
    const response = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' })
    const result = response.split('\n').map(row => {
      row = row.split(',');
      row[0] = parseInt(row[0])
      row[1] = parseFloat(row[1])
      return row;
    });
    result.pop();
    const valueRow = result.pop();
    return valueRow;
  } else {
    res.sendStatus(503)
  }
}
