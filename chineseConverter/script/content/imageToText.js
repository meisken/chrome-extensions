


const imageToTextConverterElementId = "image-text-converter";
const dataAttributePropNames = {
    "imageSrc": "data-image-src",
    "language": "data-language",
}

const imageToText = (language, src, removeSpace) => {
    const removeSpaceAfterWords = (str) => {
        return str.replace(/(?<=\p{Script=Han})(?=[^\n])\s/gmu,"")
    } 
    const removeEmptyLine = (str) => {
        return str.replace(/(^(\r\n|\n|\r)$)|(^(\r\n|\n|\r))|^\s*$/gm,"")
    }
    return new Promise(async (resolve, reject) => {
        try{
            if(src !== undefined){
                const { createWorker } = Tesseract;
                const worker = await createWorker(language);
                const { data } = await worker.recognize(src);
                await worker.terminate();
                resolve(
                    removeEmptyLine(
                        removeSpace ? removeSpaceAfterWords(data.text) : data.text
                    )
                );
            }else{
                reject(`image src does not exist ${src}`)
            }


        }catch(err){
            reject(err)
        }
    })
}

const imageToTextHandler = (statusIndicator) => {
    return new Promise(async (resolve, reject) => {

        const imageSrc = statusIndicator.getAttribute(dataAttributePropNames.imageSrc);
        const language = statusIndicator.getAttribute(dataAttributePropNames.language);

        const removeSpace = language === 'eng' ? false : true;
        
        const selection = window.getSelection();
        const srcList = [];
        let result = "";
    
        if(!selection.isCollapsed){
            const range = document.getSelection().getRangeAt(0);
            const fragment = range.cloneContents();
            const imgs = fragment.querySelectorAll('img');
            if(imgs.length > 0){
                [...imgs].forEach(img => {
                    srcList.push(img.src)
                })
            }
       
        }
        if(srcList.length === 0 ){

            if( imageSrc !== undefined){
                srcList.push(imageSrc)
            }else{
                reject("imageSrc is undefined");
                return
            }
         
        }

        try{
            // showReminder("正在開始識別 可能需要一些時間完成");
            if(srcList.length > 0){
                for(const src of srcList){
                    const text = await imageToText(language, src, removeSpace);
                    result += `${text}${srcList.length > 1 ? '\n' : ""}`
                }
                resolve(result);
            }else{
                reject("沒有找到任何圖片");
            }
      
        
    
        }catch(err){
            reject(err);


        }

    })
  
}


createConverterStatusElements(imageToTextConverterElementId, ({
    statusIndicator,
    convertButton,
    outputImage,
    outputText,
    isCopiedIndicator,
}) => {

    imageToTextHandler(statusIndicator).then((result) => {
        outputText.style.whiteSpace = "pre";
        outputText.textContent = result;

        setConverterStatus(imageToTextConverterElementId,"done", "");

        const onCopied = () => {
            console.log(statusIndicator, outputText)
            statusIndicator.setAttribute(dataAttributePropNames.imageSrc, "");
            statusIndicator.setAttribute(dataAttributePropNames.language, "");
            outputText.textContent = "";
            isCopiedIndicator.removeEventListener("click",onCopied);

        
        }

        isCopiedIndicator.addEventListener("click",onCopied);
        statusIndicator.click();
    }).catch(err => {
    
        setConverterStatus(imageToTextConverterElementId,"error",err);
        statusIndicator.click();
        
    });
 
});