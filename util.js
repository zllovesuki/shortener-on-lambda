module.exports.isValidUrl = (url) => {
    try {
        new URL(url);
    } catch (e) {
        return false;
    }
    return true

}
