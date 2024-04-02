class PostController {

    constructor() {
        this.#attachAddToSetHandler();
        this.#displayPostSets();
    }

    #getSetNavBar() {
        const setNavBar = document.querySelector("#nav-links-top > div.set-nav");
        if (setNavBar)
            return setNavBar;

        const customNavBar = document.createElement("div");
        customNavBar.className = "set-nav";
        document.querySelector("#nav-links-top").appendChild(customNavBar);

        return customNavBar;
    }

    #displayPostSets() {
        const queriedSetId = new URLSearchParams(document.location.search).get("custom_set_id");

        const sets = new UserSets(UserHelper.getCurrentUserId()).getSetsOfPost(this.#getCurrentPostId());
        if (sets.length === 0)
            return;

        const setNavBar = this.#getSetNavBar();
        sets.forEach(setInstance => {
            const setNavElement = this.#createSetNavElement(setInstance);

            if (queriedSetId === setInstance.getId()) {
                setNavBar.insertBefore(setNavElement, setNavBar.firstChild);
            } else {
                setNavBar.appendChild(setNavElement);
            }
        });
    }

    #createSetNavElement(setInstance) {
        const ulElement = document.createElement('ul');

        const liElement = document.createElement('li');
        liElement.className = 'set-selected-false';

        const currentPostIndex = setInstance.getPostIndexInSet(this.#getCurrentPostId());

        let firstAnchor = document.createElement('a');
        if (currentPostIndex === 0) {
            firstAnchor = document.createElement('span');
        } else {
            firstAnchor = document.createElement('a');
            firstAnchor.href = `/posts/${setInstance.getPostByIndex(0).postId}?custom_set_id=${setInstance.getId()}`;
        }
        firstAnchor.className = 'first';
        firstAnchor.title = 'to first';
        firstAnchor.textContent = '« first';
        liElement.appendChild(firstAnchor);

        let prevAnchor;
        if (currentPostIndex === -1 || currentPostIndex === 0) {
            prevAnchor = document.createElement('span');
        } else {
            prevAnchor = document.createElement('a');
            prevAnchor.href = `/posts/${setInstance.getPostByIndex(currentPostIndex - 1).postId}?custom_set_id=${setInstance.getId()}`;
        }
        prevAnchor.className = 'prev';
        prevAnchor.textContent = '‹ prev';
        liElement.appendChild(prevAnchor);

        const spanElement = document.createElement('span');
        spanElement.className = 'set-name';

        const setNameAnchor = document.createElement('a');
        setNameAnchor.href = `/custom_sets/${setInstance.getId()}`;
        setNameAnchor.textContent = `Set: ${setInstance.getLabel()}`;
        spanElement.appendChild(setNameAnchor);

        liElement.appendChild(spanElement);

        let nextAnchor;
        const totalPostCount = setInstance.getPostCount();
        if (currentPostIndex + 1 < totalPostCount) {
            nextAnchor = document.createElement('a');
            nextAnchor.href = `/posts/${setInstance.getPostByIndex(currentPostIndex + 1).postId}?custom_set_id=${setInstance.getId()}`;
        } else {
            nextAnchor = document.createElement('span');
        }
        nextAnchor.className = 'next';
        nextAnchor.textContent = 'next ›';
        liElement.appendChild(nextAnchor);

        let lastAnchor = document.createElement('a');
        if (currentPostIndex === totalPostCount - 1) {
            lastAnchor = document.createElement('span');
        } else {
            lastAnchor = document.createElement('a');
            lastAnchor.href = `/posts/${setInstance.getPostByIndex(totalPostCount - 1).postId}?custom_set_id=${setInstance.getId()}`;
        }
        lastAnchor.className = 'last';
        lastAnchor.title = 'to last';
        lastAnchor.textContent = 'last »';
        liElement.appendChild(lastAnchor);

        ulElement.appendChild(liElement);
        return liElement;
    }

    #getUserSetInstance() {
        if (!this._userSets)
            this._userSets = new UserSets(UserHelper.getCurrentUserId());

        return this._userSets;
    }

    #getCurrentPostId() {
        return Number(document.querySelector('meta[name="post-id"]').content);
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

    #waitUntilSetsAreLoaded(setDropdown) {
        return new Promise(resolve => {
            const observerCallback = function (mutationsList, observer) {
                mutationsList.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        if (mutation.target.options?.[0].innerText !== "Loading...") {
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
            const postId = this.#getCurrentPostId();

            if (selectedSet.dataset.isCustomSet) {
                const customSet = this.#getUserSetInstance().getSet(userSetDropdown.value);
                await customSet.addPost(postId);
            } else {
                await E6ApiHelper.addPostToSet(userSetDropdown.value, postId);
            }

            UIHelper.displaySuccessMessage(`The post '${postId}' has been added to the set '${selectedSet.innerText}'`);

            //Close the dialog by simply clicking on the close button
            document.querySelector("#ui-id-5").parentElement.querySelector("button").click()
        } catch (error) {
            UIHelper.displayErrorMessage(error.message);
        }
    }

}