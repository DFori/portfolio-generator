// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          setUser(userDoc.data());
          
          // Fetch portfolio details
          const portfoliosList = userDoc.data().portfolios || [];
          const portfolioPromises = portfoliosList.map(portfolioId => 
            getDoc(doc(db, 'portfolios', portfolioId))
          );
          
          const portfolioDocs = await Promise.all(portfolioPromises);
          const portfoliosData = portfolioDocs.map(doc => {
            return {
              id: doc.id,
              ...doc.data()
            };
          });
          
          setPortfolios(portfoliosData);
        } else {
          setError('User data not found');
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (auth.currentUser) {
      fetchUserData();
    } else {
      navigate('/login');
    }
  }, [auth.currentUser, navigate]);

  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    
    if (!newPortfolioName.trim()) {
      return;
    }
    
    try {
      // Create a new portfolio document
      const newPortfolioRef = doc(db, 'portfolios', Date.now().toString());
      await setDoc(newPortfolioRef, {
        name: newPortfolioName,
        owner: auth.currentUser.uid,
        createdAt: new Date(),
        template: 'default',
        sections: {
          hero: {
            title: `I'm ${user.name || auth.currentUser.displayName || ''}`,
            subtitle: 'Professional Portfolio',
            backgroundImage: '',
          },
          about: {
            title: 'About Me',
            content: 'Write something about yourself...',
            image: '',
          },
          skills: {
            title: 'My Skills',
            items: ['Skill 1', 'Skill 2', 'Skill 3'],
          },
          projects: {
            title: 'My Projects',
            items: [],
          },
          contact: {
            title: 'Contact Me',
            email: user.email || auth.currentUser.email || '',
            social: {
              linkedin: '',
              github: '',
              twitter: '',
            },
          },
        },
      });
      
      // Add portfolio to user's portfolios array
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        portfolios: arrayUnion(newPortfolioRef.id),
      });
      
      // Update local state
      setPortfolios([...portfolios, {
        id: newPortfolioRef.id,
        name: newPortfolioName,
        createdAt: new Date(),
        template: 'default',
      }]);
      
      // Close modal and reset form
      setCreateModalOpen(false);
      setNewPortfolioName('');
    } catch (err) {
      setError('Failed to create portfolio');
      console.error(err);
    }
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (window.confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      try {
        // Remove portfolio reference from user document
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          portfolios: arrayRemove(portfolioId),
        });
        
        // Delete the portfolio document
        await deleteDoc(doc(db, 'portfolios', portfolioId));
        
        // Update local state
        setPortfolios(portfolios.filter(p => p.id !== portfolioId));
      } catch (err) {
        setError('Failed to delete portfolio');
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your portfolio websites
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Portfolio
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {portfolios.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">No portfolios yet</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 mx-auto">
                <p>Get started by creating your first portfolio website.</p>
              </div>
              <div className="mt-5">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create a Portfolio
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{portfolio.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Template: {portfolio.template || 'Default'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Created: {portfolio.createdAt ? new Date(portfolio.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <Link
                      to={`/edit/${portfolio.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </Link>
                    <Link
                      to={`/portfolio/${portfolio.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => handleDeletePortfolio(portfolio.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Create Portfolio Modal */}
      {createModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setCreateModalOpen(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreatePortfolio}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Create New Portfolio
                      </h3>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="portfolioName"
                          id="portfolioName"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Portfolio Name"
                          value={newPortfolioName}
                          onChange={(e) => setNewPortfolioName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setCreateModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;