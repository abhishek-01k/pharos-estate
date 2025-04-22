"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContracts } from '@/context/ContractsContext';
import Image from 'next/image';

// Sample property image URLs from Unsplash
const propertyImages = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=800&auto=format&fit=crop"
];

export default function Home() {
  const { propertyDetails, isLoading } = useContracts();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);

  useEffect(() => {
    // Generate sample properties for the homepage
    if (!isLoading) {
      const properties = [
        {
          id: 1,
          title: 'Manhattan Office Tower',
          address: '350 Fifth Avenue, New York, NY 10118',
          price: '$1,500,000',
          tokenPrice: '150 PPT',
          occupancy: 94,
          annualYield: 7.2,
          image: propertyImages[0]
        },
        {
          id: 2,
          title: 'Silicon Valley Research Park',
          address: '1 Infinite Loop, Cupertino, CA 95014',
          price: '$2,200,000',
          tokenPrice: '220 PPT',
          occupancy: 98,
          annualYield: 8.1,
          image: propertyImages[1]
        },
        {
          id: 3,
          title: 'Downtown Chicago Mall',
          address: '108 North State Street, Chicago, IL 60602',
          price: '$1,800,000',
          tokenPrice: '180 PPT',
          occupancy: 92,
          annualYield: 6.8,
          image: propertyImages[2]
        },
        {
          id: 4,
          title: 'Miami Waterfront Complex',
          address: '801 Brickell Ave, Miami, FL 33131',
          price: '$3,100,000',
          tokenPrice: '310 PPT',
          occupancy: 96,
          annualYield: 7.5,
          image: propertyImages[3]
        }
      ];
      
      setFeaturedProperties(properties);
    }
  }, [isLoading]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-center">
            Commercial Real Estate<br />Reimagined Through Tokenization
          </h1>
          <p className="mt-6 text-xl text-white text-center max-w-3xl">
            Fractional ownership of prime commercial properties. Invest, earn rental income, and trade your ownership stakes in a liquid marketplace.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/properties" className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg">
              Explore Properties
            </Link>
            <Link href="/marketplace" className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-500 md:py-4 md:text-lg">
              Enter Marketplace
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-50 rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500 truncate">Total Properties</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">12</p>
            </div>
            <div className="bg-gray-50 rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500 truncate">Token Supply</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{isLoading ? 'Loading...' : `${propertyDetails.totalSupply} ${propertyDetails.symbol}`}</p>
            </div>
            <div className="bg-gray-50 rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500 truncate">Average Occupancy</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{isLoading ? 'Loading...' : `${propertyDetails.occupancyRate}%`}</p>
            </div>
            <div className="bg-gray-50 rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500 truncate">Annual Yield</p>
              <p className="mt-1 text-3xl font-semibold text-gray-900">{isLoading ? 'Loading...' : `${propertyDetails.propertyYield}%`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Featured Properties
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Prime commercial real estate available for fractional ownership through tokenization.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {featuredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative h-48 w-full">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{property.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{property.address}</p>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Property Value</p>
                      <p className="text-base font-medium text-gray-900">{property.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Token Price</p>
                      <p className="text-base font-medium text-gray-900">{property.tokenPrice}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Occupancy</p>
                      <p className="text-base font-medium text-gray-900">{property.occupancy}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Annual Yield</p>
                      <p className="text-base font-medium text-gray-900">{property.annualYield}%</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link href={`/properties/${property.id}`} className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/properties" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              View All Properties
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How PharosEstate Works
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              A simplified process for investing in commercial real estate
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">1. Identity Verification</h3>
                <p className="mt-2 text-base text-gray-500">
                  Complete KYC verification to ensure regulatory compliance and property ownership rights.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">2. Purchase Tokens</h3>
                <p className="mt-2 text-base text-gray-500">
                  Buy property tokens representing fractional ownership of high-value commercial real estate.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">3. Earn & Trade</h3>
                <p className="mt-2 text-base text-gray-500">
                  Receive rental income proportional to your ownership and trade tokens in our liquid marketplace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start investing?</span>
            <span className="block text-indigo-200">Join PharosEstate today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/properties" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                Get Started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/about" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
