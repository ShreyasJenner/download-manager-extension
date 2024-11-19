/* Testing function to log in the console, the downloaded items */

/* wait for button click message to be sent */
browser.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "start_task") {
        console.log("Task started...");
        main(); // Start your long-running task
        return Promise.resolve({ status: "Task started" });
    }
});


/* Definition of sleep function */
const sleep = ms => new Promise(res => setTimeout(res, ms));

/* Function to download from the given url */
async function startDownload(downloadUrl) {

    let downloading = await browser.downloads.download(
        {
            url: downloadUrl,
            filename: "testdownload.zip",
            conflictAction: "uniquify"
        }
    )
    
    return await downloading;
}

/* Function to pause the download */
async function pauseDownload(downloadid) {
    let pausing = await browser.downloads.pause(downloadid)

    return await pausing;
}

/* Function to resume the download */
async function resumeDownload(downloadid) {
    let resuming = await browser.downloads.resume(downloadid);

    return await resuming;
}

/* Function to check for internet connection */
/* PROBLEM WITH THIS FUNCTION. DOES NOT RELIABLY GET NETWORK INFORMATION */
function checkNetworkConnection() {
    return window.navigator.onLine;
}

/* Main Function that handles downloading of files and checking of internet connection */
async function main() {
    /* start the download */
    const id = await startDownload("https://ash-speed.hetzner.com/100MB.bin");  // temp url
    var pause = false;
    
    /* query containting downloading item status */
    var downItem = await browser.downloads.search({id});

    /* while the download isn't complete */
    while(downItem[0].state != "complete") {
        console.log(downItem[0].state);

        /* get the downloaded item data again */
        downItem = await browser.downloads.search({id});

        /* If there is no network connection */
        if(checkNetworkConnection == false) {
            console.log("Netowork Connection Failed");
            pause = true;
        } else {
            console.log("Network Online");
            pause = false;
        }

        /* pause flag indicates whether to pause or resume download */
        if(pause == true && downItem.paused != true) {
            pauseDownload(id);
            console.log("Pausing download");
        } else if(pause == false && downItem.paused == true) {
            resumeDownload(id);
            console.log("Resuming Download");
        }

        /* Sleep for 1 second before resuming loop */
        await sleep(1000);
    }

    console.log("Download complete");
}