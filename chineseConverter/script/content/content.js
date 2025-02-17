const textToImageConverterElementId = "text-image-converter";
const imageToTextConverterElementId = "image-text-converter";


const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    requestStoredSettings().then((settings) => {
        if(settings?.reminder?.enabled){
            showReminder(`已複製到剪貼簿 (你可以設定關閉這提醒)`)
        }
    })
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
            link.href = imageData;
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

const imageToTextHandler = ({selectedText, processedResult, imageSrc, language}, callback) => {


    const button = document.querySelector(`#${imageToTextConverterElementId}-convert-button`);
    const statusIndictor = document.querySelector(`#${imageToTextConverterElementId}-status-indicator`);
    const textOutput = document.querySelector(`#${imageToTextConverterElementId}-text-output`);

    if(isExist(button) && isExist(statusIndictor) && isExist(textOutput)){
        showReminder("正在開始識別 可能需要一些時間完成");
        const statusIndictorListener = () => {
            const status = statusIndictor.getAttribute("data-status");
            const message = statusIndictor.getAttribute("data-message");
            if(status === "done"){
                const text = textOutput.textContent;
                // const imageSrc = outputImage.src;
                callback(text);
            }else if(status === "error"){
                showReminder(message, "error");
            }else{
                showReminder("unknown status", "error");
            }
        
            statusIndictor.removeEventListener("click", statusIndictorListener);
        }
        statusIndictor.addEventListener("click", statusIndictorListener);
        
        const dataAttributePropNames = {
            "imageSrc": "data-image-src",
            "language": "data-language",
        }
        statusIndictor.setAttribute(dataAttributePropNames.imageSrc, imageSrc);
        statusIndictor.setAttribute(dataAttributePropNames.language, language);

        setTimeout(() => {
    
            button.click();
        }, 1)
  
    
        return
    }else{
        showReminder("刷新網頁(F5)後才能重新啟用圖片轉文字", "error");
    }

}
const convertType = {
    [contextMenuIds.zhToCn]: ({selectedText, processedResult}, callback) => {
    
        if(selectedText === undefined ||selectedText === ""){
            showReminder("沒有所選文字", "error");
            return
        }
        const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
        const result = converter(selectedText);
        callback(result)
        
    },
    [contextMenuIds.cnToZh]: ({selectedText, processedResult}, callback) => {
        if(selectedText === undefined ||selectedText === ""){
            showReminder("沒有所選文字", "error");
            return
        }
        const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
        const result = converter(selectedText);
        callback(result)


    },
    [contextMenuIds.quickToZh]: ({selectedText, processedResult}, callback) => {
        if(processedResult === "converter-error-no-selected-text"){
            showReminder("沒有所選文字", "error");
            return 
        }
        callback(processedResult)
      
    },
    [contextMenuIds.zhToQuick]: ({selectedText, processedResult}, callback) => {
        if(processedResult === "converter-error-no-selected-text"){
            showReminder("沒有所選文字", "error");
            return 
        }
        
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


        const button = document.querySelector(`#${textToImageConverterElementId}-convert-button`);
        const statusIndictor = document.querySelector(`#${textToImageConverterElementId}-status-indicator`);
        const outputImage = document.querySelector(`#${textToImageConverterElementId}-image-output`);

   
        if(isExist(button) && isExist(statusIndictor) && isExist(outputImage)){
            showReminder("開始圖片轉換 可能需要一些時間完成");
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

      
    },
    [contextMenuIds.imageToTextZh]: ({selectedText, processedResult, imageSrc}, callback) => {
        
        imageToTextHandler({selectedText, processedResult, imageSrc, language: 'chi_tra'}, callback)
    
    },
    [contextMenuIds.imageToTextCn]: ({selectedText, processedResult, imageSrc}, callback) => {
        
        imageToTextHandler({selectedText, processedResult, imageSrc, language: 'chi_sim'}, callback)
    
    },
    [contextMenuIds.imageToTextEn]: ({selectedText, processedResult, imageSrc}, callback) => {
        
        imageToTextHandler({selectedText, processedResult, imageSrc, language: 'eng'}, callback)
    
    },
 
}

const hideElementClass = "hide-element";

const reminderId = "converter-reminder";
const reminderTImeout = 3000;


const reminderStatusAttributeName = "data-status"
const insertReminder = () => {
    const reminder = document.createElement("div");
 
    reminder.id = reminderId;
    reminder.classList.add(`${reminderId}-hidden`);
    reminder.setAttribute(reminderStatusAttributeName, "hidden")

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

let reminderTimeout;

const hideReminder = () => {
    const reminder = document.querySelector(`#${reminderId}`);
    const timer = document.querySelector(`#${reminderId} .${reminderId}-timer`);

    if(reminder){
        reminder.classList.add(`${reminderId}-hidden`);
        reminder.setAttribute(reminderStatusAttributeName, "hidden");
        timer.classList.remove(`${reminderId}-animation`);
        timer.removeEventListener(hideReminder)
    }

}

const showReminder = (text, mode) => {
    const reminder = document.querySelector(`#${reminderId}`);
    const timer = document.querySelector(`#${reminderId} .${reminderId}-timer`);
    const textOutput =  document.querySelector(`#${reminderId} .${reminderId}-text-output`);
 
    if(reminder && timer && textOutput){
  
        const currentStatus = reminder.getAttribute(reminderStatusAttributeName);
        if(currentStatus === "hidden"){
            reminder.setAttribute(reminderStatusAttributeName, "displaying");
            timer.classList.add(`${reminderId}-animation`);
            timer.addEventListener("animationend", hideReminder ,true)
        }else{

            clearTimeout(reminderTimeout);
            const newTimer = timer.cloneNode(true);
            newTimer.addEventListener("animationend", hideReminder ,true)
            reminder.replaceChild(newTimer, timer);
            
        }
        

        textOutput.textContent = text;

        if(mode === "error"){
            textOutput.classList.add(`${reminderId}-error`)
        }else{
            textOutput.classList.remove(`${reminderId}-error`)
        }

    }else{
        console.error("reminder does not exist")
    }
}

const clickIsCopiedIndicator = (id) => {
    const isCopiedIndicator = document.querySelector(`#${id}-is-copied-indicator`);

    if(isExist(isCopiedIndicator)){
        isCopiedIndicator.click();
 
    }else{
        showReminder(`isCopiedIndicator does not exist`)
    }
}
const outputMode = {
    [contextMenuIds.zhToCn]: (result) => {
        copyToClipboard(result);
    },
    [contextMenuIds.cnToZh]: (result) => {
        copyToClipboard(result);
    },
    [contextMenuIds.quickToZh]: (result) => {
        copyToClipboard(result);
    },
    [contextMenuIds.zhToQuick]: (result) => {
        copyToClipboard(result);
    },
    [contextMenuIds.textToImage]: (result) => {
        const imageUrl = result;
        requestStoredSettings().then((settings) => {
          
            const download = settings.imageConvertBehavior["download"];
            const copy = settings.imageConvertBehavior["copy-to-clipboard"];
            
            saveImage(imageUrl,download,copy);
            

            clickIsCopiedIndicator(textToImageConverterElementId)


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
    },

    [contextMenuIds.imageToTextZh]: (result) => {
        copyToClipboard(result);
        clickIsCopiedIndicator(imageToTextConverterElementId)
    },
    [contextMenuIds.imageToTextCn]: (result) => {
        copyToClipboard(result);
        clickIsCopiedIndicator(imageToTextConverterElementId)
    },
    [contextMenuIds.imageToTextEn]: (result) => {
        copyToClipboard(result);
        clickIsCopiedIndicator(imageToTextConverterElementId)
    },
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
                        outputMode[mode](result)
                    }
                    sendResponse(result);
                   
                }))
            }else{
                showReminder(`沒有這個轉換模式`, "error");
                sendResponse(result);
            }   
      
               
       }
   );


   insertReminder();

    window.addEventListener("contextmenu", () => {
        backgroundConsoleLog("wake up")
    }); //wake up service worker before the user click the context
}
main();