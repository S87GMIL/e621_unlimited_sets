class GitAPIHelper {

    constructor() {
        this._requestInProgress = false;
        this._lastCommitSha = null;

        this._pendingRequest = null;
    }

    isRequestInProgress() {
        return this._requestInProgress;
    }

    async createGithubCommit(githubAccessToken, gitUsername, repoName, branchName, commitMessage, offlineSetFile, fileName) {
        if (!githubAccessToken || !gitUsername || !repoName || !branchName || !offlineSetFile || !fileName)
            throw Error("No all mandatory parameters were passed!");

        //Prevent multiple requests from being processes while another one is still pending => Because the whole file is committed, the last request will always contain the latest version of the file
        if (this.isRequestInProgress()) {
            this._pendingRequest = () => this.createGithubCommit(githubAccessToken, gitUsername, repoName, branchName, commitMessage, offlineSetFile, fileName);
            return;
        }

        this._requestInProgress = true;
        this._pendingRequest = null;

        const repoFullName = `${gitUsername}/${repoName}`;
        const tree = await this.#createGithubRepoTree(githubAccessToken, repoFullName, branchName, offlineSetFile, fileName);

        const payload = {
            "message": commitMessage,
            "tree": tree
        }

        let parentSha = this._lastCommitSha;
        if (!parentSha)
            parentSha = await this.#getParentSha(githubAccessToken, repoFullName, branchName);

        if (parentSha)
            payload.parents = [parentSha];

        const response = await this.#performCrossOriginRequest(
            "POST",
            `https://api.github.com/repos/${repoFullName}/git/commits`,
            this.#getApiHeaders(githubAccessToken),
            payload
        );

        this._lastCommitSha = response.sha;
        const updateResponse = await this.#updateGithubBranchRef(githubAccessToken, repoFullName, branchName, this._lastCommitSha);
        this._requestInProgress = false;

        if (this._pendingRequest)
            await this._pendingRequest();

        return updateResponse;
    }

    async getFileFromGit(githubAccessToken, gitUsername, repoName, branchName, fileName) {
        const repoFullName = `${gitUsername}/${repoName}`;

        const response = await this.#performCrossOriginRequest(
            "GET",
            `https://api.github.com/repos/${repoFullName}/contents/${fileName}`,
            this.#getApiHeaders(githubAccessToken)
        );

        return JSON.parse(atob(response.content));
    }

    #performCrossOriginRequest(method, url, headers = {}, body) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: method,
                url: url,
                headers: headers,
                data: body ? JSON.stringify(body) : null,
                onload: response => {
                    const responseJson = JSON.parse(response.response);
                    if (!String(response.status).startsWith("2")) {
                        reject(responseJson);
                        return;
                    }

                    resolve(responseJson);
                },
                onerror: error => {
                    console.error(error);
                    reject(error);
                },
            });
        });
    }

    #getApiHeaders(githubAccessToken) {
        return {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${githubAccessToken}`,
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    async #createGithubFileBlob(githubAccessToken, repoFullName, offlineSetFile) {
        const blobResp = await this.#performCrossOriginRequest(
            "POST",
            `https://api.github.com/repos/${repoFullName}/git/blobs`,
            this.#getApiHeaders(githubAccessToken),
            {
                content: JSON.stringify(offlineSetFile),
                encoding: "utf-8"
            }
        );

        return blobResp.sha;
    }

    async #getShaForBaseTree(githubAccessToken, repoFullName, branchName) {
        if (this._repoBaseTree)
            return this._repoBaseTree;

        const response = await this.#performCrossOriginRequest(
            "GET",
            `https://api.github.com/repos/${repoFullName}/git/trees/${branchName}`,
            this.#getApiHeaders(githubAccessToken)
        );

        this._repoBaseTree = response.sha;
        return response.sha || null;
    }

    async #getParentSha(githubAccessToken, repoFullName, branchName) {
        const parentResp = await this.#performCrossOriginRequest(
            "GET",
            `https://api.github.com/repos/${repoFullName}/git/refs/heads/${branchName}`,
            this.#getApiHeaders(githubAccessToken),
        );

        return parentResp?.object?.sha;
    }

    async #createGithubRepoTree(githubAccessToken, repoFullName, branchName, offlineSetFile, fileName) {
        let shaForBaseTree;
        shaForBaseTree = await this.#getShaForBaseTree(githubAccessToken, repoFullName, branchName);

        const tree = []

        const fileSha = await this.#createGithubFileBlob(githubAccessToken, repoFullName, offlineSetFile)
        tree.push({
            "path": fileName,
            "mode": "100644",
            "type": "blob",
            "sha": fileSha,
            "force": true
        });

        const payload = {
            "base_tree": shaForBaseTree,
            "tree": tree
        };

        const treeResp = await this.#performCrossOriginRequest(
            "POST",
            `https://api.github.com/repos/${repoFullName}/git/trees`,
            this.#getApiHeaders(githubAccessToken),
            payload
        );

        return treeResp.sha;
    }

    async #updateGithubBranchRef(githubAccessToken, repoFullName, branchName, commitSha) {
        const payload = {
            "sha": commitSha,
            "force": false
        }

        const response = await this.#performCrossOriginRequest(
            "PATCH",
            `https://api.github.com/repos/${repoFullName}/git/refs/heads/${branchName}`,
            this.#getApiHeaders(githubAccessToken),
            payload
        );

        return response;
    }

}