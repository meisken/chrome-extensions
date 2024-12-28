const contextMenuIds = {
    zhToCn: "zh-cn",
    cnToZh: "cn-zh",
    quickToZh: "quick-zh",
    zhToQuick: "zh-quick",
    textToImage: "text-image",
    saveImage: "save-image"
}



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
        if(html2canvas){
            // const testingElement = document.querySelector("#Panes");
            try{
                showReminder("開始圖片轉換 (可能需要一點時間完成)");

                const { container, restoreToOrigin , hideNotSelected} = getUserSelection();
                
                const findBackgroundColor = (el) => {
                
                    if(el !== null && el !== undefined){
                        //[...'rgba(255, 0, 0, 0)'.matchAll(/([0-9]\.?[0-9]*)/gm)]
                        const extractRgbaValue = (string) => {
                            return [...string.matchAll(/([0-9]\.?[0-9]*)/gm)]
                        }
                        const bg = window.getComputedStyle(el).backgroundColor;
                        
                        const rgba = extractRgbaValue(bg);
                        if(bg !==  "" && bg !== undefined && (rgba.length === 3  || (rgba[3] !== undefined && rgba[3][0] !== "0")) ){
                 
                            return bg
                        }else{
                            return findBackgroundColor(el.parentNode)
                        }
                
                    }
            
                 
                }
              
                const backgroundColor = findBackgroundColor(container);
                html2canvas(container, {
                    allowTaint: false,
                    useCORS: true,
                    logging: false,
                    backgroundColor: typeof backgroundColor === "string" ? backgroundColor : undefined
                }).then(function(canvas) {
                    const body = document.querySelector("body");
                    body.appendChild(canvas);
               
                    canvas.style.display = "none";
                
                    const ctx = canvas.getContext("2d");
                
                    const imageUrl = ctx.canvas.toDataURL();
                    body.removeChild(canvas);
    
    
    
                    callback({imageUrl, restoreToOrigin , hideNotSelected});
    
                }).catch((err) => { 
                    showReminder(err, "error");
    
                });
            }catch(err){
                showReminder(err, "error");
            }
    
        }
      
    },
}

const sendMessageToBackground = (requestType, props ) => {
    return new Promise((resolve,reject) => {
        if(chrome.runtime){
 
            chrome.runtime.sendMessage({requestType, props}, resolve);
        }else{
            reject("chrome.runtime is undefined");
        }
    })

 
}
const requestStoredSettings = () => {
    return new Promise(async (resolve, reject) => {
        try{
            const userSettings = await sendMessageToBackground("request-stored-settings");
            resolve(userSettings);
        }catch(err){
            reject("requestStoredSettings",err)
        }
    })
}
async function backgroundConsoleLog(...args){
    return sendMessageToBackground("background-console-log",[...args]);
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
const getUserSelection = () => {
    const selection = window.getSelection();

    const selectionStart = selection.anchorNode;
    const selectionEnd = selection.focusNode;

    const wordOffset = {
        start: selection.anchorOffset,
        end: selection.focusOffset
    }//This is mean how many words is selected or missing in start element or end element

    

    const getSelectionDirection = (selection) => {
    

        let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    
    
        let backward = false;
        // position == 0 if nodes are the same
        if (!position && selection.anchorOffset > selection.focusOffset || position === Node.DOCUMENT_POSITION_PRECEDING){
            backward = true; 
         
        }
        return backward
    }

    const direction = getSelectionDirection(selection);


    const range = selection.getRangeAt(0);

    const selectionContainer = range.commonAncestorContainer;
    const children = selectionContainer.children;

    return {    
        restoreToOrigin: () => {},
        container: selectionContainer.constructor.name.includes("HTML") ? selectionContainer : selectionContainer.parentNode
    }

    if(selectionContainer === selectionStart && selectionStart === selectionEnd){
        return {    
            restoreToOrigin: () => {},
            container: selectionContainer.constructor.name.includes("HTML") ? selectionContainer : selectionContainer.parentNode
        }
    }else{
        let startIndex,endIndex;
        [...children].forEach((child, i) => { 
    
            if(child.contains(selectionStart)){
    
                startIndex = i
            }
            if(child.contains(selectionEnd)){
    
                endIndex= i
            }
        });
        console.info(startIndex,endIndex, children, selectionStart, selectionEnd)
        const notSelectedElements = [...children].filter((el,i) => {
    
            return !(i >= startIndex && i <=endIndex)
        });
        const hideElements = (elements) => {
    
            if(elements.length > 0){
                elements.forEach((element) => {
                    element.classList.add(hideElementClass)
                })
            }
        
             
        }
        const showElements = (elements) => {
        
            if(elements.length > 0){
                elements.forEach((element) => {
                    element.classList.remove(hideElementClass)
                })
            }
        
        }
        const hideNotSelected = () => {
            hideElements(notSelectedElements);
    
        }
        hideNotSelected();
        const restoreToOrigin = () => {
            showElements(notSelectedElements);
        }
        return {
            restoreToOrigin,
            container: selectionContainer
        }
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
                            const {imageUrl, restoreToOrigin} = result;
                 
                            copyImageToClipboard(imageUrl);
                            restoreToOrigin();
                        }else{
                            copyToClipboard(result);
                        }
                
                       requestStoredSettings().then((settings) => {
                           if(settings?.reminder?.enabled){
                                backgroundConsoleLog("working")
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
    }); //wake up service worker before the user click the context menu
}
main();