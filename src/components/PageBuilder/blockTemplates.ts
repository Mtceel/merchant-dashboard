/**
 * Pre-built block templates - Shopify style
 */

export interface BlockTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  preview: string; // Preview image or SVG
  type: string; // Block type to use
  config: Record<string, any>;
}

export const blockTemplates: BlockTemplate[] = [
  // ==================== HERO BLOCKS ====================
  {
    id: 'hero-fullscreen',
    name: 'Hero - Full Screen',
    category: 'hero',
    description: 'Full-screen hero with background image, heading, and CTA',
    icon: '🎯',
    preview: 'hero-fullscreen',
    type: 'hero',
    config: {
      layout: 'fullscreen',
      backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
      overlay: true,
      overlayOpacity: 0.4,
      heading: 'Welcome to Our Store',
      subheading: 'Discover amazing products at great prices',
      headingSize: 'xl',
      textAlign: 'center',
      textColor: '#ffffff',
      buttons: [
        { text: 'Shop Now', url: '/products', style: 'primary' },
        { text: 'Learn More', url: '/about', style: 'secondary' }
      ],
      height: '100vh',
      animation: 'fade-in'
    }
  },
  {
    id: 'hero-split',
    name: 'Hero - Split Screen',
    category: 'hero',
    description: 'Split layout with image on one side, text on the other',
    icon: '⬜',
    preview: 'hero-split',
    type: 'hero',
    config: {
      layout: 'split',
      imagePosition: 'right',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      heading: 'Premium Quality Products',
      subheading: 'Crafted with care, delivered with love',
      text: 'Experience the difference that quality makes. Each product is carefully selected and tested.',
      buttons: [
        { text: 'Browse Collection', url: '/products', style: 'primary' }
      ],
      backgroundColor: '#f8f9fa',
      padding: '120px 0'
    }
  },

  // ==================== PRODUCTS BLOCKS ====================
  {
    id: 'products-grid-featured',
    name: 'Products - Featured Grid',
    category: 'ecommerce',
    description: 'Grid of featured products with filters',
    icon: '🛍️',
    preview: 'products-grid',
    type: 'products-grid',
    config: {
      heading: 'Featured Products',
      subheading: 'Hand-picked items just for you',
      columns: 4,
      rows: 2,
      showFilters: true,
      showSort: true,
      collection: 'featured',
      limit: 8,
      showQuickView: true,
      imageRatio: 'square',
      showBadges: true,
      cardStyle: 'elevated',
      spacing: 'medium'
    }
  },
  {
    id: 'products-carousel',
    name: 'Products - Carousel',
    category: 'ecommerce',
    description: 'Scrolling carousel of products',
    icon: '🎠',
    preview: 'products-carousel',
    type: 'products-carousel',
    config: {
      heading: 'Best Sellers',
      collection: 'best-sellers',
      itemsPerSlide: 4,
      autoplay: true,
      autoplaySpeed: 5000,
      showArrows: true,
      showDots: true,
      infinite: true
    }
  },

  // ==================== EMAIL SIGNUP BLOCKS ====================
  {
    id: 'email-signup-centered',
    name: 'Email Signup - Centered',
    category: 'marketing',
    description: 'Centered newsletter signup form',
    icon: '📧',
    preview: 'email-centered',
    type: 'email-signup',
    config: {
      layout: 'centered',
      heading: 'Join Our Newsletter',
      subheading: 'Get 10% off your first order',
      description: 'Subscribe to receive updates, access to exclusive deals, and more.',
      showFirstName: true,
      showLastName: false,
      buttonText: 'Subscribe',
      successMessage: 'Thanks for subscribing!',
      backgroundColor: '#f0f4f8',
      textColor: '#1a202c',
      buttonColor: '#3182ce',
      padding: '80px 0',
      maxWidth: '600px'
    }
  },
  {
    id: 'email-signup-inline',
    name: 'Email Signup - Inline',
    category: 'marketing',
    description: 'Compact inline signup form',
    icon: '✉️',
    preview: 'email-inline',
    type: 'email-signup',
    config: {
      layout: 'inline',
      heading: 'Stay in the loop',
      placeholder: 'Enter your email',
      buttonText: 'Sign Up',
      showIcon: true,
      backgroundColor: 'transparent',
      borderColor: '#e2e8f0'
    }
  },
  {
    id: 'email-popup-intent',
    name: 'Email Popup - Exit Intent',
    category: 'marketing',
    description: 'Popup form triggered on exit intent',
    icon: '🎁',
    preview: 'email-popup',
    type: 'email-popup',
    config: {
      trigger: 'exit-intent',
      heading: 'Wait! Before you go...',
      subheading: 'Get 15% off your order',
      description: 'Sign up now and receive an exclusive discount code.',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
      showFirstName: true,
      buttonText: 'Get My Discount',
      delay: 0,
      showOnce: true
    }
  },

  // ==================== TEXT + IMAGE BLOCKS ====================
  {
    id: 'text-image-left',
    name: 'Text + Image - Image Left',
    category: 'content',
    description: 'Image on left, text on right',
    icon: '📷',
    preview: 'text-image-left',
    type: 'text-image',
    config: {
      layout: 'image-left',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
      heading: 'Our Story',
      text: '<p>Founded in 2020, we set out with a mission to bring high-quality products to customers worldwide. Our commitment to excellence has made us a trusted name in the industry.</p><p>Every product is carefully curated to meet our high standards.</p>',
      buttons: [
        { text: 'Learn More', url: '/about', style: 'primary' }
      ],
      imageRatio: '16:9',
      contentWidth: '50%',
      verticalAlign: 'center',
      padding: '80px 0'
    }
  },
  {
    id: 'text-image-alternating',
    name: 'Text + Image - Alternating',
    category: 'content',
    description: 'Multiple sections with alternating layouts',
    icon: '🔄',
    preview: 'text-image-alt',
    type: 'text-image-multi',
    config: {
      sections: [
        {
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
          heading: 'Premium Materials',
          text: 'We use only the finest materials sourced from sustainable suppliers.',
          imagePosition: 'left'
        },
        {
          image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18',
          heading: 'Expert Craftsmanship',
          text: 'Every item is handcrafted by skilled artisans with years of experience.',
          imagePosition: 'right'
        },
        {
          image: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62',
          heading: 'Quality Guaranteed',
          text: 'We stand behind our products with a lifetime quality guarantee.',
          imagePosition: 'left'
        }
      ]
    }
  },

  // ==================== FAQ BLOCKS ====================
  {
    id: 'faq-accordion',
    name: 'FAQ - Accordion',
    category: 'content',
    description: 'Expandable FAQ accordion',
    icon: '❓',
    preview: 'faq-accordion',
    type: 'faq',
    config: {
      heading: 'Frequently Asked Questions',
      subheading: 'Got questions? We\'ve got answers',
      layout: 'accordion',
      allowMultiple: false,
      items: [
        {
          question: 'What is your shipping policy?',
          answer: 'We offer free shipping on orders over $50. Standard shipping takes 3-5 business days.'
        },
        {
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of purchase. Items must be unused and in original packaging.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes! We ship to over 50 countries worldwide. International shipping times vary by location.'
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also check your order status in your account.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, PayPal, Apple Pay, and Google Pay.'
        }
      ],
      searchable: true,
      backgroundColor: '#ffffff',
      borderStyle: 'line'
    }
  },
  {
    id: 'faq-two-column',
    name: 'FAQ - Two Column',
    category: 'content',
    description: 'FAQ in two-column layout',
    icon: '📋',
    preview: 'faq-columns',
    type: 'faq',
    config: {
      heading: 'Common Questions',
      layout: 'two-column',
      showIcons: true,
      items: [
        {
          question: 'How long does delivery take?',
          answer: '3-5 business days for standard shipping.'
        },
        {
          question: 'Can I change my order?',
          answer: 'Yes, within 24 hours of placing your order.'
        },
        {
          question: 'Do you offer gift wrapping?',
          answer: 'Yes, available at checkout for a small fee.'
        },
        {
          question: 'Are your products eco-friendly?',
          answer: 'We prioritize sustainable and eco-friendly materials.'
        }
      ]
    }
  },

  // ==================== BLOG BLOCKS ====================
  {
    id: 'blog-grid',
    name: 'Blog - Grid Layout',
    category: 'content',
    description: 'Grid of blog posts',
    icon: '📝',
    preview: 'blog-grid',
    type: 'blog-grid',
    config: {
      heading: 'Latest from Our Blog',
      columns: 3,
      limit: 6,
      showExcerpt: true,
      showAuthor: true,
      showDate: true,
      showCategories: true,
      showReadMore: true,
      imageRatio: '16:9',
      excerptLength: 150
    }
  },
  {
    id: 'blog-featured',
    name: 'Blog - Featured Post',
    category: 'content',
    description: 'Large featured blog post',
    icon: '📰',
    preview: 'blog-featured',
    type: 'blog-featured',
    config: {
      heading: 'Featured Story',
      layout: 'large',
      showImage: true,
      showExcerpt: true,
      showMeta: true,
      imageSize: 'cover',
      overlayText: true
    }
  },

  // ==================== FEATURES BLOCKS ====================
  {
    id: 'features-grid',
    name: 'Features - Grid',
    category: 'content',
    description: 'Grid of features with icons',
    icon: '⭐',
    preview: 'features-grid',
    type: 'features',
    config: {
      heading: 'Why Choose Us',
      subheading: 'Everything you need in one place',
      layout: 'grid',
      columns: 3,
      items: [
        {
          icon: '🚚',
          heading: 'Free Shipping',
          text: 'On orders over $50'
        },
        {
          icon: '🔒',
          heading: 'Secure Payment',
          text: '100% secure transactions'
        },
        {
          icon: '↩️',
          heading: 'Easy Returns',
          text: '30-day return policy'
        },
        {
          icon: '💬',
          heading: '24/7 Support',
          text: 'Always here to help'
        },
        {
          icon: '✅',
          heading: 'Quality Guarantee',
          text: 'Top-notch products'
        },
        {
          icon: '🎁',
          heading: 'Gift Wrapping',
          text: 'Free gift wrap available'
        }
      ],
      iconSize: 'large',
      textAlign: 'center',
      backgroundColor: '#f8f9fa'
    }
  },

  // ==================== TESTIMONIALS BLOCKS ====================
  {
    id: 'testimonials-carousel',
    name: 'Testimonials - Carousel',
    category: 'social-proof',
    description: 'Rotating customer testimonials',
    icon: '💬',
    preview: 'testimonials-carousel',
    type: 'testimonials',
    config: {
      heading: 'What Our Customers Say',
      layout: 'carousel',
      autoplay: true,
      autoplaySpeed: 6000,
      items: [
        {
          text: 'Absolutely love the quality! Best purchase I\'ve made this year.',
          author: 'Sarah Johnson',
          role: 'Verified Buyer',
          rating: 5,
          image: 'https://i.pravatar.cc/150?img=1'
        },
        {
          text: 'Fast shipping and excellent customer service. Highly recommend!',
          author: 'Michael Chen',
          role: 'Verified Buyer',
          rating: 5,
          image: 'https://i.pravatar.cc/150?img=2'
        },
        {
          text: 'The product exceeded my expectations. Will definitely order again.',
          author: 'Emma Williams',
          role: 'Verified Buyer',
          rating: 5,
          image: 'https://i.pravatar.cc/150?img=3'
        }
      ],
      showRating: true,
      showImage: true,
      backgroundColor: '#ffffff'
    }
  },
  {
    id: 'testimonials-grid',
    name: 'Testimonials - Grid',
    category: 'social-proof',
    description: 'Grid of customer reviews',
    icon: '⭐',
    preview: 'testimonials-grid',
    type: 'testimonials',
    config: {
      heading: 'Customer Reviews',
      layout: 'grid',
      columns: 3,
      items: [
        {
          text: 'Great quality and fast delivery!',
          author: 'John Doe',
          rating: 5
        },
        {
          text: 'Exactly what I was looking for.',
          author: 'Jane Smith',
          rating: 5
        },
        {
          text: 'Excellent customer support!',
          author: 'Bob Wilson',
          rating: 5
        }
      ],
      showRating: true,
      cardStyle: 'bordered'
    }
  },

  // ==================== CTA BLOCKS ====================
  {
    id: 'cta-banner',
    name: 'CTA - Banner',
    category: 'marketing',
    description: 'Full-width call-to-action banner',
    icon: '📣',
    preview: 'cta-banner',
    type: 'cta',
    config: {
      layout: 'banner',
      heading: 'Ready to Get Started?',
      text: 'Join thousands of happy customers today',
      buttons: [
        { text: 'Shop Now', url: '/products', style: 'primary' }
      ],
      backgroundColor: '#3182ce',
      textColor: '#ffffff',
      padding: '60px 0',
      textAlign: 'center'
    }
  },

  // ==================== COLLECTION BLOCKS ====================
  {
    id: 'collection-list',
    name: 'Collection List',
    category: 'ecommerce',
    description: 'Grid of product collections',
    icon: '📂',
    preview: 'collection-list',
    type: 'collection-list',
    config: {
      heading: 'Shop by Category',
      columns: 4,
      showProductCount: true,
      imageRatio: 'square',
      overlayText: true,
      items: [
        { name: 'Electronics', image: '', productCount: 120 },
        { name: 'Clothing', image: '', productCount: 350 },
        { name: 'Home & Garden', image: '', productCount: 200 },
        { name: 'Sports', image: '', productCount: 180 }
      ]
    }
  }
];

// Group templates by category
export const blockTemplatesByCategory = blockTemplates.reduce((acc, template) => {
  if (!acc[template.category]) {
    acc[template.category] = [];
  }
  acc[template.category].push(template);
  return acc;
}, {} as Record<string, BlockTemplate[]>);

// Category metadata
export const templateCategories = [
  { key: 'hero', label: 'Hero Sections', icon: '🎯', description: 'Eye-catching hero sections' },
  { key: 'ecommerce', label: 'E-commerce', icon: '🛒', description: 'Products and collections' },
  { key: 'marketing', label: 'Marketing', icon: '📧', description: 'Email signups and CTAs' },
  { key: 'content', label: 'Content', icon: '📝', description: 'Text, images, and media' },
  { key: 'social-proof', label: 'Social Proof', icon: '⭐', description: 'Reviews and testimonials' },
];
