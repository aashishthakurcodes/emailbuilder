import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const Editor = () => {
  const [layout, setLayout] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [footer, setFooter] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  //Fetching Templates
  const fetchTemplates = () => {
    axios
      .get('https://emailbuilder-1-5cwp.onrender.com/api/getEmailLayouts')
      .then((response) => {
        console.log(response.data);
        setLayout(response.data);
        toast.success('Templates fetched successfully! ');
      })
      .catch(() => toast.error('Error fetching templates'));
  };


  //Uploading images
  const uploadImage = (file) => {
    if (!file) return toast.error('Please select a valid image');
    const formData = new FormData();
    formData.append('image', file);
    setImagePreview(URL.createObjectURL(file));

    axios
      .post('https://emailbuilder-1-5cwp.onrender.com/api/uploadImage', formData)
      .then((response) => {
        // If the template is being edited, update the imageUrls
        if (editingTemplate) {
          setImageUrls([...imageUrls, response.data.imageUrl]);
        } else {
          // Otherwise, add a new image to the array
          setImageUrls([response.data.imageUrl]);
        }
        // toast.success('Image uploaded successfully!');
      })
      .catch(() => toast.error('Error uploading image'));
  };


  //Saving template
  const saveTemplate = () => {
    if (!title.trim()) return toast.error('Title is required');
    if (!content.trim()) return toast.error('Content cannot be empty');

    const emailConfig = { title, content, footer, imageUrls };

    const apiUrl = editingTemplate
      ? `https://emailbuilder-1-5cwp.onrender.com/api/updateEmailConfig/${editingTemplate._id}`
      : 'https://emailbuilder-1-5cwp.onrender.com/api/uploadEmailConfig';

    const method = editingTemplate ? 'put' : 'post';

    // Check if the imageUrls state has changed to include the new image (or updated image)
    if (imagePreview) {
      // Make sure the new image is being added properly
      emailConfig.imageUrls = [...emailConfig.imageUrls, imagePreview];
    }

    axios[method](apiUrl, emailConfig)
      .then((response) => {
        toast.success('Template saved successfully!');
        setTitle('');
        setContent('');
        setFooter('');
        setImageUrls([]);
        setImagePreview(null);
        setEditingTemplate(null);
        fetchTemplates();
      })
      .catch(() => toast.error('Error saving template'));
  };



  //Edit Template
  const editTemplate = (template) => {
    setTitle(template.title);
    setContent(template.content);
    setFooter(template.footer);
    setImageUrls(template.imageUrls);
    setEditingTemplate(template);
  };

  //DeleteTemplate
  const deleteTemplate = (templateId) => {
    axios
      .delete(`https://emailbuilder-1-5cwp.onrender.com/api/deleteEmailConfig/${templateId}`)
      .then(() => {
        toast.error('Template deleted successfully!');
        fetchTemplates();
      })
      .catch(() => toast.error('Error deleting template'));
  };

  return (
    <div className="max-w-2xl mx-auto my-10 p-6 bg-gray-500   shadow-4xl main">
      <ToastContainer />
      {/* Banner Image */}
      <div className="w-full h-40 overflow-hidden rounded-lg mb-8">
        <img
          src="https://miro.medium.com/v2/resize:fit:1400/0*OckilgOyByn-x242.gif"
          alt="Banner"
          className="w-full h-full "
        />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-100 mb-2">Email Builder</h1>
        <p className="text-gray-200">Design, edit, and manage your email templates with ease!</p>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-lg shadow-md mb-10"
      >
        <div className="grid gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter email title"
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <ReactQuill
              id="content"
              value={content}
              onChange={setContent}
              className="border rounded-md"
            />
          </div>

          <div>
            <label htmlFor="footer" className="block text-sm font-medium text-gray-700 mb-1">
              Footer
            </label>
            <input
              id="footer"
              type="text"
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              placeholder="Enter footer text"
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
            {imagePreview && (
              <motion.img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>

          <div className="text-center">
            <button
              onClick={saveTemplate}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition duration-200"
            >
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Templates List */}
      <div>
        <h2 className="text-2xl font-bold text-center text-gray-200 mb-6">Existing Templates</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {layout.length > 0 ? (
            layout.map((template) => (
              <motion.div
                key={template._id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* {template.imageUrls && template.imageUrls[0] ? (
                  <img
                    src={`http://localhost:5000${template.imageUrls[0]}`}  // Use template.imageUrls
                    alt="Template"
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Placeholder"
                    className="w-full h-40 object-cover rounded-md mb-4"
                  />
                )} */}
                <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
                <div
                  className="text-sm text-gray-700 mb-4"
                  dangerouslySetInnerHTML={{ __html: template.content }}
                />

                <p className="text-sm text-gray-600 mb-4">{template.footer}</p>
               
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => editTemplate(template)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(template._id)}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow hover:bg-red-700 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-600">No templates found.</p>
          )}

        </div>
      </div>
    </div>
  );
};

export default Editor;
