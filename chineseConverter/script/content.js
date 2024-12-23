const contextMenuIds = {
    zhToCn: "zh-cn",
    cnToZh: "cn-zh",
    quickToZh: "quick-zh",
    zhToQuick: "zh-quick"
}

const openCCmode = {
    [contextMenuIds.zhToCn]: { from: 'hk', to: 'cn' },
    [contextMenuIds.cnToZh]: { from: 'cn', to: 'hk' },

};

chrome.runtime.onMessage.addListener( 
    function(request, sender, sendResponse) {
        let result = "";
        if(request.mode === contextMenuIds.zhToCn || request.mode === contextMenuIds.cnToZh){
            const converter = OpenCC.Converter(openCCmode[request.mode]);
            result = converter(request.selectedText);

       
            navigator.clipboard.writeText(result);
         
        }

        if(request.mode === contextMenuIds.quickToZh || request.mode === contextMenuIds.ZhToQuick){
            result = request.processedResult 
       
            navigator.clipboard.writeText(result);
        }
        //alert(`copied ${result} to your clipboard`)
  
        sendResponse()
            
    }
);


