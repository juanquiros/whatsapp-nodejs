
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const ExcelJs = require('exceljs');
const moment = require('moment');
const fs = require('fs');
// Load the session data if it has been previously saved
let sessionData;

const sendMedia = (to, file)=>{
    const mediaFile = MessageMedia.fromFilePath('./mediaSend/'+file);
    
    client.sendMessage(to,mediaFile);
}
// Use the saved values
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
client.on('message', message => {
	var body = message.body;
    var to = message.from;
    if(message.author){
        to = message.author;
    }
    console.log(message.body + ' - Desde:' + message.from + '- Autor:'+message.author);
      
      switch(message.type){
          case 'chat':
                switch(body){
                    case '!ping':
                        message.reply('Hola mundo');
                        break;
                    case 'Imagen':
                        client.sendMessage(to,'Hola!');
                        sendMedia(to,'asd.jpg');
                        break;
                }
              break;
              case 'image':
                message.reply('no entiendo');
                  break;
      }
    
    saveHistorial(to, body);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

const saveHistorial = (number, message) => {
    const pathChat = './chats/'+number+'.xlsx';
    const workbook = new ExcelJs.Workbook();
    const today = moment().format('DD-MM-YYY hh:mm');
    if(fs.existsSync(pathChat)){
        workbook.xlsx.readFile(pathChat)
        .then(()=>{
            const worksheet = workbook.getWorksheet(1);
            const lastRow = worksheet.lastRow;
            let getRowInsert = worksheet.getRow(++(lastRow.number));
            getRowInsert.getCell('A').value = today;
            getRowInsert.getCell('B').value = message;
            getRowInsert.commit();
            workbook.xlsx.writeFile(pathChat)
            .then(()=>{
                console.log('agregado al xlsx');
            })
            .catch(()=>{
                console.log('falla al agregar al xlsx');
            })

        });
    }else{
        console.log('nuevo');
        const worksheet = workbook.addWorksheet('Chats');
        worksheet.columns= [
            {header:'Fecha',key :'date'},
            {header:'Mensaje',key :'message'}
        ];
        worksheet.addRow([today,message]);
        workbook.xlsx.writeFile(pathChat)
        .then(()=>{
            console.log('nuevo xlsx');
        })
        .catch(()=>{
            console.log('falla xlsx');
        });
    }
}

client.initialize();