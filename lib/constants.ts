export const LINKEDIN_COLORS = {
  blue: '#0A66C2',
  blueDark: '#004182',
  blueLight: '#378FE9',
  gray900: '#191919',
  gray800: '#3C3D40',
  gray600: '#767676',
  gray300: '#C4C4C4',
  gray200: '#E9E9E9',
  gray100: '#F3F2EF',
  white: '#FFFFFF',
  success: '#057642',
  error: '#CC1016',
};

export const TEXT_LIMITS = {
  min: 10,
  max: 3000,
};

export const FILE_LIMITS = {
  image: {
    maxSize: 10, // MB
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif'],
  },
  video: {
    maxSize: 100, // MB
    allowedTypes: ['mp4', 'mov', 'avi'],
  },
};

export const CAPTION_DEFAULTS = {
  enabled: false,
  style: 'default' as const,
  position: 'bottom' as const,
  color: '#FFFFFF',
  size: 16,
};

export const CAMPAIGN_OBJECTIVES = [
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'video-views', label: 'Video Views' },
  { value: 'website-visits', label: 'Website Visits' },
  { value: 'lead-generation', label: 'Lead Generation' },
];

export const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export const MOCK_LOCATIONS = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'India',
  'Brazil',
  'Japan',
  'Singapore',
];

export const MOCK_INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Marketing',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Real Estate',
  'Entertainment',
];
