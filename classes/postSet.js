class PostSet {

    constructor(setDefinition, customSetStorage) {
        if (!setDefinition)
            throw Error("No set definition was passed!");

        if (!customSetStorage)
            throw Error("No offline set storage instance was passed!");

        this._setId = setDefinition.setId;
        this._customSetStorageInstance = customSetStorage;

        this._setDefinition = setDefinition;
        this._posts = setDefinition.posts;
    }

    getId() {
        return this._setId;
    }

    setId(newId) {
        this._customSetStorageInstance.changeSetId(this._setId, newId);
    }

    getLabel() {
        return this._setDefinition.label;
    }

    setLabel(newLabel) {
        this._customSetStorageInstance.changeSetLabel(this._setId, newLabel);
    }

    getDescription() {
        return this._setDefinition.description;
    }

    setDescription(newDescription) {
        this._customSetStorageInstance.changeSetDescription(this._setId, newDescription);
    }

    getPosts() {
        return this._setDefinition.posts;
    }

    getPostAmount() {
        return this._setDefinition.posts.length;
    }

    getCreationDate() {
        return new Date(this._setDefinition.createdOn);
    }

    getLastChangedDate() {
        return new Date(this._setDefinition.changedOn);
    }

    async addPost(postId) {
        const createdPost = await this._customSetStorageInstance.addPostToSet(this._setId, postId);
        return createdPost;
    }

    removePost(postId) {
        this._customSetStorageInstance.removePostFromSet(this._setId, postId);
    }

    isPostInSet(postId) {
        return this._setDefinition.posts.some(post => post.postId === postId);
    }

    updatePosts(updatedPosts) {
        this._customSetStorageInstance.updatePosts(this.getId(), updatedPosts);
    }

    delete() {
        this._customSetStorageInstance.deleteSet(this.getId());
    }

    getPostIndexInSet(postId) {
        if (!postId)
            throw Error("No post ID was passed!");

        return this._posts.findIndex(post => post.postId === postId);
    }

    getPostByIndex(index) {
        return this._posts[index];
    }

    getPostCount() {
        return this._posts.length;
    }

}