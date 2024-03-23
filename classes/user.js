class User {

    constructor(userId, userJson) {
        if (!userId)
            throw Error("No user ID was passed!");

        if (!userJson)
            throw Error("No user JSON was passed!");

        this._userId = userId;
        this._userJson = userJson;
    }

    getId() {
        return this._userId;
    }

    getName() {
        return this._userJson.name;
    }

    getPostChanges() {
        return this._userJson.post_update_count;
    }

    getUploadCount() {
        return this._userJson.post_upload_count;
    }

    getLevel() {
        return this._userJson.level_string;
    }

    getBlackListedTags() {
        return this._userJson.blacklisted_tags;
    }

    getAvatarId() {
        return this._userJson.avatar_id;
    }

    async getAvatarPost() {
        return await ApiHelper.getInstance().loadPost(this.getAvatarId());
    }

    canRepalcePosts() {
        return this._userJson.replacements_beta;
    }

    getPostsPerPage() {
        return this._userJson.per_page;
    }
}