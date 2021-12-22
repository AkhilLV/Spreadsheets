class DataController {
  constructor() { }

  toServer = (data) => {
    try {
      fetch("/download", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => {
        return res.blob()
      }).then(blob => download(blob, data.tableName))

    } catch (err) {
      console.error(err)
      alert("Something went wrong! Try again")
    }
  }
}

class UIController {
  constructor() {
    this.DOMElements = {
      app: document.querySelector('.app'),
      body: document.querySelector('body'),
      createTableBtn: document.querySelector('.btn'),
      checkbox: document.getElementById('checkbox'),
      modal: document.querySelector('.modal'),
      numberOfColumns: document.getElementById('col'),
      numberOfRows: document.getElementById('row'),
      overlay: document.querySelector('.overlay'),
      saveTableBtn: document.querySelector('.btn-save'),
      saveTableAsPNGBtn: document.querySelector('.btn-save-as-png'),
      tableNameInput: document.querySelector('.table-name-input'),
      table: document.querySelector('.table'),
      selectPreset: document.querySelector('.select-preset')
    }
  }

  renderTable = (numberOfRows, numberOfColumns) => {
    this.DOMElements.table.insertAdjacentHTML('afterbegin', `<div class="flex"><h1 id="table-heading" contentEditable="true">Click To Change</h1><a href="#"><i class="fas fa-trash-alt"></i></a><a href="#"><i class="fas fa-eraser"></i></a></div>`)

    let columns = ``
    for (let i = 1; i <= numberOfColumns; i++) {
      columns += `<div contentEditable="true" class="cell"></div>`
    }

    for (let i = 1; i <= numberOfRows; i++) {
      let HTML = `<div class="row">${columns}</div>`
      this.DOMElements["table"].insertAdjacentHTML('beforeend', HTML)
    }
  }

  appendRow = () => {
    const numberOfColumns = document.querySelector(".row").childElementCount

    let columns = ``
    for (let i = 1; i <= numberOfColumns; i++) {
      columns += `<div contentEditable="true" class="cell"></div>`
    }
    const HTML = `<div class="row">${columns}</div>`

    this.DOMElements.table.insertAdjacentHTML("beforeend", HTML)
  }

  deleteRow = () => {
    this.DOMElements.table.removeChild(this.DOMElements.table.lastElementChild)
  }

  appendColumn = () => {
    const rows = document.querySelectorAll(".row")

    rows.forEach(row => {
      row.insertAdjacentHTML('beforeend', '<div contentEditable="true" class="cell"></div>')
    })
  }

  deleteColumn = () => {
    const rows = document.querySelectorAll(".row")

    rows.forEach(row => {
      row.removeChild(row.lastElementChild)
    })
  }

  toggleModal = () => {
    this.DOMElements.overlay.classList.toggle("hide")
    this.DOMElements.modal.classList.toggle("hide")
    this.DOMElements.body.classList.toggle("disable-overflow")
    this.DOMElements.overlay.removeEventListener("click", () => { })
  }

  clearTable = (cells) => {
    cells.forEach(cell => {
      this.removeAllChildNodes(cell)
    })
  }

  removeAllChildNodes(parent) {
    while (parent.lastChild) {
      parent.removeChild(parent.lastChild);
    }
  }

  extractRows = () => {
    const UIrows = document.querySelectorAll(".row")

    const allRows = []
    UIrows.forEach(row => {
      const rowContents = []
      row.childNodes.forEach(node => {
        rowContents.push(node.textContent)
      })
      allRows.push(rowContents)
    })

    return allRows
  }


  getDOMElements = () => {
    return this.DOMElements
  }
}

class Controller {
  constructor(Data, UI) {
    this.dataCtrl = new Data()
    this.uiCtrl = new UI()
    this.DOMElements = this.uiCtrl.getDOMElements()
    this.state = {
      isTableGenerated: false,
      currentRowValue: 0,
      currentColumnValue: 0,
      color: 0
    }

    this.DOMElements["selectPreset"].addEventListener("click", this.delegateModalEvents)
    this.DOMElements["createTableBtn"].addEventListener("click", this.handleGenerateClick)
    this.DOMElements["saveTableBtn"].addEventListener("click", this.handleSaveClick)
    this.DOMElements["saveTableAsPNGBtn"].addEventListener("click", this.handleSaveAsPNGClick)
    this.DOMElements["numberOfRows"].addEventListener("change", this.handleRowChange)
    this.DOMElements["numberOfColumns"].addEventListener("change", this.handleColumnChange)
    this.DOMElements["table"].addEventListener("click", this.delegateTableEvents)
  }

