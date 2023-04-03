const express = require("express");
const router = express.Router();
 const {
  listContacts,
  getById,
  removeContact,
  addContact,
  updateContact,
} = require("./contactsMethods");

// GET /api/contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const contact = await getById(id);
    if (typeof contact === "string") {
      res.status(404).json({ message: "Not found" });
    } else {
      res.status(200).json(contact);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts
router.post("/", async (req, res, next) => { 
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
   const missingFields = [];
   if (!name) missingFields.push("name");
   if (!email) missingFields.push("email");
   if (!phone) missingFields.push("phone");
   res
     .status(400)
     .json({
       message: `The following mandatory fields are missing: ${missingFields.join(", ")}`,
     });
    return
  }
  try {
    const newContact = await addContact(name, email, phone);
    res.status(201).json(newContact);
  } catch (err) {    
    next(err);
  }
});

// DELETE /api/contacts/:id
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    const deletedContact = await removeContact(id);
    if (typeof deletedContact === "string") {
      res.status(404).json({ message: "Not found", deletedContact });
    } else {
      res.status(200).json({ message: "Contact deleted", deletedContact });
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id
router.put("/:id", async (req, res, next) => {
  const contactId = req.params.id;
  const { name, email, phone } = req.body;

  if (!name && !email && !phone) {
    res.status(400).json({ message: "Missing fields" });
    return;
  }

  try {
    const updatedContact = await updateContact(contactId, {
      name,
      email,
      phone,
    });

    if (!updatedContact) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    res.status(200).json(updatedContact);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
