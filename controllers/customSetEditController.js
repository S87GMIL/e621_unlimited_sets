class CustomSetEditController extends SetEditingBaseController {

    _createUiElements() {
        document.title = `Set Edit - ${this._setInstance.getLabel()} - e621`;
    }

}