  delegateModalEvents = (e) => {
    if (e.target.classList.contains('preset')) {
      e.target.classList.toggle('selected')
      if (e.target.nextElementSibling && e.target.nextElementSibling.classList.contains('selected')) {
        e.target.nextElementSibling.classList.remove('selected')
      }
      if (e.target.previousElementSibling && e.target.previousElementSibling.classList.contains('selected')) {
        e.target.previousElementSibling.classList.remove('selected')
      }
    }

    this.state.color = e.target.dataset.color
  }

  delegateTableEvents = (e) => {
    e.preventDefault()
    // Delete
    if (e.target.classList.contains("fa-trash-alt")) {
      this.uiCtrl.removeAllChildNodes(this.DOMElements.table)

      this.state.isTableGenerated = false
    }

    // Clear
    if (e.target.classList.contains("fa-eraser")) {
      this.uiCtrl.clearTable(document.querySelectorAll(".cell"))
    }
  }

  handleRowChange = () => {
    if (this.DOMElements.numberOfRows.value > this.state.currentRowValue && this.state.isTableGenerated) {
      for (let i = 1; i <= this.DOMElements.numberOfRows.value - this.state.currentRowValue; i++) {
        this.uiCtrl.appendRow()
      }
    } else if (this.DOMElements.numberOfRows.value < this.state.currentRowValue && this.state.isTableGenerated) {
      for (let i = 1; i <= this.state.currentRowValue - this.DOMElements.numberOfRows.value; i++) {
        this.uiCtrl.deleteRow()
      }
    }

    this.state.currentRowValue = this.DOMElements.numberOfRows.value
  }

  handleColumnChange = () => {
    if (this.DOMElements.numberOfColumns.value > this.state.currentColumnValue && this.state.isTableGenerated) {
      for (let i = 1; i <= this.DOMElements.numberOfColumns.value - this.state.currentColumnValue; i++) {
        this.uiCtrl.appendColumn()
      }
    } else if (this.DOMElements.numberOfColumns.value < this.state.currentColumnValue && this.state.isTableGenerated) {
      for (let i = 1; i <= this.state.currentColumnValue - this.DOMElements.numberOfColumns.value; i++) {
        this.uiCtrl.deleteColumn()
      }
    }

    this.state.currentColumnValue = this.DOMElements.numberOfColumns.value
  }

  handleSaveClick = () => {
    if (this.uiCtrl.DOMElements.table.hasChildNodes()) {
      this.uiCtrl.DOMElements.overlay.addEventListener("click", this.uiCtrl.toggleModal)
      this.uiCtrl.DOMElements.tableNameInput.value = document.getElementById('table-heading').innerText

      this.uiCtrl.toggleModal()
    } else {
      alert('Generate a table first')
    }
  }

  handleSaveAsPNGClick = () => {
    const tableName = this.uiCtrl.DOMElements["tableNameInput"].value

    const data = {
      rows: this.uiCtrl.extractRows(),
      tableHeight: this.DOMElements.table.offsetHeight,
      tableWidth: this.DOMElements.table.offsetWidth,
      tableName: tableName.substring(0, 22),
      includeHeading: this.DOMElements.checkbox.checked,
      color: this.state.color || '#fc7e00'
    }

    this.dataCtrl.toServer(data)
    this.uiCtrl.toggleModal()
  }

  handleGenerateClick = () => {
    let numberOfColumns = this.uiCtrl.DOMElements["numberOfColumns"].value
    let numberOfRows = this.uiCtrl.DOMElements["numberOfRows"].value

    if (numberOfColumns <= 0 || numberOfRows <= 0) {
      alert('Enter a number greater than 0')
      return
    }

    this.uiCtrl.removeAllChildNodes(this.uiCtrl.DOMElements["table"])
    this.uiCtrl.renderTable(numberOfRows, numberOfColumns)
    this.state.isTableGenerated = true
  }
}

init = new Controller(DataController, UIController)