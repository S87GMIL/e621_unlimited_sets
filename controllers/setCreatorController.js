class SetCreatorController extends SetBaseController {

    #getUserSetInstance() {
        if (!this._userSetsInstance)
            this._userSetsInstance = new UserSets(UserHelper.getCurrentUserId());

        return this._userSetsInstance;
    }

    _createUiElements() {
        const formContainer = document.querySelector("#a-new > div");
        const createCustomContainer = document.createElement("div");
        formContainer.appendChild(createCustomContainer);

        const label = document.createElement("p");
        label.innerText = "Create a custom 'offline' set";
        createCustomContainer.appendChild(label);

        const hint = document.createElement("p");
        hint.className = "hint";
        hint.innerText = `This feature should only be used if you have reached your set limit, and can't create new sets.
        As the name suggests, these sets are not saved on the server and are only saved locally in your browser, which means that without backups, they can get lost in case the user script storage is cleared or your hard drive fails.`;
        createCustomContainer.appendChild(hint);

        const creationButton = document.createElement("button");
        creationButton.innerText = "Create offline set";
        creationButton.addEventListener("click", this._onCreateOfflineSetClick.bind(this));
        createCustomContainer.appendChild(creationButton);

        this._errorStrip = document.createElement("p");
        this._errorStrip.style.marginTop = "10px";
        this._errorStrip.style.color = "red";
        createCustomContainer.appendChild(this._errorStrip);
    }

    _onCreateOfflineSetClick() {
        const labelInput = document.querySelector("#post_set_name");
        const idInput = document.querySelector("#post_set_shortname");
        const descriptionInput = document.querySelector("#post_set_description_for_");

        if (!this.#validateInput())
            return;

        try {
            const createdSet = this.#getUserSetInstance().createSet(idInput.value, labelInput.value, descriptionInput.value);
            this.#navigateToSet(createdSet.getId());
        } catch (error) {
            this._errorStrip.innerText = error.message;
        }
    }

    #validateInput() {
        const idInput = document.querySelector("#post_set_shortname");
        const nameInput = document.querySelector("#post_set_name");
        this._errorStrip.innerText = "";

        if (idInput.value.includes(" ")) {
            this._errorStrip.innerText = "The set short name can't contain any spaces!";
            return false;
        }

        if (!nameInput.value) {
            this._errorStrip.innerText = "The set set name can't be empty!";
            return false;
        }

        return true;
    }

    #navigateToSet(setId) {
        if (!setId)
            throw Error("No offline set ID was passed!");

        window.location.assign(`https://e621.net/custom_sets/${setId}`);
    }

}