// Google Sheets info
const sheet_url = "YOUR_URL"
const spreadsheet = SpreadsheetApp.openByUrl(sheet_url)


// chatに送信
function send_chat(body){
 // ChatWorks info
 const cw_token = 'YOUR_TOKEN'
 const room_id =  'YOUR_ROOM_ID'
 const params ={
   method: "post",
   headers: { "X-ChatWorkToken" : cw_token },
   payload: {
     body: body
   }
 };
 const url = "https://api.chatwork.com/v2/rooms/" + room_id + "/messages"
 const res = UrlFetchApp.fetch(url, params);
 const code = res.getResponseCode()
 console.log('ChatWorks', code)
}


function fetchContactMail() {
 //取得間隔
 const now_time= Math.floor(new Date().getTime() / 1000)
 const time_term = now_time - 1800 // 30 minutes before 
 
 //検索条件指定
 const strTerms = '(is:unread after:'+ time_term + ')';
 
 //取得
 const myThreads = GmailApp.search(strTerms);
 const myMsgs = GmailApp.getMessagesForThreads(myThreads)
 
 const valMsgs = []
 let count = 0
 for(let i = 0; i < myMsgs.length; i++){
   for(let j = 0; j < myMsgs[i].length; j++){
     if (myMsgs[i][j].isUnread()) {
       valMsgs[count] = myMsgs[i][j]
       myMsgs[i][j].markRead()
       ++count
     }
   }
 }
 
 return valMsgs;
}


// 実行関数
function main() {
 new_Me = fetchContactMail()
 console.log(new_Me.length)
 if(new_Me.length > 0){
   for(var i = 0; i < new_Me.length; i++){

     // getting mail information
     const msg = new_Me[i]
     const date = msg.getDate()
     const jdate = Utilities.formatDate(date, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss")
     const from_address = msg.getFrom()
     const subject = msg.getSubject()
     const body = msg.getPlainBody()
     

     
     if (subject.match('YOUR_CONDITION')){
      console.log(date, subject)
      // Save log to Google SpreadSheet
      spreadsheet.appendRow([jdate, from_address, subject, body])
      

      // making message for ChatWorks
      let chat_message = ''
      chat_message += `[info][title]件名: ${subject} from ${from_address}[/title]`;
      chat_message += `${body}`;
      chat_message += '[hr]';
      chat_message += `${jdate}[/info]`;
      
      // send to ChatWorks
      send_chat(chat_message)

      // Send to Kintone App
      const record = {
        "DateTime": {
          "value": date
        },
        "From": {
          "value": from_address
        },
        "Subject": {
          "value": subject
        },
        "Contents": {
          "value": body
        }
      }
      
      save_to_kintone(record)
      msg.markRead()
     }
     
   }
 }
}