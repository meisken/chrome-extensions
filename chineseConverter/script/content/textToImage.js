

const textToImageConverterElementId = "text-image-converter";

const getUserSelection = () => {
    const selection = window.getSelection();

    if(selection.isCollapsed){
        throw new Error("沒有所選文字");
    }


    const getSelectionDirection = (selection) => {
        const directionList = ["forward","backward","self"];
        
        let position = selection.anchorNode.compareDocumentPosition(selection.focusNode);
        if(position === 0){
            return directionList[2] ;
        }
    
        if (!position && selection.anchorOffset > selection.focusOffset || position === Node.DOCUMENT_POSITION_PRECEDING){

            return directionList[1];
         
        }else{
            return directionList[0];
        }

    }


    

    const range = selection.getRangeAt(0);

    const selectionContainer = range.commonAncestorContainer;
    const direction = getSelectionDirection(selection);
    const isElement = (node) => {
        return node.constructor.name.includes("HTML");
    }
    const isExist = (element) => {
        return element !== null && element !== undefined;
    }
    const addPadding = (el) => {

        //selectionContainer
        if(isElement(el)){
    
            const { paddingTop, paddingBottom, paddingLeft, paddingRight } = window.getComputedStyle(el);

            const toNumber = (padding) => {
                const paddingNumber = parseInt(padding.replace("px",""));
                if(paddingNumber !== NaN){
                    return paddingNumber
                }else{
                    throw new Error("paddingNumber is not a number");
                }
            }
            const paddingNumbers = {
                top: toNumber(paddingTop),
                bottom: toNumber(paddingBottom),
                left: toNumber(paddingLeft),
                right: toNumber(paddingRight),
            }

            if(paddingNumbers.left === 0 && paddingNumbers.right === 0){
                el.style.paddingLeft = "16px";
                el.style.paddingRight = "16px";
            }
            if(paddingNumbers.top === 0 && paddingNumbers.bottom === 0){
                el.style.paddingTop = "16px";
                el.style.paddingBottom = "16px";
            }
        }else{
            // throw new Error("找不到所選");
        }
    
    }

    const removePadding = (el) => {
        if(isElement(el)){
            el.style.paddingLeft = "";
            el.style.paddingRight = "";
            el.style.paddingTop = "";
            el.style.paddingBottom = "";
        }else{
            // throw new Error("找不到所選");
        }
    }
    


    if(direction !== "self" && isElement(selectionContainer)){

        const selectionStartElement = direction === "forward" ?  selection.anchorNode : selection.focusNode;

        const selectionEndElement = direction === "forward" ? selection.focusNode : selection.anchorNode;

        const { top: selectionStartElementTop } = isElement(selectionStartElement) ? selectionStartElement.getBoundingClientRect() : selectionStartElement.parentNode.getBoundingClientRect();

        const { top: selectionEndElementTop, height: selectionEndElementHeight } = isElement(selectionEndElement) ? selectionEndElement.getBoundingClientRect() : selectionEndElement.parentNode.getBoundingClientRect();
   
        const { top: selectionContainerTop, height: selectionContainerHeight } = selectionContainer.getBoundingClientRect();
   
        const selectionEndBottom = selectionEndElementTop + selectionEndElementHeight;
        const selectionContainerBottom = selectionContainerTop + selectionContainerHeight;

        const snapshotAllowExtendOffset = 150;

        const children = selectionContainer.children;

        addPadding(selectionContainer);




        if((selectionContainerBottom - selectionEndBottom > snapshotAllowExtendOffset || selectionStartElementTop - selectionContainerTop > snapshotAllowExtendOffset ) && children.length > 2 &&  isExist(selection.focusNode) && isExist(selection.anchorNode)){

            [...children].forEach((child, i) => { 


                const startElement = direction === "forward" ? selection.anchorNode : selection.focusNode;
                const endElement = direction === "forward" ? selection.focusNode : selection.anchorNode;

                if(child.contains(startElement)){
        
                    startIndex = i;
                }
                if(child.contains(endElement)){
        
                    endIndex= i;
                }
            });
         
            const notSelectedElements = [...children].filter((el,i) => {
    
                return !(i >= startIndex && i <=endIndex);
            });
            const restoreElements = (elements) => {
                if(elements.length > 0){
                    elements.forEach((element) => {
                        element.style.display = "";
                    })
                }
                removePadding(selectionContainer);
            }
        
            const hideElements = (elements) => {
    
                if(elements.length > 0){
                    elements.forEach((element) => {
                        element.style.display = "none";
                    })
                }
            
                 
            }
            hideElements(notSelectedElements);
    
            return {    
                restoreElements: () => { 
                    restoreElements(notSelectedElements);
                },
                selectionContainer: isElement(selectionContainer) ? selectionContainer : selectionContainer.parentNode
            }
        }

    }


    const willBeCopiedElement = isElement(selectionContainer) ? selectionContainer : selectionContainer.parentNode;
    addPadding(willBeCopiedElement);
    return {    
        restoreElements: () => { removePadding(willBeCopiedElement); },
        selectionContainer:  willBeCopiedElement
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
            if(el.parentNode.tagName !== "HTML"){
                return findBackgroundColor(el.parentNode)
            }else{
                return "#ffffff"
            }
       
        }

    }

 
}


