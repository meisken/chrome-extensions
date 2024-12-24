const contextMenuIds = {
    zhToCn: "zh-cn",
    cnToZh: "cn-zh",
    quickToZh: "quick-zh",
    zhToQuick: "zh-quick",
    textToImage: "text-image"
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
            processedResult
         } = request;

        if(convertType[mode]){
            result = convertType[mode](selectedText, processedResult)
        }   
        if(result){
            copyToClipboard(result);
        }
 
        //alert(`copied ${result} to your clipboard`)
  
        sendResponse(result)
            
    }
);


