'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { VideoResult, CampaignData } from '@/types';
import { CAMPAIGN_OBJECTIVES, COMPANY_SIZES, MOCK_LOCATIONS, MOCK_INDUSTRIES } from '@/lib/constants';
import { createLinkedInCampaign } from '@/lib/api';
import Button from '../forms/Button';

interface CampaignWizardProps {
  isOpen: boolean;
  onClose: () => void;
  videoData: VideoResult;
  onSuccess: () => void;
}

export default function CampaignWizard({ isOpen, onClose, videoData, onSuccess }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [campaignId, setCampaignId] = useState<string>();
  const [estimatedReach, setEstimatedReach] = useState<number>(0);

  const [formData, setFormData] = useState({
    objective: '',
    name: '',
    location: [] as string[],
    jobTitles: '',
    companySizes: [] as string[],
    industries: [] as string[],
    budgetType: 'daily' as 'daily' | 'total',
    budgetAmount: '',
    startDate: '',
    endDate: '',
  });

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleArrayItem = (field: 'location' | 'companySizes' | 'industries', value: string) => {
    const array = formData[field];
    if (array.includes(value)) {
      updateField(field, array.filter(item => item !== value));
    } else {
      updateField(field, [...array, value]);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const campaignData: CampaignData = {
        objective: formData.objective,
        name: formData.name,
        targeting: {
          location: formData.location,
          jobTitles: formData.jobTitles.split(',').map(t => t.trim()),
          companySizes: formData.companySizes,
          industries: formData.industries,
        },
        budget: {
          type: formData.budgetType,
          amount: parseFloat(formData.budgetAmount),
        },
        schedule: {
          startDate: new Date(formData.startDate),
          endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        },
        videoId: videoData.id,
      };

      const response = await createLinkedInCampaign(campaignData);
      setCampaignId(response.campaignId);
      setEstimatedReach(response.estimatedReach);
      setCurrentStep(5);
    } catch (err) {
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.objective && formData.name;
      case 2:
        return formData.location.length > 0 && formData.industries.length > 0;
      case 3:
        return formData.budgetAmount && parseFloat(formData.budgetAmount) >= 10 && formData.startDate;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-linkedin-hover max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-linkedin-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-linkedin-gray-900">
              Launch LinkedIn Campaign
            </h2>
            {currentStep < 5 && (
              <p className="text-sm text-linkedin-gray-600 mt-1">
                Step {currentStep} of 4
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-linkedin-gray-600 hover:text-linkedin-gray-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        {currentStep < 5 && (
          <div className="px-6 pt-4">
            <div className="h-2 bg-linkedin-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-linkedin-blue"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && <Step1 formData={formData} updateField={updateField} />}
            {currentStep === 2 && <Step2 formData={formData} updateField={updateField} toggleArrayItem={toggleArrayItem} />}
            {currentStep === 3 && <Step3 formData={formData} updateField={updateField} />}
            {currentStep === 4 && <Step4 formData={formData} videoData={videoData} />}
            {currentStep === 5 && <Step5 campaignId={campaignId} estimatedReach={estimatedReach} onClose={onClose} onSuccess={onSuccess} />}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between p-6 border-t border-linkedin-gray-200">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            {currentStep === 4 ? (
              <Button onClick={handleSubmit} loading={loading} disabled={!canProceed()}>
                Launch Campaign
                <Sparkles className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Step 1: Campaign Objective
function Step1({ formData, updateField }: any) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-linkedin-gray-900 mb-2">
          Campaign Objective
        </h3>
        <p className="text-sm text-linkedin-gray-600 mb-4">
          What do you want to achieve with this campaign?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAMPAIGN_OBJECTIVES.map((obj) => (
            <button
              key={obj.value}
              onClick={() => updateField('objective', obj.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                formData.objective === obj.value
                  ? 'border-linkedin-blue bg-blue-50'
                  : 'border-linkedin-gray-300 hover:border-linkedin-blue'
              }`}
            >
              <p className="font-semibold text-linkedin-gray-900">{obj.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
          Campaign Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter campaign name"
          className="linkedin-input"
        />
      </div>
    </motion.div>
  );
}

// Step 2: Targeting
function Step2({ formData, updateField, toggleArrayItem }: any) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-linkedin-gray-900 mb-2">
          Target Audience
        </h3>
        <p className="text-sm text-linkedin-gray-600 mb-4">
          Define who should see your campaign
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
          Location
        </label>
        <select
          multiple
          value={formData.location}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            updateField('location', selected);
          }}
          className="linkedin-input h-32"
        >
          {MOCK_LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <p className="text-xs text-linkedin-gray-600 mt-1">Hold Cmd/Ctrl to select multiple</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
          Job Titles (comma-separated)
        </label>
        <input
          type="text"
          value={formData.jobTitles}
          onChange={(e) => updateField('jobTitles', e.target.value)}
          placeholder="e.g., Software Engineer, Product Manager"
          className="linkedin-input"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
          Company Size
        </label>
        <div className="space-y-2">
          {COMPANY_SIZES.map((size) => (
            <label key={size.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.companySizes.includes(size.value)}
                onChange={() => toggleArrayItem('companySizes', size.value)}
                className="w-4 h-4 accent-linkedin-blue"
              />
              <span className="text-sm text-linkedin-gray-900">{size.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
          Industries
        </label>
        <select
          multiple
          value={formData.industries}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            updateField('industries', selected);
          }}
          className="linkedin-input h-32"
        >
          {MOCK_INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );
}

// Step 3: Budget & Schedule
function Step3({ formData, updateField }: any) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-linkedin-gray-900 mb-2">
          Budget & Schedule
        </h3>
        <p className="text-sm text-linkedin-gray-600 mb-4">
          Set your campaign budget and timeline
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
          Budget Type
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => updateField('budgetType', 'daily')}
            className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
              formData.budgetType === 'daily'
                ? 'border-linkedin-blue bg-blue-50 text-linkedin-blue'
                : 'border-linkedin-gray-300 text-linkedin-gray-900'
            }`}
          >
            Daily Budget
          </button>
          <button
            onClick={() => updateField('budgetType', 'total')}
            className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
              formData.budgetType === 'total'
                ? 'border-linkedin-blue bg-blue-50 text-linkedin-blue'
                : 'border-linkedin-gray-300 text-linkedin-gray-900'
            }`}
          >
            Total Budget
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
          Budget Amount ($)
        </label>
        <input
          type="number"
          value={formData.budgetAmount}
          onChange={(e) => updateField('budgetAmount', e.target.value)}
          placeholder="Minimum $10"
          min="10"
          className="linkedin-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => updateField('startDate', e.target.value)}
            min={today}
            className="linkedin-input"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-linkedin-gray-900 mb-2">
            End Date (Optional)
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            min={formData.startDate || today}
            className="linkedin-input"
          />
        </div>
      </div>
    </motion.div>
  );
}

// Step 4: Review
function Step4({ formData, videoData }: any) {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-linkedin-gray-900 mb-2">
          Review Campaign
        </h3>
        <p className="text-sm text-linkedin-gray-600 mb-4">
          Please review your campaign details before launching
        </p>
      </div>

      <div className="space-y-4">
        <ReviewSection title="Campaign">
          <ReviewItem label="Objective" value={CAMPAIGN_OBJECTIVES.find(o => o.value === formData.objective)?.label || formData.objective} />
          <ReviewItem label="Name" value={formData.name} />
        </ReviewSection>

        <ReviewSection title="Targeting">
          <ReviewItem label="Locations" value={formData.location.join(', ')} />
          <ReviewItem label="Job Titles" value={formData.jobTitles || 'Any'} />
          <ReviewItem label="Company Sizes" value={formData.companySizes.length > 0 ? formData.companySizes.join(', ') : 'Any'} />
          <ReviewItem label="Industries" value={formData.industries.join(', ')} />
        </ReviewSection>

        <ReviewSection title="Budget & Schedule">
          <ReviewItem label="Budget" value={`$${formData.budgetAmount} (${formData.budgetType})`} />
          <ReviewItem label="Start Date" value={formData.startDate} />
          <ReviewItem label="End Date" value={formData.endDate || 'Ongoing'} />
        </ReviewSection>

        <ReviewSection title="Video">
          <ReviewItem label="Video ID" value={videoData.id} />
          <ReviewItem label="Duration" value={`${videoData.duration}s`} />
          <ReviewItem label="Resolution" value={videoData.resolution} />
        </ReviewSection>
      </div>
    </motion.div>
  );
}

// Step 5: Success
function Step5({ campaignId, estimatedReach, onClose, onSuccess }: any) {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-linkedin-success/10 flex items-center justify-center">
        <Check className="w-10 h-10 text-linkedin-success" />
      </div>
      <h3 className="text-2xl font-bold text-linkedin-gray-900 mb-2">
        Campaign Launched Successfully!
      </h3>
      <p className="text-linkedin-gray-600 mb-6">
        Your LinkedIn ad campaign is now live and reaching your target audience.
      </p>

      <div className="bg-linkedin-gray-100 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-xs text-linkedin-gray-600 mb-1">Campaign ID</p>
            <p className="text-sm font-semibold text-linkedin-gray-900">{campaignId}</p>
          </div>
          <div>
            <p className="text-xs text-linkedin-gray-600 mb-1">Estimated Reach</p>
            <p className="text-sm font-semibold text-linkedin-gray-900">{estimatedReach?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="secondary">
          View Campaign
        </Button>
        <Button onClick={() => {
          onSuccess();
          onClose();
        }}>
          Create Another Video
        </Button>
      </div>
    </motion.div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-linkedin-gray-300 rounded-lg p-4">
      <h4 className="font-semibold text-linkedin-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-linkedin-gray-600">{label}:</span>
      <span className="font-medium text-linkedin-gray-900 text-right max-w-xs truncate">{value}</span>
    </div>
  );
}
