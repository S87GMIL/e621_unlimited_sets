class SettingsController extends SetBaseController {

    _createUiElements() {
        this._clearMainPage();

        document.title = `S87's offline sets - settings - e621`;

        const title = document.createElement("h2");
        title.innerText = `S87's offline sets - Settings`;
        this._getMainPageElement().appendChild(title);

        const sectionElement = document.createElement('div');
        sectionElement.className = 'section';
        this._getMainPageElement().appendChild(sectionElement);

        const formElement = document.createElement('form');
        formElement.className = 'simple_form';
        formElement.noValidate = true;
        sectionElement.appendChild(formElement);

        const downloadButton = document.createElement("button");
        downloadButton.innerText = "Backup Sets";
        downloadButton.className = "btn";
        downloadButton.style.padding = "3px 8px";
        downloadButton.addEventListener("click", this.onDownloadPress.bind(this));
        formElement.appendChild(downloadButton);

        const downloadHint = document.createElement("p");
        downloadHint.style.marginTop = "5px";
        downloadHint.className = "hint";
        downloadHint.innerText = "Downloads all defined offline sets for the currently logged in user";
        formElement.appendChild(downloadHint);

        formElement.appendChild(document.createElement("br"));

        const uploadDiv = document.createElement("div");
        uploadDiv.style.display = "flex";
        formElement.appendChild(uploadDiv);

        const fileUploader = document.createElement("input");
        fileUploader.type = "file";
        fileUploader.accept = ".json";
        uploadDiv.appendChild(fileUploader);

        const progressBar = document.createElement("progress");
        progressBar.style.display = "none";
        progressBar.style.width = "240px";
        progressBar.max = 100;
        progressBar.value = 0;
        progressBar.innerText = "0%";
        uploadDiv.appendChild(progressBar);

        const uploadHint = document.createElement("p");
        uploadHint.style.marginTop = "5px";
        uploadHint.className = "hint";
        uploadHint.innerText = "Upload a JSON backup file containing offline sets";
        formElement.appendChild(uploadHint);

        const applySetDataButton = document.createElement("button");
        const applyHint = document.createElement("p");
        fileUploader.addEventListener("change", async () => {
            progressBar.style.display = "inline";
            applySetDataButton.style.display = "block";
            applyHint.style.display = "block";
            uploadHint.style.display = "none";

            const uploadedFileString = await this.#loadFile(fileUploader.files[0], progressBar);
            try {
                this._uplaodedFile = JSON.parse(uploadedFileString);
            } catch (error) {
                UIHelper.displayErrorMessage("The uploaded file is not a valid JSON file or contains errors!");
                console.error(error);
            }
            progressBar.style.display = "none";
        });

        applySetDataButton.id = "applySetDataButton";
        applySetDataButton.style.marginTop = "10px";
        applySetDataButton.style.display = "none";
        applySetDataButton.innerText = "Apply Uploaded Sets";
        applySetDataButton.className = "btn";
        applySetDataButton.style.padding = "3px 8px";
        applySetDataButton.addEventListener("click", this.onApplyUploadedClick.bind(this));
        formElement.appendChild(applySetDataButton);

        applyHint.style.display = "none";
        applyHint.style.marginTop = "5px";
        applyHint.className = "hint";
        applyHint.innerText = "This will overwrite all offline sets of the current user with the sets defined in the uploaded file";
        formElement.appendChild(applyHint);

        const backupSettignsDiv = document.createElement("div");
        backupSettignsDiv.style.marginTop = "35px";
        formElement.appendChild(backupSettignsDiv);

        const backupSettingsTitle = document.createElement("h2");
        backupSettingsTitle.innerText = "Backup Settings";
        backupSettignsDiv.appendChild(backupSettingsTitle);

        backupSettignsDiv.appendChild(document.createElement("br"));

        const reminderHelperInstance = new BackupReminderHelper(UserHelper.getCurrentUserId());
        const reminderDisabled = reminderHelperInstance.getReminderDisabled();

        const reminderPeriodInput = document.createElement("input");

        const disableReminderLabel = document.createElement("label");
        disableReminderLabel.className = "string optional";
        disableReminderLabel.innerText = "Disable backup reminder";
        backupSettignsDiv.appendChild(disableReminderLabel);

        const disableReminderCheckbox = document.createElement("input");
        disableReminderCheckbox.type = "checkbox";
        disableReminderCheckbox.checked = reminderDisabled;
        disableReminderCheckbox.id = "disableReminderCheckbox";
        disableReminderCheckbox.style.marginLeft = "8px";
        disableReminderCheckbox.addEventListener("change", () => reminderPeriodInput.disabled = disableReminderCheckbox.checked)
        backupSettignsDiv.appendChild(disableReminderCheckbox);

        const disableReminderhint = document.createElement("p");
        disableReminderhint.style.marginTop = "5px";
        disableReminderhint.className = "hint";
        disableReminderhint.innerText = "Prevents the backup reminder from showing up entirely";
        backupSettignsDiv.appendChild(disableReminderhint);

        const reminderPeridoLabel = document.createElement("label");
        reminderPeridoLabel.className = "string optional";
        reminderPeridoLabel.innerText = "Disable backup reminder (Days)";
        reminderPeridoLabel.style.display = "block";
        reminderPeridoLabel.style.marginTop = "15px";
        backupSettignsDiv.appendChild(reminderPeridoLabel);

        reminderPeriodInput.type = "number";
        reminderPeriodInput.id = "reminderPeriodInput";
        reminderPeriodInput.value = reminderHelperInstance.getRemidnerPeriod();
        reminderPeriodInput.disabled = reminderDisabled;
        backupSettignsDiv.appendChild(reminderPeriodInput);

        const periodHint = document.createElement("p");
        periodHint.style.marginTop = "5px";
        periodHint.className = "hint";
        periodHint.innerText = "The period after which a reminder will be shown, in case no backup has been made since";
        backupSettignsDiv.appendChild(periodHint);

        backupSettignsDiv.appendChild(document.createElement("br"));

        const saveButton = document.createElement("button");
        saveButton.innerText = "Save Backup Settings"
        saveButton.className = "btn";
        saveButton.style.padding = "2px 6px";
        saveButton.addEventListener("click", event => {
            event.preventDefault();
            this._saveReminderSettings(reminderHelperInstance, reminderPeriodInput.value, disableReminderCheckbox.checked)
        });
        backupSettignsDiv.appendChild(saveButton);
    }

    #loadFile(uplaodedFile, progressBar) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            if (progressBar) reader.addEventListener("progress", event => {
                if (event.lengthComputable) {
                    const percentage = Math.round((event.loaded * 100) / event.total);

                    progressBar.value = percentage;
                    progressBar.innerText = percentage + "%";
                }
            }, false);

            reader.onload = evt => resolve(evt.target.result);
            reader.readAsBinaryString(uplaodedFile);
        });
    }

    #getUserSets() {
        if (!this._userSetInstance)
            this._userSetInstance = new UserSets(UserHelper.getCurrentUserId());

        return this._userSetInstance;
    }

    #getSetStorageInstance() {
        if (!this._setStoreageInstance)
            this._setStoreageInstance = new CustomSetStorage(UserHelper.getCurrentUserId());

        return this._setStoreageInstance;
    }

    onSaveSettingsPress() {
        event.preventDefault();
    }

    onDownloadPress(event) {
        event.preventDefault();

        const rawSetData = this.#getSetStorageInstance().getRawSetData();
        Object.keys(rawSetData).forEach(setId => {
            rawSetData[setId].posts = rawSetData[setId].posts.map(post => post.postId);
        });

        const setDataString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawSetData));
        const donwloadAnchor = document.createElement('a');
        donwloadAnchor.setAttribute("href", setDataString);

        const date = new Date();
        const currentDateString = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

        donwloadAnchor.setAttribute("download", `offline_sets_${UserHelper.getCurrentUserId()}_${currentDateString}.json`);
        donwloadAnchor.click();

        new BackupReminderHelper(UserHelper.getCurrentUserId()).setLastBackupDate(new Date());
    }

    #validateSetFile(setFile) {
        if (!setFile)
            throw Error("No set file data was passed!");

        Object.keys(setFile).forEach(setId => {
            const set = setFile[setId];
            if (typeof set !== 'object')
                throw Error(`set with ID '${setId}' does not contain a valid object!`);

            if (!set.setId || !set.label || !set.posts || !Array.isArray(set.posts))
                throw Error(`The set '${setId}' has an invbalid internal structure!`);
        });
    }

    async onApplyUploadedClick(event) {
        event.preventDefault();
        const button = event.target;
        const originalButtonText = button.innerText;

        const setFile = this._uplaodedFile;
        if (!this._uplaodedFile) {
            UIHelper.displayErrorMessage("No file has been uploaded!");
            return;
        }

        button.innerText = "Loading ...";

        try {
            const userSetInstance = this.#getUserSets();
            this.#validateSetFile(this._uplaodedFile);

            const overwrittenSetCount = Object.keys(setFile).filter(setId => userSetInstance.hasSet(setId)).length;
            const newSetCount = Object.keys(setFile).filter(setId => !userSetInstance.hasSet(setId)).length;

            if (!overwrittenSetCount && !newSetCount) {
                UIHelper.displayErrorMessage("The uplaoded file doesn't contain any sets!");
                return;
            }

            if (confirm(`Please confirm, that you want to replace '${overwrittenSetCount}' existing set${overwrittenSetCount > 1 ? 's' : ''}, and create '${newSetCount}' new set${newSetCount > 1 ? 's' : ''}`) !== true)
                return;

            Object.keys(setFile).forEach(setId => {
                const set = setFile[setId];

                if (!userSetInstance.hasSet(set.setId))
                    userSetInstance.createSet(set.setId, set.label, set.description);
            });

            await this.#updateSetPosts(setFile);

            UIHelper.displaySuccessMessage("Set file has successfully been loaded and applied!");
        } catch (error) {
            UIHelper.displayErrorMessage(error.message);
        }

        button.innerText = originalButtonText;
    }

    async #updateSetPosts(newSetMetaData, index = 0) {
        return new Promise(async (resolve, reject) => {
            try {
                const setId = Object.keys(newSetMetaData)[index];
                if (!setId) {
                    resolve();
                    return;
                }

                const setMetaData = newSetMetaData[setId];
                if (setMetaData.posts.length > 0) {
                    const loadedPosts = await E6ApiHelper.loadBulkPost(setMetaData.posts);
                    setMetaData.posts = loadedPosts.map(post => CustomSetStorage.createPostMetadata(post.id, post));
                }

                this.#getSetStorageInstance().updateSetFromMetadata(setId, setMetaData);

                await this.#updateSetPosts(newSetMetaData, index + 1);
                resolve()
            } catch (error) {
                reject(error);
            }
        });
    }

    _saveReminderSettings(reminderHelper, remidnerPeriod, disableReminder) {
        reminderHelper.setReminderPeriod(remidnerPeriod);
        reminderHelper.setReminderDisabled(disableReminder);

        UIHelper.displaySuccessMessage("Reminder settings saved!");
    }
}