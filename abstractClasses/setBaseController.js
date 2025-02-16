class SetBaseController {

    constructor(substituteE6Icon = true) {
        this._addItemsToToolbar(this.#getStandardToolbarItems());
        this._createUiElements();

        this._menuCleared = false;

        if (substituteE6Icon)
            UIHelper.substituteE6Image();
    }

    _createUiElements() {
        //This method can be redefined in extending classes
    }

    _getMainPageElement() {
        return document.querySelector("#page");
    }

    #getStandardToolbarItems() {
        return [
            { text: 'List', href: '/post_sets' },
            { text: 'New', href: '/post_sets/new' },
            { text: 'Help', href: '/help/sets' },
            { text: 'Mine', href: `/post_sets?search[creator_id]=${UserHelper.getCurrentUserId()}`, hidden: !!UserHelper.getCurrentUserId() },
            { text: 'Invites', href: '/post_set_maintainers' },
            { text: '|', type: 'seperator' },
            { text: "S87's offline set settings", href: "/custom_sets/settings", },
        ];
    }

    _addItemsToToolbar(items) {
        const menu = document.querySelector("body > nav > menu.nav-secondary.desktop");
        if (!this._menuCleared)
            menu.innerHTML = "";

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

    _clearMainPage() {
        const mainPage = this._getMainPageElement();
        const noticeDivs = Array.from(mainPage.children).slice(0, 2);
        mainPage.innerHTML = "";
        noticeDivs.forEach(element => mainPage.appendChild(element));
    }

}