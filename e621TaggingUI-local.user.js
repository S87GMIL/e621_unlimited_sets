// ==UserScript==
// @name         e621 unlimited offline sets
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Allows users to create an unlimited amount of sets, which are saved locally
// @author       S87GMIL
// @match        https://e621.net/*
// @icon64       file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\icon.png
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\helpers\apiHelpder.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\helpers\uiHelper.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\helpers\userHelper.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\classes\user.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\classes\customSetStorage.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\classes\postSet.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\classes\userSets.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\controllers\postController.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\controllers\postOverviewController.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\controllers\setPostViewerController.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\controllers\setViewerController.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\controllers\setCreatorController.js
// @require      file:C:\Users\Dev\Desktop\projects\e621_unlimited_sets\controllers\customSetController.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// ==/UserScript==

(function () {
    'use strict';

    const path = document.location.pathname;
    const currentUserId = UserHelper.getCurrentUserId();
    const searchParameters = decodeURIComponent(document.location.search);

    if (!currentUserId)
        throw Error("The user isn't currently logged in!");

    if (path.startsWith("/posts/"))
        new PostController();

    if (path.startsWith("/posts"))
        new PostOverviewController();

    if (path === "/posts" && searchParameters.includes("tags=custom_set:"))
        new SetPostViewerController();

    if (path.startsWith("post_sets") && searchParameters === `?search[creator_id]=${currentUserId}`)
        new SetViewerController();

    if (path === "/post_sets/new")
        new SetCreatorController();

    if (path.startsWith("/custom_post_sets/"))
        new CustomSetController(path.split("/").pop());

})();
