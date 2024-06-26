class CustomSetPostListController extends SetEditingBaseController {

    _createSetSpecificElements() {
        this._clearMainPage();

        document.title = `Set Post List - ${this._setInstance.getLabel()} - e621`;

        const div = document.createElement('div');
        const h2 = document.createElement('h2');
        h2.textContent = `Post list for set '${this._setInstance.getLabel()}'`;

        div.appendChild(h2);

        const form = document.createElement('form');
        form.className = 'simple_form edit_post_set';
        form.noValidate = true;

        const inputDiv = document.createElement("div");
        inputDiv.className = "input text optional post_set_post_ids_string";
        form.appendChild(inputDiv);

        const postIdsLabel = document.createElement('label');
        postIdsLabel.innerText = 'Post IDs';
        inputDiv.appendChild(postIdsLabel);

        const postIdTextArea = document.createElement('textarea');
        postIdTextArea.style.width = "80%";
        postIdTextArea.className = 'text optional post_set_post_ids_string';
        postIdTextArea.spellcheck = false;
        postIdTextArea.autocomplete = 'off';

        const postIds = this._setInstance.getPosts().map(post => post.postId);

        postIdTextArea.value = postIds.join(" ");
        inputDiv.appendChild(postIdTextArea);

        const inputSubmit = document.createElement('button');
        inputSubmit.innerText = "Update"
        inputSubmit.className = 'btn';
        inputSubmit.style.minWidth = "5rem";
        inputSubmit.addEventListener("click", (event) => {
            event.preventDefault();
            this.#updateSetPosts(postIdTextArea.value.split(" "));
        });

        form.appendChild(inputSubmit);
        div.appendChild(form);

        this._getMainPageElement().appendChild(div);
    }

    async #updateSetPosts(postIds) {
        try {
            const updatedPosts = await E6ApiHelper.loadBulkPost(postIds);
            this._setInstance.updatePosts(updatedPosts);
            UIHelper.displaySuccessMessage("All posts in the current set have been update!");
        } catch (error) {
            UIHelper.displayErrorMessage(error.message);
            console.error(error);
        }
    }
}