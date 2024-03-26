class SetPostViewerController {

    constructor() {
        this.#displayPosts();
        UIHelper.substituteE6Image();
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

    #getCustomSet() {
        const filters = document.querySelector("#tags").value.split(" ");
        const customsetIds = [];
        filters.map(tag => {
            if (tag.startsWith("custom_set:"))
                customsetIds.push(tag.substring(11, tag.length));
        });

        if (customsetIds.length === 0)
            return;

        const setInstance = this.#getUserSetInstance().getSet(customsetIds[0]);
        if (!setInstance)
            UIHelper.displayErrorMessage(`No offline set found with the ID '${customsetIds[0]}'!`);

        return setInstance;
    }

    async #displayPosts() {
        const customSet = this.#getCustomSet();
        if (!customSet) {
            console.info("No custom set was queried");
            return;
        }

        const postsContainer = document.querySelector("#posts-container");
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
        postContainer.className = "post-preview post-status-has-parent post-rating-explicit";

        const postLink = document.createElement("a");
        postLink.href = `/posts/${post.postId}`;
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

        const pageMenu = document.querySelector("#posts > div.paginator > menu");
        pageMenu.innerHTML = "";

        const leftArrow = document.createElement("li");
        pageMenu.appendChild(leftArrow);
        const leftArrowLink = document.createElement("a");
        urlSearchParams.set("page", currentPage > 1 ? currentPage - 1 : 1);
        leftArrowLink.href = `${document.location.pathname}?${urlSearchParams.toString()}`;
        const leftArrowIcon = document.createElement("i");
        leftArrowIcon.className = "fa-solid fa-chevron-left";
        leftArrow.appendChild(leftArrowLink);
        leftArrowLink.appendChild(leftArrowIcon);

        for (let page = 0; page < pageAmount; page++) {

            const pageNumber = document.createElement("li");

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

        const rightArrow = document.createElement("li");
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
        //TODO: Implement a more advanced filter logic to filter the custom set posts!

        let posts = setInstance.getPosts();
        const filteredTags = document.querySelector("#tags").value.split(" ").filter(tag => tag !== `custom_set:${setInstance.getId()}` && !!tag);

        if (filteredTags.length === 0)
            return posts;

        let setPostIdArrays = [];

        filteredTags
            .filter(tag => tag.startsWith("custom_set:"))
            .forEach(customSetTag => {
                const customsetId = customSetTag.split(":").pop();
                const setInstance = this.#getUserSetInstance().getSet(customsetId);
                if (!setInstance)
                    UIHelper.displayErrorMessage(`No offline set found with the ID '${customsetId}'!`);

                if (setInstance?.getPostAmount() > 0)
                    setPostIdArrays[setPostIdArrays.length] = setInstance.getPosts().map(post => post.postId);
            });

        if (setPostIdArrays.length > 0) {
            const commonPostIds = this.#findCommonSetPosts(setPostIdArrays, posts.map(post => post.postId));
            posts = posts.filter(post => commonPostIds.includes(post.postId));
        }

        const simpleFiltertagArray = filteredTags.filter(tag => !tag.startsWith("custom_set:"));
        if (simpleFiltertagArray.length === 0)
            return posts;

        return posts.filter(post => {
            const tags = post.tags;
            const postTags = [...tags.general, ...tags.artist, ...tags.copyright, ...tags.character, ...tags.species, ...tags.meta, ...tags.lore];
            return postTags.includes(...simpleFiltertagArray);
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