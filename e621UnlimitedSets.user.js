// ==UserScript==
// @name         e621 unlimited offline sets
// @namespace    http://tampermonkey.net/
// @version      0.9.6
// @description  Allows users to create an unlimited amount of locally saved offline sets
// @author       S87GMIL
// @match        https://e621.net/*
// @supportURL   https://github.com/S87GMIL/e621_unlimited_sets/issues
// @updateURL    https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/main/e621UnlimitedSets.user.js
// @downloadURL  https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/main/e621UnlimitedSets.user.js
// @icon64       https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/e6_s87_logo.png
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/helpers/storageHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/helpers/e6ApiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/helpers/gitApiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/helpers/uiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/helpers/userHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/helpers/backupReminderHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/abstractClasses/setBaseController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/abstractClasses/setEditingBaseController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/classes/router.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/classes/user.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/classes/gitRepository.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/classes/customSetStorage.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/classes/postSet.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/classes/userSets.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/settingsController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/customSetPostListController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/customSetEditController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/postController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/postOverviewController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/setPostViewerController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/setViewerController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/setCreatorController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v0.9.6-beta/controllers/customSetController.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @connect      api.github.com
// ==/UserScript==

(function () {
    'use strict';
    new Router().route();
})();