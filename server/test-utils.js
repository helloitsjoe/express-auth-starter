const silenceLogsMatching = string => log => (...logArgs) => {
  if (new RegExp(string).test(...logArgs)) {
    return;
  }
  log(...logArgs);
};

module.exports = { silenceLogsMatching };
