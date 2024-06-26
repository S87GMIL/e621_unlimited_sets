class PostOverviewController {

    constructor() {
        this._postsReplaced = false;

        this.#attachModeChangeHandler();
        this.#handleSelectedMode();
    }

    #getUserSetInstance() {
        if (!this._userSets)
            this._userSets = new UserSets(UserHelper.getCurrentUserId());

        return this._userSets;
    }

    #attachModeChangeHandler() {
        const modeSelect = document.querySelector("#mode-box-mode");
        modeSelect.addEventListener("change", this.#handleSelectedMode.bind(this))
    }

    async #handleSelectedMode() {
        const modeDropdown = document.querySelector("#mode-box-mode");
        const selectedMode = modeDropdown.value;
        if (selectedMode === "view")
            return;

        if (!this._postsReplaced) {
            await this.#waitUntilPostsAreLoaded();
            this.#replacePostEventHandlers();
        }

        this.#displayCustomSets();
    }

    async #displayCustomSets() {
        const userSetDropdown = document.querySelector("#set-id");
        await this.#waitUntilSetsAreLoaded(userSetDropdown);

        const customSetGroup = document.createElement("optgroup");
        customSetGroup.label = "Offline Sets";
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

    #replacePostEventHandlers() {
        console.info("Replacing all posts with clones and a custom event handler");
        this._postsReplaced = true;

        const postContainer = document.querySelector("#posts-container");
        Array.from(postContainer.querySelectorAll("article")).forEach(postTile => {
            const postClone = postTile.cloneNode(true);
            const postLink = postClone.querySelector("a");

            postClone.dataset.originalUrl = postLink.href;
            postLink.href = "javascript: void(0)";

            postTile.replaceWith(postClone);
            postClone.addEventListener("click", this.#onPostClicked.bind(this));
        });
    }

    async #onPostClicked(event) {
        try {
            const setDropdown = document.querySelector("#set-id");
            const selectedMode = document.querySelector("#mode-box-mode").value;
            const selectedSetOption = setDropdown.options[setDropdown.selectedIndex];

            const postArticleElement = event.target.parentElement.parentElement.parentElement;
            const postId = postArticleElement.dataset.id;

            switch (selectedMode) {
                case "add-to-set":
                    if (selectedSetOption.dataset.isCustomSet) {
                        const customSet = this.#getUserSetInstance().getSet(setDropdown.value);
                        await customSet.addPost(postId);
                    } else {
                        await E6ApiHelper.addPostToSet(setDropdown.value, postId)
                    }

                    UIHelper.displaySuccessMessage(`The post '${postId}' has been added to the set '${selectedSetOption.innerText}'`);
                    break;
                case "remove-from-set":
                    if (selectedSetOption.dataset.isCustomSet) {
                        const customSet = this.#getUserSetInstance().getSet(setDropdown.value);
                        await customSet.removePost(postId);
                    } else {
                        await E6ApiHelper.removePostFromSet(setDropdown.value, postId);
                    }
                    //Posts can't safely be hidden, because the user might delete them from a different set and not the one dispalyed right now
                    //postArticleElement.style.display = "none";

                    UIHelper.displaySuccessMessage(`The post '${postId}' has been removed from the set '${selectedSetOption.innerText}'`);
                    break;
                case "view":
                    window.location.assign(postArticleElement.dataset.originalUrl);
                    break;
                case "edit":
                    //This required more work than I'm willing to invest right now, so I guess just reload and try again ...
                    window.location.reload();
                    break;
                case "add-fav":
                    await E6ApiHelper.addPostToFavorites(postId);
                    UIHelper.displaySuccessMessage(`The post '${postId}' has been added to your favorites`);
                    break;
                case "remove-fav":
                    await E6ApiHelper.removePostFromFavorites(postId);
                    UIHelper.displaySuccessMessage(`The post '${postId}' has been removed from your favorites`);
                    break;
            }
        } catch (error) {
            UIHelper.displayErrorMessage(error.message || error?.responseJSON?.message || "A service error occurred!");
        }
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

            if (setDropdown.options.length > 0 && setDropdown.options[0].innerText !== "Loading..." && setDropdown.children.length === 2) {
                resolve();
                return;
            }

            const oObserver = new MutationObserver(observerCallback);
            oObserver.observe(setDropdown, { attributes: true, childList: true, subtree: true });
        });
    }

    #waitUntilPostsAreLoaded() {
        return new Promise(resolve => {
            const observerCallback = function (mutationsList, observer) {
                mutationsList.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        if (mutation.target.children.length > 0 && mutation.target.children[0].tagName !== "P") {
                            oObserver.disconnect();
                            resolve()
                        }
                    }
                });
            };

            const postContainer = document.querySelector("#posts-container");
            if (postContainer.children.length > 0 && postContainer.children[0].tagName !== "P") {
                resolve();
                return;
            }

            const oObserver = new MutationObserver(observerCallback);
            oObserver.observe(postContainer, { attributes: true, childList: true, subtree: true });
        });
    }
}