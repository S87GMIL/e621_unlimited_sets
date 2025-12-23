class SetPostViewerController {

    constructor() {
        this.#displayPosts();
        UIHelper.substituteE6Image();
        this.#filterUnsupportedModes();
    }

    #filterUnsupportedModes() {
        const modeSelect = document.querySelector("#mode-box-mode");
        Array.from(modeSelect.options).forEach(option => {
            if (option.value === "edit") {
                option.style.display = "none";

                if (modeSelect.value === option.value) {
                    modeSelect.value = "view";
                    modeSelect.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    async #getUser() {
        if (!this._userInstance)
            this._userInstance = await UserHelper.getUserInstance(UserHelper.getCurrentUserId());

        return this._userInstance;
    }

    #getCurrentPage() {
        return Number(new URLSearchParams(window.location.search).get('page') || 1);
    }

    #getUserSetInstance() {
        if (!this._userSetInstance)
            this._userSetInstance = new UserSets(UserHelper.getCurrentUserId());

        return this._userSetInstance;
    }

    #getCustomSetIDs() {
        const filters = document.querySelector("#tags").value.split(" ");

        let customSetIds = [];
        filters.forEach(tag => {
            if (tag.startsWith("custom_set:"))
                customSetIds.push(tag.substring(11, tag.length));
        });

        return customSetIds;
    }

    #getCustomSet() {
        const customSetIDs = this.#getCustomSetIDs();
        if (customSetIDs.length === 0)
            return;

        const setInstance = this.#getUserSetInstance().getSet(customSetIDs[0]);
        if (!setInstance)
            UIHelper.displayErrorMessage(`No offline set found with the ID '${customSetIDs[0]}'!`);

        return setInstance;
    }

    async #displayPosts() {
        const customSet = this.#getCustomSet();
        if (!customSet) {
            console.info("No offline set was queried");
            return;
        }

        const postsContainer = document.getElementById("posts").getElementsByClassName("posts-container")[0];
        postsContainer.innerHTML = "";

        const userInstance = await this.#getUser();
        const currentPage = this.#getCurrentPage();
        const postsPerPage = userInstance.getPostsPerPage();

        const filteredPosts = this.#filterPosts(customSet);
        const pagePosts = filteredPosts.slice((currentPage - 1) * postsPerPage, (currentPage * postsPerPage + postsPerPage) - 1);

        this.#displayPages(Math.ceil(filteredPosts.length / postsPerPage) || 1, currentPage);
        pagePosts.forEach(post => postsContainer.appendChild(this.#createPostItem(post)));
    }

    #createPostItem(post) {
        const postContainer = document.createElement("article");
        postContainer.dataset.id = post.postId;
        postContainer.className = "thumbnail rating-explicit";
        postContainer.dataset.fileUrl = post.file.url;
        postContainer.dataset.sampleUrl = post.preview.url;
        postContainer.dataset.previewUrl = post.preview.url;
        postContainer.dataset.previewWidth = "256";
        postContainer.dataset.previewHeight = "309";

        const postLink = document.createElement("a");
        postLink.className = "thm-link";
        const customSetQueryString = this.#getCustomSetIDs().map(setId => `custom_set:${setId}`).join("+");
        postLink.href = `/posts/${post.postId}?q=${customSetQueryString}`;
        postContainer.appendChild(postLink);

        const pictureContainer = document.createElement("picture");
        postLink.appendChild(pictureContainer);

        const postPreview = document.createElement("img");
        postPreview.src = post.preview.url;
        postPreview.className = "has-cropped-true";
        pictureContainer.appendChild(postPreview);

        return postContainer;
    }

    #displayPages(pageAmount, currentPage) {
        const urlSearchParams = new URLSearchParams(document.location.search);

        const pageMenu = document.querySelector("#posts > nav");
        pageMenu.innerHTML = "";

        const leftArrow = document.createElement("span");
        pageMenu.appendChild(leftArrow);
        const leftArrowLink = document.createElement("a");
        urlSearchParams.set("page", currentPage > 1 ? currentPage - 1 : 1);
        leftArrowLink.href = `${document.location.pathname}?${urlSearchParams.toString()}`;
        const leftArrowIcon = document.createElement("i");
        leftArrowIcon.className = "fa-solid fa-chevron-left";
        leftArrow.appendChild(leftArrowLink);
        leftArrowLink.appendChild(leftArrowIcon);

        for (let page = 0; page < pageAmount; page++) {

            const pageNumber = document.createElement("span");

            if (page + 1 === currentPage) {
                pageNumber.className = "current-page";

                const pageNumberSpan = document.createElement("span");
                pageNumberSpan.innerText = page + 1;
                pageNumber.appendChild(pageNumberSpan);
            } else {
                pageNumber.className = "numbered-page";

                const pageLink = document.createElement("a");
                urlSearchParams.set("page", page + 1);
                pageLink.href = `${document.location.pathname}?${urlSearchParams.toString()}`;
                pageLink.innerText = page + 1;
                pageNumber.appendChild(pageLink);
            }

            pageMenu.appendChild(pageNumber);
        }

        const rightArrow = document.createElement("span");
        pageMenu.appendChild(rightArrow);
        const rightArrowLink = document.createElement("a");
        urlSearchParams.set("page", currentPage < pageAmount ? currentPage + 1 : currentPage);
        rightArrowLink.href = `${document.location.pathname}?${urlSearchParams.toString()}`;
        const rightArrowIcon = document.createElement("i");
        rightArrowIcon.className = "fa-solid fa-chevron-right";
        rightArrow.appendChild(rightArrowLink);
        rightArrowLink.appendChild(rightArrowIcon);
    }

    #filterPosts(setInstance) {
        let posts = setInstance.getPosts();
        const filteredTags = document.querySelector("#tags").value.split(" ").filter(tag => tag !== `custom_set:${setInstance.getId()}` && !!tag);

        if (filteredTags.length === 0)
            return posts;

        let setPostIdArrays = [];

        filteredTags
            .filter(tag => tag.startsWith("custom_set:"))
            .forEach(customSetTag => {
                const customSetId = customSetTag.split(":").pop();
                const setInstance = this.#getUserSetInstance().getSet(customSetId);
                if (!setInstance)
                    UIHelper.displayErrorMessage(`No offline set found with the ID '${customSetId}'!`);

                if (setInstance?.getPostAmount() > 0)
                    setPostIdArrays[setPostIdArrays.length] = setInstance.getPosts().map(post => post.postId);
            });

        if (setPostIdArrays.length > 0) {
            const commonPostIds = this.#findCommonSetPosts(setPostIdArrays, posts.map(post => post.postId));
            posts = posts.filter(post => commonPostIds.includes(post.postId));
        }

        const mustIncludeTags = filteredTags.filter(tag => !tag.startsWith("custom_set:") && !tag.startsWith("-"));

        let negativeTags = [];
        filteredTags.forEach(tag => {
            if (!tag.startsWith("custom_set:") && tag.startsWith("-"))
                negativeTags.push(tag.substring(1));
        });


        if (mustIncludeTags.length === 0 && negativeTags.length === 0)
            return posts;

        return posts.filter(post => {
            const tags = post.tags;
            const postTags = [...tags.general, ...tags.artist, ...tags.copyright, ...tags.character, ...tags.species, ...tags.meta, ...tags.lore];

            let display = true;
            if (!mustIncludeTags.every(tag => postTags.includes(tag)))
                display = false;

            if (postTags.includes(...negativeTags))
                display = false;

            return display;
        });
    }

    #findCommonSetPosts(postIdArrays, originalPosts) {
        const commonPostIds = new Set(originalPosts);

        for (let index = 0; index < postIdArrays.length; index++) {
            const currentArray = postIdArrays[index];
            commonPostIds.forEach(postId => {
                if (!currentArray.includes(postId)) {
                    commonPostIds.delete(postId);
                }
            });
        }

        return Array.from(commonPostIds);
    }
}