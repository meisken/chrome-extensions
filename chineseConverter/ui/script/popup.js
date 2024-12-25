
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
let storedSettings;

const contextMenuIds = {
    zhToCn: "zh-cn",
    cnToZh: "cn-zh",
    quickToZh: "quick-zh",
    zhToQuick: "zh-quick",
    textToImage: "text-image"
}

const outputModeNames = {
    [contextMenuIds.zhToCn]: "text-output-mode",
    [contextMenuIds.cnToZh]: "text-output-mode",
    [contextMenuIds.quickToZh]: "text-output-mode",
    [contextMenuIds.zhToQuick]: "quick-output-mode",
    [contextMenuIds.textToImage]: "text-output-mode"
}
let convertedOutput;
const clearInput = () => {
    const textConvertInput = document.querySelector("#search-input");
    if(textConvertInput){
        textConvertInput.value = "";
    }
}
const clearOutput = () => {
    const textOutputTarget = document.querySelector(".text-output-mode .output-target");
    const quickOutputTarget = document.querySelector(".quick-output-mode.output-target");
    if( textOutputTarget){
        textOutputTarget.textContent = "";
    }
    if(quickOutputTarget){
        quickOutputTarget.innerHTML = "";
    }
}
const outputModes = {
    "text-output-mode": (result) => {

        const outputTarget = document.querySelector(".text-output-mode .output-target");
        if(outputTarget && result !== undefined && typeof result === 'string'){
            outputTarget.textContent = result;
            convertedOutput = result;
        }

    },
    "quick-output-mode": (result) => {
        if(result.length > 0){
            const charactersFilterOutStrings = result.filter((char) => {
                return typeof char !== "string" && "radicals" in char
            });

            const insertCharacterElements = (characters) => {

                if(characters.length > 0) {
                    const outputTarget = document.querySelector(".quick-output-mode.output-target");
                    if(outputTarget ){
                        outputTarget.innerHTML = ""; //clear up
           
                        characters.forEach(({character, radicals}, i) => {
                            if(character !== undefined && radicals.length > 0){
                          
                                const elementString = `
                                    <div class="character" id="character-${i}">
                                        <h1 class="character-medium-font">${character}</h1>
                                        <div class="radical">
                                            <span class="radical-regular-dark-font">${radicals[0]}</span>
                                            ${radicals[1] !== undefined ? `<span class="radical-regular-dark-font">${radicals[1]}</span>` : ""}

                                            </div>
                                    </div>
                                `;
                                outputTarget.innerHTML += elementString;
                            }
                
                        });
                    }

            
                }
            
              
            }
            insertCharacterElements(charactersFilterOutStrings);
        }
 
    }
}

const sendMessageToContent = (props, callback) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      
        if(tabs[0]){
            chrome.tabs.sendMessage(
                tabs[0].id, 
                props, 
                callback
            )
        }

    })

}
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
}
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
                    
                    checkbox.addEventListener("change", async (e) => {
                    
                        if(settingsSectionNames[key] === settingsSectionNames.convertMode){
                            const current = checkbox.id.replace(checkboxIdPrefixes[settingsSectionNames.convertMode], "")
                            await updateSettings(key,{
                                current 
                            });
                            if(storedSettings){
                                updateCovertModeInDom(current, storedSettings.contextMenuName[current]);
                            }
                     
                        }
                        if(settingsSectionNames[key] === settingsSectionNames.contextMenu){
                            const itemKey = checkbox.id.replace(checkboxIdPrefixes[settingsSectionNames.contextMenu], "");
                            await updateSettings(key,{
                                [itemKey]: checkbox.checked
                            })
                        }
                        if(settingsSectionNames[key] === settingsSectionNames.rightClickBehavior){
                            const itemKey = checkbox.id.replace(checkboxIdPrefixes[settingsSectionNames.rightClickBehavior], "");
                            await updateSettings(key,{
                                [itemKey]: checkbox.checked
                            })
                        }
                        await requestStoredSettings()
                     
                    });
                });
            }
        }
    }
    checkboxOnChangeListers()
}



const convertType = {
    [contextMenuIds.zhToCn]: (mode, text, callback) => {      
        sendMessageToContent({selectedText: text, mode, noCopy: true}, (result) => { 
            callback(result);
        })
    },
    [contextMenuIds.cnToZh]: (mode, text, callback) => {
        sendMessageToContent({selectedText: text, mode, noCopy: true}, (result) => { 
            callback(result);
        })
    },
    [contextMenuIds.quickToZh]: (mode, text, callback) => {
        sendMessageToBackground("request-quick-conversion",{mode, text}).then((result) => {
            callback(result)
        }).catch((err) => {

        })

    },
    [contextMenuIds.zhToQuick]: (mode, text, callback) => {
        sendMessageToBackground("request-quick-conversion",{mode, text}).then((result) => {
            callback(result)
        }).catch((err) => {
            
        })
    },
    [contextMenuIds.textToImage]: (mode, text, callback) => {
   
      
    },
}

