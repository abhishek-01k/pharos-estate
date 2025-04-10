"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useContracts } from '@/context/ContractsContext';
import { useActiveAccount } from 'thirdweb/react';

// Sample property image URLs from Unsplash
const propertyImages = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577415124269-fc1140a69e91?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464146072230-91cabc968266?q=80&w=1200&auto=format&fit=crop"
];

// Sample property data
const SAMPLE_PROPERTIES = [
  {
    id: "1",
    title: 'Manhattan Office Tower',
    address: '350 Fifth Avenue, New York, NY 10118',
    price: '$1,500,000',
    tokenPrice: '150 PPT',
    occupancy: 94,
    annualYield: 7.2,
    image: propertyImages[0],
    description: 'Prime office space in the heart of Manhattan. This Class A office building features state-of-the-art amenities, 24/7 security, and is located near major transportation hubs.',
    squareFeet: '35,000',
  yearBuilt: 2005,
    tenants: 'Multiple Fortune 500 companies',
    leaseTerms: '5-10 year leases',
    annualIncome: '$1,080,000',
    expenses: '$324,000',
    netIncome: '$756,000',
    documents: [
      { name: 'Property Appraisal', url: '#' },
      { name: 'Lease Agreements', url: '#' },
      { name: 'Inspection Report', url: '#' }
    ]
  },
  {
    id: "2",
    title: 'Silicon Valley Research Park',
    address: '1 Infinite Loop, Cupertino, CA 95014',
    price: '$2,200,000',
    tokenPrice: '220 PPT',
    occupancy: 98,
    annualYield: 8.1,
    image: propertyImages[1],
    description: 'Modern research facility in Silicon Valley with multiple laboratory and office spaces designed for tech companies and startups.',
    squareFeet: '42,000',
    yearBuilt: 2012,
    tenants: 'Tech companies and research institutions',
    leaseTerms: '3-7 year leases',
    annualIncome: '$1,782,000',
    expenses: '$546,000',
    netIncome: '$1,236,000',
    documents: [
      { name: 'Property Appraisal', url: '#' },
      { name: 'Lease Agreements', url: '#' },
      { name: 'Inspection Report', url: '#' }
    ]
  },
  {
    id: "3",
    title: 'Downtown Chicago Mall',
    address: '108 North State Street, Chicago, IL 60602',
    price: '$1,800,000',
    tokenPrice: '180 PPT',
    occupancy: 92,
    annualYield: 6.8,
    image: propertyImages[2],
    description: 'Retail shopping center located in downtown Chicago. Features a mix of retail stores, restaurants, and entertainment venues.',
    squareFeet: '54,000',
    yearBuilt: 1998,
    tenants: 'National retail chains and local businesses',
    leaseTerms: '2-5 year leases',
    annualIncome: '$1,224,000',
    expenses: '$468,000',
    netIncome: '$756,000',
    documents: [
      { name: 'Property Appraisal', url: '#' },
      { name: 'Lease Agreements', url: '#' },
      { name: 'Inspection Report', url: '#' }
    ]
  },
  {
    id: "4",
    title: 'Miami Waterfront Complex',
    address: '801 Brickell Ave, Miami, FL 33131',
    price: '$3,100,000',
    tokenPrice: '310 PPT',
    occupancy: 96,
    annualYield: 7.5,
    image: propertyImages[3],
    description: 'Luxury mixed-use development on the waterfront in Miami. Includes retail, office, and residential spaces with stunning ocean views.',
    squareFeet: '65,000',
    yearBuilt: 2018,
    tenants: 'Luxury retailers and professional services firms',
    leaseTerms: '5-10 year leases',
    annualIncome: '$2,325,000',
    expenses: '$697,500',
    netIncome: '$1,627,500',
    documents: [
      { name: 'Property Appraisal', url: '#' },
      { name: 'Lease Agreements', url: '#' },
      { name: 'Inspection Report', url: '#' }
    ]
  }
];

