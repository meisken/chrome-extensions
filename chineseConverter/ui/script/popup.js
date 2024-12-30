
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
    textToImage: "text-image",
}
const convertModeName = {
    [contextMenuIds.zhToCn]: "繁轉簡",
    [contextMenuIds.cnToZh]: "簡轉繁",
    [contextMenuIds.quickToZh]: "速成碼轉繁",
    [contextMenuIds.zhToQuick]: "繁轉速成碼",
    [contextMenuIds.textToImage]: "文字轉圖片",
}

const outputModeNames = {
    [contextMenuIds.zhToCn]: "text-output-mode",
    [contextMenuIds.cnToZh]: "text-output-mode",
    [contextMenuIds.quickToZh]: "text-output-mode",
    [contextMenuIds.zhToQuick]: "quick-output-mode",
    [contextMenuIds.textToImage]: "image-output-mode"
}
const printError = (err) => {
    const errorMessageBox = document.querySelector("#error-message-box");
    if(errorMessageBox){
        errorMessageBox.textContent = `Error: ${err}`
    }
}
const clearErrorMessage = () => {
    const errorMessageBox = document.querySelector("#error-message-box");
    if(errorMessageBox){
        errorMessageBox.textContent = ""
    }
}
let convertedOutput;
const clearInput = () => {
    const textConvertInput = document.querySelector("#search-input");
    if(textConvertInput){
        textConvertInput.value = "";
    }else{
        printError("textConvertInput does not exist")
    }
}
const clearOutput = () => {
    const textOutputTarget = document.querySelector(".text-output-mode .output-target");
    const quickOutputTarget = document.querySelector(".quick-output-mode.output-target");
    if( textOutputTarget !== undefined && textOutputTarget !== null){
        textOutputTarget.textContent = "";


  
    }else{
        printError("textOutputTarget does not exist");
    }
    if(quickOutputTarget !== undefined && quickOutputTarget !== null){
        quickOutputTarget.innerHTML = "";
    }else{
        printError("quickOutputTarget does not exist");
    }

    const imageOutput = document.querySelector("#image-output");
    if(imageOutput !== undefined && imageOutput !== null){
        imageOutput.remove();
    }

}
const outputModes = {
    "text-output-mode": (result) => {

        const outputTarget = document.querySelector(".text-output-mode .output-target");

        if(outputTarget !== undefined){
            if(result !== undefined && typeof result === 'string'){
                outputTarget.textContent = result;
                convertedOutput = result;
            }
        }else{
            printError("outputTarget does not exist");
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
                    }else{
                        printError("outputTarget does not exist");
                    }

            
                }
            
              
            }
            insertCharacterElements(charactersFilterOutStrings);
        }
 
    },
    "image-output-mode": (result) => {

        const outputTarget = document.querySelector(".text-output-mode .output-target");

        if(outputTarget !== undefined){
            if(result !== undefined && typeof result === 'string'){
                clearOutput();
                const imageElement = document.createElement("img");
                imageElement.src = result;
                imageElement.id = "image-output";

                outputTarget.appendChild(imageElement);
                convertedOutput = { type: "image" };
            }
        }else{
            printError("outputTarget does not exist");
        }
    }
}

const sendMessageToContent = (props, callback) => {
    if(chrome){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      
            if(tabs[0]){
                chrome.tabs.sendMessage(
                    tabs[0].id, 
                    props, 
                    callback
                )
            }else{
                printError("no valid chrome tab found");
            }
    
        })
    }else{
        printError("you can't use converter on this page");
    }


}
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
}
const switchPage = (pageName) => {
    const pagesContainer = document.querySelector(".pages-container");
    if(pagesContainer){
        if(pageName === "detail"){
            pagesContainer.classList.add("detail");
        }else{
            pagesContainer.classList.remove("detail");
        }
    }else{
        printError("pagesContainer does not exist")
    }

}
const sendMessageToBackground = (requestType, props ) => {
    return new Promise((resolve,reject) => {
        if(chrome?.runtime){
 
            chrome.runtime.sendMessage({requestType, props}, resolve);
        }else{
            printError("you can't use converter on this page");
            reject("you can't use converter on this page");
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
    
            }else{
                printError("no checkbox found");
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
                        try{
                            if(settingsSectionNames[key] === settingsSectionNames.convertMode){
                                const current = checkbox.id.replace(checkboxIdPrefixes[settingsSectionNames.convertMode], "")
                                await updateSettings(key,{
                                    current 
                                });
                                if(storedSettings){
                                    updateCovertModeInDom(current, convertModeName[current]);
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
                            await requestStoredSettings();
                        }catch(err){
                            printError(err);
                        }

                     
                    });
                });
            }else{
                printError("no checkbox found");
            }
        }
    }
    checkboxOnChangeListers();
}



