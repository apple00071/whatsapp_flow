/**
 * Group Controller
 * Handles WhatsApp group management operations
 */

const { Group, Session } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all groups for a session
 */
exports.listGroups = async (req, res) => {
  const { session_id } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const search = req.query.search;

  // Verify session belongs to user
  const session = await Session.findOne({
    where: {
      id: session_id,
      user_id: req.user.id,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  const where = { session_id };

  // Add search filter
  if (search) {
    where.name = { [Op.iLike]: `%${search}%` };
  }

  const { count, rows: groups } = await Group.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
  });

  res.json({
    success: true,
    data: {
      groups,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    },
  });
};

/**
 * Get group by ID
 */
exports.getGroup = async (req, res) => {
  const group = await Group.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  res.json({
    success: true,
    data: group,
  });
};

/**
 * Sync groups from WhatsApp
 */
exports.syncGroups = async (req, res) => {
  const { session_id } = req.body;

  // Verify session belongs to user
  const session = await Session.findOne({
    where: {
      id: session_id,
      user_id: req.user.id,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.status !== 'connected') {
    throw new ApiError(400, 'Session is not connected');
  }

  // Get WhatsApp client
  const { whatsappManager } = require('../services/whatsapp.service');
  const client = whatsappManager.getClient(session_id);

  // Get chats and filter groups
  const chats = await client.getChats();
  const groupChats = chats.filter(chat => chat.isGroup);

  let syncedCount = 0;
  let updatedCount = 0;

  for (const groupChat of groupChats) {
    const [group, created] = await Group.findOrCreate({
      where: {
        session_id,
        whatsapp_group_id: groupChat.id._serialized,
      },
      defaults: {
        name: groupChat.name,
        description: groupChat.description || '',
        participants: groupChat.participants.map(p => p.id._serialized),
        admins: groupChat.participants
          .filter(p => p.isAdmin)
          .map(p => p.id._serialized),
        owner: groupChat.owner ? groupChat.owner._serialized : null,
        invite_code: await groupChat.getInviteCode().catch(() => null),
      },
    });

    if (created) {
      syncedCount++;
    } else {
      // Update existing group
      await group.update({
        name: groupChat.name,
        description: groupChat.description || '',
        participants: groupChat.participants.map(p => p.id._serialized),
        admins: groupChat.participants
          .filter(p => p.isAdmin)
          .map(p => p.id._serialized),
        owner: groupChat.owner ? groupChat.owner._serialized : null,
      });
      updatedCount++;
    }
  }

  res.json({
    success: true,
    message: 'Groups synced successfully',
    data: {
      synced: syncedCount,
      updated: updatedCount,
      total: syncedCount + updatedCount,
    },
  });
};

/**
 * Create a new group
 */
exports.createGroup = async (req, res) => {
  const { session_id, name, participants } = req.body;

  // Verify session belongs to user
  const session = await Session.findOne({
    where: {
      id: session_id,
      user_id: req.user.id,
    },
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.status !== 'connected') {
    throw new ApiError(400, 'Session is not connected');
  }

  // Get WhatsApp client
  const { whatsappManager } = require('../services/whatsapp.service');
  const client = whatsappManager.getClient(session_id);

  // Format participant numbers
  const formattedParticipants = participants.map(p => 
    p.includes('@') ? p : `${p}@c.us`
  );

  // Create group on WhatsApp
  const createdGroup = await client.createGroup(name, formattedParticipants);

  // Save to database
  const group = await Group.create({
    session_id,
    whatsapp_group_id: createdGroup.gid._serialized,
    name,
    participants: formattedParticipants,
    admins: [session.phone_number + '@c.us'],
    owner: session.phone_number + '@c.us',
  });

  res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: group,
  });
};

/**
 * Update group settings
 */
exports.updateGroup = async (req, res) => {
  const { name, description } = req.body;

  const group = await Group.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (group.session.status !== 'connected') {
    throw new ApiError(400, 'Session is not connected');
  }

  // Get WhatsApp client
  const { whatsappManager } = require('../services/whatsapp.service');
  const client = whatsappManager.getClient(group.session_id);

  // Get group chat
  const chat = await client.getChatById(group.whatsapp_group_id);

  // Update on WhatsApp
  if (name) {
    await chat.setSubject(name);
  }
  if (description !== undefined) {
    await chat.setDescription(description);
  }

  // Update in database
  const updates = {};
  if (name) updates.name = name;
  if (description !== undefined) updates.description = description;

  await group.update(updates);

  res.json({
    success: true,
    message: 'Group updated successfully',
    data: group,
  });
};

/**
 * Add participants to group
 */
exports.addParticipants = async (req, res) => {
  const { participants } = req.body;

  const group = await Group.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (group.session.status !== 'connected') {
    throw new ApiError(400, 'Session is not connected');
  }

  // Get WhatsApp client
  const { whatsappManager } = require('../services/whatsapp.service');
  const client = whatsappManager.getClient(group.session_id);

  // Get group chat
  const chat = await client.getChatById(group.whatsapp_group_id);

  // Format participant numbers
  const formattedParticipants = participants.map(p => 
    p.includes('@') ? p : `${p}@c.us`
  );

  // Add participants
  await chat.addParticipants(formattedParticipants);

  // Update database
  const updatedParticipants = [...new Set([...group.participants, ...formattedParticipants])];
  await group.update({ participants: updatedParticipants });

  res.json({
    success: true,
    message: 'Participants added successfully',
    data: group,
  });
};

/**
 * Remove participants from group
 */
exports.removeParticipants = async (req, res) => {
  const { participants } = req.body;

  const group = await Group.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (group.session.status !== 'connected') {
    throw new ApiError(400, 'Session is not connected');
  }

  // Get WhatsApp client
  const { whatsappManager } = require('../services/whatsapp.service');
  const client = whatsappManager.getClient(group.session_id);

  // Get group chat
  const chat = await client.getChatById(group.whatsapp_group_id);

  // Format participant numbers
  const formattedParticipants = participants.map(p => 
    p.includes('@') ? p : `${p}@c.us`
  );

  // Remove participants
  await chat.removeParticipants(formattedParticipants);

  // Update database
  const updatedParticipants = group.participants.filter(
    p => !formattedParticipants.includes(p)
  );
  await group.update({ participants: updatedParticipants });

  res.json({
    success: true,
    message: 'Participants removed successfully',
    data: group,
  });
};

/**
 * Leave group
 */
exports.leaveGroup = async (req, res) => {
  const group = await Group.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  if (group.session.status !== 'connected') {
    throw new ApiError(400, 'Session is not connected');
  }

  // Get WhatsApp client
  const { whatsappManager } = require('../services/whatsapp.service');
  const client = whatsappManager.getClient(group.session_id);

  // Get group chat
  const chat = await client.getChatById(group.whatsapp_group_id);

  // Leave group
  await chat.leave();

  // Delete from database
  await group.destroy();

  res.json({
    success: true,
    message: 'Left group successfully',
  });
};

