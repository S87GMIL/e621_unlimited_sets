class CustomSetStorage {
    CUSTOM_SET_KEY_PREFIX = "customSet_";
    DELETION_MODE = true;

    constructor(userId) {
        if (!userId)
            throw new Error("No user ID was passed!");

        this._userId = userId;
        this._gitRepoInstance = new GitRepository(userId);

        this.#addGlobalWindowAPI();
    }

    #addGlobalWindowAPI() {
        if (!Window.S87OfflineSetAPI)
            Window.S87OfflineSetAPI = {
                getUserSets: this.getUserSets.bind(this),
                getUserSet: this.getUserSet.bind(this),
                addPostToSet: this.addPostToSet.bind(this)
            }
    }

    #createUserSetsKey() {
        return this.CUSTOM_SET_KEY_PREFIX + this._userId;
    }

    #getCustomSets() {
        return this._customSets = StorageHelper.getValue(this.#createUserSetsKey()) || {};
    }

    #getSet(setId) {
        const customSet = this.#getCustomSets();
        if (!customSet[setId] || customSet[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        return customSet[setId];
    }

    static createPostMetadata(postId, postData) {
        if (!postId)
            throw Error("No post ID was passed!");

        return {
            postId: Number(postId),
            createdOn: Date.now(),
            tags: postData.tags,
            preview: postData.preview,
            file: postData.file
        }
    }

    getRawSetData() {
        return this.#getCustomSets();
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

        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);
        this._gitRepoInstance.saveChangesToRepository(GitRepository.SET_CREATED_ACTION, label);

        return customSets[setId];
    }

    updateSetFromMetadata(setId, setMetadata) {
        if (!setId)
            throw Error("No set id was passed!");

        if (!setMetadata)
            throw Error("No set metadata was passed!");

        const customSets = this.#getCustomSets();
        if (!customSets[setId])
            throw Error(`No set with the ID '${setId}' exists!`);

        if (!setMetadata.setId || !setMetadata.label || !setMetadata.createdOn || !Array.isArray(setMetadata.posts))
            throw Error(`The passed set metadata for set '${setId}' is not valid!`);

        customSets[setId] = {
            setId: setMetadata.setId,
            label: setMetadata.label,
            description: setMetadata.description || "",
            createdOn: setMetadata.createdOn,
            changedOn: setMetadata.changedOn || Date.now(),
            posts: setMetadata.posts
        };

        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);

        return customSets[setId];
    }

    deleteSet(setId) {
        let customSets = this.#getCustomSets();
        if (!customSets[setId])
            throw Error(`No set with the ID '${setId}' exists!`);

        const setLabel = customSets[setId].label;

        if (!this.DELETION_MODE) {
            customSets[setId].deleted = true;
            customSets[setId].deletedOn = Date.now();
        } else {
            delete customSets[setId];
        }

        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);
        this._gitRepoInstance.saveChangesToRepository(GitRepository.SET_DELETED_ACTION, setLabel);
    }

    async addPostToSet(setId, postId) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        if (this.isPostAlreadyInSet(setId, postId))
            throw Error(`The post '${postId}' has already been added to set '${customSets[setId].label}'`)

        const postData = await E6ApiHelper.getPost(postId);
        const createdPost = CustomSetStorage.createPostMetadata(postId, postData);
        customSets[setId].posts.push(createdPost);
        customSets[setId].changedOn = Date.now();

        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);
        this._gitRepoInstance.saveChangesToRepository(GitRepository.POST_ADDED_ACTION, customSets[setId].label, [postId]);

        return createdPost;
    }

    updatePosts(setId, updatedPosts) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        customSets[setId].posts = [];

        updatedPosts.forEach(async postData => {
            customSets[setId].posts.push(CustomSetStorage.createPostMetadata(postData.id, postData));
        })

        customSets[setId].changedOn = Date.now();
        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);
        this._gitRepoInstance.saveChangesToRepository(GitRepository.SET_POSTS_UPDATED_ACTION, customSets[setId].label, customSets[setId].posts);
    }

    removePostFromSet(setId, postId) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        const filteredPosts = customSets[setId].posts.filter(post => post.postId !== Number(postId));

        if (filteredPosts.length === customSets[setId].posts.length)
            throw Error(`The set '${setId}' does not contain post '${postId}'!`);

        customSets[setId].posts = filteredPosts;
        customSets[setId].changedOn = Date.now();

        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);
        this._gitRepoInstance.saveChangesToRepository(GitRepository.POST_REMOVED_ACTION, customSets[setId].label, [postId]);
    }

    isPostAlreadyInSet(setId, postId) {
        return this.#getSet(setId).posts.some(post => post.postId === Number(postId));
    }

    doesSetAlreadyExist(setId) {
        return !!this.#getCustomSets()[setId];
    }

    hasSetBeenDeleted(setId) {
        return !!this.#getSet(setId).deleted;
    }

    changeSetLabel(setId, newLabel) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        const oldLabel = customSets[setId].label;
        customSets[setId].label = newLabel;
        customSets[setId].changedOn = Date.now();

        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);
    }

    changeSetDescription(setId, newDescription) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        customSets[setId].description = newDescription;
        customSets[setId].changedOn = Date.now();

        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);
    }

    changeSetId(setId, newId) {
        const customSets = this.#getCustomSets();
        if (!customSets[setId] || customSets[setId].deleted)
            throw Error(`No set with the ID '${setId}' exists!`);

        if (customSets[newId])
            throw Error(`A set with the ID '${newId}' already exists!`);

        customSets[setId].setId = newId;
        customSets[setId].changedOn = Date.now();

        customSets[newId] = customSets[setId];
        delete customSets[setId];

        StorageHelper.saveValue(this.#createUserSetsKey(), customSets);
    }

}