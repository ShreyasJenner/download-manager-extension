/* Activate when a download is started */
browser.downloads.onCreated.addListener( async (downloaditem) => {
    // Add download item to the list
    const key = "ongoing_list";
    let currObj = await getDownloadList();
    let currArr = currObj.ongoing_list;
    
    console.log(currArr);
    // if array does not exists then local storage should be updated and downloadHandler should be run
    if(currArr == undefined || currArr == []) {
        currArr = [];
        currArr.push(downloaditem);
        await browser.storage.local.set({[key]: currArr});
        await downloadHandler();
    } else {
        // only perform local storage updation
        currArr.push(downloaditem);
        await browser.storage.local.set({[key]: currArr});
    }
})

/* Activate on extension click */
document.addEventListener("DOMContentLoaded", showDownloadList);

/* Event handler for buttons */
document.getElementById("pause_download").addEventListener("click", pauseDownload); 
document.getElementById("resume_download").addEventListener("click", resumeDownload); 


/* Function that adds downloading items in html popup */
async function showDownloadList() {
    const key = "ongoing_list";

    const ongoing_list = await browser.storage.local.get(key);

    // write the list items to html popup
    const Container = document.getElementById("download_list");

    // clear existing content in container
    Container.innerHTML = '';

    // check if downloads are ongoing before creating html content
    if(ongoing_list.ongoing_list === undefined) {
        Container.innerHTML = '<p>No downloads ongoing</p>';
    } else {
        // for loop to create the button list 
        ongoing_list.ongoing_list.forEach((item, index) => {
            // create the item container ongoing_list:"[{"id":36,"url":"https://ash-speed.hetzner.com/100MB.bin","referrer":"https://ash-speed.hetzner.com/","filename":"/home/ouroboros/Downloads/100MB(1).bin","incognito":false,"cookieStoreId":"firefox-default","danger":"safe","mime":"application/octet-stream","startTime":"2024-11-26T07:14:53.447Z","endTime":null,"state":"in_progress","paused":false,"canResume":false,"error":null,"bytesReceived":0,"totalBytes":-1,"fileSize":-1,"exists":false}]"
            const itemContainer = document.createElement("div");
            itemContainer.classList.add("item-name");

            // create span for the item name 
            const itemName = document.createElement("span");
            itemName.classList.add("item-name");
            itemName.textContent = item.filename;

            // create button
            const itemButton = document.createElement("button");
            itemButton.classList.add("item-button");

            // set appropriate icon based on whether download can be paused
            if(item.canResume === false) {
                // item cant be paused
                itemButton.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                itemButton.innerHTML = '<i class="fas fa-pause"></i>';
            }

            // add the item details to the button dataset
            itemButton.dataset.value = JSON.stringify([item, index]);
            
            // add event listener to detect button clicks
            itemButton.addEventListener("click", async function() {
                // get json value stored in button dataset 
                let value = JSON.parse(itemButton.dataset.value);

                // if download can't be paused and button has been clicked
                if(value[0].canResume === false) {
                    console.log("Cancelling download");
                    itemButton.innerHTML = '';
                    await cancelDownload(value[0].id, value[1]);
                } 
                // if download has been paused, resume it 
                else if(value[0].paused == true) {
                    console.log("Resuming Download");
                    itemButton.innerHTML = '<i class="fas fa-check"></i>';
                    await resumeDownload(value[0].id);
                } else {
                    console.log("Pausing Download");
                    itemButton.innerHTML = '<i class="fas fa-pause"></i>';
                    await pauseDownload(value[0].id);
                }
            });

            // append text and button to div
            itemContainer.appendChild(itemName);
            itemContainer.appendChild(itemButton);

            // append div to popup
            Container.appendChild(itemContainer);
        });
    }
}


/* Function that gets list of downloads from storage */
async function getDownloadList() {
    const key = "ongoing_list";

    // get items from local storage
    return await browser.storage.local.get(key);
}

/* Function to pause the download */
async function pauseDownload(id) {
    let pausing = browser.downloads.pause(id);

    console.log(pausing);
}

/* Function to resume download */
async function resumeDownload(id) {
    let resuming = browser.downloads.resume(id);

    console.log(resuming);
}

/* Function to cancel download and remove it from local storage */
async function cancelDownload(id, index) {
    const key = "ongoing_list";

    // cancel the download
    let cancelling = browser.downloads.cancel(id);
    console.log(cancelling);

    // remove  the item from the array in local storage
    let ongoing_list = await getDownloadList();
    console.log(ongoing_list.ongoing_list);
    ongoing_list.ongoing_list.splice(index, 1);
    

    // replace with new array in local storage
    console.log("Cancel"+ongoing_list);
    await browser.storage.local.set({[key]: ongoing_list.ongoing_list});

}

/* Function that checks if downloads are queued and then calls checkNetwork while download is ongoing 
Also handles removal of completed downloads froms storage
*/
async function downloadHandler() {
    const key = "ongoing_list";
    let ongoing_list = await getDownloadList();
    let new_ongoing_list = {ongoing_list: []};

    console.log("This is a periodic log from downloadHandler");
    console.log(ongoing_list);

    // check if downloads have been cancelled
    if(ongoing_list.ongoing_list.length == 0) {
        // replace the array in storage with the new array
        await browser.storage.local.set({[key]: ongoing_list.ongoing_list});
        console.log("Donwload Handle Finished");
        return true;
    }

    // check if a download is completed
    ongoing_list.ongoing_list.forEach(item => {
        if(item.state === "in_progress") {
            new_ongoing_list.ongoing_list.push(item);
        }
    })

    // replace the array in storage with the new array
    await browser.storage.local.set({[key]: new_ongoing_list.ongoing_list});

    // if no more items are being downloaded, exit the function here
    if(new_ongoing_list.ongoing_list.length == 0) {
        console.log("Donwload Handler Finished");
        return true;
    }


    // check network connectivity
    let res = await checkNetwork();

    // no network connection => pause download
    if(res == false) {
        // iterate through the ongoing list and pause items
        ongoing_list.ongoing_list.forEach(item => {
            pauseDownload(item.id);
        })
    } else {
        // if items are paused then resume them
        ongoing_list.ongoing_list.forEach(item => {
            if(item.paused == true) {
                resumeDownload(item.id);
            }
        })
    }
    
    setTimeout(downloadHandler, 3000);
}

/* Function to check network connectivity */
async function checkNetwork() {
    try {
        // ping 8.8.8.8 for network connectivity
        const res = await fetch('8.8.8.8', {method: 'HEAD'});
        if(res.ok) {
            return true;
        } else {
            return false;
        }
    } catch(err) {
        return false;
    }
}