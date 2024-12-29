



const getUserSelection = () => {
    const selection = window.getSelection();

    const selectionStart = selection.anchorNode;
    const selectionEnd = selection.focusNode;

    const wordOffset = {
        start: selection.anchorOffset,
        end: selection.focusOffset
    }//This is mean how many words is selected or missing in start element or end element

    

    const getSelectionDirection = (selection) => {
    

        let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
    
    
        let backward = false;
        // position == 0 if nodes are the same
        if (!position && selection.anchorOffset > selection.focusOffset || position === Node.DOCUMENT_POSITION_PRECEDING){
            backward = true; 
         
        }
        return backward
    }

    const direction = getSelectionDirection(selection);


    const range = selection.getRangeAt(0);

    const selectionContainer = range.commonAncestorContainer;
    const children = selectionContainer.children;

    return {    
        restoreToOrigin: () => {},
        selectionContainer: selectionContainer.constructor.name.includes("HTML") ? selectionContainer : selectionContainer.parentNode
    }

    if(selectionContainer === selectionStart && selectionStart === selectionEnd){
        return {    
            restoreToOrigin: () => {},
            container: selectionContainer.constructor.name.includes("HTML") ? selectionContainer : selectionContainer.parentNode
        }
    }else{
        let startIndex,endIndex;
        [...children].forEach((child, i) => { 
    
            if(child.contains(selectionStart)){
    
                startIndex = i
            }
            if(child.contains(selectionEnd)){
    
                endIndex= i
            }
        });
        console.info(startIndex,endIndex, children, selectionStart, selectionEnd)
        const notSelectedElements = [...children].filter((el,i) => {
    
            return !(i >= startIndex && i <=endIndex)
        });
        const hideElements = (elements) => {
    
            if(elements.length > 0){
                elements.forEach((element) => {
                    element.classList.add(hideElementClass)
                })
            }
        
             
        }
        const showElements = (elements) => {
        
            if(elements.length > 0){
                elements.forEach((element) => {
                    element.classList.remove(hideElementClass)
                })
            }
        
        }
        const hideNotSelected = () => {
            hideElements(notSelectedElements);
    
        }
        hideNotSelected();
        const restoreElements = () => {
            showElements(notSelectedElement)
        }

        const isCopiedIndicator = document.querySelector("#converter-isCopiedIndicator");
        const onCopied = () => {
            restoreElements();
            isCopiedIndicator.removeEventListener("click", onCopied);
        }
        isCopiedIndicator.addEventListener("click", onCopied);
   
        
        return {
 
            container: selectionContainer
        }
    }



}

const findBackgroundColor = (el) => {
                
    if(el !== null && el !== undefined){
        //[...'rgba(255, 0, 0, 0)'.matchAll(/([0-9]\.?[0-9]*)/gm)]
        const extractRgbaValue = (string) => {
            return [...string.matchAll(/([0-9]\.?[0-9]*)/gm)]
        }
        const bg = window.getComputedStyle(el).backgroundColor;
        
        const rgba = extractRgbaValue(bg);
        if(bg !==  "" && bg !== undefined && (rgba.length === 3  || (rgba[3] !== undefined && rgba[3][0] !== "0")) ){
 
            return bg
        }else{
            return findBackgroundColor(el.parentNode)
        }

    }

 
}

const convertSelectionToImage = (callback) => {
    if(window.html2canvas === undefined && globalThis.html2canvas === undefined){
        throw new Error("html2canvas could not load on this page")
    }

    const { selectionContainer, restoreToOrigin } = getUserSelection();
    const backgroundColor = findBackgroundColor(selectionContainer);
    html2canvas(selectionContainer, {
        allowTaint: false,
        useCORS: true,
        logging: false,
        backgroundColor: typeof backgroundColor === "string" ? backgroundColor : undefined
    }).then(function(canvas) {
        const body = document.querySelector("body");
        body.appendChild(canvas);
    
        canvas.style.display = "none";
    
        const ctx = canvas.getContext("2d");
    
        const imageUrl = ctx.canvas.toDataURL();
        body.removeChild(canvas);

        callback({imageUrl, restoreToOrigin})

        // resolve({imageUrl, restoreToOrigin});

    }).catch((err) => {setStatus("error",err)});


}


const setStatus = (status, message) => {
    const statusIndicator = document.querySelector("#converter-status-indicator");
    if(statusIndicator){
        if(typeof message !== "string"){
            message = message.toString()
        }
        statusIndicator.setAttribute("data-status",status);
        statusIndicator.setAttribute("data-message",message);
    }else{
        console.error("statusIndicator does not exist")
    }

}

const createElements = () => {
  
    const container = document.createElement("div");
    container.style.display = "none";
    container.id = "convert-control-panel";

    const statusIndicator = document.createElement("button");
    statusIndicator.id = "converter-status-indicator";
    //content js will add a click listener to confirm the convert is done, and the text is the status
    setStatus("","");

    const convertButton = document.createElement("button");
    convertButton.id = "converter-convert-button";

    const outputImage = document.createElement("img");
    outputImage.id = "converter-image-output";

    const isCopiedIndicator = document.createElement("button");;
    isCopiedIndicator.id = "converter-isCopiedIndicator";
    //it will be added a click listener after hide some element, then reveal those elements back on click (copied)
    
    container.appendChild(statusIndicator);
    container.appendChild(convertButton);
    container.appendChild(outputImage);

    convertButton.addEventListener("click",() => {
        try{

            convertSelectionToImage(({imageUrl}) => {
                outputImage.src = imageUrl;
                setStatus("done", "");
                statusIndicator.click();
            });

        
        }catch(err){
            setStatus("error",err);
            statusIndicator.click();
        }
     
    })

    document.body.appendChild(container);
}

createElements();