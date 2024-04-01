class GitAPIHelper {

    static async createGithubCommit(githubAccessToken, gitUsername, repoName, branchName, commitMessage, offlineSetFile, fileName) {
        if (!githubAccessToken || !gitUsername || !repoName || !branchName || !offlineSetFile || !fileName)
            throw Error("No all mandatory parameters were passed!");

        const repoFullName = `${gitUsername}/${repoName}`;
        const tree = await this.#createGithubRepoTree(githubAccessToken, repoFullName, branchName, offlineSetFile, fileName);
        const parentSha = await this.#getParentSha(githubAccessToken, repoFullName, branchName);

        const payload = {
            "message": commitMessage,
            "tree": tree,
            "parents": [parentSha]
        }

        const response = await this.#performCrossOriginRequest(
            "POST",
            `https://api.github.com/repos/${repoFullName}/git/commits`,
            this.#getApiHeaders(githubAccessToken),
            payload
        );
        debugger;

        const commitResp = await response.json();
        const commitSha = commitResp.sha;

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
        debugger;

        const lastCommitContent = await response.json();
        return lastCommitContent;
    }

    static async #performCrossOriginRequest(method, url, headers, body) {
        const response = await GM.xmlHttpRequest({
            method: method,
            url: url,
            headers: headers ? headers : {},
            data: body ? JSON.stringify(body) : {}
        });
        return response;
    }

    static async #getApiHeaders(githubAccessToken) {
        return {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${githubAccessToken}`,
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    static async #createGithubFileBlob(githubAccessToken, repoFullName, content, encoding = "utf-8") {
        const blobResp = await this.#performCrossOriginRequest(
            "POST",
            `https://api.github.com/repos/${repoFullName}/git/blobs`,
            this.#getApiHeaders(githubAccessToken),
            {
                "content": content,
                "encoding": encoding
            }
        );
        debugger;

        const response = await blobResp.json();
        return response.sha;
    }

    static async #getShaForBaseTree(githubAccessToken, repoFullName, branchName) {
        const baseTreeResp = await this.#performCrossOriginRequest(
            "GET",
            `https://api.github.com/repos/${repoFullName}/git/trees/${branchName}`,
            this.#getApiHeaders(githubAccessToken)
        );
        debugger;

        const response = await baseTreeResp.json();
        return response.sha
    }

    static async #getParentSha(githubAccessToken, repoFullName, branchName) {
        const parentResp = await this.#performCrossOriginRequest(
            "GET",
            `https://api.github.com/repos/${repoFullName}/git/refs/heads/${branchName}`,
            this.#getApiHeaders(githubAccessToken),
        );
        debugger;

        const response = await parentResp.json()
        return response.object.sha
    }

    static async #createGithubRepoTree(githubAccessToken, repoFullName, branchName, offlineSetFile, fileName) {
        const shaForBaseTree = await this.#getShaForBaseTree(githubAccessToken, repoFullName, branchName)
        const tree = []

        const fileSha = await this.#createGithubFileBlob(githubAccessToken, repoFullName, offlineSetFile)
        tree.push({
            "path": fileName,
            "mode": "100644",
            "type": "blob",
            "sha": fileSha
        })

        const payload = {
            "base_tree": shaForBaseTree,
            "tree": tree
        }


        const treeResp = await this.#performCrossOriginRequest(
            "POST",
            `https://api.github.com/repos/${repoFullName}/git/trees`,
            this.#getApiHeaders(githubAccessToken),
            payload
        );
        debugger;

        const response = await treeResp.json();
        return response.sha;
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
        debugger;

        const commitResp = await response.json();
        return commitResp;
    }

}