class CustomSetController {

    constructor(setId) {
        if (!setId)
            throw Error("No set ID was passed!");

        this._setInstance = new UserSets(UserHelper.getCurrentUserId()).getSet(setId);
        if (!this._setInstance)
            throw Error(`No custom set with the ID ${setId} was found!`);

        this.#createToolbarLinks();
        this.#createSetUi();
    }

    #createToolbarLinks() {
        const menu = document.querySelector("#nav > menu.secondary");
        menu.innerHTML = "";

        const items = [
            { text: 'List', href: '/post_sets' },
            { text: 'New', href: '/post_sets/new' },
            { text: 'Help', href: '/help/sets' },
            { text: 'Mine', href: `/post_sets?search[creator_id]=${UserHelper.getCurrentUserId()}`, hidden: !!UserHelper.getCurrentUserId() },
            { text: '|', type: 'seperator' },
            { text: 'Invites', href: '/post_set_maintainers' },
            { text: 'Posts', href: `/posts?tags=custom_set:${this._setInstance.getId()}` },
            { text: 'Edit', href: `/custom_sets/${this._setInstance.getId()}/edit` },
            { text: 'Edit Posts', href: `/custom_sets/${this._setInstance.getId()}/post_list` },
            { text: 'Delete', clickHandler: this.#onDeleteSetClicked.bind(this), confirm: 'Are you sure you want to delete this set?' }
        ];

        items.forEach(item => {
            const li = document.createElement('li');

            if (item.type !== "seperator") {
                const a = document.createElement('a');
                a.href = item.href || "#";

                if (item.confirm && item.clickHandler)
                    a.addEventListener("click", event => {
                        if (confirm(item.confirm) === true)
                            item.clickHandler(event);
                    });

                if (!item.confirm && item.clickHandler)
                    a.addEventListener("click", item.clickHandler);

                a.textContent = item.text;

                li.appendChild(a);
            } else {
                li.innerText = item.text;
            }
            menu.appendChild(li);
        });
    }

    #onDeleteSetClicked() {
        this._setInstance.delete();
        document.location.assign(`/post_sets?search[creator_id]=${UserHelper.getCurrentUserId()}`);
    }

    #createSetUi() {
        document.title = `Set - ${this._setInstance.getLabel()} - e621`;

        const mainPage = document.querySelector("#page");
        mainPage.innerHTML = "";

        const setContainer = document.createElement("div");
        mainPage.appendChild(setContainer);

        const header = document.createElement("div");
        header.className = "set-header";
        setContainer.appendChild(header);

        const title = document.createElement("p");
        title.innerText = `${this._setInstance.getLabel()} by ${UserHelper.getCurrentUserName()}`;
        header.appendChild(title);

        const status = document.createElement("div");
        status.className = "set-status set-status-private";
        status.title = "This set is offline and only visible to you, and not saved on the server";
        status.innerText = "Private / Offline";
        header.appendChild(status);

        const owner = document.createElement("div");
        owner.className = "set-status set-status-owner";
        owner.title = "You own this set";
        owner.innerText = "Owner";
        header.appendChild(owner);

        const setShortName = document.createElement("div");
        setShortName.className = "set-shortname";
        setShortName.innerText = "Short Name: ";
        setContainer.appendChild(setShortName);

        const setLink = document.createElement("a");
        setLink.href = `/posts?tags=custom_set:${this._setInstance.getId()}`;
        setLink.innerText = this._setInstance.getLabel();
        setShortName.appendChild(setLink);

        const daysSinceCreation = Math.round((new Date().getTime() - this._setInstance.getCreationDate()) / (1000 * 3600 * 24));
        const daysSinceLastChange = Math.round((new Date().getTime() - this._setInstance.getLastChangedDate()) / (1000 * 3600 * 24));

        const metadataDisplay = document.createElement("p");
        metadataDisplay.innerText = `Created: ${daysSinceCreation} day ago | Updated: ${daysSinceLastChange} days ago`;
        setContainer.appendChild(metadataDisplay);

        setContainer.appendChild(document.createElement("br"));
        setContainer.appendChild(document.createElement("br"));

        const setDescription = document.createElement("div");
        setDescription.innerText = this._setInstance.getDescription() || "No description.";
        setContainer.appendChild(setDescription);

        const viewPostsSpan = document.createElement("span");
        viewPostsSpan.className = "set-viewposts";

        const viewPostsLink = document.createElement("a");
        viewPostsLink.href = setLink.href;
        viewPostsLink.innerText = `» View Posts (${this._setInstance.getPosts().length})`;
        viewPostsSpan.appendChild(viewPostsLink);

        setContainer.appendChild(viewPostsSpan);

        setContainer.appendChild(document.createElement("br"));
        setContainer.appendChild(document.createElement("br"));
    }
}