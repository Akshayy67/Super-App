import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Check, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import { ContactForm } from './ContactForm';

export const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = useState(false);

  const handleSubscribe = () => {
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Subscription Plans
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose the perfect plan for your academic journey
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">₹0</div>
              <p className="text-gray-600 dark:text-gray-400">Forever</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Basic features access</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Limited AI assistance</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Community access</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Current Plan
            </button>
          </div>

          {/* Monthly Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Popular
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Monthly</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">₹299</div>
              <p className="text-gray-600 dark:text-gray-400">per month</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">All free features</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Unlimited AI assistance</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Priority support</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Advanced features</span>
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Subscribe Now
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Yearly</h3>
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">₹2,999</div>
              <p className="text-gray-600 dark:text-gray-400">per year</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-semibold">
                Save ₹589 (17% off)
              </p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">All monthly features</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Best value</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Exclusive features</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">24/7 priority support</span>
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Subscribe Now
            </button>
          </div>
        </div>

        {/* Refund Policy Info */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                30-Day Money-Back Guarantee
              </h3>
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                Not satisfied? Get a full refund within 30 days of your initial subscription. 
                Refunds are processed within 10-14 business days after approval. 
                <a href="/policies/cancellation-refund.html" className="underline ml-1" target="_blank" rel="noopener noreferrer">
                  Learn more
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Need Help Choosing?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our team is here to help you find the perfect plan
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Email Us</p>
                <a href="mailto:support@super-app.tech" className="text-blue-600 dark:text-blue-400 hover:underline">
                  support@super-app.tech
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Call Us</p>
                <a href="tel:+917382005522" className="text-blue-600 dark:text-blue-400 hover:underline">
                  +91 7382005522
                </a>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              {showContactForm ? 'Hide Contact Form' : 'Show Contact Form'}
            </button>
          </div>

          {showContactForm && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <ContactForm />
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            By subscribing, you agree to our{' '}
            <a href="/policies/terms-and-conditions.html" target="_blank" rel="noopener noreferrer" className="underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/policies/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

