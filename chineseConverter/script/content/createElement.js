const setConverterStatus = (id,status, message) => {
    const statusIndicator = document.querySelector(`#${id}-status-indicator`);
    if(statusIndicator){
        if(typeof message !== "string"){
            message = message.toString()
        }
        statusIndicator.setAttribute("data-status",status);
        statusIndicator.setAttribute("data-message",message);
    }else{
        console.error( `${id}-status-indicator  does not exist`)
    }

}

const createConverterStatusElements = (id, convertButtonOnClick) => {
  
    const container = document.createElement("div");
    container.style.display = "none";
    container.id = `${id}-panel`;

    const statusIndicator = document.createElement("button");
    statusIndicator.id = `${id}-status-indicator`;
    //content js will add a click listener to confirm the convert is done, and the text is the status


    const convertButton = document.createElement("button");
    convertButton.id = `${id}-convert-button`;

    const outputImage = document.createElement("img");
    outputImage.id = `${id}-image-output`;

    const outputText = document.createElement("div");
    outputText.id = `${id}-text-output`;

    const isCopiedIndicator = document.createElement("button");;
    isCopiedIndicator.id = `${id}-is-copied-indicator`;
    //it will be added a click listener after hide some element, then reveal those elements back on click (copied)
    
    container.appendChild(statusIndicator);
    container.appendChild(convertButton);
    container.appendChild(outputImage);
    container.appendChild(outputText);
    container.appendChild(isCopiedIndicator);

    convertButton.addEventListener("click", () => {
        convertButtonOnClick({
            statusIndicator,
            convertButton,
            outputImage,
            outputText,
            isCopiedIndicator,
        })
    })

    document.body.appendChild(container);
    setConverterStatus(id,"","");
}

//createElements();