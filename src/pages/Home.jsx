// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="container mx-auto px-6 py-20 text-center">
            <h1 className="text-5xl font-bold mb-4">Create Your Professional Portfolio in Minutes</h1>
            <p className="text-xl mb-8">Showcase your work, share your story, and get hired with a stunning portfolio website.</p>
            <div className="flex justify-center space-x-4">
              <Link to="/register" className="bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition duration-300">
                Get Started
              </Link>
              <Link to="/login" className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-blue-600 transition duration-300">
                Login
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Portfolio Generator?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-blue-500 text-4xl mb-4">
                  <i className="fas fa-bolt"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Quick Setup</h3>
                <p className="text-gray-600">Create your portfolio in minutes with our intuitive editor. No coding required.</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-blue-500 text-4xl mb-4">
                  <i className="fas fa-palette"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Beautiful Designs</h3>
                <p className="text-gray-600">Choose from professionally designed templates that make your work shine.</p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="text-blue-500 text-4xl mb-4">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Mobile Responsive</h3>
                <p className="text-gray-600">Your portfolio looks great on all devices - desktop, tablet, and mobile.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-8 rounded-lg">
                <p className="italic text-gray-600 mb-4">"This portfolio generator saved me so much time! I was able to showcase my work professionally without having to learn how to code."</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-bold">Sarah Johnson</h4>
                    <p className="text-gray-500">Graphic Designer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg">
                <p className="italic text-gray-600 mb-4">"I got three job interviews within a week of publishing my portfolio. The templates are clean and professional!"</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <h4 className="font-bold">Michael Chen</h4>
                    <p className="text-gray-500">Web Developer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Dream Portfolio?</h2>
            <p className="text-xl mb-8">Join thousands of professionals who have boosted their careers with our platform.</p>
            <Link to="/register" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition duration-300">
              Create Your Portfolio Now
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;