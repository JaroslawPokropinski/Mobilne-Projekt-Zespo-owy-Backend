const { genSalt, hash, compare } = require('bcrypt');

exports.cryptPassword = (password, callback) => {
    genSalt(10, function(err, salt) {
        if (err) return callback(err);

        hash(password, salt, function(err, _hash) {
            return callback(err, _hash);
        });
    });
};

exports.comparePassword = (plainPass, hashword, callback) => {
    compare(plainPass, hashword, function(err, isPasswordMatch) {
        return err == null ? callback(null, isPasswordMatch) : callback(err);
    });
};
