// ==UserScript==
// @name         e621 unlimited offline sets
// @namespace    http://tampermonkey.net/
// @version      1.0.6
// @description  Allows users to create an unlimited amount of locally saved offline sets
// @author       S87GMIL
// @match        https://e621.net/*
// @supportURL   https://github.com/S87GMIL/e621_unlimited_sets/issues
// @updateURL    https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/main/e621UnlimitedSets.user.js
// @downloadURL  https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/main/e621UnlimitedSets.user.js
// @icon64       https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/e6_s87_logo.png
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/helpers/storageHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/helpers/e6ApiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/helpers/gitApiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/helpers/uiHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/helpers/userHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/helpers/backupReminderHelper.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/abstractClasses/setBaseController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/abstractClasses/setEditingBaseController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/classes/router.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/classes/user.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/classes/gitRepository.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/classes/customSetStorage.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/classes/postSet.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/classes/userSets.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/settingsController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/customSetPostListController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/customSetEditController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/postController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/postOverviewController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/setPostViewerController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/setViewerController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/setCreatorController.js
// @require      https://raw.githubusercontent.com/S87GMIL/e621_unlimited_sets/v1.0.6/controllers/customSetController.js
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
