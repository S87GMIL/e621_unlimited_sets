class E6ApiHelper {

    static async #performRequest(method, path, body = {}) {
        return new Promise((resolve, reject) => {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const requestBody = { ...body };

            if (csrfToken && ["POST", "PATCH", "DELETE"].includes(method))
                requestBody.authenticity_token = csrfToken;

            let settings = {
                type: method,
                url: path,
                data: requestBody,
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

    static #normalizePost(post) {
        if (!post)
            return post;

        if (post.post)
            post = post.post;

        if (!post.files)
            return post;

        const original = post.files.original || {};
        const preview = post.files.preview || {};
        const sample = post.files.sample || {};

        return {
            ...post,
            file: {
                width: original.width,
                height: original.height,
                url: original.url
            },
            preview: {
                width: preview.width,
                height: preview.height,
                url: preview.jpg || preview.webp || null
            },
            sample: {
                width: sample.width,
                height: sample.height,
                url: sample.jpg || sample.webp || null
            }
        };
    }

    static async getPost(postId) {
        const postResponse = await this.#performGetRequest(`https://e621.net/posts/${postId}.json?mode=extended`);
        if (!postResponse)
            throw Error(`No post with the ID '${postId}' could be found!`);

        return this.#normalizePost(postResponse);
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
                "post_ids[]": [postId]
            });
        if (!response || !response.name)
            throw Error(`Post '${postId}' could not be added to set '${setId}'!`);

        return response;
    }

    static async removePostFromSet(setId, postId) {
        const response = await this.#performPostRequest(`https://e621.net/post_sets/${setId}/remove_posts.json`,
            {
                "post_ids[]": [postId]
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
        batchSize = Math.min(batchSize, 320);
        const start = batch * batchSize;
        const requestPostIds = postIds.slice(start, start + batchSize);

        if (requestPostIds.length === 0)
            return [];

        const encodedPostIds = encodeURIComponent(requestPostIds.join(","));
        const response = await this.#performGetRequest(`https://e621.net/posts.json?search[id]=${encodedPostIds}&limit=${batchSize}&mode=extended`);
        if (!response)
            throw Error(`Posts couldn't be loaded in bulk!`);

        const loadedPosts = Array.isArray(response)
            ? response
            : (Array.isArray(response.posts) ? response.posts : []);
        const normalizedPosts = loadedPosts.map(post => this.#normalizePost(post));

        if (start + batchSize < postIds.length)
            normalizedPosts.push(...await E6ApiHelper.loadBulkPost(postIds, batch + 1, batchSize));

        return normalizedPosts;
    }
}