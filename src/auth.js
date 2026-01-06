function isAdmin(msg, admins) {
  return admins.includes(String(msg.from.id));
}

module.exports = { isAdmin };