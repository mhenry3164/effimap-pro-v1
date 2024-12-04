import React from 'react';
import { X } from 'lucide-react';
import ContactForm from './ContactForm';

interface ContactModalProps {
  onClose: () => void;
  source?: string;
}

export default function ContactModal({ onClose, source }: ContactModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Contact Us</h2>
          <ContactForm
            onSuccess={onClose}
            source={source}
          />
        </div>
      </div>
    </div>
  );
}
