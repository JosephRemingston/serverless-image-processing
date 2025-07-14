var generateUserId = () => {
  const timestamp = Date.now().toString(36); // base36 = compact timestamp
  const random = Math.random().toString(36).substring(2, 6); // 4-char random
  return `user_${timestamp}_${random}`;
};

module.exports = generateUserId;