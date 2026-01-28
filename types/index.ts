export type TabId = 'text-to-video' | 'image-to-video' | 'video-to-video';

export interface VideoResult {
  id: string;
  url: string;
  thumbnail: string;
  duration: number;
  resolution: string;
  captionsIncluded: boolean;
  captionOptions?: CaptionOptions;
  createdAt: Date;
}

export interface CaptionOptions {
  enabled: boolean;
  style: 'default' | 'bold' | 'minimal';
  position: 'bottom' | 'center' | 'top';
  color: string;
  size: number;
}

export interface CampaignData {
  objective: string;
  name: string;
  targeting: {
    location: string[];
    jobTitles: string[];
    companySizes: string[];
    industries: string[];
  };
  budget: {
    type: 'daily' | 'total';
    amount: number;
  };
  schedule: {
    startDate: Date;
    endDate?: Date;
  };
  videoId: string;
}

export interface CampaignWizardStep {
  id: number;
  title: string;
  description: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}
