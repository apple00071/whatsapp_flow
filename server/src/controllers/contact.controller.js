/**
 * Contact Controller
 * Handles contact management operations
 */

const { Contact, Session } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all contacts for a session
 */
exports.listContacts = async (req, res) => {
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
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { phone_number: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where,
    limit,
    offset,
    order: [['name', 'ASC']],
  });

  res.json({
    success: true,
    data: {
      contacts,
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
 * Get contact by ID
 */
exports.getContact = async (req, res) => {
  const contact = await Contact.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!contact) {
    throw new ApiError(404, 'Contact not found');
  }

  res.json({
    success: true,
    data: contact,
  });
};

/**
 * Create a new contact
 */
exports.createContact = async (req, res) => {
  const { session_id, phone_number, name, email, labels, custom_fields } = req.body;

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

  // Check if contact already exists
  const existingContact = await Contact.findOne({
    where: {
      session_id,
      phone_number,
    },
  });

  if (existingContact) {
    throw new ApiError(400, 'Contact already exists for this session');
  }

  const contact = await Contact.create({
    session_id,
    phone_number,
    name,
    email,
    labels: labels || [],
    custom_fields: custom_fields || {},
  });

  res.status(201).json({
    success: true,
    message: 'Contact created successfully',
    data: contact,
  });
};

/**
 * Update contact
 */
exports.updateContact = async (req, res) => {
  const { name, email, labels, custom_fields } = req.body;

  const contact = await Contact.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!contact) {
    throw new ApiError(404, 'Contact not found');
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (labels !== undefined) updates.labels = labels;
  if (custom_fields !== undefined) {
    updates.custom_fields = { ...contact.custom_fields, ...custom_fields };
  }

  await contact.update(updates);

  res.json({
    success: true,
    message: 'Contact updated successfully',
    data: contact,
  });
};

/**
 * Delete contact
 */
exports.deleteContact = async (req, res) => {
  const contact = await Contact.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: Session,
        as: 'session',
        where: { user_id: req.user.id },
      },
    ],
  });

  if (!contact) {
    throw new ApiError(404, 'Contact not found');
  }

  await contact.destroy();

  res.json({
    success: true,
    message: 'Contact deleted successfully',
  });
};

/**
 * Sync contacts from WhatsApp
 */
exports.syncContacts = async (req, res) => {
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

  // Get contacts from WhatsApp
  const whatsappContacts = await client.getContacts();

  let syncedCount = 0;
  let updatedCount = 0;

  for (const waContact of whatsappContacts) {
    if (!waContact.isUser) continue; // Skip non-user contacts

    const [contact, created] = await Contact.findOrCreate({
      where: {
        session_id,
        phone_number: waContact.id.user,
      },
      defaults: {
        name: waContact.name || waContact.pushname || waContact.id.user,
        profile_pic_url: await waContact.getProfilePicUrl().catch(() => null),
        is_business: waContact.isBusiness,
      },
    });

    if (created) {
      syncedCount++;
    } else {
      // Update existing contact
      await contact.update({
        name: waContact.name || waContact.pushname || contact.name,
        profile_pic_url: await waContact.getProfilePicUrl().catch(() => null),
        is_business: waContact.isBusiness,
      });
      updatedCount++;
    }
  }

  res.json({
    success: true,
    message: 'Contacts synced successfully',
    data: {
      synced: syncedCount,
      updated: updatedCount,
      total: syncedCount + updatedCount,
    },
  });
};

/**
 * Bulk import contacts
 */
exports.bulkImport = async (req, res) => {
  const { session_id, contacts } = req.body;

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

  const imported = [];
  const errors = [];

  for (const contactData of contacts) {
    try {
      const [contact, created] = await Contact.findOrCreate({
        where: {
          session_id,
          phone_number: contactData.phone_number,
        },
        defaults: {
          name: contactData.name,
          email: contactData.email,
          labels: contactData.labels || [],
          custom_fields: contactData.custom_fields || {},
        },
      });

      if (created) {
        imported.push(contact);
      } else {
        errors.push({
          phone_number: contactData.phone_number,
          error: 'Contact already exists',
        });
      }
    } catch (error) {
      errors.push({
        phone_number: contactData.phone_number,
        error: error.message,
      });
    }
  }

  res.json({
    success: true,
    message: `Imported ${imported.length} contacts`,
    data: {
      imported: imported.length,
      errors: errors.length,
      details: errors,
    },
  });
};

/**
 * Export contacts
 */
exports.exportContacts = async (req, res) => {
  const { session_id } = req.query;

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

  const contacts = await Contact.findAll({
    where: { session_id },
    order: [['name', 'ASC']],
  });

  res.json({
    success: true,
    data: contacts,
  });
};

