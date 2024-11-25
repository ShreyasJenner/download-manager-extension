document.getElementById("pause_download").addEventListener("click", pauseDownload); 

document.getElementById("resume_download").addEventListener("click", resumeDownload); 


/* Activate on extension click */
document.addEventListener("DOMContentLoaded", showDownloadList);


/* Function that shows downloading items in html popup */
async function showDownloadList() {
    // get items that are currently downloading 
    await getDownloadList();

    const ongoing_list = await browser.storage.local.get("ongoing_list");

    // write the list items to html popup
    const Container = document.getElementById("download_list");

    // clear existing content in container
    Container.innerHTML = '';

    // for loop to create the button list 
    ongoing_list.ongoing_list.forEach(item => {
        // create the item container 
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
        itemButton.dataset.value = JSON.stringify(item);
        
        // add event listener to detect button clicks
        itemButton.addEventListener("click", async function() {
            // get json value stored in button dataset 
            let value = JSON.parse(itemButton.dataset.value);

            // if download cant be paused and button has been clicked
            if(value.canResume === false) {
                console.log("Cancelling download");
                itemButton.innerHTML = '';
                await cancelDownload(value.id);
            } 
            // if download has been paused, resume it 
            else if(value.paused == true) {
                console.log("Resuming Download");
                itemButton.innerHTML = '<i class="fas fa-check"></i>';
                await resumeDownload(value.id);
            } else {
                console.log("Pausing Download");
                itemButton.innerHTML = '<i class="fas fa-pause"></i>';
                await pauseDownload(value.id);
            }
        });

        // append text and button to div
        itemContainer.appendChild(itemName);
        itemContainer.appendChild(itemButton);

        // append div to popup
        Container.appendChild(itemContainer);
    });
}


/* Function that gets list of active downloads and puts it in storage */
async function getDownloadList() {
    const query = {};

    let down_list = await browser.downloads.search(query);
    let ongoing_list = []

    // get items whose downloads have not been completed
    down_list.forEach(item => {
        if(item.state === "in_progress") {
            ongoing_list.push(item);
        }
    });

    // store the list containing currently downloading items into storage
    await browser.storage.local.set({ongoing_list});
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

/* Function to cancel download */
async function cancelDownload(id) {
    let cancelling = browser.downloads.cancel(id);

    console.log(cancelling);
}