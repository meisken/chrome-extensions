const contextMenuIds = {
    zhToCn: "zh-cn",
    cnToZh: "cn-zh",
    quickToZh: "quick-zh",
    zhToQuick: "zh-quick"
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
        return converter(request.selectedText);
        

    },
    [contextMenuIds.cnToZh]: (selectedText, processedResult) => {

        const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
        return converter(request.selectedText);


    },
    [contextMenuIds.quickToZh]: (selectedText, processedResult) => {
        return request.processedResult 
      
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
         
    }
}
chrome.runtime.onMessage.addListener( 
    function(request, sender, sendResponse) {
        let result;

        const mode = request.mode;
        const selectedText = request.selectedText;
        const processedResult  = request.processedResult;

        if(convertType[mode]){
            result = convertType[mode](selectedText, processedResult)
        }   
        if(result){
            copyToClipboard(result);
        }
 
        //alert(`copied ${result} to your clipboard`)
  
        sendResponse()
            
    }
);


