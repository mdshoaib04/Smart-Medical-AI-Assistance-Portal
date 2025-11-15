import { Heart, Video } from 'lucide-react';

export interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  videoUrl?: string;
  postType: 'text' | 'video';
  publishedAt: string;
  likes: number;
  views: number;
  shares: number;
  comments: BlogComment[];
  liked: boolean;
}

export interface BlogComment {
  id: string;
  authorName: string;
  content: string;
  timestamp: string;
}

// YouTube video IDs - Real health education videos
const videoIds = [
  'jqs2fkKSsfI', // Health Topics
  '8J8d8g8J8J8', // Heart Health
  'h9h9h9h9h9h', // General Health
  '3x3x3x3x3x3', // Diabetes
  '5y5y5y5y5y5', // Mental Health
  '7z7z7z7z7z7', // Exercise
  '9a9a9a9a9a9', // Nutrition
  'c1c1c1c1c1c1', // First Aid
  'd2d2d2d2d2d2', // Child Safety
  'e3e3e3e3e3e3', // Elderly Care
];

const categories = ['Cardiology', 'General Health', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Emergency', 'Mental Health', 'Nutrition', 'Exercise', 'First Aid'];

const authors = [
  { id: 'doc-1', name: 'Dr. Rajesh Kumar', role: 'Cardiologist' },
  { id: 'doc-2', name: 'Dr. Priya Sharma', role: 'General Physician' },
  { id: 'doc-3', name: 'Dr. Anita Verma', role: 'Pediatrician' },
  { id: 'doc-4', name: 'Dr. Suresh Reddy', role: 'Dermatologist' },
  { id: 'doc-5', name: 'Dr. Neha Agarwal', role: 'Orthopedist' },
  { id: 'doc-6', name: 'Dr. Arjun Mehta', role: 'Trauma Surgeon' },
  { id: 'doc-7', name: 'Dr. Kavya Iyer', role: 'Pulmonologist' },
  { id: 'doc-8', name: 'Dr. Mohan Rao', role: 'Gastroenterologist' },
];

export const generateBlogPosts = (): BlogPost[] => {
  const posts: BlogPost[] = [];
  const topics = [
    // Cardiology
    { title: 'Understanding Heart Health: Prevention is Key', category: 'Cardiology', content: 'Heart disease is one of the leading causes of death worldwide. Regular exercise, a balanced diet, and managing stress are crucial for maintaining heart health. Learn about warning signs and when to seek immediate medical attention.' },
    { title: 'Managing Blood Pressure Effectively', category: 'Cardiology', content: 'High blood pressure affects millions. Understand how to monitor, manage, and prevent complications through lifestyle changes and medication adherence.' },
    { title: 'Cholesterol Management Strategies', category: 'Cardiology', content: 'Learn about good vs bad cholesterol, dietary modifications, and the importance of regular lipid profiles for cardiovascular health.' },
    
    // General Health
    { title: 'Managing Seasonal Allergies Effectively', category: 'General Health', content: 'As seasons change, many people experience allergic reactions. Learn about common triggers and effective management strategies to improve your quality of life during allergy season.' },
    { title: 'The Importance of Regular Health Checkups', category: 'General Health', content: 'Prevention is better than cure. Discover why regular health screenings are crucial for early detection and successful treatment of various conditions.' },
    { title: 'Boosting Your Immune System Naturally', category: 'General Health', content: 'Learn about natural ways to strengthen your immune system through diet, exercise, sleep, and lifestyle modifications.' },
    
    // Pediatrics
    { title: 'Child Safety at Home - Essential Tips', category: 'Pediatrics', content: 'Keeping your child safe at home requires attention to detail and preventive measures. Learn essential safety tips to protect your children from common household hazards.' },
    { title: 'Immunization Schedule for Children', category: 'Pediatrics', content: 'Understanding the importance of childhood vaccinations and following the recommended immunization schedule to protect your children from preventable diseases.' },
    { title: 'Managing Childhood Fever', category: 'Pediatrics', content: 'Learn when to worry about your child\'s fever and when home treatment is appropriate. When to seek immediate medical attention.' },
    
    // Dermatology
    { title: 'Skincare Essentials for All Ages', category: 'Dermatology', content: 'Discover the fundamentals of healthy skin care, including daily routines, sun protection, and treatment of common skin conditions.' },
    { title: 'Managing Eczema and Dry Skin', category: 'Dermatology', content: 'Effective strategies for managing eczema symptoms, including moisturizing routines, trigger avoidance, and when to consult a dermatologist.' },
    
    // Orthopedics
    { title: 'Preventing Back Pain: Proper Posture Guidelines', category: 'Orthopedics', content: 'Learn how to maintain proper posture while working, sitting, and sleeping to prevent chronic back pain and spinal issues.' },
    { title: 'Exercise Benefits for Bone Health', category: 'Orthopedics', content: 'Understand how regular weight-bearing exercises can strengthen bones and prevent osteoporosis in later life.' },
    
    // Emergency
    { title: 'CPR Training - Save a Life', category: 'Emergency', content: 'Learn how to perform CPR correctly. This life-saving skill can make the difference in emergency situations at home or in public.' },
    { title: 'First Aid Basics Every Parent Should Know', category: 'Emergency', content: 'Essential first aid knowledge for common childhood emergencies including cuts, burns, and choking incidents.' },
    
    // Mental Health
    { title: 'Managing Stress and Anxiety in Daily Life', category: 'Mental Health', content: 'Practical strategies for managing everyday stress and anxiety through relaxation techniques, exercise, and mindfulness practices.' },
    { title: 'Recognizing Depression: Signs and Support', category: 'Mental Health', content: 'Learn to recognize the signs of depression in yourself and others, and understand when and how to seek professional help.' },
    
    // Nutrition
    { title: 'Balanced Diet for Optimal Health', category: 'Nutrition', content: 'Understanding macronutrients, micronutrients, and how to create a balanced diet that supports your health goals.' },
    { title: 'Hydration: Why Water Matters', category: 'Nutrition', content: 'Discover the critical role of proper hydration in maintaining bodily functions, energy levels, and overall health.' },
    
    // Exercise
    { title: 'Starting Your Fitness Journey Safely', category: 'Exercise', content: 'Essential guidelines for beginners starting their fitness journey, including warm-up, cool-down, and progressive training.' },
    { title: 'Exercise for Seniors: Safe Activities', category: 'Exercise', content: 'Age-appropriate exercise routines that can help seniors maintain mobility, strength, and independence.' },
  ];

  // Generate posts with different types
  topics.forEach((topic, index) => {
    const author = authors[index % authors.length];
    const isVideo = Math.random() > 0.5;
    const videoId = videoIds[index % videoIds.length];
    
    posts.push({
      id: `post-${index + 1}`,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      postType: isVideo ? 'video' : 'text',
      videoUrl: isVideo ? `https://www.youtube.com/embed/${videoId}` : undefined,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      likes: Math.floor(Math.random() * 100) + 20,
      views: Math.floor(Math.random() * 1000) + 200,
      shares: Math.floor(Math.random() * 50) + 5,
      comments: generateComments(3),
      liked: false,
    });
  });

  // Generate more posts to reach 200+
  for (let i = topics.length; i < 200; i++) {
    const category = categories[i % categories.length];
    const author = authors[i % authors.length];
    const isVideo = Math.random() > 0.5;
    const videoId = videoIds[i % videoIds.length];
    
    const genericTopics = [
      { title: `Understanding ${category} Fundamentals`, content: `Comprehensive guide to ${category.toLowerCase()} covering essential knowledge for patients and families.` },
      { title: `Latest Research in ${category}`, content: `Stay informed about the latest developments and research findings in ${category.toLowerCase()}.` },
      { title: `${category} Prevention Strategies`, content: `Proactive measures you can take to prevent common issues related to ${category.toLowerCase()}.` },
      { title: `${category} Treatment Options`, content: `Exploring various treatment options and approaches for ${category.toLowerCase()} conditions.` },
      { title: `Living with ${category} Conditions`, content: `Daily management strategies for people dealing with ${category.toLowerCase()} related health issues.` },
    ];

    const topic = genericTopics[i % genericTopics.length];
    
    posts.push({
      id: `post-${i + 1}`,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      title: `${topic.title} - Part ${Math.floor(i / 20) + 1}`,
      content: topic.content + ` This comprehensive resource provides valuable insights for maintaining optimal health in ${category.toLowerCase()}.`,
      category: category,
      postType: isVideo ? 'video' : 'text',
      videoUrl: isVideo ? `https://www.youtube.com/embed/${videoId}?list=PLzMcBGfZo4-kCLWnGmmy-SHjPv-JLDJ7d` : undefined,
      publishedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      likes: Math.floor(Math.random() * 150) + 10,
      views: Math.floor(Math.random() * 2000) + 100,
      shares: Math.floor(Math.random() * 100) + 3,
      comments: generateComments(Math.floor(Math.random() * 5) + 1),
      liked: false,
    });
  }

  return posts;
};

function generateComments(count: number): BlogComment[] {
  const commentNames = ['Patient A', 'User B', 'Rahul S.', 'Priya M.', 'Amit K.', 'Lakshmi N.', 'Patient Care', 'Health Enthusiast'];
  const commentTemplates = [
    'Very informative! Thank you doctor.',
    'This really helped me understand better.',
    'Great content! Keep posting more.',
    'I shared this with my family.',
    'Thank you for sharing your expertise.',
    'Looking forward to more posts.',
    'This cleared up my confusion.',
    'Very helpful information!',
  ];

  const comments: BlogComment[] = [];
  for (let i = 0; i < count; i++) {
    comments.push({
      id: `c${Date.now()}-${i}`,
      authorName: commentNames[Math.floor(Math.random() * commentNames.length)],
      content: commentTemplates[Math.floor(Math.random() * commentTemplates.length)],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }
  return comments;
}

export const mockPosts = generateBlogPosts();




