module.exports = {
    "env": {
        "browser": true,
        "es6" : true,
        "commonjs": true,
        "jquery": true,
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-console": "warn"
    },
    "globals": {
        "Float32Array": true,
        "canvas": true,
        "gl": true,
        "program": true,
        "Matrices": true,
        "models": true,
    }
};
