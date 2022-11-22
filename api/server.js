import express from 'express'
import bodyParser from 'body-parser'

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*'])
  res.append('Access-Control-Allow-Methods', 'GET,POST')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login', (req, res) => {
  console.log(req.body)
  res.send('ok')
})

const port = process.env.APP_PORT

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
