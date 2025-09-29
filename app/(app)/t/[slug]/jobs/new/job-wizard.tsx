'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Organization, Client } from '@/generated/prisma';
import { renderField } from '@/ui/registry';
import { createJob } from '@/server/actions/jobs';

interface JobWizardProps {
  org: Organization;
  clients: Client[];
}

interface FormData {
  [key: string]: any;
}

interface FormErrors {
  [key: string]: string;
}

export function JobWizard({ org, clients }: JobWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    custom: {}
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract wizard configuration from organization settings
  const settings = org.settings as any;
  const wizard = settings?.workflows?.jobLifecycle?.createWizard;
  const requiredFields = settings?.forms?.job?.required || ['title', 'clientId'];

  if (!wizard?.steps) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Job creation wizard is not configured</p>
        <p className="text-sm text-gray-400 mt-1">
          Contact your administrator to set up the job creation workflow
        </p>
      </div>
    );
  }

  const steps = wizard.steps;

  const handleFieldChange = (fieldName: string, value: any) => {
    const newFormData = { ...formData };
    
    if (fieldName.startsWith('custom.')) {
      const customField = fieldName.replace('custom.', '');
      newFormData.custom = {
        ...newFormData.custom,
        [customField]: value
      };
    } else {
      newFormData[fieldName] = value;
    }
    
    setFormData(newFormData);
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const getFieldValue = (fieldName: string) => {
    if (fieldName.startsWith('custom.')) {
      const customField = fieldName.replace('custom.', '');
      return formData.custom?.[customField];
    }
    return formData[fieldName];
  };

  const validateStep = (stepIndex: number): FormErrors => {
    const step = steps[stepIndex];
    const stepErrors: FormErrors = {};

    step.fields.forEach((fieldName: string) => {
      if (requiredFields.includes(fieldName)) {
        const value = getFieldValue(fieldName);
        if (!value || (typeof value === 'string' && !value.trim())) {
          stepErrors[fieldName] = 'This field is required';
        }
      }
    });

    return stepErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    // Validate all steps
    const allErrors: FormErrors = {};
    steps.forEach((_: any, index: number) => {
      const stepErrors = validateStep(index);
      Object.assign(allErrors, stepErrors);
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createJob(org.slug, formData);
      router.push(`/t/${org.slug}/jobs`);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create job'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStepData = steps[currentStep];
  
  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step: any, index: number) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  index <= currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              <div className="ml-2">
                <p className={`text-sm font-medium ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step content */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentStepData.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentStepData.fields.map((fieldName: string) => {
            const fieldProps = {
              name: fieldName,
              value: getFieldValue(fieldName),
              onChange: (value: any) => handleFieldChange(fieldName, value),
              error: errors[fieldName],
              required: requiredFields.includes(fieldName),
              options: fieldName === 'clientId' ? clients : undefined,
            };

            return (
              <div key={fieldName} className="col-span-1">
                {renderField(fieldName, fieldProps)}
              </div>
            );
          })}
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {errors.submit}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="space-x-3">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Job'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