const convertType = {
    [contextMenuIds.zhToCn]: (mode, text, callback) => {      
        sendMessageToContent({selectedText: text, mode, noCopy: true}, (result) => { 
            callback(result);
        });
    },
    [contextMenuIds.cnToZh]: (mode, text, callback) => {
        sendMessageToContent({selectedText: text, mode, noCopy: true}, (result) => { 
            callback(result);
        });
    },
    [contextMenuIds.quickToZh]: (mode, text, callback) => {
        sendMessageToBackground("request-quick-conversion",{mode, text}).then((result) => {
            callback(result)
        }).catch((err) => {
            printError(err)
        });

    },
    [contextMenuIds.zhToQuick]: (mode, text, callback) => {
        sendMessageToBackground("request-quick-conversion",{mode, text}).then((result) => {
            callback(result)
        }).catch((err) => {
            printError(err)
        });
    },
    [contextMenuIds.textToImage]: (mode, text, callback) => {

        const textOutputTarget = document.querySelector(".text-to-image-template .container .output-target");
        if(textOutputTarget){
            textOutputTarget.textContent = text;
        }else{
            printError("textOutputTarget does not exist");
            return
        }

        const textOutputContainer = document.querySelector(".text-to-image-template .container");

        if(html2canvas && textOutputContainer){

            html2canvas(textOutputContainer).then(function(canvas) {
                const body = document.querySelector("body");
                body.appendChild(canvas);
           
                canvas.style.display = "none";
            
                const ctx = canvas.getContext("2d");

                const imageUrl = ctx.canvas.toDataURL();
                body.removeChild(canvas);
        
                
        
                callback(imageUrl);
            }).catch(printError);
        }else{
            printError("html2canvas or textOutputContainer does not exist")
        }
    


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
                    clearErrorMessage();
                    const result = await requestTextProcess(e.target.value, storedSettings.convertMode.current);
                    outputModes[outputModeNames[storedSettings.convertMode.current]](result);
                    
                }catch(err){
                    printError(err);
                }
            }, 500)
    
        });
    }else{
        printError("textConvertInput does not exist");
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

            if(convertedOutput !== undefined){
                if(typeof convertedOutput === "string"){
                    copyToClipboard(convertedOutput);

                    changeStatusText("Copied!");
                    setTimeout(() => {
                        changeStatusText("Copy");
                    },1500)

                }
                if(isObject(convertedOutput) && "type" in convertedOutput && convertedOutput.type === "image"){//bug
                    const imageOutput = document.querySelector("#image-output");
                    if(imageOutput !== undefined){
                     
                        copyImageToClipboard(imageOutput.src);

                        changeStatusText("Copied!");
                        setTimeout(() => {
                            changeStatusText("Copy");
                        },1500)
                        
                    }else{
                        printError("image output does not exist");
                    }
                }
            }else{
                printError("no valid output found");
            }

     
        })
    }else{
        printError("copyButton does not exist");
    }
}
const registerCrossButtonListener = () => {
    const crossButton = document.querySelector("#cross-button");
    crossButton.addEventListener("click", () => {
        clearInput();
        clearOutput();
    });
}
const registerReminderToggleListener = () => {
    const reminderToggle = document.querySelector(`#convert-toggle input[type="checkbox"]`);
    if(reminderToggle){
        reminderToggle.addEventListener("change",async () => {
  
            try{
                await updateSettings("reminder",{
                    enabled: reminderToggle.checked
                });
                await requestStoredSettings()
            }catch(err){
                printError(err);
            }
        })
    }else{
        printError("reminderToggle does not exist");
    }
}
const registerHelpButtonListener = () => {
    const helpButton = document.querySelector(`#help-button`);
    if(helpButton){
        helpButton.addEventListener("click",async () => {
            window.open('https://github.com/meisken/chrome-extensions/tree/main/chineseConverter', "_blank")

        })
    }else{
        printError("helpButton does not exist");
    }
}
async function backgroundConsoleLog(...args){
    if(chrome?.runtime){
        return sendMessageToBackground("background-console-log",[...args]);
    }else{
        return new Promise((resolve) => {
            console.log(...args);
            resolve();
        })
    }

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
            reject(err)
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
                rightClickBehavior,
                reminder
            } = userSettings;

            if(convertMode !== undefined){

                
                const checkbox = document.querySelector(`label[for=${checkboxIdPrefixes[settingsSectionNames.convertMode]}${convertMode.current}] input[type="checkbox"]`)
                if(checkbox){
                    checkbox.checked = true;
                }else{
                    reject("convertMode checkbox does not exist");
                }

                updateCovertModeInDom(convertMode.current, convertModeName[convertMode.current]);
            }else{
                reject("convertMode is undefined");
            }
            
            if(contextMenu !== undefined){
                Object.keys(contextMenu).forEach(key => {
                    if(contextMenu[key]){
                        const checkbox = document.querySelector(`label[for=${checkboxIdPrefixes[settingsSectionNames.contextMenu]}${key}] input[type="checkbox"]`)
                        if(checkbox){
                            checkbox.checked = true
                        }else{
                            reject("contextMenu checkbox does not exist");
                        }
                    }
                })
            }else{
                reject("contextMenu is undefined");
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
                reject("rightClickBehavior is undefined");
            }
            if(reminder !== undefined){
                const reminderToggle = document.querySelector(`#convert-toggle input[type="checkbox"]`);
                if(reminderToggle){
                    reminderToggle.checked = reminder.enabled;
                }else{
                    reject("reminderToggle does not exist");
                }
            }
            resolve();
        }catch(err){
            reject(err)
        }


    })



 
}
async function copyImageToClipboard(imgUrl) {
    try {
        const data = await fetch(imgUrl);
        const blob = await data.blob();
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob,
            }),
        ]);
    } catch (err) {
        printError(`${err.name} ${err.message}`);
    }
}
  


const main = async () => {
    //on popup show
    try{
        await initializeSettings();

    }catch(err){
        
        printError(err);
    }
    registerPageSwitchButtonListeners();
    registerSearchInputOnChangeListener();
    registerCopyButtonOnClickListener();
    registerCrossButtonListener();
    registerReminderToggleListener();
    registerCheckboxesListeners();
    registerHelpButtonListener();
    // createTextSnapShot();
}



main();



function isObject(obj)
{
    return obj != null && obj.constructor.name === "Object"
}
