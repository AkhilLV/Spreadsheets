const express = require("express")
const nodeHtmlToImage = require("node-html-to-image")

const PORT = process.env.port || 5000

const app = express()

app.use(express.static('../public'))
app.use(express.json())

const arrayToHTML = (data) => {
  let DHTML = ``
  data.rows.forEach(row => {
    let columns = ``
    row.forEach(element => {
      columns += `<div>${element}</div>`
    })
    DHTML += `<div class="row">${columns}</div>`
  })

  return `<html>
  <head>
    <style>
    * {
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }
    body {
      height: ${data.tableHeight + 15}px;
      width: ${data.tableWidth}px;
      font-family: "Segoe UI";
    }

    h1 {
      overflow-wrap: break-word;
      margin-bottom: 15px;
    }
    
    .row {
      display: flex;
      justify-content: space-between;
    }
    /* 1 = First Row */
    .row:nth-child(1) div {
      background-color: ${data.color};
      border: none;
      color: #fff;
      display: grid;
      place-items: center;
      text-align: center;
      width: 200px;
      height: 50px;
    }
    
    .row div {
      border-bottom: 0.1px #555 solid;
      background-color: #222;
      color: #fff;
      display: grid;
      place-items: center;
      text-align: center;
      width: 200px;
      height: 30px;
      margin-right: 5px;
    }
    
    </style>
  </head>
  <body><h1>${data.includeHeading ? data.tableName : ""}</h1><div class="table">${DHTML}</div></body</html>`
}

app.post('/download', async (req, res) => {
  console.log("Request Recieved")
  const HTML = arrayToHTML(req.body)
  console.log("Generating Image")
  const image = await nodeHtmlToImage({
    html: HTML,
    transparent: true
  })
  console.log("Image Generated")
  res.writeHead(200, { 'Content-Type': 'image/png' })
  res.end(image, 'binary')
})

app.listen(PORT, () => console.log(`Server is listening on PORT: ${PORT}`))