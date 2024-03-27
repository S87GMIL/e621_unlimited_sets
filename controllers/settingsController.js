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
        downloadButton.innerText = "Download Sets";
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
        uploadHint.innerText = "Upload a JSON file containing offline sets";
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

        return;

        formElement.appendChild(document.createElement("br"));
        formElement.appendChild(document.createElement("br"));

        const inputElements = [
            { type: 'input', id: 'repoUrl', value: "", label: 'Repository URL' },
            { type: 'input', id: 'accessToken', value: "", label: 'Git Access Token' }
        ];

        inputElements.forEach(input => {
            const inputDiv = document.createElement('div');
            inputDiv.className = "input string optional";
            formElement.appendChild(inputDiv);

            if (input.label) {
                const labelElement = document.createElement('label');
                labelElement.className = `${input.type} optional`;
                labelElement.htmlFor = input.id;
                labelElement.textContent = input.label;
                inputDiv.appendChild(labelElement);
            }

            const inputElement = document.createElement(input.type);

            if (input.type !== "textarea")
                inputElement.type = input.type;

            inputElement.name = input.name;
            inputElement.id = input.id;
            inputElement.value = input.value || '';

            inputDiv.appendChild(inputElement);
        });

        const submitButton = document.createElement("button");
        submitButton.innerText = "Apply Git Settings";
        submitButton.className = "btn";
        submitButton.style.marginRight = "15px"
        submitButton.style.padding = "3px 8px";
        submitButton.addEventListener("click", this.onSaveSettingsPress.bind(this));
        formElement.appendChild(submitButton);

        const gitHint = document.createElement("p");
        gitHint.style.marginTop = "5px";
        gitHint.className = "hint";
        gitHint.innerText = `These GitHub settings will be used to automatically backup your sets to the define GitHub repository, make sure, that you choose an empty repositry that isn't used for anything else.
        The repository URL as well as your access token will only be saved locally in your browser.`;
        formElement.appendChild(gitHint);
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
                if (setMetaData.posts.length > 0)
                    setMetaData.posts = await ApiHelper.loadBulkPost(setMetaData.posts);

                this.#getSetStorageInstance().updateSetFromMetadata(setId, setMetaData);

                await this.#updateSetPosts(newSetMetaData, index + 1);
                resolve()
            } catch (error) {
                reject(error);
            }
        });
    }
}