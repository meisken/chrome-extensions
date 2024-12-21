

const switchPage = (pageName) => {
    const pagesContainer = document.querySelector(".pages-container");
    if(pageName === "detail"){
        pagesContainer.classList.add("detail");
    }else{
        pagesContainer.classList.remove("detail");
    }
}
const sendMessageToBackground = (requestType, callback, props ) => {
    if(chrome.runtime){
 
        chrome.runtime.sendMessage({requestType, props}, callback);
    }
 
}
const registerPageSwitchButtonListeners = () => {


    const convertModeButton = document.querySelector(".convert-mode .title .detail");
    const rightClickMenuButton = document.querySelector(".right-click-menu .title .detail");
    const backToHomeButton = document.querySelector(".detail-setting-container header .previous-page-title");

    convertModeButton.addEventListener("click", () => {
        switchPage("detail");

    });

    rightClickMenuButton.addEventListener("click", () => {
        switchPage("detail");
    });

    backToHomeButton.addEventListener("click", () => {
        switchPage("main");
    });
}

const registerCheckboxesListener = () => {
    const uncheckedNeededSection = ["convert-mode"] //the sections should be only one check box is checked
    
    uncheckedNeededSection.forEach((sectionClassName) => {
        const checkboxes = document.querySelectorAll(`.setting-section.${sectionClassName} input[type="checkbox"]`)   
        if(checkboxes.length !== 0){

            const uncheckOther = (id) => {
                checkboxes.forEach((checkbox) => {
                    if(id !== checkbox.id){
                        checkbox.checked = false;
                    }
                })
            }

            checkboxes.forEach((checkbox) => {
           
                checkbox.addEventListener("change", (e) => {
                    uncheckOther(e.target.id);
               
                })
            })

        }
    })
  
}

const requestStoredSettings = () => {
    sendMessageToBackground("request-stored-settings", console.log)
}

const main = () => {
    //on popup show
    registerPageSwitchButtonListeners();
    registerCheckboxesListener();
    requestStoredSettings();
}

main();