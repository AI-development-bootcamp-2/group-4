'use strict';

// guards/index.js — barrel

const { ownershipGuard, messageOwnerGuard, notificationOwnerGuard } = require('./ownership/ownership.guard');
const { requireRole, adminOnly, modOrAdmin, superAdminOnly }         = require('./role/role.guard');
const ipGuard            = require('./ip/ip.guard');           // does not exist
const subscriptionGuard  = require('./subscription/sub.guard'); // does not exist

module.exports = {
  ownershipGuard,
  messageOwnerGuard,
  notificationOwnerGuard,
  requireRole,
  adminOnly,
  modOrAdmin,
  superAdminOnly,
  ipGuard,
  subscriptionGuard,
};
