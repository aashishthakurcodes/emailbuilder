const express = require('express');
const multer = require('multer');
const path = require('path');
const EmailTemplate = require('../models/EmailTemplate');
const router = express.Router();

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage: storage });

// Get all email templates
router.get('/getEmailLayouts', async (req, res) => {
  try {
    const templates = await EmailTemplate.find();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const updatedTemplates = templates.map((template) => {
      const updatedImageUrls = Array.isArray(template.imageUrls)
        ? template.imageUrls.map((url) =>
            url.startsWith('http') ? url : `${baseUrl}${url}`
          )
        : [];
      return { ...template._doc, imageUrls: updatedImageUrls };
    });

    res.json(updatedTemplates);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching email templates' });
  }
});

// Get a single email template by ID
router.get('/getEmailLayout/:id', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const updatedImageUrls = Array.isArray(template.imageUrls)
      ? template.imageUrls.map((url) =>
          url.startsWith('http') ? url : `${baseUrl}${url}`
        )
      : [];

    res.json({ ...template._doc, imageUrls: updatedImageUrls });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching email template' });
  }
});

// Upload an image and get the image URL
router.post('/uploadImage', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({ imageUrl: `${baseUrl}/uploads/${req.file.filename}` });
});

// Create a new email template
router.post('/uploadEmailConfig', async (req, res) => {
  const { title, content, footer, imageUrls } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const newTemplate = new EmailTemplate({ title, content, footer, imageUrls });
    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ error: 'Error saving template' });
  }
});

// Update an email template (including image)
router.put('/updateEmailConfig/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, content, footer, imageUrls } = req.body;
    let newImageUrls = imageUrls;

    if (req.file) {
      // If a new image is uploaded, add it to the imageUrls array
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      newImageUrls = [...imageUrls, `${baseUrl}/uploads/${req.file.filename}`];
    }

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      { title, content, footer, imageUrls: newImageUrls },
      { new: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(updatedTemplate);
  } catch (error) {
    res.status(500).json({ error: 'Error updating template' });
  }
});

// Delete an email template
router.delete('/deleteEmailConfig/:id', async (req, res) => {
  try {
    const deletedTemplate = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!deletedTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting template' });
  }
});

module.exports = router;
