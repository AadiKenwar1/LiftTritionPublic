module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        "babel-preset-expo", // Just use this
      ],
      plugins: [
        "react-native-reanimated/plugin", // Must be last
      ],
    };
  };

