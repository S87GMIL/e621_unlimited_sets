class SettingsController extends SetBaseController {

    constructor() {
        super();
        
        this._addItemsToToolbar(this.#getSettingsToolbarItems());
    }

    #getSettingsToolbarItems() {
        return [
            { text: '|', type: 'seperator' },
            { text: "S87's offline set settings", href: "/custom_sets/settings", }
        ];
    }

    _createUiElements() {
        document.title = `S87's offline sets - settings - e621`;


    }
}