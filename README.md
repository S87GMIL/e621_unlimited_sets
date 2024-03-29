# Installation

To install the script, you will need a user script manager like <a href="https://www.tampermonkey.net/" target="_blank">Tampermonkey</a>.<br>
Once installed, simply follow this [link](https://github.com/S87GMIL/e621_unlimited_sets/raw/main/e621UnlimitedSets.user.js) to install. 

# Overview

This user script allows you to create an unlimited amount of so-called "offline sets" These sets are only saved on your device and not the e6 servers.<br>
Because nothing is saved on the e6 servers, it is possible to circumvent the imposed set limit, without breaching any site rules or exploiting the site's API.<br>
This also means, that the offline sets created are only available on the device on which they were created, unless the user manually downloads a backup of the offline sets and uploads it to another device.<br><br>

Usage of the offline sets should be as easy and intuitive as possible; this is why they are directly integrated in the standard set pages and will behave just like regular e6 sets.

## Creating a new offline set

To create a new offline set, simply open the default e6 [set creation page](https://e621.net/post_sets/new), and scroll all the way down. Here you will find the "Create offline set" button, which takes the entered information and creates a new offline set.<br>
It is also possible to open the offline set settings from this page by clicking the "S87's offline set settings" item in the navigation bar.

<image src="./readme_images/set_creation.png" style="box-shadow: 0px 0px 10px black;">

## Adding posts to an offline set

### Single post

To add a single post to an offline set, simply click the "Add to set" button in the sidebar of the desired post, and in the "Set Name" dropdown, scroll all the way down to the "Offline Sets" group. Here you can finally select the desired offline set, and click "Add" to add the current post to the selected offline set:<br>
<image src="./readme_images/single_post_add_to_offline_set.png" style="box-shadow: 0px 0px 10px black;">

### Multiple posts

To add multiple posts to an offline set, navigate to the post page, and select the "Add To Set" mode under the search input, and select the desired offline set from the dropdown field underneath.<br>
Any post you click, will now be added to the selected offline set:<br>
<image src="./readme_images/multiple_posts_add_to_offline_set.png" style="box-shadow: 0px 0px 10px black;">

## Offline set settings

The offline set settings can be reached by either clicking the "S87's offline set settings" in the menu of the set page, or by clicking this [link](https://e621.net/custom_sets/settings).<br>
On the settings page, it is possible to download a backup of the created offline sets for the currently logged-in user, as well as an option to upload previous backups.<br>
The user script has a function to remind users to back up the created offline set, to prevent data loss in case there is an issue with the browser or PC. This behavior can be changed by adapting the values under "Backup Settings".<br>
By default, the user will be reminded after 30 days to back up any created sets; however, this value can be changed to any amount of days or even disabled entirely by checking the "Disable backup reminder" checkbox.

<image src="./readme_images/offline_set_settings.png" style="box-shadow: 0px 0px 10px black;"><br> 

## My set page

The offline sets are only visible on the user set overview page, which can be reached by clicking the "Mine" menu item on the "Sets" Page.<br>
Offline sets will be marked as "Private / Offline" in the Status column, so users can easily identify which sets are saved locally, and which are normal e6 online sets.<br>
From here, the navigation is identical to normal sets; users can navigate to the set information by clicking on the set name, or directly access the set posts by clicking on the set short name.
<image src="./readme_images/user_set_overview_page.png" style="box-shadow: 0px 0px 10px black;"><br> 

## Accessing set posts

To view the posts in an offline set, you can either use the set overview page and navigate using the short name, or by simply entering "custom_set:<set_short_name>" in the tag input. It is possible to enter multiple offline sets, which will only display posts that are included in every defined set.<br>
By adding normal tags in the tag input, it is possible to filter the offline set posts; e.g. by entering "custom_set:gryphons blue_feathers", only posts of the offline set "gryphons", that contain the "blue_feathers" tag, will be shown.<br>
Right now, this feature is still limited, and not all tag combinations or complex filters will work.
<br>
<image src="./readme_images/custom_set_tag_input.png" style="box-shadow: 0px 0px 10px black;"><br> 

## Editing / Updating Posts in an offline set

It is possible to edit and update the posts in an offline set by navigating to the "Edit Posts" page of an offline set by clicking the "Edit Posts" menu item, or by navigating to "https://e621.net/custom_sets/post_list/<set_short_name>":<br>
<image src="./readme_images/offline_set_edit_posts_button.png" style="box-shadow: 0px 0px 10px black;"><br> 
Here, all post IDs from the selected set will be displayed. Users can change the included post IDs, copy them to another set, or paste IDs to add them to the current set.<br>
By pressing update, the information of all included posts will be updated as well, so all tags and image URLs will be requested again using the e6 API. (To help performance and prevent frequent requests to the e6 API, all posts in an offline set will be cached, meaning that their information might be outdated when they haven't been updated in a while.).<br>
<image src="./readme_images/update_set_posts.png" style="box-shadow: 0px 0px 10px black;"><br> 