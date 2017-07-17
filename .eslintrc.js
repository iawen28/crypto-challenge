module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import",
    ],
    "globals": {
        "window": true
    },
    "env": {
        "browser": true,
        "node": true,
        "es6": true,
    },
    "rules": {
        "no-comma-danger": 0,
        "class-methods-use-this": 0,
        "no-console": 0,
        "react/prop-types": 0,
        "comma-dangle": 0
    }
};