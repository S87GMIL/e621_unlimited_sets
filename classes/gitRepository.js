class GitRepository {

    static SET_CREATED_ACTION = "set_created";
    static SET_DELETED_ACTION = "set_deleted";
    static SET_NAME_CHANGED = "set_name_changed";
    static SET_ID_CHANGED = "set_id_changed";
    static SET_DESCRIPTION_CHANGED = "set_description_changed";
    static SET_UPDATED_ACTION = "set_updated";
    static SET_POSTS_UPDATED_ACTION = "set_posts_updated";

    static POST_ADDED_ACTION = "post_added";
    static POST_REMOVED_ACTION = "post_removed";

    constructor(userId) {
        if (!userId)
            throw Error("No user ID was passed!");

        this._userId = userId;

        const gitSettings = this.#getUserGitSettings();

        this._gitUsername = gitSettings.username;
        this._repoName = gitSettings.repositoryName;
        this._branchName = gitSettings.branchName;
        this._accessToken = gitSettings.accessToken;
        this._gitBackupEnabled = gitSettings.gitEnabled;
    }

    #createGitUserSettingsKey() {
        return `git_settings_${this._userId}`;
    }

    #getUserGitSettings() {
        if (!this._gitSettings) {
            this._gitSettings = StorageHelper.getValue(this.#createGitUserSettingsKey());

            if (!this._gitSettings) {
                console.info(`No git settings found for user '${this._userId}'`);
                return this.#createSettingsJson();
            }
        }

        return this._gitSettings;
    }

    #createSettingsJson(repoName = this._repoName, branchName = this._branchName, username = this._gitUsername, accessToken = this._accessToken, gitEnabled = this._gitBackupEnabled) {
        return {
            gitEnabled: gitEnabled || false,
            repositoryName: repoName || "",
            branchName: branchName || "",
            accessToken: accessToken || "",
            username: username || "",
        };
    }

    isGitBackupEnabled() {
        return this._gitBackupEnabled;
    }

    setGitBackupEnabled(enabled) {
        this._gitBackupEnabled = enabled;

        StorageHelper.saveValue(this.#createGitUserSettingsKey(), this.#createSettingsJson(this.getRepositoryName(), this.getBranchName(), this.getUsername(), this.getAccessToken(), enabled));
    }

    getUsername() {
        return this._gitUsername;
    }

    setUsername(username) {
        if (!username)
            throw Error("No username was passed!");

        this._gitUsername = username;

        StorageHelper.saveValue(this.#createGitUserSettingsKey(), this.#createSettingsJson(this.getRepositoryName(), this.getBranchName(), username, this.getAccessToken(), this.isGitBackupEnabled()));
    }

    getAccessToken() {
        return this._accessToken;
    }

    setAccessToken(accessToken) {
        if (!accessToken)
            throw Error("No access token was passed!");

        this._accessToken = accessToken;

        StorageHelper.saveValue(this.#createGitUserSettingsKey(), this.#createSettingsJson(this.getRepositoryName(), this.getBranchName(), this.getUsername(), accessToken, this.isGitBackupEnabled()));
    }

    hasAccessToken() {
        return !!this._accessToken;
    }

    getRepositoryName() {
        return this._repoName;
    }

    setRepositoryName(repositoryName) {
        if (!repositoryName)
            throw Error("No repository name was passed!");

        this._repoName = repositoryName;

        StorageHelper.saveValue(this.#createGitUserSettingsKey(), this.#createSettingsJson(repositoryName, this.getBranchName(), this.getUsername(), this.getAccessToken(), this.isGitBackupEnabled()));
    }

    getBranchName() {
        return this._branchName;
    }

    setBranchName(branchName) {
        if (!branchName)
            throw Error("No branch name was passed!");

        this._branchName = branchName;

        StorageHelper.saveValue(this.#createGitUserSettingsKey(), this.#createSettingsJson(this.getRepositoryName(), this._branchName, this.getUsername(), this.getAccessToken(), this.isGitBackupEnabled()));
    }

    async loadSetsFromRepository() {
        const fileName = this.#createUserSetsFileName();
        const response = await GitAPIHelper.getFileFromGit(
            this.getAccessToken(),
            this.getUsername(),
            this.getRepositoryName(),
            this.getBranchName(),
            fileName
        );

        return response;
    }

    async saveChangesToRepository(action, setLabel, changedPosts) {
        if (!this.isGitBackupEnabled())
            return;

        try {
            const rawSetData = new CustomSetStorage(this._userId).getRawSetData();
            Object.keys(rawSetData).forEach(setId => {
                rawSetData[setId].posts = rawSetData[setId].posts.map(post => post.postId);
            });

            const fileName = this.#createUserSetsFileName();

            const response = await GitAPIHelper.createGithubCommit(
                this.getAccessToken(),
                this.getUsername(),
                this.getRepositoryName(),
                this.getBranchName(),
                this.#generateCommitMessage(action, setLabel, changedPosts),
                rawSetData,
                fileName
            );

            console.info("Offline sets successfully backed up in the defined GitHub repository!");
            return response;
        } catch (error) {
            const errorMessage = `Error while saving changes to GIT! Message: ${error.message}`;
            console.error(error);
            UIHelper.displayErrorMessage(errorMessage);
            throw Error(errorMessage);
        }
    }

    #createUserSetsFileName() {
        return `e6OfflineSets_${this._userId}.json`;
    }

    #generateCommitMessage(action, setLabel, changedPosts) {
        switch (action) {
            case GitRepository.POST_ADDED_ACTION:
                return `Added post${changedPosts.length > 1 ? 's' : ''} '${changedPosts.join(", ")}' to the set '${setLabel}'`;
            case GitRepository.POST_REMOVED_ACTION:
                return `Removed post${changedPosts.length > 1 ? 's' : ''} '${changedPosts.join(", ")}' from the set '${setLabel}'`;
            case GitRepository.SET_CREATED_ACTION:
                return `Created the set '${setLabel}'`;
            case GitRepository.SET_DELETED_ACTION:
                return `Deleted the set '${setLabel}'`;
            case GitRepository.SET_DESCRIPTION_CHANGED:
                return `Changed the description of the set '${setLabel}'`;
            case GitRepository.SET_NAME_CHANGED:
                return `Changed the name of the set '${setLabel}'`;
            case GitRepository.SET_POSTS_UPDATED_ACTION:
                return `Updated posts of the set '${setLabel}', updated a total of ${changedPosts.length} post${changedPosts.length > 0 ? 's' : ''}`;
            case GitRepository.SET_UPDATED_ACTION:
                return `Updated set '${setLabel}' using backed up metadata`;
            case GitRepository.SET_ID_CHANGED:
                return `Changed the ID of set '${setLabel}'`;
        }
    }
}