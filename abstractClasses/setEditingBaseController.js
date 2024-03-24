class SetEditingBaseController {

    constructor(setId) {
        if (!setId)
            throw Error("No set ID was passed!");

        this._setInstance = new UserSets(UserHelper.getCurrentUserId()).getSet(setId);
        if (!this._setInstance)
            throw Error(`No custom set with the ID ${setId} was found!`);

        this.#createToolbarLinks();
        this.#clearMainPage();
        this._createUiElements();

        UIHelper.substituteE6Image();
    }

    #clearMainPage() {
        const mainPage = this._getMainPageElement();
        const noticeDivs = Array.from(mainPage.children).slice(0, 2);
        mainPage.innerHTML = "";
        noticeDivs.forEach(element => mainPage.appendChild(element));
    }

    _getMainPageElement() {
        return document.querySelector("#page");
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
            { text: 'Edit', href: `/custom_sets/edit/${this._setInstance.getId()}` },
            { text: 'Edit Posts', href: `/custom_sets/post_list/${this._setInstance.getId()}` },
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
}