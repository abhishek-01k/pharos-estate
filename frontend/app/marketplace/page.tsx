"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useContracts } from '@/context/ContractsContext';
import { useActiveAccount } from 'thirdweb/react';

// Sample property image URLs from Unsplash
const propertyImages = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=800&auto=format&fit=crop"
];

// Sample marketplace listings
const SAMPLE_LISTINGS = [
  {
    id: 1,
    title: 'Manhattan Office Tower',
    tokenSymbol: 'PPT',
    tokenAmount: 50,
    price: 7500,
    pricePerToken: 150,
    seller: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    image: propertyImages[0],
    propertyId: 1
  },
  {
    id: 2,
    title: 'Silicon Valley Research Park',
    tokenSymbol: 'PPT',
    tokenAmount: 25,
    price: 5500,
    pricePerToken: 220,
    seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    image: propertyImages[1],
    propertyId: 2
  },
  {
    id: 3,
    title: 'Downtown Chicago Mall',
    tokenSymbol: 'PPT',
    tokenAmount: 40,
    price: 7200,
    pricePerToken: 180,
    seller: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    image: propertyImages[2],
    propertyId: 3
  },
  {
    id: 4,
    title: 'Miami Waterfront Complex',
    tokenSymbol: 'PPT',
    tokenAmount: 15,
    price: 4650,
    pricePerToken: 310,
    seller: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    image: propertyImages[3],
    propertyId: 4
  },
  {
    id: 5,
    title: 'Manhattan Office Tower',
    tokenSymbol: 'PPT',
    tokenAmount: 30,
    price: 4500,
    pricePerToken: 150,
    seller: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    image: propertyImages[0],
    propertyId: 1
  },
  {
    id: 6,
    title: 'Silicon Valley Research Park',
    tokenSymbol: 'PPT',
    tokenAmount: 10,
    price: 2200,
    pricePerToken: 220,
    seller: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    image: propertyImages[1],
    propertyId: 2
  }
];

export default function MarketplacePage() {
  const { isConnected, propertyDetails, listings } = useContracts();
  const account = useActiveAccount();
  
  const [marketplaceListings, setMarketplaceListings] = useState(SAMPLE_LISTINGS);
  const [filteredListings, setFilteredListings] = useState(SAMPLE_LISTINGS);
  const [filter, setFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter and sort listings
  useEffect(() => {
    let result = [...marketplaceListings];
    
    // Apply filter
    if (filter === 'my-listings' && account) {
      result = result.filter(item => item.seller.toLowerCase() === account.address?.toLowerCase());
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.tokenSymbol.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'token-amount':
        result.sort((a, b) => b.tokenAmount - a.tokenAmount);
        break;
      case 'recent':
      default:
        // Already sorted by recent by default (id)
        break;
    }
    
    setFilteredListings(result);
  }, [filter, sortOption, searchQuery, marketplaceListings, account]);
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Marketplace Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Property Token Marketplace</h1>
          <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
            Buy and sell property tokens on PharosEstate's secure marketplace with low transaction fees.
          </p>
        </div>
        
        {/* Filters and Search */}
        <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md ${
                  filter === 'all' 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Listings
              </button>
              {isConnected && (
                <button
                  onClick={() => setFilter('my-listings')}
                  className={`px-4 py-2 rounded-md ${
                    filter === 'my-listings' 
                      ? 'bg-indigo-100 text-indigo-700 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  My Listings
                </button>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none w-full md:w-48 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="recent">Recently Listed</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="token-amount">Token Amount</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Create Listing Button */}
        {isConnected && (
          <div className="mb-8 flex justify-end">
            <Link href="/marketplace/create-listing" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Listing
            </Link>
          </div>
        )}
        
        {/* Marketplace Stats */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volume</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">152,450 PPT</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Listings</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{filteredListings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Transaction Fee</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">1.0%</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Listings */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative">
                  <img 
                    src={listing.image} 
                    alt={listing.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-0 right-0 mt-4 mr-4 bg-white bg-opacity-90 rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                    {listing.tokenAmount} {listing.tokenSymbol}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {listing.title}
                    </h3>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">
                      Seller: <span className="font-medium">{formatAddress(listing.seller)}</span>
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-500">Price per token</p>
                      <p className="text-xl font-semibold text-gray-900">{listing.pricePerToken} PPT</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total price</p>
                      <p className="text-xl font-semibold text-indigo-600">{listing.price} PPT</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link
                      href={`/marketplace/listing/${listing.id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Listing
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No listings found</h3>
            <p className="mt-1 text-gray-500">
              {filter === 'my-listings' 
                ? "You don't have any active listings. Create one to start selling your property tokens."
                : "No listings match your search criteria. Try adjusting your filters."}
            </p>
            {filter === 'my-listings' && (
              <div className="mt-6">
                <Link href="/marketplace/create-listing" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Listing
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 