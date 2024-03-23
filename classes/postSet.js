class PostSet {

    constructor(setDefinition, customSetStorage) {
        if (!setDefinition)
            throw Error("No set definition was passed!");

        if (!customSetStorage)
            throw Error("No custom set storage instance was passed!");

        this._setId = setDefinition.setId;
        this._customSetStorageInstance = customSetStorage;

        this._setDefinition = setDefinition;
        this._posts = setDefinition.posts;
    }

    getId() {
        return this._setId;
    }

    getLabel() {
        return this._setDefinition.label;
    }

    getDescription() {
        return this._setDefinition.description;
    }

    getPosts() {
        return this._setDefinition.posts;
    }

    getCreationDate() {
        return new Date(this._setDefinition.createdOn);
    }

    getLastChangedDate() {
        return new Date(this._setDefinition.changedOn);
    }

    async addPost(postId) {
        const createdPost = await this._customSetStorageInstance.addPostToSet(this._setId, postId);
        this._setDefinition.posts.push(createdPost);
    }

    removePost(postId) {
        this._customSetStorageInstance.removePostFromSet(this._setId, postId);
        this._setDefinition.posts = this._setDefinition.posts.filter(post => post.postId !== postId);
    }

    isPostInSet(postId) {
        return this._setDefinition.posts.some(post => post.postId === postId);
    }

}