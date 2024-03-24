class CustomSetStorage {
    CUSTOM_SET_KEY_PREFIX = "customSet_";
    DELETION_MODE = true;

    constructor(userId) {
        if (!userId)
            throw new Error("No user ID was passed!");

        this._userId = userId;
    }

    #createUsersetsKey() {
        return this.CUSTOM_SET_KEY_PREFIX + this._userId;
    }

    #getCustomSets() {
        if (!this._customSets)
            this._customSets = GM_getValue(this.#createUsersetsKey()) || {};

        return this._customSets;
    }

    #getSet(setId) {
        const customSet = this.#getCustomSets();
        if (!customSet[setId] || customSet[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        return customSet[setId];
    }

    #createPostMetadata(postId, postData) {
        if (!postId)
            throw Error("No post ID was passed!");

        return {
            postId: postId,
            createdOn: Date.now(),
            tags: postData.tags,
            preview: postData.preview,
            file: postData.file
        }
    }

    getUserSets() {
        const userSets = this.#getCustomSets();

        let setArray = [];
        Object.keys(userSets).map(setId => {
            if (!userSets[setId].deleted)
                setArray.push(userSets[setId]);
        });

        return setArray;
    }

    getUserSet(setId) {
        return this.#getSet(setId);
    }

    createSet(setId, label, description) {
        if (!setId)
            throw Error(`Nom set ID was passed!`);

        let customSets = this.#getCustomSets();
        if (customSets[setId] && (!this.DELETION_MODE && customSets[setId].deleted))
            throw Error(`A set with the ID '${setId}' already exists!`);

        if (!label)
            throw Error("No set label was passed!");

        customSets[setId] = {
            setId: setId,
            label: label,
            description: description,
            createdOn: Date.now(),
            changedOn: Date.now(),
            posts: []
        };

        GM_setValue(this.#createUsersetsKey(), customSets);

        return customSets[setId];
    }

    deleteSet(setId) {
        let customSets = this.#getCustomSets();
        if (!customSets[setId])
            throw Error(`No set with the ID '${setId}' exists!`);

        if (!this.DELETION_MODE) {
            customSets[setId].deleted = true;
            customSets[setId].deletedOn = Date.now();
        } else {
            delete customSets[setId];
        }

        GM_setValue(this.#createUsersetsKey(), customSets);
    }

    async addPostToSet(setId, postId) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        if (this.isPostAlreadyInSet(setId, postId))
            throw Error(`The post '${postId}' has already been added to set '${customSets[setId].label}'`)

        const postData = await ApiHelper.getPost(postId);
        const createdPost = await this.#createPostMetadata(postId, postData);
        customSets[setId].posts.push(createdPost);
        customSets[setId].changedOn = Date.now();

        GM_setValue(this.#createUsersetsKey(), customSets);

        return createdPost;
    }

    updatePosts(setId, updatedPosts) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        customSets[setId].posts = [];

        updatedPosts.forEach(async postData => {
            const createdPost = this.#createPostMetadata(postData.id, postData);

            if (this.isPostAlreadyInSet(setId, postData.id))
                throw Error(`The post '${postData.id}' has already been added to set '${customSets[setId].label}'`)

            customSets[setId].posts.push(createdPost);
        })

        customSets[setId].changedOn = Date.now();
        GM_setValue(this.#createUsersetsKey(), customSets);
    }

    removePostFromSet(setId, postId) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        customSets[setId].posts = customSets[setId].posts.filter(post => post.postId !== postId);
        customSets[setId].changedOn = Date.now();

        GM_setValue(this.#createUsersetsKey(), customSets);
    }

    isPostAlreadyInSet(setId, postId) {
        return this.#getSet(setId).posts.some(post => post.postId === postId);
    }

    doesSetAlreadyExist(setId) {
        return !!this.#getCustomSets()[setId];
    }

    hasSetBeenDeleted(setId) {
        return !!this.#getSet(setId).deleted;
    }

}