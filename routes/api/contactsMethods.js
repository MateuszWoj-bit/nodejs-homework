const Joi = require("joi");
const mongoose = require("mongoose");
require("dotenv").config();
const { Schema } = mongoose;

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
});

const Contact = mongoose.model("Contact", contactSchema);

async function listContacts() {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (err) {
    throw new Error(`Error getting contacts: ${err.message}`);
  }
}

async function getById(contactId) {
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return `id ${contactId} not found`;
    }
    return contact;
  } catch (err) {
    throw new Error(`Error getting contact: ${err.message}`);
  }
}

async function removeContact(contactId) {
  try {
    const contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) {
      return `Id ${contactId} not found, no contact deleted`;
    }
    return contact;
  } catch (err) {
    throw new Error(`Error removing contact: ${err.message}`);
  }
}

const addContact = async (name, email, phone) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(6).max(20).required(),
  });

  const validation = schema.validate({ name, email, phone });
  if (validation.error) {
    throw new Error(`Validation error: ${validation.error.message}`);
  }
  try {
    const newContact = new Contact({ name, email, phone });
    await newContact.save();
    return newContact;
  } catch (err) {
    throw new Error(`Error adding contact: ${err.message}`);
  }
};

async function updateContact(contactId, body) {
const schema = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  phone: Joi.string().min(6).max(20),
});

const validation = schema.validate(body);
if (validation.error) {
  console.log(validation.error.message);
  throw new Error(`Validation error: ${validation.error.message}`);
}

  try {
    const contact = await Contact.findByIdAndUpdate(contactId, body, {
      new: true,
    });
    if (!contact) {
      return null;
    }
    return contact;
  } catch (err) {
    throw new Error(`Error updating contact: ${err.message}`);
  }
}

async function updateStatusContact(contactId, body) {
 const schema = Joi.object({
   favorite: Joi.boolean().required(),
 });

 const validationResult = schema.validate(body);

 if (validationResult.error) {
   return { message: "missing field favorite" };
 }
  try {
    const { favorite } = body;
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return null;
    }
    contact.favorite = favorite;
    await contact.save();
    return contact;
  } catch (err) {
    throw new Error(`Error updating contact: ${err.message}`);
  }
}

module.exports = {
  listContacts,
  getById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
