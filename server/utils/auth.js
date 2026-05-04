const isOwnerOrAdmin = (resourceAuthor, user) => {
  if (!user) {
    return false;
  }

  return resourceAuthor.toString() === user._id.toString() || user.role === 'admin';
};

module.exports = {
  isOwnerOrAdmin
};
