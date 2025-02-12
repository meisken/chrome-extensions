function injectCode(src , mountTarget) {
    return new Promise((resolve) => {
        const nullthrows = (v) => {
            if (v === null) throw new Error("it's a null");
            return v;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = function() {

            // this.remove();
            resolve();
        };
    
        // This script runs before the <head> element is created,
        // so we add the script to <html> instead.
        if( mountTarget === "head"){
            nullthrows(document.head || document.documentElement).appendChild(script);

        }
        if(mountTarget === "body"){
            nullthrows(document.body).appendChild(script);

        }
    })

}

const injectMain = async () => {
    try{
        const settings = await requestStoredSettings();
        await injectCode(chrome.runtime.getURL('script/content/createElement.js'), "head");
        if(settings !== undefined && settings.contextMenu[contextMenuIds.textToImage]){
            await injectCode(chrome.runtime.getURL('script/lib/html2canvas.min.js'), "head");
            await injectCode(chrome.runtime.getURL('script/content/textToImage.js'), "body");
        }
        if(settings !== undefined && (
            settings.contextMenu[contextMenuIds.imageToTextZh] ||
            settings.contextMenu[contextMenuIds.imageToTextCn] ||
            settings.contextMenu[contextMenuIds.imageToTextEn]
        ) ){
            await injectCode(chrome.runtime.getURL("script/lib/tesseract.min.js"), "head");
            await injectCode(chrome.runtime.getURL('script/content/imageToText.js'), "body");
        }

    }catch(err){
        console.error(err)
    }

}
injectMain()

