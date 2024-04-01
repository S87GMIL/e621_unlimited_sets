class GitAPIHelper {

    static async createGithubCommit(githubAccessToken, gitUsername, repoName, branchName, commitMessage, offlineSetFile, fileName) {
        if (!githubAccessToken || !gitUsername || !repoName || !branchName || !offlineSetFile || !fileName)
            throw Error("No all mandatory parameters were passed!");

        const repoFullName = `${gitUsername}/${repoName}`;
        const tree = await this.#createGithubRepoTree(githubAccessToken, repoFullName, branchName, offlineSetFile, fileName);

        const payload = {
            "message": commitMessage,
            "tree": tree
        }

        if (tree) {
            const parentSha = await this.#getParentSha(githubAccessToken, repoFullName, branchName);
            payload.parents = [parentSha];
        }

        const response = await this.#performCrossOriginRequest(
            "POST",
            `https://api.github.com/repos/${repoFullName}/git/commits`,
            this.#getApiHeaders(githubAccessToken),
            payload
        );

        const commitSha = response.sha;
        const updateResponse = await this.#updateGithubBranchRef(githubAccessToken, repoFullName, branchName, commitSha);
        return updateResponse;
    }

    static async getFileFromGit(githubAccessToken, gitUsername, repoName, branchName, fileName) {
        const repoFullName = `${gitUsername}/${repoName}`;
        const tree = await this.#createGithubRepoTree(githubAccessToken, repoFullName, branchName, offlineSetFile, fileName);
        const parentSha = await this.#getParentSha(githubAccessToken, repoFullName, branchName);

        const payload = {
            "message": commitMessage,
            "tree": tree,
            "parents": [parentSha]
        };

        const response = await this.#performCrossOriginRequest(
            "GET",
            `https://api.github.com/repos/${repoFullName}/git/commits/${parentSha}`,
            this.#getApiHeaders(githubAccessToken)
        );

        const lastCommitContent = await response.json();
        return lastCommitContent;
    }

    static #performCrossOriginRequest(method, url, headers = {}, body) {
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

    static #getApiHeaders(githubAccessToken) {
        return {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${githubAccessToken}`,
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    static async #createGithubFileBlob(githubAccessToken, repoFullName, offlineSetFile) {
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

    static async #getShaForBaseTree(githubAccessToken, repoFullName, branchName) {
        const response = await this.#performCrossOriginRequest(
            "GET",
            `https://api.github.com/repos/${repoFullName}/git/trees/${branchName}`,
            this.#getApiHeaders(githubAccessToken)
        );

        return response.sha || null;
    }

    static async #getParentSha(githubAccessToken, repoFullName, branchName) {
        const parentResp = await this.#performCrossOriginRequest(
            "GET",
            `https://api.github.com/repos/${repoFullName}/git/refs/heads/${branchName}`,
            this.#getApiHeaders(githubAccessToken),
        );

        return parentResp?.object?.sha;
    }

    static async #createGithubRepoTree(githubAccessToken, repoFullName, branchName, offlineSetFile, fileName) {
        let shaForBaseTree;
        try {
            shaForBaseTree = await this.#getShaForBaseTree(githubAccessToken, repoFullName, branchName);
        } catch (error) {
            //Only ignore the "tree empty" error, it's not possible to proceed with any other error
            if (error.message !== "Not Found")
                throw error;
        }

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

    static async #updateGithubBranchRef(githubAccessToken, repoFullName, branchName, commitSha) {
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