class CustomSetEditController extends SetEditingBaseController {

    _createUiElements() {
        document.title = `Edit Set - ${this._setInstance.getLabel()} - e621`;

        const title = document.createElement("h2");
        title.innerText = `Editing '${this._setInstance.getLabel()}'`;
        this._getMainPageElement().appendChild(title);

        const sectionElement = document.createElement('div');
        sectionElement.className = 'section';

        const formElement = document.createElement('form');
        formElement.className = 'simple_form edit_post_set';
        formElement.id = 'edit_post_set_22965';
        formElement.noValidate = true;
        formElement.action = '/post_sets/22965';
        formElement.acceptCharset = 'UTF-8';
        formElement.method = 'post';
        sectionElement.appendChild(formElement);

        const inputElements = [
            { type: 'input', name: 'post_set[name]', id: 'name', value: this._setInstance.getLabel(), label: 'Name' },
            { type: 'input', name: 'post_set[shortname]', id: 'id', value: this._setInstance.getId(), label: 'Short Name' },
            { type: 'textarea', name: 'post_set[description]', id: 'description', value: this._setInstance.getDescription(), label: 'Description' },
        ];

        inputElements.forEach(input => {
            const inputDiv = document.createElement('div');
            inputDiv.className = "input string optional post_set_name";
            formElement.appendChild(inputDiv);

            if (input.label) {
                const labelElement = document.createElement('label');
                labelElement.className = `${input.type} optional`;
                labelElement.htmlFor = input.id;
                labelElement.textContent = input.label;
                inputDiv.appendChild(labelElement);
            }

            const inputElement = document.createElement(input.type);

            if (input.type !== "textarea")
                inputElement.type = input.type;

            inputElement.name = input.name;
            inputElement.id = input.id;
            inputElement.value = input.value || '';

            inputDiv.appendChild(inputElement);
        });

        const submitButton = document.createElement("button");
        submitButton.innerText = "Submit";
        submitButton.className = "btn";
        submitButton.addEventListener("click", event => {
            event.preventDefault();
            this.#onSetUpdatedPress();
        });

        formElement.appendChild(submitButton);

        this._getMainPageElement().appendChild(sectionElement);
    }

    #onSetUpdatedPress() {
        try {
            const newName = document.getElementById("name").value;
            const newId = document.getElementById("id").value;
            const newDescription = document.getElementById("description").value;

            let idChanged = false;

            if (newId.includes(" ") || !newId) {
                UIHelper.displayErrorMessage("The set short name can't contain any spaces!")
                return;
            }

            if (!newName) {
                UIHelper.displayErrorMessage("The set set name can't be empty!")
                return;
            }

            if (this._setInstance.getLabel() !== newName)
                this._setInstance.setLabel(newName);

            if (this._setInstance.getDescription() !== newDescription)
                this._setInstance.setDescription(newDescription);

            if (this._setInstance.getId() !== newId) {
                this._setInstance.setId(newId);
                idChanged = true;
            }

            UIHelper.displaySuccessMessage("The set has successfully been updated!");
            if (idChanged)
                window.location.assign(`https://e621.net/custom_sets/edit/${newId}`);
        } catch (error) {
            UIHelper.displayErrorMessage(error.message);
        }
    }
}