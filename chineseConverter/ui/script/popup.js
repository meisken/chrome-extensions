
const settingsSectionNames = {
    convertMode: "convert-mode", 
    contextMenu: "context-menu", 
    rightClickBehavior: "right-click-behavior"
};
const checkboxIdPrefixes = {
    [settingsSectionNames.convertMode]: "convert-mode-",
    [settingsSectionNames.contextMenu]: "context-",
    [settingsSectionNames.rightClickBehavior]: "right-click-behavior-"
};

const switchPage = (pageName) => {
    const pagesContainer = document.querySelector(".pages-container");
    if(pageName === "detail"){
        pagesContainer.classList.add("detail");
    }else{
        pagesContainer.classList.remove("detail");
    }
}
const sendMessageToBackground = (requestType, props ) => {
    return new Promise((resolve,reject) => {
        if(chrome.runtime){
 
            chrome.runtime.sendMessage({requestType, props}, resolve);
        }else{
            reject("chrome.runtime is undefined");
        }
    })

 
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

const registerCheckboxesListeners = () => {
    
    const uncheckOtherCheckboxesListener = () => {
        const uncheckedNeededSection = ["convert-mode"]; //the sections should be only one check box is checked
    
        uncheckedNeededSection.forEach((sectionClassName) => {
            const checkboxes = document.querySelectorAll(`.setting-section.${sectionClassName} input[type="checkbox"]`)   
            if(checkboxes.length !== 0){
    
                const uncheckOther = (id) => {
                    checkboxes.forEach((checkbox) => {
                        if(id !== checkbox.id){
                            checkbox.checked = false;
                        }else{
                            checkbox.checked = true;
                        }
                    })
                }
    
                checkboxes.forEach((checkbox) => {
               
                    checkbox.addEventListener("change", (e) => {
                        uncheckOther(e.target.id);
                   
                    })
                })
    
            }
        });
    }
    uncheckOtherCheckboxesListener();

    const checkboxOnChangeListers = () => {
        for(const key in settingsSectionNames){
            const sectionName = settingsSectionNames[key];
            const checkboxes = document.querySelectorAll(`.${sectionName} input[type="checkbox"]`);
            if(checkboxes.length > 0){
                checkboxes.forEach((checkbox) => {
                    
                    checkbox.addEventListener("change", (e) => {
                    
                        if(settingsSectionNames[key] === settingsSectionNames.convertMode){
                            UpdateSettings(key,{
                                current: checkbox.id.replace(checkboxIdPrefixes[settingsSectionNames.convertMode], "")
                            });
                        }
                        if(settingsSectionNames[key] === settingsSectionNames.contextMenu){
                            const itemKey = checkbox.id.replace(checkboxIdPrefixes[settingsSectionNames.contextMenu], "");
                            UpdateSettings(key,{
                                [itemKey]: checkbox.checked
                            })
                        }
                        if(settingsSectionNames[key] === settingsSectionNames.rightClickBehavior){
                            const itemKey = checkbox.id.replace(checkboxIdPrefixes[settingsSectionNames.rightClickBehavior], "");
                            UpdateSettings(key,{
                                [itemKey]: checkbox.checked
                            })
                        }
                     
                    });
                });
            }
        }
    }
    checkboxOnChangeListers()
}
async function BackgroundConsoleLog(arg){
    return sendMessageToBackground("background-console-log",arg)
}
async function UpdateSettings(key, newState){
    return sendMessageToBackground("update-settings",{key, newState})
}

const requestStoredSettings = () => {
    return new Promise(async (resolve, reject) => {
        try{
            const userSettings = await sendMessageToBackground("request-stored-settings");
            resolve(userSettings);
        }catch(err){
            reject("rej",err)
        }
    })
}
const initCheckboxes =  () => {

    return new Promise(async (resolve, reject) => {
    

        try{
            const userSettings = await requestStoredSettings();
        
            const convertMode = userSettings["convertMode"];
            const contextMenu = userSettings["contextMenu"];
            const rightClickBehavior = userSettings["rightClickBehavior"];
          
            if(convertMode !== undefined){

                
                const checkbox = document.querySelector(`label[for=${checkboxIdPrefixes[settingsSectionNames.convertMode]}${convertMode.current}] input[type="checkbox"]`)
                if(checkbox){
                    checkbox.checked = true;
                }else{
                    reject("convertMode checkbox does not exist")
                }
            }else{
                reject("convertMode is undefined")
            }
            
            if(contextMenu !== undefined){
                Object.keys(contextMenu).forEach(key => {
                    if(contextMenu[key]){
                        const checkbox = document.querySelector(`label[for=${checkboxIdPrefixes[settingsSectionNames.contextMenu]}${key}] input[type="checkbox"]`)
                        if(checkbox){
                            checkbox.checked = true
                        }else{
                            reject("contextMenu checkbox does not exist")
                        }
                    }
                })
            }else{
                reject("contextMenu is undefined")
            }

            if(rightClickBehavior !== undefined){
                Object.keys(rightClickBehavior).forEach(key => {
            
                    if(rightClickBehavior[key]){
                        const checkbox = document.querySelector(`label[for=${checkboxIdPrefixes[settingsSectionNames.rightClickBehavior]}${key}] input[type="checkbox"]`)
                        if(checkbox){
                            checkbox.checked = true;
                        }else{
                            reject("rightClickBehavior checkbox does not exist")
                        }
                    }
                })
            }else{
                reject("rightClickBehavior is undefined")
            }

            resolve();
        }catch(err){
            reject(err)
        }


    })



 
}
const main = async () => {
    //on popup show
    try{
        await initCheckboxes();
    }catch(err){
        
        BackgroundConsoleLog("err",err);
    }
    registerPageSwitchButtonListeners();
    registerCheckboxesListeners();
    requestStoredSettings();
}

main();