const registerSearchInputOnChangeListener = () => {

    const requestTextProcess = (text, mode) => {
        return new Promise(async (resolve, reject) => {
            try{
            
                if(convertType[mode]){
                    convertType[mode](mode, text, resolve);
                }else{
                    reject("convert type does not exist")
                }
           
                
            
            }catch(err){
                reject(err)
            }
        })
    }
    const textConvertInput = document.querySelector("#search-input");

    let debounceTimer;
    if(textConvertInput){
        textConvertInput.addEventListener("input", (e) => {

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(async () => {
                try{
                    const result = await requestTextProcess(e.target.value, storedSettings.convertMode.current);
                    outputModes[outputModeNames[storedSettings.convertMode.current]](result);
                
                }catch(err){
    
                }
            }, 500)
    
        });
    }

    // storedSettings.convertMode.current
}
const registerCopyButtonOnClickListener = () => {
    const copyButton = document.querySelector("#copy-button");
    const changeStatusText = (text) => {
        const statusTip = document.querySelector("#copy-button .status-tip")
        statusTip.textContent = text
    }
    if(copyButton){
        copyButton.addEventListener("click",() => {

            if(convertedOutput !== undefined && typeof convertedOutput === "string"){
                copyToClipboard(convertedOutput);
                changeStatusText("Copied!");
                setTimeout(() => {
                    changeStatusText("Copy");
                },1500)
            }else{

            }

     
        })
    }
}
const registerCrossButtonListener = () => {
    const crossButton = document.querySelector("#cross-button");
    crossButton.addEventListener("click", () => {
        clearInput();
        clearOutput();
    });
}
async function backgroundConsoleLog(...args){
    return sendMessageToBackground("background-console-log",[...args]);
}
async function updateSettings(key, newState){
    return sendMessageToBackground("update-settings",{key, newState});
}

const requestStoredSettings = () => {
    return new Promise(async (resolve, reject) => {
        try{
            const userSettings = await sendMessageToBackground("request-stored-settings");
            storedSettings = userSettings;
            resolve(userSettings);
        }catch(err){
            reject("requestStoredSettings",err)
        }
    })
}



const updateCovertModeInDom = (mode, name) => {
    return new Promise((resolve, reject) => {

        if(name === undefined || name === ""){
            reject("convert name does not exist")
            return
        }

        const textConvertInput = document.querySelector(".search-bar input");
        if(textConvertInput){
            textConvertInput.placeholder = name;
        }else{
            reject("convertMode checkbox does not exist");
        };
    
        const currentConvertModeText = document.querySelector(".convert-mode .title .detail span");
        if(currentConvertModeText){
            currentConvertModeText.textContent = name;
        }else{
            reject("convertMode checkbox does not exist");
        };

        const outputContainer = document.querySelector(".output-box");

        if(mode !== undefined && outputModeNames[mode] && outputContainer){
       
            outputContainer.setAttribute("data-output-mode", outputModeNames[mode]);
        }else{
            reject("output Container  or convert mode does not exist");
        }

        resolve();
    })
}

const initializeSettings =  () => {

    return new Promise(async (resolve, reject) => {
    

        try{
            const userSettings = await requestStoredSettings();
        
            const {
                convertMode, 
                contextMenu,
                contextMenuName,
                rightClickBehavior
            } = userSettings;
         
            if(convertMode !== undefined){

                
                const checkbox = document.querySelector(`label[for=${checkboxIdPrefixes[settingsSectionNames.convertMode]}${convertMode.current}] input[type="checkbox"]`)
                if(checkbox){
                    checkbox.checked = true;
                }else{
                    reject("convertMode checkbox does not exist")
                }

                updateCovertModeInDom(convertMode.current, contextMenuName[convertMode.current]);
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


const createTextSnapShot = () => {
    // const createCanvas = () => {
    //     const body = document.querySelector("body");
    //     const canvas = document.createElement("canvas");
    //     canvas.style.display = "none";

   

    //     body.appendChild(canvas );

    //     const ctx = canvas.getContext("2d");
    //     ctx.canvas.width =  ctx.measureText(this.value).width;
    //     ctx.fillText(this.value, 0, 10);

    //     imageElem.src =  ctx.canvas.toDataURL();

    //     return  ctx
    // }
    // createCanvas();


    // navigator.clipboard.writeText("hello world");
}
const main = async () => {
    //on popup show
    try{
        await initializeSettings();
    }catch(err){
        
        backgroundConsoleLog("err",err);
    }
    registerPageSwitchButtonListeners();
    registerCheckboxesListeners();
    requestStoredSettings();
    registerSearchInputOnChangeListener();
    registerCopyButtonOnClickListener();
    registerCrossButtonListener();
}



main();