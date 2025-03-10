const contextMenuIds = {
    zhToCn: "zh-cn",
    cnToZh: "cn-zh",
    quickToZh: "quick-zh",
    zhToQuick: "zh-quick",
    textToImage: "text-image",

    imageToTextZh: "image-text-zh",
    imageToTextCn: "image-text-cn",
    imageToTextEn: "image-text-en",

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
const sendMessageToBackground = (requestType, props ) => {
    return new Promise((resolve,reject) => {
        if(chrome.runtime){
 
            chrome.runtime.sendMessage({requestType, props}, resolve);
        }else{
            reject("chrome.runtime is undefined");
        }
    })

 
}