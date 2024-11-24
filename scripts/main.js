/* Main Function that handles downloading of files and checking of internet connection */
async function main() {
    /* start the download */
    const id = await startDownload("https://ash-speed.hetzner.com/100MB.bin");  // temp url
    await browser.storage.local.set({"Download_Manager_download_id": id});
    console.log("Stored", id);
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
            console.log("Network Connection Failed");
            pause = true;
        } else {
            console.log("Network Online");
            pause = false;
        }

        /* pause flag indicates whether to pause or resume download */
        if(pause == true && downItem.paused != true) {
            pauseDownload(id);
        } else if(pause == false && downItem.paused == true) {
            resumeDownload(id);
        }

        /* Sleep for 1 second before resuming loop */
        await sleep(1000);
    }

    console.log("Download complete");
}