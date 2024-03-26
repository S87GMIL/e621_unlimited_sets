class StorageHelper {

    static saveValue(key, value) {
        if (!key)
            throw Error("No value key was passed!");

        GM_setValue(key, value);
    }

    static getValue(key) {
        if (!key)
            throw Error("No value key was passed!");

        return GM_getValue(key);
    }

}