class ApiHelper {

    static async #performRequest(method, path, body = {}) {
        return new Promise((resolve, reject) => {
            let settings = {
                type: method,
                url: path,
                data: body,
                success: response => {
                    this._lastRequestTime = new Date().getTime();
                    resolve(response);
                },
                error: error => {
                    reject(error);
                }
            };

            $.ajax(settings);
        });
    }

    static #performGetRequest(path) {
        return this.#performRequest("GET", path)
    }

    static #performDeleteRequest(path) {
        return this.#performRequest("DELETE", path)
    }

    static #performPostRequest(path, body) {
        return this.#performRequest("POST", path, body)
    }

    static #performPatchRequest(path, data) {
        return this.#performRequest("PATCH", path, data)
    }

    static async getPost(postId) {
        const postResponse = await this.#performGetRequest(`https://e621.net/posts/${postId}.json`);
        if (!postResponse)
            throw Error(`No post with the ID '${postId}' could be found!`);

        return postResponse.post;
    }

    static async getUserInformation(userId) {
        const response = await this.#performGetRequest(`https://e621.net/users/${userId}.json`);
        if (!response || !response.name)
            throw Error(`User with ID '${userId}' couldn't be loaded!`);

        return response;
    }

    static async addPostToSet(setId, postId) {
        const response = await this.#performPostRequest(`https://e621.net/post_sets/${setId}/add_posts.json`,
            {
                post_ids: [postId]
            });
        if (!response || !response.name)
            throw Error(`Post '${postId}' could not be adde to set '${setId}'!`);

        return response;
    }

    static async removePostFromSet(setId, postId) {
        const response = await this.#performPostRequest(`https://e621.net/post_sets/${setId}/remove_posts.json`,
            {
                post_ids: [postId]
            });
        if (!response || !response.name)
            throw Error(`Post '${postId}' could not be removed from the set '${setId}'!`);

        return response;
    }

    static async addPostToFavorites(postId) {
        const response = await this.#performPostRequest(`https://e621.net/favorites.json`,
            {
                post_id: postId
            });

        return response;
    }

    static async removePostFromFavorites(postId) {
        const response = await this.#performDeleteRequest(`https://e621.net/favorites/${postId}.json`);

        return response;
    }

    static async loadBulkPost(postIds, batch = 0, batchSize = 100) {
        const requestPostIds = postIds.slice(batch * batchSize, (batch * batchSize + batchSize) - 1);

        if (requestPostIds.length === 0)
            return [];

        const response = await this.#performGetRequest(`https://e621.net/posts.json?tags=id:${postIds.join(",")}`);
        if (!response || !response.posts)
            throw Error(`Posts couldn't be loaded in bulk!`);

        let loadedPosts = response.posts;
        loadedPosts = loadedPosts.concat(await ApiHelper.loadBulkPost(requestPostIds, batch + 1, batchSize));

        return loadedPosts;
    }
}