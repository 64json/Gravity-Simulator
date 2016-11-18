class InvisibleError extends Error {
    constructor(message){
        super(message);
    }
}

module.exports = InvisibleError;