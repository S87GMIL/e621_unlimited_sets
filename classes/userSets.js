class UserSets {

    constructor(userId) {
        if (!userId)
            throw Error("No user ID was passed!");

        this.userId = userId;

        this._setStorageInstance = new CustomSetStorage(userId);
        this._setInstances = [];

        this.#initializeSets();
    }

    #initializeSets() {
        this._setStorageInstance.getUserSets().forEach(setObject => {
            this._setInstances.push(
                new PostSet(setObject, this._setStorageInstance)
            );
        });
    }

    getSets() {
        return this._setInstances;
    }

    getSet(setId) {
        return this._setInstances.filter(set => set.getId() === setId)[0];
    }

    createSet(setId, label, description) {
        const createdSet = this._setStorageInstance.createSet(setId, label, description);
        const newSetInstance = new PostSet(createdSet, this._setStorageInstance);
        this._setInstances.push(newSetInstance);

        return newSetInstance;
    }

    deleteSet(setId) {
        this._setStorageInstance.deleteSet(setId);
        this._setInstances = this._setInstances.filter(setInstance => setInstance.getId() !== setId);
    }

}