const Joi = require("joi");
const fs = require("fs/promises");
const path = require("path");
const contactsPath = path.join(__dirname, "db", "contacts.json");

async function listContacts() {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    return contacts;
  } catch (err) {
    throw new Error(`Error getting contacts: ${err.message}`);
  }
}

async function getById(contactId) {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const contact = contacts.find((c) => c.id === contactId);
    if (contact === undefined) {
      return `id ${contactId} not found`;
    }
    return contact;
  } catch (err) {
    throw new Error(`Error getting contact: ${err.message}`);
  }
}

async function removeContact(contactId) {
  try {
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const contact = contacts.find((c) => c.id === contactId);
    if (contact === undefined) {
      return `Id ${contactId} not found, no contact deleted`;
    }
    const updatedContacts = contacts.filter((c) => c.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(updatedContacts));
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
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const lastContact = contacts[contacts.length - 1];
    const newId = parseInt(lastContact.id) + 1;
    const newContact = { id: newId.toString(), name, email, phone };
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
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
    const data = await fs.readFile(contactsPath, "utf-8");
    const contacts = JSON.parse(data);
    const contactIndex = contacts.findIndex(
      (contact) => contact.id === contactId
    );

    if (contactIndex === -1) {
      return null;
    }

    contacts[contactIndex] = {
      ...contacts[contactIndex],
      ...body,
      id: contactId,
    };

    await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

    return contacts[contactIndex];
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
};