
const port = 8000;
const express = require("express")
const app = express()
const fs = require("fs")
const cors = require("cors")
const urlencodedParser = express.urlencoded({extended: false});
const bodyParser = require("body-parser")
const jsonParser = bodyParser.json()
app.use(cors())


function dateQrci(val){
  let date = new Date(Number(val))
  let str = date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear()
  return str
}

app.get('/qrciList', (request, response) => {
  fs.readFile("qrciList.json", "utf8", 
            function(error,data){
                if(error) throw error; // если возникла ошибка
                let arr = JSON.parse(data);
                let dateNow = Date.now()

                for (let dept = 0; dept < arr.length; dept++){
                  for (let list = 0; list < arr[dept].qrciList.length; list++){
                    arr[dept].qrciList[list].status = true
                    for (let el = 0; el < arr[dept].qrciList[list].qrciRows.length; el++){
                      console.log(arr[dept].qrciList[list].qrciRows[el])
                      arr[dept].qrciList[list].qrciRows[el].status = true
                      if (Number(arr[dept].qrciList[list].qrciRows[el].date) < Number(dateNow)){
                        arr[dept].qrciList[list].status = false
                        arr[dept].qrciList[list].qrciRows[el].status = false
                      }
                    }
                  }
                }

                response.send(arr);  // выводим считанные данные
            });
})
app.get('/qrciList/department/:dep/qrci/:num', (request, response) => {
  fs.readFile("qrciList.json", "utf8", 
            function(error,data){
                if(error) throw error; // если возникла ошибка
                let arr = JSON.parse(data);
                for (let i=0; i<arr[Number(request.params["dep"])].qrciList.length; i++){
                  if (Number(arr[request.params["dep"]].qrciList[i].number) === Number(request.params["num"])){
                    arr[request.params["dep"]].qrciList[i].date = dateQrci(arr[request.params["dep"]].qrciList[i].date)
                    for (let el=0; el< arr[request.params["dep"]].qrciList[i].qrciRows.length; el++){
                      arr[request.params["dep"]].qrciList[i].qrciRows[el].date = dateQrci(arr[request.params["dep"]].qrciList[i].qrciRows[el].date)
                    }
                    console.log(arr[request.params["dep"]].qrciList[i])
                    response.send(arr[request.params["dep"]].qrciList[i])
                  }
                } 
            });
})

app.post("/", jsonParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);

    let obj = request.body.body 
    let data = fs.readFileSync("./qrciList.json", "utf8")
    let dataStr = JSON.parse(data);
    let arrdate = obj.date.split(".")
    obj.date =  Date.UTC(arrdate[2], arrdate[1]-1, arrdate[0], 3, 0, 0, 0)

    for (let el = 0; el < obj.qrciRows.length; el++){
      let rowDate = obj.qrciRows[el].date.split('.')
      obj.qrciRows[el].date = Date.UTC(rowDate[2], rowDate[1]-1, rowDate[0], 0, 0, 0, 0)
    }

    if (obj.number === 0){
      if (dataStr[request.body.index].qrciList.length > 0){
        obj.id = dataStr[request.body.index].qrciList.length
        obj.number = dataStr[request.body.index].qrciList[dataStr[request.body.index].qrciList.length-1].number + 1
      } else {
        obj.id = 0
        obj.number = 1
      }
      
      dataStr[request.body.index].qrciList.push(obj)
    } else {
      dataStr[request.body.index].qrciList[obj.id] = obj
    }
    
    data = JSON.stringify(dataStr)
    fs.writeFileSync("./qrciList.json", data, "utf8")

});
app.listen(port, (err) => {
  if (err) {
      return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
}) 