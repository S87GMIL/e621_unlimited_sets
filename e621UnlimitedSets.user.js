// ==UserScript==
// @name         e621 unlimited offline sets
// @namespace    http://tampermonkey.net/
// @version      0.8.0
// @description  Allows users to create an unlimited amount of locally saved offline sets
// @author       S87GMIL
// @match        https://e621.net/*
// @supportURL   https://github.com/S87GMIL/e621_unlimited_sets/issues
// @updateURL    https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/releases/latest/e621UnlimitedSets.user.js
// @downloadURL  https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/releases/latest/e621UnlimitedSets.user.js
// @icon64       https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/e6_s87_logo.png
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/helpers/storageHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/helpers/apiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/helpers/uiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/helpers/userHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/helpers/backupReminderHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/abstractClasses/setBaseController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/abstractClasses/setEditingBaseController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/classes/user.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/classes/gitRepository.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/classes/customSetStorage.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/classes/postSet.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/classes/userSets.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/settingsController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/customSetPostListController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/customSetEditController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/postController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/postOverviewController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/setPostViewerController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/setViewerController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/setCreatorController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.8.0/controllers/customSetController.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

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

})();