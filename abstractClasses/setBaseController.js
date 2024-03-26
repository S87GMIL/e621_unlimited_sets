class SetBaseController {

    constructor() {
        this._addItemsToToolbar(this.#getStandardToolbarItems());
        this.#clearMainPage();
        this._createUiElements();

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
            { text: 'Mine', href: `/post_sets?search[creator_id]=${UserHelper.getCurrentUserId()}`, hidden: !!UserHelper.getCurrentUserId() }
        ];
    }

    _addItemsToToolbar(items) {
        const menu = document.querySelector("#nav > menu.secondary");
        const menuSpacer = document.querySelector("#subnav-height-placeholder");

        if (menuSpacer)
            menuSpacer.style.display = "none";

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

    #clearMainPage() {
        const mainPage = this._getMainPageElement();
        const noticeDivs = Array.from(mainPage.children).slice(0, 2);
        mainPage.innerHTML = "";
        noticeDivs.forEach(element => mainPage.appendChild(element));
    }

}