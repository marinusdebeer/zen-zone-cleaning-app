/**
 * SEND ESTIMATE MODAL
 * 
 * Purpose:
 * Modal for sending estimate to client via email or SMS
 * Allows editing recipient, subject, body, and attachments
 */

'use client';

import { useState } from 'react';
import { X, Send, Mail, MessageSquare, FileText, Paperclip } from 'lucide-react';

interface SendEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  estimateTitle: string;
  estimateTotal: number;
}

export function SendEstimateModal({
  isOpen,
  onClose,
  estimateId,
  clientName,
  clientEmail,
  clientPhone,
  estimateTitle,
  estimateTotal,
}: SendEstimateModalProps) {
  const [sendMethod, setSendMethod] = useState<'email' | 'sms'>('email');
  const [formData, setFormData] = useState({
    to: sendMethod === 'email' ? clientEmail : clientPhone,
    subject: `Estimate for ${estimateTitle}`,
    body: sendMethod === 'email' 
      ? `Hi ${clientName.split(' ')[0]},\n\nThank you for your interest in our services. Please find attached the estimate for "${estimateTitle}".\n\nTotal: $${estimateTotal.toFixed(2)}\n\nPlease review and let us know if you have any questions. We look forward to working with you!\n\nBest regards`
      : `Hi! Your estimate for "${estimateTitle}" is ready.\n\nTotal: $${estimateTotal.toFixed(2)}\n\nView online: [link]\n\n- Zen Zone Cleaning`,
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  // Update recipient when method changes
  const handleMethodChange = (method: 'email' | 'sms') => {
    setSendMethod(method);
    setFormData(prev => ({
      ...prev,
      to: method === 'email' ? clientEmail : clientPhone,
      body: method === 'email'
        ? `Hi ${clientName.split(' ')[0]},\n\nThank you for your interest in our services. Please find attached the estimate for "${estimateTitle}".\n\nTotal: $${estimateTotal.toFixed(2)}\n\nPlease review and let us know if you have any questions. We look forward to working with you!\n\nBest regards`
        : `Hi! Your estimate for "${estimateTitle}" is ready.\n\nTotal: $${estimateTotal.toFixed(2)}\n\nView online: [link]\n\n- Zen Zone Cleaning`,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSend = async () => {
    setError('');
    setIsSending(true);

    try {
      // Validate
      if (!formData.to) {
        throw new Error(`Please enter a ${sendMethod === 'email' ? 'email address' : 'phone number'}`);
      }

      if (sendMethod === 'email' && !formData.to.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (sendMethod === 'email' && !formData.subject) {
        throw new Error('Please enter a subject');
      }

      if (!formData.body) {
        throw new Error('Please enter a message');
      }

      // Import server action dynamically
      const { sendEstimate } = await import('@/server/actions/estimate-email');

      // Send estimate
      await sendEstimate({
        estimateId,
        method: sendMethod,
        to: formData.to,
        subject: formData.subject,
        body: formData.body,
        // TODO: Convert File objects to Buffer for attachments
        // attachments: await Promise.all(attachments.map(async file => ({
        //   filename: file.name,
        //   content: Buffer.from(await file.arrayBuffer()),
        // }))),
      });

      // Success - close modal and refresh page
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send estimate');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-brand-bg rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Send className="w-6 h-6 text-brand mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Send Estimate</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Email estimate to client</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Client Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{clientName}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Estimate: {estimateTitle}</p>
              </div>
            </div>
          </div>

          {/* Send Method Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Send Via
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleMethodChange('email')}
                disabled={isSending}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  sendMethod === 'email'
                    ? 'bg-brand-bg-tertiary border-brand'
                    : 'bg-brand-bg border-brand-border hover:border-brand-border-hover'
                } ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Mail className="w-5 h-5 mx-auto mb-1 text-brand" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
              </button>
              <button
                type="button"
                onClick={() => handleMethodChange('sms')}
                disabled={isSending || !clientPhone}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  sendMethod === 'sms'
                    ? 'bg-brand-bg-tertiary border-brand'
                    : 'bg-brand-bg border-brand-border hover:border-brand-border-hover'
                } ${isSending || !clientPhone ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <MessageSquare className="w-5 h-5 mx-auto mb-1 text-brand" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">SMS</p>
              </button>
            </div>
            {!clientPhone && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                SMS not available - client has no phone number
              </p>
            )}
          </div>

          {/* To Email/Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {sendMethod === 'email' ? 'To Email' : 'To Phone'} <span className="text-red-500">*</span>
            </label>
            <input
              type={sendMethod === 'email' ? 'email' : 'tel'}
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              disabled={isSending}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
              placeholder={sendMethod === 'email' ? 'client@example.com' : '(555) 123-4567'}
            />
          </div>

          {/* Subject (Email only) */}
          {sendMethod === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={isSending}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
                placeholder="Estimate for services"
              />
            </div>
          )}

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={sendMethod === 'sms' ? 5 : 10}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              disabled={isSending}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand font-mono text-sm"
              placeholder={sendMethod === 'email' ? 'Email message...' : 'SMS message...'}
              maxLength={sendMethod === 'sms' ? 160 : undefined}
            />
            {sendMethod === 'sms' && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.body.length}/160 characters
              </p>
            )}
          </div>

          {/* File Attachments (Email only) */}
          {sendMethod === 'email' && (
            <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
              <Paperclip className="w-4 h-4 mr-2" />
              Attachments (Optional)
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isSending}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-brand focus:border-brand"
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Estimate PDF will be automatically attached
            </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[var(--tenant-bg-tertiary)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending || !formData.to || (sendMethod === 'email' && !formData.subject) || !formData.body}
            className="px-6 py-2 bg-brand text-white font-semibold rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send {sendMethod === 'email' ? 'Email' : 'SMS'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

