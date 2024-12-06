const mode = {
    "zh-cn": { from: 'hk', to: 'cn' },
    "cn-zh": { from: 'cn', to: 'hk' }
};

chrome.runtime.onMessage.addListener( 
    function(request, sender, sendResponse) {

        if(request.mode === "zh-cn" || request.mode === "cn-zh"){
            const converter = OpenCC.Converter(mode[request.mode]);
            const result = converter(request.selectedText);
            console.log(result)
       
            navigator.clipboard.writeText(result);
            alert(`copied ${result} to your clipboard`)
        }

  
        sendResponse()
            
    }
);
