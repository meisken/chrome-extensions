



const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
}
async function copyImageToClipboard(imgUrl) {
    try {
        const data = await fetch(imgUrl);
        const blob = await data.blob();
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob,
            }),
        ]);
    } catch (err) {
        showReminder(`${err.name} ${err.message}`, "error");
    }
}
const isString = (variable) => {
    return typeof variable === 'string' || variable instanceof String
}
const isExist = (element) => {
    return element !== null && element !== undefined
}
const convertType = {
    [contextMenuIds.zhToCn]: (selectedText, processedResult, callback) => {

        const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
        const result = converter(selectedText);
        callback(result)
        
    },
    [contextMenuIds.cnToZh]: (selectedText, processedResult, callback) => {

        const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
        const result = converter(selectedText);
        callback(result)


    },
    [contextMenuIds.quickToZh]: (selectedText, processedResult, callback) => {
        callback(processedResult)
      
    },
    [contextMenuIds.zhToQuick]: (selectedText, processedResult, callback) => {
        const characterArray = processedResult;
     
        if(characterArray.length > 0){
            let result = characterArray.map((char) => {
                if(isString(char)){
                    return char
                }else{
                    const {
                        character,
                        keys,
                        radicals,
                        number
                    } = char;
                    return radicals.join("") + number
                }
          
            }).join("");
            callback(result)
        }
         
    },
    [contextMenuIds.textToImage]: (selectedText, processedResult, callback) => {
        if(true){
            // const testingElement = document.querySelector("#Panes");
            try{
          


                const button = document.querySelector("#converter-convert-button");
                const statusIndictor = document.querySelector("#converter-status-indicator");
                const outputImage = document.querySelector("#converter-image-output");

           
                if(isExist(button) && isExist(statusIndictor) && isExist(outputImage)){
                    showReminder("開始圖片轉換 (可能需要一點時間完成)");
                    const statusIndictorListener = () => {
                        const status = statusIndictor.getAttribute("data-status");
                        const message = statusIndictor.getAttribute("data-message");
                        if(status === "done"){
                            const imageSrc = outputImage.src;
                            callback(imageSrc);
                        }else if(status === "error"){
                            showReminder(message, "error");
                        }else{
                            showReminder("unknown status", "error");
                        }
                    
                        statusIndictor.removeEventListener("click", statusIndictorListener);
                    }
                    statusIndictor.addEventListener("click", statusIndictorListener);
                    
                    setTimeout(() => {
                        button.click();
                    }, 1)
              
                
                    return
                }else{
                    showReminder("刷新網頁(F5)後才能重新啟用文字轉圖片", "error");
                }

            }catch(err){
                showReminder(err, "error");
            }
    
        }
      
    },
}

const hideElementClass = "hide-element";

