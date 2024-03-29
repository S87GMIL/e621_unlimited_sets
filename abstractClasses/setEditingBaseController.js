class SetEditingBaseController extends SetBaseController {

    constructor(setId) {
        super(setId);

        if (!setId)
            throw Error("No set ID was passed!");

        this._setInstance = new UserSets(UserHelper.getCurrentUserId()).getSet(setId);
        if (!this._setInstance)
            throw Error(`No offline set with the ID ${setId} was found!`);

        this._addItemsToToolbar(this.#getSetEditingToolbarItems());
        this._createSetSpecificElements();
    }

    #getSetEditingToolbarItems() {
        return [
            { text: 'Invites', href: '/post_set_maintainers' },
            { text: 'Posts', href: `/posts?tags=custom_set:${this._setInstance.getId()}` },
            { text: 'Edit', href: `/custom_sets/edit/${this._setInstance.getId()}` },
            { text: 'Edit Posts', href: `/custom_sets/post_list/${this._setInstance.getId()}` },
            { text: 'Delete', clickHandler: this.#onDeleteSetClicked.bind(this), confirm: 'Are you sure you want to delete this set?' },
            { text: '|', type: 'seperator' },
            { text: "S87's offline set settings", href: "/custom_sets/settings", },
        ];
    }

    #onDeleteSetClicked() {
        this._setInstance.delete();
        document.location.assign(`/post_sets?search[creator_id]=${UserHelper.getCurrentUserId()}`);
    }

    _createSetSpecificElements() {
        //This function should be redefined in extending classes
    }
}