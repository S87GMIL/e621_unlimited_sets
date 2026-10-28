// ==UserScript==
// @name         e621 unlimited offline sets
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Allows users to create an unlimited amount of locally saved offline sets
// @author       S87GMIL
// @match        https://e621.net/*
// @supportURL   https://github.com/S87GMIL/e621_unlimited_sets/issues
// @updateURL    https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/main/e621UnlimitedSets.user.js
// @downloadURL  https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/main/e621UnlimitedSets.user.js
// @icon64       https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/e6_s87_logo.png
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/helpers/storageHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/helpers/e6ApiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/helpers/gitApiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/helpers/uiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/helpers/userHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/helpers/backupReminderHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/abstractClasses/setBaseController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/abstractClasses/setEditingBaseController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/classes/router.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/classes/user.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/classes/gitRepository.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/classes/customSetStorage.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/classes/postSet.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/classes/userSets.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/settingsController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/customSetPostListController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/customSetEditController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/postController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/postOverviewController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/setPostViewerController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/setViewerController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/setCreatorController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.2/controllers/customSetController.js
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