const reminderId = "converter-reminder";
const reminderTImeout = 3000;
const insertCssClass = () => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .${hideElementClass} { display: none !important; }
        #${reminderId}{
            position: fixed;
            z-index: 99999;
            right: 20px;
            top: 20px;
            box-shadow: 4px 8px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(0);
            transition: transform 0.3s ease-in-out;
            cursor: pointer;
        }

        #${reminderId}.${reminderId}-hidden{
            transform: translateY(calc(-100% - 20%))
        }
        #${reminderId} .${reminderId}-container{
            width: 320px;
            padding: 16px;
            background-color: #151718;
            min-height: 120px;
        }
        #${reminderId} .${reminderId}-dots{
            display: grid;
            gap: 6px;
            grid-template-columns: repeat(3, 12px);
            grid-template-rows: 12px;
            border-radius: 10.5px;

        }
        #${reminderId} .${reminderId}-dots div{
            border-radius: 50%;
        }
        #${reminderId} .${reminderId}-red{
            background-color: #FF5F56;
        }
        #${reminderId} .${reminderId}-yellow{
            background-color: #FFBD2E;
        }
        #${reminderId} .${reminderId}-green{
            background-color: #27C93F;
        }
        .${reminderId}-text-output{
            padding: 16px 0;
            font-size: 16px;
            line-height: 22px;
            letter-spacing: 0.5px;
            font-weight: 400;
            color: #ffffff;
            font-family: Sans-serif;
            color: #FFFFFF;
        }
        .${reminderId}-text-output.${reminderId}-error{
            color: #FF3B30;
        }
        .${reminderId}-timer{
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background-color: #33C458;
            transform-origin: left;
   
        }
        .${reminderId}-timer.${reminderId}-animation{
            animation: progress ${reminderTImeout / 1000}s linear forwards;
        }
        @keyframes progress {
            from {  transform: scaleX(1); }
            to { transform: scaleX(0); }
        }
    `;
    document.getElementsByTagName('head')[0].appendChild(style);


}


const inertReminder = () => {
    const reminder = document.createElement("div");
 
    reminder.id = reminderId;
    reminder.classList.add(`${reminderId}-hidden`);

    const container = document.createElement("div");
    container.classList.add(`${reminderId}-container`);

    const dotsContainer = document.createElement("div");
    dotsContainer.classList.add(`${reminderId}-dots`);

    ["red","yellow","green"].forEach((color) => {
        const dot = document.createElement("div");
        dot.classList.add(`${reminderId}-${color}`);
        dotsContainer.appendChild(dot);
    })
    const textOutput = document.createElement("div");
    textOutput.classList.add(`${reminderId}-text-output`);

    container.appendChild(dotsContainer);
    container.appendChild(textOutput);
    reminder.appendChild(container);

    const timer = document.createElement("div");
    timer.classList.add(`${reminderId}-timer`);
    reminder.appendChild(timer);
    document.body.appendChild(reminder);

    reminder.addEventListener("click", hideReminder)

}

let hideTimerTimeout;
const showReminder = (text, mode) => {
    const reminder = document.querySelector(`#${reminderId}`);
    const timer = document.querySelector(`#${reminderId} .${reminderId}-timer`);
    const textOutput =  document.querySelector(`#${reminderId} .${reminderId}-text-output`);

    if(reminder && timer && textOutput){

        clearTimeout(hideTimerTimeout);
        if(timer.classList.contains(`${reminderId}-animation`)){
            timer.classList.remove(`${reminderId}-animation`);
            void timer.offsetWidth;
        }

        if(mode === "error"){
            textOutput.classList.add(`${reminderId}-error`)
        }else{
            textOutput.classList.remove(`${reminderId}-error`)
        }


        reminder.classList.remove(`${reminderId}-hidden`);
        timer.classList.add(`${reminderId}-animation`);
        textOutput.textContent = text;
 

        hideTimerTimeout = setTimeout(() => {
            reminder.classList.add(`${reminderId}-hidden`);
        }, reminderTImeout)
    }else{
        showReminder("reminder does not exist", "error")
    }
}
const hideReminder = () => {
    const reminder = document.querySelector(`#${reminderId}`);
    if(reminder){
        clearTimeout(hideTimerTimeout);
        reminder.classList.add(`${reminderId}-hidden`);
    }

}

const main = () => {

    chrome.runtime.onMessage.addListener( 
        function(request, sender, sendResponse) {
   
           const {
               mode, 
               selectedText,  
               processedResult,
               noCopy = false
           } = request;
   
           if(convertType[mode]){
               convertType[mode](selectedText, processedResult, (result => {
   
                   if(result && !noCopy){
                  
                   
                        if(mode === contextMenuIds.textToImage){
                            const imageUrl = result;
                 
                            copyImageToClipboard(imageUrl);
                            const isCopiedIndicator = document.querySelector("#converter-isCopiedIndicator");

                            if(isExist(isCopiedIndicator)){
                                isCopiedIndicator.click();
                            }
                            // restoreToOrigin();
                        }else{
                            copyToClipboard(result);
                        }
                        
                        requestStoredSettings().then((settings) => {
                            if(settings?.reminder?.enabled){
                                    showReminder(`已複製到剪貼簿 (你可以設定關閉這功能)`)
                            }
                        })
                   }
                   sendResponse(result);
                   
               }))
           }   
      
               
       }
   );

   insertCssClass();
   inertReminder();

    window.addEventListener("contextmenu", () => {
        backgroundConsoleLog("wake up")
    }); //wake up service worker before the user click the context
}
main();