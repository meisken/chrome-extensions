function injectCode(src , mountTarget) {
    return new Promise((resolve) => {
        const nullthrows = (v) => {
            if (v === null) throw new Error("it's a null");
            return v;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = function() {
            console.log("script injected");
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
    await injectCode(chrome.runtime.getURL('script/html2canvas.min.js'), "head");
    await injectCode(chrome.runtime.getURL('script/textToImage.js'), "body");
}
injectMain()

