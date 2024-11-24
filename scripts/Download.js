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

    console.log("Pausing download");
    return await pausing;
}

/* Function to resume the download */
async function resumeDownload(downloadid) {
    let resuming = await browser.downloads.resume(downloadid);

    console.log("Resuming Download");
    return await resuming;
}
