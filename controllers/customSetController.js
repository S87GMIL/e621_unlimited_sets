class CustomSetController extends SetEditingBaseController {

    _createSetSpecificElements() {
        document.title = `Set - ${this._setInstance.getLabel()} - e621`;
        this._clearMainPage();

        const mainPage = document.querySelector("#page");

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