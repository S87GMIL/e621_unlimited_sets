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

        this._createFileBackupSection(formElement);
        this._createBackupReminderSection(formElement);
        this._createGitSettingSection(formElement);
    }

    _createFileBackupSection(parentContainer) {
        const fileBackupSection = document.createElement("div");
        parentContainer.appendChild(fileBackupSection);

        const fileBackupTitle = document.createElement("h2");
        fileBackupTitle.innerText = "File Backup";
        fileBackupSection.appendChild(fileBackupTitle);

        fileBackupSection.appendChild(document.createElement("br"));

        const downloadButton = document.createElement("button");
        downloadButton.innerText = "Backup Sets";
        downloadButton.className = "btn";
        downloadButton.style.padding = "3px 8px";
        downloadButton.addEventListener("click", this.onDownloadPress.bind(this));
        fileBackupSection.appendChild(downloadButton);

        const downloadHint = document.createElement("p");
        downloadHint.style.marginTop = "5px";
        downloadHint.className = "hint";
        downloadHint.innerText = "Downloads all defined offline sets for the currently logged in user";
        fileBackupSection.appendChild(downloadHint);

        const uploadDiv = document.createElement("div");
        uploadDiv.style.display = "flex";
        fileBackupSection.appendChild(uploadDiv);

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
        fileBackupSection.appendChild(uploadHint);

        const applySetDataButton = document.createElement("button");
        const applyHint = document.createElement("p");
        fileUploader.addEventListener("change", async () => {
            progressBar.style.display = "inline";
            applySetDataButton.style.display = "block";
            applyHint.style.display = "block";
            uploadHint.style.display = "none";

            const uploadedFileString = await this.#loadFile(fileUploader.files[0], progressBar);
            try {
                this._uploadedFile = JSON.parse(uploadedFileString);
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
        fileBackupSection.appendChild(applySetDataButton);

        applyHint.style.display = "none";
        applyHint.style.marginTop = "5px";
        applyHint.className = "hint";
        applyHint.innerText = "This will overwrite all offline sets of the current user with the sets defined in the uploaded file";
        fileBackupSection.appendChild(applyHint);
    }

    _createBackupReminderSection(parentContainer) {
        const backupSettingsDiv = document.createElement("div");
        backupSettingsDiv.style.marginTop = "40px";
        parentContainer.appendChild(backupSettingsDiv);

        const backupSettingsTitle = document.createElement("h2");
        backupSettingsTitle.innerText = "Backup Settings";
        backupSettingsDiv.appendChild(backupSettingsTitle);

        backupSettingsDiv.appendChild(document.createElement("br"));

        const reminderHelperInstance = new BackupReminderHelper(UserHelper.getCurrentUserId());
        const reminderDisabled = reminderHelperInstance.getReminderDisabled();

        const reminderPeriodInput = document.createElement("input");

        const disableReminderLabel = document.createElement("label");
        disableReminderLabel.className = "string optional";
        disableReminderLabel.innerText = "Disable backup reminder";
        backupSettingsDiv.appendChild(disableReminderLabel);

        const disableReminderCheckbox = document.createElement("input");
        disableReminderCheckbox.type = "checkbox";
        disableReminderCheckbox.checked = reminderDisabled;
        disableReminderCheckbox.id = "disableReminderCheckbox";
        disableReminderCheckbox.style.marginLeft = "8px";
        disableReminderCheckbox.addEventListener("change", () => reminderPeriodInput.disabled = disableReminderCheckbox.checked)
        backupSettingsDiv.appendChild(disableReminderCheckbox);

        const disableReminderHint = document.createElement("p");
        disableReminderHint.style.marginTop = "5px";
        disableReminderHint.className = "hint";
        disableReminderHint.innerText = "Prevents the backup reminder from showing up entirely";
        backupSettingsDiv.appendChild(disableReminderHint);

        const reminderPeriodLabel = document.createElement("label");
        reminderPeriodLabel.className = "string optional";
        reminderPeriodLabel.innerText = "Disable backup reminder (Days)";
        reminderPeriodLabel.style.display = "block";
        reminderPeriodLabel.style.marginTop = "15px";
        backupSettingsDiv.appendChild(reminderPeriodLabel);

        reminderPeriodInput.type = "number";
        reminderPeriodInput.id = "reminderPeriodInput";
        reminderPeriodInput.value = reminderHelperInstance.getReminderPeriod();
        reminderPeriodInput.disabled = reminderDisabled;
        backupSettingsDiv.appendChild(reminderPeriodInput);

        const periodHint = document.createElement("p");
        periodHint.style.marginTop = "5px";
        periodHint.className = "hint";
        periodHint.innerText = "The period after which a reminder will be shown, in case no backup has been made since";
        backupSettingsDiv.appendChild(periodHint);

        const saveButton = document.createElement("button");
        saveButton.innerText = "Save Backup Settings"
        saveButton.className = "btn";
        saveButton.style.padding = "2px 6px";
        saveButton.addEventListener("click", event => {
            event.preventDefault();
            this._saveReminderSettings(reminderHelperInstance, reminderPeriodInput.value, disableReminderCheckbox.checked)
        });
        backupSettingsDiv.appendChild(saveButton);
    }

    _createGitSettingSection(parentContainer) {
        const gitRepoInstance = new GitRepository(UserHelper.getCurrentUserId());
        const gitBackupEnabled = gitRepoInstance.isGitBackupEnabled();

        const gitSettingsSection = document.createElement("div");
        gitSettingsSection.style.marginTop = "40px";

        const gitBackupTitle = document.createElement("h2");
        gitBackupTitle.innerText = "Git Backup";
        gitSettingsSection.appendChild(gitBackupTitle);

        gitSettingsSection.appendChild(document.createElement("br"));

        const disableGitLabel = document.createElement("label");
        disableGitLabel.className = "string optional";
        disableGitLabel.innerText = "Disable Git Backup";
        gitSettingsSection.appendChild(disableGitLabel);

        const inputElements = [
            { type: 'input', id: 'gitUsername', value: "", label: 'GitHub Username' },
            { type: 'input', id: 'repoName', value: "", label: 'Repository Name' },
            { type: 'input', id: 'gitBranchName', value: "", label: 'Branch Name' },
            { type: 'input', id: 'accessToken', value: "", label: 'Git Access Token' }
        ];

        const gitInputFieldDiv = document.createElement("div");

        const disableGitCheckbox = document.createElement("input");
        disableGitCheckbox.type = "checkbox";
        disableGitCheckbox.id = "gitBackupEnabledCheckbox";
        disableGitCheckbox.checked = !gitBackupEnabled;
        disableGitCheckbox.style.marginLeft = "8px";
        disableGitCheckbox.addEventListener("change", () => {
            gitInputFieldDiv.style.display = disableGitCheckbox.checked ? "none" : "block";
        });
        gitSettingsSection.appendChild(disableGitCheckbox);

        const disableGitHint = document.createElement("p");
        disableGitHint.style.marginTop = "5px";
        disableGitHint.className = "hint";
        disableGitHint.innerText = "When disabled, changes made to offline sets will not be backed up to GitHub and should be manually backed up after a certain period of time";
        gitSettingsSection.appendChild(disableGitHint);


        gitSettingsSection.appendChild(gitInputFieldDiv);
        gitInputFieldDiv.style.display = gitBackupEnabled ? "block" : "none";

        inputElements.forEach(input => {
            const inputDiv = document.createElement('div');
            inputDiv.className = "input string optional";
            gitInputFieldDiv.appendChild(inputDiv);

            if (input.label) {
                const labelElement = document.createElement('label');
                labelElement.className = `${input.type} optional`;
                labelElement.htmlFor = input.id;
                labelElement.textContent = input.label;
                inputDiv.appendChild(labelElement);
            }

            const inputElement = document.createElement(input.type);

            inputElement.type = input.type;
            inputElement.name = input.name;
            inputElement.id = input.id;
            inputElement.value = input.value || '';

            if (inputElement.disabled !== undefined)
                inputElement.disabled = input.disabled

            inputDiv.appendChild(inputElement);
        });

        const submitButton = document.createElement("button");
        submitButton.innerText = "Apply Git Settings";
        submitButton.className = "btn";
        submitButton.style.marginRight = "15px"
        submitButton.style.padding = "3px 8px";
        submitButton.addEventListener("click", event => {
            event.preventDefault();
            this.onSaveGitSettingsPress(gitRepoInstance);
        });
        gitSettingsSection.appendChild(submitButton);

        const gitHint = document.createElement("p");
        gitHint.style.marginTop = "5px";
        gitHint.className = "hint";
        gitHint.innerText = `These GitHub settings will be used to automatically backup your sets to the define GitHub repository, make sure, that you choose an empty repository that isn't used for anything else.
        Your username as well as your access token will only be saved locally in your browser.`;
        gitSettingsSection.appendChild(gitHint);

        parentContainer.appendChild(gitSettingsSection);
    }

    #loadFile(uploadedFile, progressBar) {
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
            reader.readAsBinaryString(uploadedFile);
        });
    }

    #getUserSets() {
        if (!this._userSetInstance)
            this._userSetInstance = new UserSets(UserHelper.getCurrentUserId());

        return this._userSetInstance;
    }

    #getSetStorageInstance() {
        if (!this._setStorageInstance)
            this._setStorageInstance = new CustomSetStorage(UserHelper.getCurrentUserId());

        return this._setStorageInstance;
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
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", setDataString);

        const date = new Date();
        const currentDateString = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;

        downloadAnchor.setAttribute("download", `offline_sets_${UserHelper.getCurrentUserId()}_${currentDateString}.json`);
        downloadAnchor.click();

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
                throw Error(`The set '${setId}' has an invalid internal structure!`);
        });
    }

    async onApplyUploadedClick(event) {
        event.preventDefault();
        const button = event.target;
        const originalButtonText = button.innerText;

        const setFile = this._uploadedFile;
        if (!this._uploadedFile) {
            UIHelper.displayErrorMessage("No file has been uploaded!");
            return;
        }

        button.innerText = "Loading ...";

        try {
            const userSetInstance = this.#getUserSets();
            this.#validateSetFile(this._uploadedFile);

            const overwrittenSetCount = Object.keys(setFile).filter(setId => userSetInstance.hasSet(setId)).length;
            const newSetCount = Object.keys(setFile).filter(setId => !userSetInstance.hasSet(setId)).length;

            if (!overwrittenSetCount && !newSetCount) {
                UIHelper.displayErrorMessage("The uploaded file doesn't contain any sets!");
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

    _saveReminderSettings(reminderHelper, reminderPeriod, disableReminder) {
        reminderHelper.setReminderPeriod(reminderPeriod);
        reminderHelper.setReminderDisabled(disableReminder);

        UIHelper.displaySuccessMessage("Reminder settings saved!");
    }

    onSaveGitSettingsPress(gitRepoInstance) {
        const gitBackupEnabled = !document.getElementById("gitBackupEnabledCheckbox").checked;

        const gitRepoName = document.getElementById("repoName").value;
        const gitUsername = document.getElementById("gitUsername").value;
        const gitAccessToken = document.getElementById("accessToken").value;
        const branchName = document.getElementById("gitBranchName").value;

        if (gitBackupEnabled && (!gitRepoName || !gitUsername || !gitAccessToken)) {
            UIHelper.displayErrorMessage("Not all required GitHub settings have been filled out!");
            return;
        }

        gitRepoInstance.setGitBackupEnabled(gitBackupEnabled);

        if (gitBackupEnabled) {
            gitRepoInstance.setUsername(gitUsername);
            gitRepoInstance.setAccessToken(gitAccessToken);
            gitRepoInstance.setRepositoryName(gitRepoName);
            gitRepoInstance.setBranchName(branchName);
        }

        UIHelper.displaySuccessMessage("GitHub settings saved!");
    }
}