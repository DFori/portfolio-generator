 import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';
import Experience from '../components/Experience';

const ViewPortfolio = () => {
  const { portfolioId } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        console.log('Received portfolioId:', portfolioId);
        
        if (!portfolioId || typeof portfolioId !== 'string' || portfolioId.trim() === '') {
          setError('Invalid portfolio ID');
          return;
        }

        // Ensure portfolioId is a valid Firestore document ID
        if (!/^[a-zA-Z0-9_-]{1,}$/.test(portfolioId)) {
          setError('Invalid portfolio ID format');
          return;
        }

        const portfolioDoc = await getDoc(doc(db, 'portfolios', portfolioId));
        
        if (!portfolioDoc.exists()) {
          setError('Portfolio not found');
          return;
        }

        setPortfolio({
          id: portfolioDoc.id,
          ...portfolioDoc.data()
        });
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [portfolioId]);

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
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return null;
  }

  const { sections } = portfolio;

  return (
    <div>
      <Navbar />
      
      {/* Hero Section */}
      <section 
        className="relative py-20 overflow-hidden bg-cover bg-center min-h-[60vh] flex items-center"
        style={{ 
          backgroundImage: sections.hero.backgroundImage 
            ? `url(${sections.hero.backgroundImage})` 
            : 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)'
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{sections.hero.title}</h1>
          <p className="text-xl md:text-2xl">{sections.hero.subtitle}</p>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">{sections.about.title}</h2>
          <div className="md:flex md:items-center md:space-x-10">
            {sections.about.image && (
              <div className="flex-shrink-0 mb-8 md:mb-0">
                <img 
                  src={sections.about.image} 
                  alt="Profile" 
                  className="h-64 w-64 rounded-full object-cover mx-auto"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="prose prose-lg max-w-none">
                {sections.about.content.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Skills Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">{sections.skills.title}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {sections.skills.items.map((skill, idx) => (
              <span 
                key={idx} 
                className="px-4 py-2 bg-white shadow rounded-full text-gray-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">{sections.projects.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.projects.items.map((project, idx) => {
              // Handle both string and object formats
              let projectObj = project;
              if (typeof project === 'string') {
                try {
                  projectObj = JSON.parse(project);
                } catch (e) {
                  projectObj = { title: 'Error', description: 'Invalid project data' };
                }
              }
              
              return (
                <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  {projectObj.imageUrl && (
                    <div className="h-48 w-full bg-gray-200">
                      <img 
                        src={projectObj.imageUrl} 
                        alt={projectObj.title} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{projectObj.title}</h3>
                    <p className="text-gray-600 mb-4">{projectObj.description}</p>
                    {projectObj.link && (
                      <a 
                        href={projectObj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">{sections.contact.title}</h2>
          <div className="text-center">
            <p className="text-lg mb-6">
              You can reach me at{" "}
              <a 
                href={`mailto:${sections.contact.email}`} 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {sections.contact.email}
              </a>
            </p>
            
            <div className="flex justify-center space-x-6">
              {sections.contact.social.github && (
                <a 
                  href={sections.contact.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900"
                >
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              )}
              
              {sections.contact.social.linkedin && (
                <a 
                  href={sections.contact.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900"
                >
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.7,3H4.3C3.582,3,3,3.582,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c0.718,0,1.3-0.582,1.3-1.3V4.3 C21,3.582,20.418,3,19.7,3z M8.339,18.338H5.667v-8.59h2.672V18.338z M7.004,8.574c-0.857,0-1.549-0.694-1.549-1.548 c0-0.855,0.691-1.548,1.549-1.548c0.854,0,1.547,0.694,1.547,1.548C8.551,7.881,7.858,8.574,7.004,8.574z M18.339,18.338h-2.669 v-4.177c0-0.996-0.017-2.278-1.387-2.278c-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h0.037 c0.356-0.675,1.227-1.387,2.526-1.387c2.703,0,3.203,1.779,3.203,4.092V18.338z" />
                  </svg>
                </a>
              )}
              
              {sections.contact.social.twitter && (
                <a 
                  href={sections.contact.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-900"
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Experience Section */}
      <Experience experiences={portfolio.experiences} />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} {portfolio.name} - All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default ViewPortfolio;
