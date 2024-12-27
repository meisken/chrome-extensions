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
const isString = (variable) => {
    return typeof variable === 'string' || variable instanceof String
}
const convertType = {
    [contextMenuIds.zhToCn]: (selectedText, processedResult) => {

        const converter = OpenCC.Converter({ from: 'hk', to: 'cn' });
        const result = converter(selectedText);
        return result;
        

    },
    [contextMenuIds.cnToZh]: (selectedText, processedResult) => {

        const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
        const result = converter(selectedText);
        return result;


    },
    [contextMenuIds.quickToZh]: (selectedText, processedResult) => {
        return processedResult
      
    },
    [contextMenuIds.zhToQuick]: (selectedText, processedResult) => {
        const characterArray = processedResult;
     
        if(characterArray.length > 0){
            console.log(characterArray)
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
            return result
        }
         
    },
    [contextMenuIds.textToImage]: (selectedText, processedResult) => {
        return undefined
      
    },
}
chrome.runtime.onMessage.addListener( 
     function(request, sender, sendResponse) {
        let result;

        const {
            mode, 
            selectedText,  
            processedResult,
            noCopy = false
        } = request;

        if(convertType[mode]){
            result = convertType[mode](selectedText, processedResult)
        }   
        if(result && !noCopy){
            copyToClipboard(result);
            requestStoredSettings().then((settings) => {
                if(settings?.reminder?.enabled){
                    alert(`已複製到剪貼簿 (你可以在跳出視窗關閉這功能 點一下右上角icon打開跳出視窗)`)
                }
            })
        }


  
        sendResponse(result)
            
    }
);


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