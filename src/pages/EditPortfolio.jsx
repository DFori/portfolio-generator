// src/pages/EditPortfolio.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import Navbar from '../components/Navbar';

const EditPortfolio = () => {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('hero');
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const portfolioDoc = await getDoc(doc(db, 'portfolios', portfolioId));
        
        if (portfolioDoc.exists()) {
          const portfolioData = portfolioDoc.data();
          
          // Check if the user owns this portfolio
          if (portfolioData.owner !== auth.currentUser.uid) {
            setError('You do not have permission to edit this portfolio');
            return;
          }
          
          setPortfolio({
            id: portfolioDoc.id,
            ...portfolioData
          });
        } else {
          setError('Portfolio not found');
        }
      } catch (err) {
        setError('Failed to load portfolio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchPortfolio();
    }
  }, [portfolioId, auth.currentUser]);

  const handleTextChange = (section, field, value) => {
    setPortfolio(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (section, index, value) => {
    const newItems = [...portfolio.sections[section].items];
    newItems[index] = value;
    
    setPortfolio(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          items: newItems
        }
      }
    }));
  };

  const handleAddArrayItem = (section) => {
    const newItems = [...portfolio.sections[section].items, ''];
    
    setPortfolio(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          items: newItems
        }
      }
    }));
  };

  const handleRemoveArrayItem = (section, index) => {
    const newItems = [...portfolio.sections[section].items];
    newItems.splice(index, 1);
    
    setPortfolio(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: {
          ...prev.sections[section],
          items: newItems
        }
      }
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperiences = [...portfolio.experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    
    setPortfolio(prev => ({
      ...prev,
      experiences: newExperiences
    }));
  };

  const handleAddExperience = () => {
    const newExperience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      skills: []
    };
    
    setPortfolio(prev => ({
      ...prev,
      experiences: [...(prev.experiences || []), newExperience]
    }));
  };

  const handleRemoveExperience = (index) => {
    const newExperiences = [...portfolio.experiences];
    newExperiences.splice(index, 1);
    
    setPortfolio(prev => ({
      ...prev,
      experiences: newExperiences
    }));
  };

  const handleSocialChange = (platform, value) => {
    setPortfolio(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        contact: {
          ...prev.sections.contact,
          social: {
            ...prev.sections.contact.social,
            [platform]: value
          }
        }
      }
    }));
  };

  const handleImageUpload = async (section, field, file) => {
    if (!file) return;

    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, `portfolios/${portfolioId}/${section}_${field}_${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Set up progress tracking
    setUploadProgress(prev => ({
      ...prev,
      [`${section}_${field}`]: 0
    }));

    // Listen for state changes, errors, and completion of the upload
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(prev => ({
          ...prev,
          [`${section}_${field}`]: progress
        }));
      },
      (error) => {
        console.error('Upload error:', error);
        setError('Failed to upload image');
        setUploadProgress(prev => ({
          ...prev,
          [`${section}_${field}`]: 0
        }));
      },
      async () => {
        // Upload completed successfully, get the download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // Update the portfolio state with the new image URL
        setPortfolio(prev => ({
          ...prev,
          sections: {
            ...prev.sections,
            [section]: {
              ...prev.sections[section],
              [field]: downloadURL
            }
          }
        }));
        
        // Clear progress
        setUploadProgress(prev => ({
          ...prev,
          [`${section}_${field}`]: 100
        }));
        
        // Show preview
        setPreviewUrl(downloadURL);
      }
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Update the portfolio document in Firestore
      await updateDoc(doc(db, 'portfolios', portfolioId), {
        sections: portfolio.sections,
        experiences: portfolio.experiences || [],
        updatedAt: new Date()
      });
      
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Failed to save changes');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  return (
    <div>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              Edit Portfolio: {portfolio.name}
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button
              onClick={() => navigate(`/portfolio/${auth.currentUser.uid}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Preview
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        
        {saveSuccess && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">Changes saved successfully!</span>
          </div>
        )}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[...Object.keys(portfolio.sections), 'experience'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 ${
                    activeSection === section
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            {/* Hero Section */}
            {activeSection === 'hero' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="hero-title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="hero-title"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={portfolio.sections.hero.title}
                    onChange={(e) => handleTextChange('hero', 'title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="hero-subtitle" className="block text-sm font-medium text-gray-700">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    id="hero-subtitle"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={portfolio.sections.hero.subtitle}
                    onChange={(e) => handleTextChange('hero', 'subtitle', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Background Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {portfolio.sections.hero.backgroundImage && (
                      <div className="mr-4">
                        <img
                          src={portfolio.sections.hero.backgroundImage}
                          alt="Background preview"
                          className="h-32 w-auto object-cover rounded"
                        />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        id="hero-background"
                        onChange={(e) => handleImageUpload('hero', 'backgroundImage', e.target.files[0])}
                      />
                      <label
                        htmlFor="hero-background"
                        className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Upload New Image
                      </label>
                    </div>
                  </div>
                  {uploadProgress['hero_backgroundImage'] > 0 && uploadProgress['hero_backgroundImage'] < 100 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress['hero_backgroundImage']}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* About Section */}
            {activeSection === 'about' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="about-title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="about-title"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={portfolio.sections.about.title}
                    onChange={(e) => handleTextChange('about', 'title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="about-content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    id="about-content"
                    rows={6}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={portfolio.sections.about.content}
                    onChange={(e) => handleTextChange('about', 'content', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Profile Image
                  </label>
                  <div className="mt-1 flex items-center">
                    {portfolio.sections.about.image && (
                      <div className="mr-4">
                        <img
                          src={portfolio.sections.about.image}
                          alt="Profile preview"
                          className="h-32 w-32 object-cover rounded-full"
                        />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        id="about-image"
                        onChange={(e) => handleImageUpload('about', 'image', e.target.files[0])}
                      />
                      <label
                        htmlFor="about-image"
                        className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Upload Profile Image
                      </label>
                    </div>
                  </div>
                  {uploadProgress['about_image'] > 0 && uploadProgress['about_image'] < 100 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress['about_image']}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Skills Section */}
            {activeSection === 'skills' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="skills-title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="skills-title"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={portfolio.sections.skills.title}
                    onChange={(e) => handleTextChange('skills', 'title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <div className="mt-1 space-y-2">
                    {portfolio.sections.skills.items.map((skill, index) => (
                      <div key={index} className="flex">
                        <input
                          type="text"
                          className="block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={skill}
                          onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem('skills', index)}
                          className="ml-2 p-1 text-red-600 hover:text-red-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddArrayItem('skills')}
                      className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Projects Section */}
            {activeSection === 'projects' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="projects-title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="projects-title"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={portfolio.sections.projects.title}
                    onChange={(e) => handleTextChange('projects', 'title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Projects
                  </label>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    Add your projects in JSON format. Each project should include title, description, imageUrl (optional), and link (optional).
                  </p>
                  <div className="mt-1 space-y-4">
                    {portfolio.sections.projects.items.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <div className="flex justify-between mb-3">
                          <h3 className="text-sm font-medium">Project {index + 1}</h3>
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem('projects', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                        <textarea
                          rows={6}
                          className="w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={typeof project === 'object' ? JSON.stringify(project, null, 2) : project}
                          onChange={(e) => {
                            try {
                              // Try to parse it as JSON
                              const parsed = JSON.parse(e.target.value);
                              handleArrayChange('projects', index, parsed);
                            } catch (err) {
                              // If it's not valid JSON// Completing the EditPortfolio.js file:

                              // If it's not valid JSON
                              // Just store it as a string for now
                              handleArrayChange('projects', index, e.target.value);
                            }
                          }}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddArrayItem('projects')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Project
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Project JSON example: <code>{"{"}"title":"My Project","description":"A cool project I built","imageUrl":"https://example.com/image.jpg","link":"https://example.com"{"}"}</code>
                  </p>
                </div>
              </div>
            )}
            
            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="contact-title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    id="contact-title"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={portfolio.sections.contact.title}
                    onChange={(e) => handleTextChange('contact', 'title', e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={portfolio.sections.contact.email}
                    onChange={(e) => handleTextChange('contact', 'email', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Social Media
                  </label>
                  <div className="mt-2 space-y-4">
                    <div>
                      <label htmlFor="social-github" className="block text-sm font-medium text-gray-700">
                        GitHub
                      </label>
                      <input
                        type="text"
                        id="social-github"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={portfolio.sections.contact.social.github || ''}
                        onChange={(e) => handleSocialChange('github', e.target.value)}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    <div>
                      <label htmlFor="social-linkedin" className="block text-sm font-medium text-gray-700">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        id="social-linkedin"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={portfolio.sections.contact.social.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/yourusername"
                      />
                    </div>
                    <div>
                      <label htmlFor="social-twitter" className="block text-sm font-medium text-gray-700">
                        Twitter
                      </label>
                      <input
                        type="text"
                        id="social-twitter"
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        value={portfolio.sections.contact.social.twitter || ''}
                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                        placeholder="https://twitter.com/yourusername"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Experiences
                  </label>
                  <div className="mt-1 space-y-4">
                    {portfolio.experiences?.map((experience, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor={`company-${index}`} className="block text-sm font-medium text-gray-700">
                              Company
                            </label>
                            <input
                              type="text"
                              id={`company-${index}`}
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={experience.company || ''}
                              onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor={`position-${index}`} className="block text-sm font-medium text-gray-700">
                              Position
                            </label>
                            <input
                              type="text"
                              id={`position-${index}`}
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={experience.position || ''}
                              onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor={`startDate-${index}`} className="block text-sm font-medium text-gray-700">
                              Start Date
                            </label>
                            <input
                              type="date"
                              id={`startDate-${index}`}
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={experience.startDate || ''}
                              onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                            />
                          </div>
                          <div>
                            <label htmlFor={`endDate-${index}`} className="block text-sm font-medium text-gray-700">
                              End Date
                            </label>
                            <input
                              type="date"
                              id={`endDate-${index}`}
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={experience.endDate || ''}
                              onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                            />
                          </div>
                          <div className="col-span-full">
                            <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <textarea
                              id={`description-${index}`}
                              rows={3}
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={experience.description || ''}
                              onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                            />
                          </div>
                          <div className="col-span-full">
                            <label htmlFor={`skills-${index}`} className="block text-sm font-medium text-gray-700">
                              Skills
                            </label>
                            <input
                              type="text"
                              id={`skills-${index}`}
                              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                              value={experience.skills?.join(', ') || ''}
                              onChange={(e) => handleExperienceChange(index, 'skills', e.target.value.split(',').map(s => s.trim()))}
                              placeholder="Comma separated list of skills"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveExperience(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove Experience
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Add Experience
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPortfolio;