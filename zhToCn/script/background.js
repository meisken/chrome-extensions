const contextMenuIds = {
    zhToCn: "zh-cn",
    cnToZh: "cn-zh"
}
const contextMenuNames = {
    [contextMenuIds.zhToCn] : "繁轉簡",
    [contextMenuIds.cnToZh] : "簡轉繁",
}

const searchTerapeak = ( OnClickData) => {

    const mode =  OnClickData.menuItemId;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      
        if(tabs[0]){
            chrome.tabs.sendMessage(
                tabs[0].id, 
                {
                    mode,
                    selectedText:  OnClickData.selectionText
                }, 
                function(response) {}
            )
        }

    })
     
};

chrome.contextMenus.removeAll(function() {
    chrome.contextMenus.create({
        id: contextMenuIds.zhToCn,
        title: contextMenuNames[contextMenuIds.zhToCn],
        contexts:["selection"], 
    }); 
    chrome.contextMenus.create({
        id: contextMenuIds.cnToZh,
        title: contextMenuNames[contextMenuIds.cnToZh],
        contexts:["selection"],  
    }); 

})

chrome.contextMenus.onClicked.addListener(searchTerapeak);


