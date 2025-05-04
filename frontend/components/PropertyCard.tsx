"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

type PropertyCardProps = {
  id: number;
  title: string;
  location: string;
  price: string;
  tokenPrice: string;
  imageUrl: string;
  occupancy: number;
  yield: number;
};

export const PropertyCard = ({ 
  id, 
  title, 
  location, 
  price, 
  tokenPrice, 
  imageUrl, 
  occupancy, 
  yield: annualYield 
}: PropertyCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="h-48 relative">
          <Image
            src={imageUrl}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
          />
          <div 
            className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        
        {/* Property Tag */}
        <div className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
          Commercial
        </div>
        
        {/* Property Yield Tag */}
        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          {annualYield}% Yield
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200 mb-2">{title}</h3>
        <div className="flex items-center mb-4 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">{location}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm text-gray-500">Property Value</p>
            <p className="font-semibold text-gray-900">{price}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm text-gray-500">Token Price</p>
            <p className="font-semibold text-gray-900">{tokenPrice}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm text-gray-500">Occupancy</p>
            <p className="font-semibold text-gray-900">{occupancy}%</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-sm text-gray-500">Annual Yield</p>
            <p className="font-semibold text-indigo-600">{annualYield}%</p>
          </div>
        </div>
        
        {/* Bottom action buttons */}
        <div className="flex space-x-2">
          <Link
            href={`/properties/${id}`}
            className="flex-1 bg-indigo-600 text-white text-center px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            View Details
          </Link>
          <button 
            className="bg-white text-indigo-600 border border-indigo-600 px-3 py-2 rounded-md hover:bg-indigo-50 transition-colors"
            aria-label="Add to watchlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard; 