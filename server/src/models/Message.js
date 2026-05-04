'use strict';

const mongoose = require('mongoose');

/**
 * A Conversation groups two users and holds metadata.
 * Individual messages reference the conversation by id.
 */
const conversationSchema = new mongoose.Schema(
  {
    // Exactly two participants (direct message model)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Last message preview — updated on every new message for inbox display
    lastMessage: {
      content: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      sentAt: { type: Date, default: null },
    },
    // Per-participant unread counters: { userId: count }
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    // Soft-delete per participant
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Quick lookup by participant pair
conversationSchema.index({ participants: 1 });

conversationSchema.statics.findBetween = async function (userA, userB) {
  return this.findOne({
    participants: { $all: [userA, userB] },
  });
};

const Conversation = mongoose.model('Conversation', conversationSchema);

/**
 * Individual message within a conversation.
 */
const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Soft-delete: hide from recipient once they delete, hard-delete when both have deleted
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Optional: reply-to for threading within a conversation
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Attachments — stored as URL references after upload
    attachments: [
      {
        url: String,
        filename: String,
        mimeType: String,
        size: Number,
      },
    ],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = { Conversation, Message };
