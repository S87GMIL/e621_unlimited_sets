class PostController {

    constructor() {
        this.#attachAddToSetHandler();
    }

    #getUserSetInstance() {
        if (!this._userSets)
            this._userSets = new UserSets(UserHelper.getCurrentUserId());

        return this._userSets;
    }

    #getCurrentPostId() {
        return document.querySelector('meta[name="post-id"]').content;;
    }

    #attachAddToSetHandler() {
        const addToSetButton = document.querySelector("#set");
        addToSetButton.addEventListener("click", this.#onAddToSetBtnClick.bind(this));

        const confirmAddToSetBtn = document.querySelector("#add-to-set-submit");
        const confirmButtonClone = confirmAddToSetBtn.cloneNode(true);
        confirmAddToSetBtn.replaceWith(confirmButtonClone);

        confirmButtonClone.addEventListener("click", this.#onAddToSetConfirmBtnClick.bind(this));
    }

    async #onAddToSetBtnClick() {
        const userSetDropdown = document.querySelector("#add-to-set-id");
        await this.#waitUntilSetsAreLoaded(userSetDropdown);

        const customSetGroup = document.createElement("optgroup");
        customSetGroup.label = "Custom Sets";
        userSetDropdown.appendChild(customSetGroup);

        this.#getUserSetInstance()
            .getSets()
            .forEach(setInstance => {
                const setOptionElement = document.createElement("option");
                setOptionElement.value = setInstance.getId();
                setOptionElement.innerText = setInstance.getLabel();
                setOptionElement.dataset.isCustomSet = true;
                customSetGroup.appendChild(setOptionElement);
            });
    }

    #waitUntilSetsAreLoaded(setDropdown) {
        return new Promise(resolve => {
            const observerCallback = function (mutationsList, observer) {
                mutationsList.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        if (mutation.target.options[0].innerText !== "Loading...") {
                            oObserver.disconnect();
                            resolve()
                        }
                    }
                });
            };
            const oObserver = new MutationObserver(observerCallback);
            oObserver.observe(setDropdown, { attributes: true, childList: true, subtree: true });
        });
    }

    async #onAddToSetConfirmBtnClick() {
        try {
            const userSetDropdown = document.querySelector("#add-to-set-id");
            const selectedSet = userSetDropdown.options[userSetDropdown.selectedIndex];
            if (selectedSet.dataset.isCustomSet) {
                const customSet = this.#getUserSetInstance().getSet(userSetDropdown.value);
                await customSet.addPost(this.#getCurrentPostId());
            } else {
                await ApiHelper.addPostToSet(userSetDropdown.value, this.#getCurrentPostId());
            }

            UIHelper.displaySuccessMessage(`The current post has been added to the set '${selectedSet.innerText}'`);
        } catch (error) {
            UIHelper.displayErrorMessage(error.message);
        }
    }

}