import React from 'react';
import ContactForm from '../../shared/components/ContactForm';
import { MapPin, Mail, Phone } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions about EffiMapPro? We're here to help! Reach out to our team and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="bg-[#003f88] text-white rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <MapPin className="h-6 w-6 mt-1 mr-4" />
              <div>
                <h3 className="font-medium mb-1">Our Location</h3>
                <p className="text-gray-200">123 Business Street<br />Silicon Valley, CA 94025</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="h-6 w-6 mt-1 mr-4" />
              <div>
                <h3 className="font-medium mb-1">Email Us</h3>
                <a href="mailto:contact@effimappro.com" className="text-gray-200 hover:text-white">
                  contact@effimappro.com
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="h-6 w-6 mt-1 mr-4" />
              <div>
                <h3 className="font-medium mb-1">Call Us</h3>
                <a href="tel:+1-555-123-4567" className="text-gray-200 hover:text-white">
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-blue-400">
            <h3 className="font-medium mb-4">Business Hours</h3>
            <p className="text-gray-200">
              Monday - Friday: 9:00 AM - 6:00 PM PST<br />
              Saturday - Sunday: Closed
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-lg">
          <ContactForm source="contact_page" />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
