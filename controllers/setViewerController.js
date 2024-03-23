class SetViewerController {

    constructor() {
        this.#displayCustomSets();
    }

    #getUserSetInstance() {
        if (!this._userSets)
            this._userSets = new UserSets(UserHelper.getCurrentUserId());

        return this._userSets;
    }

    #displayCustomSets() {
        const tableBody = document.querySelector("#set-index > table > tbody");

        this.#getUserSetInstance()
            .getSets()
            .forEach(setInstance => {
                const tableRow = document.createElement("tr");
                tableRow.dataset.isCustoMSet = true;

                const nameCell = document.createElement("td");
                const setLink = document.createElement("a");
                setLink.href = `/custom_sets/${setInstance.getId()}`;
                setLink.innerText = setInstance.getLabel();
                nameCell.appendChild(setLink);
                tableRow.appendChild(nameCell);

                const idCell = document.createElement("td");
                const idLink = document.createElement("a");
                idLink.href = `/posts?tags=custom_set:${setInstance.getId()}`;
                idLink.innerText = setInstance.getLabel();
                idCell.appendChild(idLink);
                tableRow.appendChild(idCell);

                const creatorCell = document.createElement("td");
                const authorLink = document.createElement("a");
                authorLink.href = `/users/${UserHelper.getCurrentUserId()}`;
                authorLink.innerText = UserHelper.getCurrentUserName();
                creatorCell.appendChild(authorLink);
                tableRow.appendChild(creatorCell);

                const postCountCell = document.createElement("td");
                postCountCell.innerText = setInstance.getPosts().length;
                tableRow.appendChild(postCountCell);

                const createdOnCell = document.createElement("td");
                const daysSinceCreation = Math.round((new Date().getTime() - setInstance.getCreationDate()) / (1000 * 3600 * 24));
                createdOnCell.innerText = `${daysSinceCreation} days ago`;
                tableRow.appendChild(createdOnCell);

                const updaedOnCell = document.createElement("td");
                const daysSinceLastChange = Math.round((new Date().getTime() - setInstance.getLastChangedDate()) / (1000 * 3600 * 24));
                updaedOnCell.innerText = `${daysSinceLastChange} days ago`;
                tableRow.appendChild(updaedOnCell);

                const StatusCell = document.createElement("td");
                const visibilityState = document.createElement("div");
                visibilityState.innerText = "Private / Offline";
                StatusCell.appendChild(visibilityState);
                const ownerState = document.createElement("div");
                ownerState.innerText = "Owner";
                StatusCell.appendChild(ownerState);
                tableRow.appendChild(StatusCell);

                tableBody.appendChild(tableRow);
            });
    }

}