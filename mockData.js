// Mock database
module.exports = {
    users: [
      { id: 1, email: 'brand@example.com', role: 'brand', password: 'password' },
      { id: 2, email: 'creator@example.com', role: 'creator', password: 'password' },
      { id: 3, email: 'admin@example.com', role: 'admin', password: 'password' }
    ],
    
    creators: [
      { 
        id: 1, 
        name: 'Travel Guru', 
        email: 'travel@creator.com',
        platform: 'Instagram', 
        followers: 120000, 
        engagement: 4.2, 
        categories: ['travel', 'lifestyle'],
        preferredLanguage: 'English'
      },
      { 
        id: 2, 
        name: 'Tech Reviewer', 
        email: 'tech@creator.com',
        platform: 'YouTube', 
        followers: 85000, 
        engagement: 7.8, 
        categories: ['technology', 'reviews'],
        preferredLanguage: 'Spanish'
      },
      // Add more creators as needed
    ],
    
    campaigns: [],
    outreachMessages: [],
    payments: []
  };