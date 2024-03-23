class UserHelper {

    static getCurrentUserId() {
        return document.querySelector('meta[name="current-user-id"]').content;
    }

    static getCurrentUserName() {
        return document.querySelector('meta[name="current-user-name"]').content;
    }

    static async getUserInstance(userId) {
        return await this.#loadUser(userId);
    }

    static async #loadUser(userId) {
        if (!userId)
            throw Error("User is not signed in!");

        const userJson = await ApiHelper.getUserInformation(userId);
        return new User(userId, userJson);
    }

}