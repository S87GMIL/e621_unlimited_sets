class GitRepository {

    static SET_CREATED_ACTION = "set_created";
    static SET_DELETED_ACTION = "set_deleted";
    static SET_DELETED_ACTION = "set_deleted";
    static SET_NAME_CHANGED = "set_name_changed";
    static SET_DESCRIPTION_CHANGED = "set_description_changed";

    static POST_ADDED_ACTION = "post_added";
    static POST_REMOVED_ACTION = "post_removed";

    constructor() {
        const gitSettings = this.#getUserGitSettings();

        this._repoUrl = gitSettings.repositoryUrl;
        this._accessToken = gitSettings.accessToken;
    }

    #createGitUserSettingsKey() {
        return `git_settings_${userId}`;
    }

    #getUserGitSettings() {
        if (!this._gitSettings) {
            const userId = UserHelper.getCurrentUserId();
            this._gitSettings = StorageHelper.getValue(this.#createGitUserSettingsKey());

            if (!this._gitSettings) {
                console.info(`No git settings found for user '${userId}'`);
                return this.#createSettingsJson();
            }
        }

        return this._gitSettings;
    }

    #createSettingsJson(repoUrl = this._repoUrl, accessToken = this._accessToken) {
        return {
            repositoryUrl: repoUrl || "",
            accessToken: accessToken || ""
        };
    }

    getAccessToken() {
        return this._accessToken;
    }

    setAccessToken(accessToken) {
        if (!accessToken)
            throw Error("No access token was passed!");

        this._accessToken = accessToken;

        StorageHelper.saveValue(this.#createGitUserSettingsKey(), this.#createSettingsJson(this.getRepositoryUrl(), accessToken));
    }

    hasAccessToken() {
        return !!this._accessToken;
    }

    getRepositoryUrl() {
        return this._repoUrl;
    }

    setRepositoryUrl(repositoryUrl) {
        if (!repositoryUrl)
            throw Error("No repository URL was passed!");

        this._repoUrl = repositoryUrl;

        StorageHelper.saveValue(this.#createGitUserSettingsKey(), this.#createSettingsJson(repositoryUrl, this.getAccessToken()));
    }

    loadSetsFromRepository() {
        //TODO: Implement logic to pull data from a repository
    }

    saveSetsToRepository() {
        //TODO: Implement logic to push data to a repository
    }

    #generateCommitMesage(action, setLabel, addedPosts) {
        switch (action) {
            case this.POST_ADDED_ACTION:
                return `Added post${addedPosts.length > 1 ? 's' : ''} '${addedPosts.join(", ")}' to the set '${setLabel}'`;
            case this.POST_REMOVED_ACTION:
                return `Removed post${addedPosts.length > 1 ? 's' : ''} '${addedPosts.join(", ")}' from the set '${setLabel}'`;
            case this.SET_CREATED_ACTION:
                return `Created the set '${setLabel}'`;
            case this.SET_DELETED_ACTION:
                return `Deleted the set '${setLabel}'`;
            case this.SET_DESCRIPTION_CHANGED:
                return `Changed the description of the set '${setLabel}'`;
            case this.SET_NAME_CHANGED:
                return `Changed the name of the set '${setLabel}'`;
        }
    }

    async #performRequest(method, url, body) {
        const response = await GM.xmlHttpRequest({
            method: method,
            url: url,
            headers: body ? {
                "Content-Type": "application/json"
            } : {},
            data: body || {}
        });
        return response;
    }
}