export default function PropertyDetailPage() {
  const params = useParams();
  const { id } = params;
  const { isConnected, propertyDetails, approveMarketplace } = useContracts();
  const account = useActiveAccount();
  
  const [property, setProperty] = useState<any>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchaseSuccess, setIsPurchaseSuccess] = useState(false);
  
  useEffect(() => {
    // Find the property with the matching ID
    const foundProperty = SAMPLE_PROPERTIES.find(p => p.id === id);
    if (foundProperty) {
      setProperty(foundProperty);
    }
  }, [id]);

  const handlePurchase = async () => {
    try {
    setIsLoading(true);
      // In a real application, this would interact with your contract
      await approveMarketplace(purchaseAmount);
    
      // Simulate a delay for the transaction
    setTimeout(() => {
        setIsLoading(false);
        setIsPurchaseSuccess(true);
      }, 2000);
    } catch (error) {
      console.error("Error purchasing tokens:", error);
      setIsLoading(false);
    }
  };
  
  if (!property) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Property Not Found</h1>
          <p className="mt-4 text-lg text-gray-500">The property you're looking for doesn't exist or has been removed.</p>
          <Link href="/properties" className="mt-8 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700">
        Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column: Property images and details */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <Link href="/properties" className="text-indigo-600 hover:text-indigo-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
                Back to Properties
              </Link>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-96 object-cover"
              />
        </div>
        
            <div className="mt-8">
              <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
              <p className="text-lg text-gray-600 mt-2">{property.address}</p>
              
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900">Property Description</h2>
                <p className="mt-3 text-gray-700">{property.description}</p>
          </div>
          
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <dl className="space-y-4">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Property Value</dt>
                        <dd className="text-gray-900 font-medium">{property.price}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Token Price</dt>
                        <dd className="text-gray-900 font-medium">{property.tokenPrice}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Square Feet</dt>
                        <dd className="text-gray-900 font-medium">{property.squareFeet}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Year Built</dt>
                        <dd className="text-gray-900 font-medium">{property.yearBuilt}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <dl className="space-y-4">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Occupancy Rate</dt>
                        <dd className="text-gray-900 font-medium">{property.occupancy}%</dd>
                  </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Annual Yield</dt>
                        <dd className="text-green-600 font-medium">{property.annualYield}%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Lease Terms</dt>
                        <dd className="text-gray-900 font-medium">{property.leaseTerms}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Tenants</dt>
                        <dd className="text-gray-900 font-medium">{property.tenants}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-900">Financial Summary</h2>
                <div className="mt-4">
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Annual Gross Income</dt>
                      <dd className="text-gray-900 font-medium">{property.annualIncome}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Annual Expenses</dt>
                      <dd className="text-gray-900 font-medium">{property.expenses}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Net Operating Income</dt>
                      <dd className="text-green-600 font-medium">{property.netIncome}</dd>
                    </div>
                  </dl>
                    </div>
                  </div>
                  
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
                <div className="mt-4">
                  <ul className="divide-y divide-gray-200">
                    {property.documents.map((doc: any) => (
                      <li key={doc.name} className="py-3">
                        <a href={doc.url} className="flex items-center text-indigo-600 hover:text-indigo-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                          {doc.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
                    </div>
                    
          {/* Right column: Purchase box */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Tokens</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Token Price</p>
                  <p className="text-2xl font-bold text-gray-900">{property.tokenPrice}</p>
                    </div>
                    
                <div>
                  <p className="text-gray-600">Annual Yield</p>
                  <p className="text-2xl font-bold text-green-600">{property.annualYield}%</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <label htmlFor="token-amount" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tokens
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="number"
                      id="token-amount"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="1"
                      min="1"
                      step="1"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="text-gray-600">Total Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {parseInt(purchaseAmount) > 0 
                      ? `${parseInt(purchaseAmount) * parseInt(property.tokenPrice.replace(/[^0-9]/g, ''))} PPT` 
                      : '0 PPT'}
                  </p>
        </div>
        
                {isPurchaseSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Purchase Successful</h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>Your tokens have been successfully purchased.</p>
              </div>
                        <div className="mt-4">
                          <Link href="/portfolio" className="text-sm font-medium text-green-600 hover:text-green-500">
                            View in Portfolio <span aria-hidden="true">&rarr;</span>
                          </Link>
                </div>
                </div>
                </div>
              </div>
                ) : (
                <button
                  onClick={handlePurchase}
                    disabled={!isConnected || isLoading}
                    className={`w-full px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                      isConnected 
                        ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                      </span>
                    ) : isConnected ? (
                      'Purchase Tokens'
                    ) : (
                      'Connect Wallet to Purchase'
                    )}
                </button>
                )}
                
                <div className="text-sm text-gray-500 mt-2">
                  <p>By purchasing tokens, you agree to the <a href="#" className="text-indigo-600 hover:text-indigo-800">Terms and Conditions</a>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 