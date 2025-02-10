



const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
}
async function saveImage(imgUrl,download,copyToClipboard) {
    try {
        const data = await fetch(imgUrl);
        const blob = await data.blob();

        if(copyToClipboard){
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob,
                }),
            ]);
        }
        if(download){
            const urlCreator = window.URL || window.webkitURL;
            imageData = urlCreator.createObjectURL(blob);
    
            const link = document.createElement('a');
            link.href = imageData
            link.download = 'snapshot';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }



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
const imageToText = (language, src, removeSpace) => {
    const removeSpaceAfterWords = (str) => {
        return str.replace(/(?<=\p{Script=Han})(?=[^\n])\s/gmu,"")
    } 
    const removeEmptyLine = (str) => {
        return str.replace(/(^(\r\n|\n|\r)$)|(^(\r\n|\n|\r))|^\s*$/gm,"")
    }
    return new Promise(async (resolve, reject) => {
        try{
            const { createWorker } = Tesseract;
            const worker = await createWorker(language);
            const { data } = await worker.recognize(src);
            await worker.terminate();
            resolve(
                removeEmptyLine(
                    removeSpace ? removeSpaceAfterWords(data.text) : data.text
                )
            );

        }catch(err){
            reject(err)
        }
    })
}
const convertType = {
    [contextMenuIds.zhToCn]: ({selectedText, processedResult}, callback) => {

        const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
        const result = converter(selectedText);
        callback(result)
        
    },
    [contextMenuIds.cnToZh]: ({selectedText, processedResult}, callback) => {

        const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
        const result = converter(selectedText);
        callback(result)


    },
    [contextMenuIds.quickToZh]: ({selectedText, processedResult}, callback) => {
        callback(processedResult)
      
    },
    [contextMenuIds.zhToQuick]: ({selectedText, processedResult}, callback) => {
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
                    return keys.join("") //+ number
                }
          
            }).join("");
            callback(result)
        }
         
    },
    [contextMenuIds.textToImage]: ({selectedText, processedResult}, callback) => {
        if(true){
            // const testingElement = document.querySelector("#Panes");
            try{
          


                const button = document.querySelector("#converter-convert-button");
                const statusIndictor = document.querySelector("#converter-status-indicator");
                const outputImage = document.querySelector("#converter-image-output");

           
                if(isExist(button) && isExist(statusIndictor) && isExist(outputImage)){
                    showReminder("開始圖片轉換 可能需要一點時間完成");
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
    [contextMenuIds.imageToText]: ({selectedText, processedResult, imageSrc}, callback) => {

        const selection = window.getSelection();
        const srcList = [];
        let result = "";

        if(selection.isCollapsed){
            srcList.push(imageSrc)
        }else{
            const range = document.getSelection().getRangeAt(0);
            const fragment = range.cloneContents();
            const imgs = fragment.querySelectorAll('img');
            [...imgs].forEach(img => {
                srcList.push(img.src)
            })
        }

        const asyncWrapper = async () => {
            try{
              
                for(const src of srcList){
                    const text = await imageToText(['chi_tra','eng','chi_sim'], src, true);
                    result += `${text}${srcList.length > 1 ? '\n' : ""}`
                }

                callback(result);
            }catch(err){
                showReminder(err, "error")
            }
            
        }
        if(srcList.length > 0){
            showReminder("正在開始識別 可能需要一些時間完成");
            asyncWrapper();
        }else{
            showReminder("沒有找到任何圖片", "error")
        }
      
    
    },

 
}

const hideElementClass = "hide-element";

const reminderId = "converter-reminder";
const reminderTImeout = 3000;



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
                imageSrc 

            } = request;

            if(convertType[mode]){
                convertType[mode]({selectedText, processedResult, imageSrc}, (result => {
           
                    if(result){
                    
                   
                        if(mode === contextMenuIds.textToImage){
                            const imageUrl = result;
                            requestStoredSettings().then((settings) => {
                              
                                const download = settings.imageConvertBehavior["download"];
                                const copy = settings.imageConvertBehavior["copy-to-clipboard"];
                                
                                saveImage(imageUrl,download,copy);
                                
                                const isCopiedIndicator = document.querySelector("#converter-is-copied-indicator");
    
                                if(isExist(isCopiedIndicator)){
                                    isCopiedIndicator.click();
                                }else{
                                    showReminder(`isCopiedIndicator does not exist`)
                                }

                                if(settings?.reminder?.enabled){
                                    const copyMessage = copy ? "已複製到剪貼簿" : "";
                                    const slash = copy && download ? "/" : "";
                                    const downloadMessage = download ? "已下載到電腦" : "";
                                    showReminder(`${copyMessage}${slash}${downloadMessage} (你可以設定關閉這提醒)`)
                                }
                                if(!copy && !download){
                                    showReminder(`沒有已選取的圖片轉換模式`, "error")

                                }

                            })
             
                            // restoreToOrigin();
                        }else{
                            copyToClipboard(result);
                            requestStoredSettings().then((settings) => {
                                if(settings?.reminder?.enabled){
                                    showReminder(`已複製到剪貼簿 (你可以設定關閉這提醒)`)
                                }
                            })
                        }
                        
              
                    }
                    sendResponse(result);
                   
                }))
            }else{
                showReminder(`沒有這個轉換模式`, "error")
            }   
      
               
       }
   );


   inertReminder();

    window.addEventListener("contextmenu", () => {
        backgroundConsoleLog("wake up")
    }); //wake up service worker before the user click the context
}
main();