const convertSelectionToImage = (callback) => {
    if(window.html2canvas === undefined && globalThis.html2canvas === undefined){
        throw new Error("html2canvas could not load on this page")
    }

    const { selectionContainer, restoreElements } = getUserSelection();
 
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

        callback({imageUrl, restoreElements})

        // resolve({imageUrl, restoreToOrigin});

    }).catch((err) => {setConverterStatus(textToImageConverterElementId,"error",err)});


}

createConverterStatusElements(textToImageConverterElementId, ({
    statusIndicator,
    convertButton,
    outputImage,
    outputText,
    isCopiedIndicator,
}) => {
    try{
        outputImage.src = "";
        convertSelectionToImage(({imageUrl, restoreElements}) => {
            outputImage.src = imageUrl;
            setConverterStatus(textToImageConverterElementId,"done", "");
   
            const onCopied = () => {

                restoreElements();
                isCopiedIndicator.removeEventListener("click",onCopied)
            }

            isCopiedIndicator.addEventListener("click",onCopied)
            statusIndicator.click();

        });

    
    }catch(err){
        setConverterStatus(textToImageConverterElementId,"error",err);
        statusIndicator.click();
    }
 
});

// const setStatus = (status, message) => {
//     const statusIndicator = document.querySelector("#converter-status-indicator");
//     if(statusIndicator){
//         if(typeof message !== "string"){
//             message = message.toString()
//         }
//         statusIndicator.setAttribute("data-status",status);
//         statusIndicator.setAttribute("data-message",message);
//     }else{
//         console.error("statusIndicator does not exist")
//     }

// }

// const createElements = () => {
  
//     const container = document.createElement("div");
//     container.style.display = "none";
//     container.id = "convert-control-panel";

//     const statusIndicator = document.createElement("button");
//     statusIndicator.id = "converter-status-indicator";
//     //content js will add a click listener to confirm the convert is done, and the text is the status


//     const convertButton = document.createElement("button");
//     convertButton.id = "converter-convert-button";

//     const outputImage = document.createElement("img");
//     outputImage.id = "converter-image-output";

//     const isCopiedIndicator = document.createElement("button");;
//     isCopiedIndicator.id = "converter-is-copied-indicator";
//     //it will be added a click listener after hide some element, then reveal those elements back on click (copied)
    
//     container.appendChild(statusIndicator);
//     container.appendChild(convertButton);
//     container.appendChild(outputImage);
//     container.appendChild(isCopiedIndicator);

//     convertButton.addEventListener("click",() => {
//         try{

//             convertSelectionToImage(({imageUrl, restoreElements}) => {
//                 outputImage.src = imageUrl;
//                 setStatus("done", "");
       
//                 const onCopied = () => {
//                     restoreElements();
//                     isCopiedIndicator.removeEventListener("click",onCopied)
//                 }

//                 isCopiedIndicator.addEventListener("click",onCopied)
//                 statusIndicator.click();

//             });

        
//         }catch(err){
//             setStatus("error",err);
//             statusIndicator.click();
//         }
     
//     })

//     document.body.appendChild(container);
//     setStatus("","");
// }

// createElements();
