class Router {
    constructor() {

    }

    route() {
        const path = document.location.pathname;
        const currentUserId = UserHelper.getCurrentUserId();
        const searchParameters = decodeURIComponent(document.location.search);

        const backupReminder = new BackupReminderHelper(currentUserId);
        if (backupReminder.isBackupOverdue())
            backupReminder.displayBackupReminder();

        if (!currentUserId)
            throw Error("The user isn't currently logged in!");

        if (path.startsWith("/posts/") && path.length > 7) {
            new PostController();
            return;
        }

        if (path.startsWith("/posts")) {
            new PostOverviewController();

            if (searchParameters.includes("tags=custom_set:"))
                new SetPostViewerController();

            return;
        }

        if (path.startsWith("/post_sets") && searchParameters === `?search[creator_id]=${currentUserId}`) {
            new SetViewerController();
            return;
        }

        if (path === "/post_sets/new") {
            new SetCreatorController();
            return;
        }

        if (path.startsWith("/custom_sets/post_list/")) {
            new CustomSetPostListController(path.split("/").pop());
            return;
        }

        if (path.startsWith("/custom_sets/edit/")) {
            new CustomSetEditController(path.split("/").pop());
            return;
        }

        if (path.startsWith("/custom_sets/settings")) {
            new SettingsController();
            return;
        }

        if (path.startsWith("/custom_sets/")) {
            new CustomSetController(path.split("/").pop());
            return;
        }
    }
}