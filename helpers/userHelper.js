class UserHelper {

    static getCurrentUserId() {
        return document.body.getAttribute("data-user-id");
    }

    static getCurrentUserName() {
        return document.body.getAttribute("data-user-name");
    }

    static async getUserInstance(userId) {
        return await this.#loadUser(userId);
    }

    static async #loadUser(userId) {
        if (!userId)
            throw Error("User is not signed in!");

        const userJson = await E6ApiHelper.getUserInformation(userId);
        return new User(userId, userJson);
    }

}