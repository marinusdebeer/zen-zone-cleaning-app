'use client';

import { useState } from 'react';
import { 
  X, User, MapPin, Clock, Tag, Repeat, Users, Mail, Plus, 
  Calendar, DollarSign, FileText, AlertCircle, Check 
} from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  startTime: Date;
  endTime: Date;
  onSave: (jobData: any) => void;
}

export function JobModal({ isOpen, onClose, startTime, endTime, onSave }: JobModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    client: '',
    title: '',
    address: '',
    notes: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    recurringDays: [] as number[],
    recurringEndDate: '',
    estimatedCost: '',
    priority: 'normal',
    notifyClient: true,
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);

  const teamMembers = [
    { id: '1', name: 'John Smith', role: 'Team Lead', available: true },
    { id: '2', name: 'Emily Davis', role: 'Cleaner', available: true },
    { id: '3', name: 'Michael Brown', role: 'Cleaner', available: false },
    { id: '4', name: 'Sarah Wilson', role: 'Cleaner', available: true },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      startTime,
      endTime,
      assignedTeam: selectedTeamMembers,
    });
    onClose();
    setCurrentStep(1);
    setSelectedTeamMembers([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const steps = [
    { num: 1, title: 'Details', icon: FileText },
    { num: 2, title: 'Team', icon: Users },
    { num: 3, title: 'Schedule', icon: Repeat },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
          
          <div className="bg-gradient-to-r from-[#2e3d2f] to-[#4a7c59] p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold">Create New Job</h2>
                <p className="text-sm text-gray-200 mt-1">{formatDate(startTime)}</p>
                
                <div className="mt-4 bg-white/10 backdrop-blur rounded-lg p-3 inline-flex items-center space-x-3">
                  <Clock className="w-5 h-5" />
                  <div>
                    <span className="font-semibold text-lg">{formatTime(startTime)} - {formatTime(endTime)}</span>
                    <span className="text-sm text-gray-200 ml-3">({duration.toFixed(1)}h)</span>
                  </div>
                </div>
              </div>
              
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center justify-center space-x-4 mt-6">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                
                return (
                  <div key={step.num} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.num)}
                      type="button"
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                        isActive ? 'bg-white text-[#2e3d2f] shadow-lg' : isCompleted ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-200 hover:bg-white/20'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      <span className="text-sm font-medium">{step.title}</span>
                    </button>
                    {step.num < steps.length && <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-white' : 'bg-white/20'}`}></div>}
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 mr-2 text-[#4a7c59]" />
                      Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all"
                      placeholder="Enter client name"
                    />
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4 mr-2 text-[#4a7c59]" />
                      Service Type *
                    </label>
                    <select
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all"
                    >
                      <option value="">Select service type</option>
                      <option value="Home Cleaning">🏠 Home Cleaning</option>
                      <option value="Deep Clean">✨ Deep Clean</option>
                      <option value="Office Cleaning">🏢 Office Cleaning</option>
                      <option value="Move In/Out">📦 Move In/Out</option>
                      <option value="Post-Construction">🔨 Post-Construction</option>
                      <option value="Window Cleaning">🪟 Window Cleaning</option>
                      <option value="Carpet Cleaning">🧹 Carpet Cleaning</option>
                      <option value="Other">➕ Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 mr-2 text-[#4a7c59]" />
                    Service Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all"
                    placeholder="123 Main St, Barrie, ON"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <AlertCircle className="w-4 h-4 mr-2 text-[#4a7c59]" />
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="normal">🟡 Normal</option>
                      <option value="high">🔴 High</option>
                      <option value="urgent">⚠️ Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 mr-2 text-[#4a7c59]" />
                      Estimated Cost
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 mr-2 text-[#4a7c59]" />
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all resize-none"
                    placeholder="Pet notes, access codes, special requests..."
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Select team members available during the scheduled time
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-[#4a7c59]" />
                    Assign Team Members
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teamMembers.map((member) => {
                      const isSelected = selectedTeamMembers.includes(member.id);
                      const isAvailable = member.available;
                      
                      return (
                        <div
                          key={member.id}
                          onClick={() => isAvailable && toggleTeamMember(member.id)}
                          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected ? 'border-[#4a7c59] bg-[#f7faf7] shadow-md' : isAvailable ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm' : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#4a8c37] rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${isAvailable ? 'bg-[#4a7c59]' : 'bg-gray-400'}`}>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{member.name}</p>
                              <p className="text-sm text-gray-600">{member.role}</p>
                              <p className={`text-xs mt-1 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                                {isAvailable ? '✓ Available' : '✗ Busy'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-[#4a7c59]" />
                    Invite Team Member
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all"
                      placeholder="email@example.com"
                    />
                    <button
                      type="button"
                      onClick={() => setInviteEmail('')}
                      className="px-6 py-3 bg-[#4a7c59] text-white rounded-xl hover:bg-[#4a8c37] transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Invite</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-[#f7faf7] to-white p-6 rounded-xl border-2 border-[#4a7c59]/20">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Repeat className="w-6 h-6 text-[#4a7c59]" />
                      <div>
                        <p className="font-semibold text-gray-900">Make this a recurring job</p>
                        <p className="text-sm text-gray-600">Schedule this job to repeat automatically</p>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-[#4a8c37] transition-colors"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 shadow-md"></div>
                    </div>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-6">
                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                        <Calendar className="w-4 h-4 mr-2 text-[#4a7c59]" />
                        Repeat Pattern
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['daily', 'weekly', 'biweekly', 'monthly'].map((pattern) => (
                          <button
                            key={pattern}
                            type="button"
                            onClick={() => setFormData({ ...formData, recurringPattern: pattern })}
                            className={`px-4 py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                              formData.recurringPattern === pattern ? 'border-[#4a7c59] bg-[#f7faf7] text-[#4a7c59]' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {pattern}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(formData.recurringPattern === 'weekly' || formData.recurringPattern === 'biweekly') && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-3 block">Select Days</label>
                        <div className="grid grid-cols-7 gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                            const isSelected = formData.recurringDays.includes(index);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    recurringDays: isSelected ? formData.recurringDays.filter(d => d !== index) : [...formData.recurringDays, index]
                                  });
                                }}
                                className={`h-12 rounded-xl border-2 font-medium text-sm transition-all ${
                                  isSelected ? 'border-[#4a7c59] bg-[#4a7c59] text-white' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 mr-2 text-[#4a7c59]" />
                        Repeat Until
                      </label>
                      <input
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4a7c59] focus:border-[#4a7c59] transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-2">Leave blank for indefinite recurring</p>
                    </div>

                    <div className="bg-[#f7faf7] p-4 rounded-xl border-2 border-[#4a7c59]/20">
                      <p className="text-sm font-medium text-gray-900">
                        📅 This job will repeat <span className="text-[#4a7c59] font-bold">{formData.recurringPattern}</span>
                        {formData.recurringDays.length > 0 && <span> on <span className="text-[#4a7c59] font-bold">{formData.recurringDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</span></span>}
                        {formData.recurringEndDate && <span> until <span className="text-[#4a7c59] font-bold">{new Date(formData.recurringEndDate).toLocaleDateString()}</span></span>}
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t-2 border-gray-100 pt-6">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifyClient}
                      onChange={(e) => setFormData({ ...formData, notifyClient: e.target.checked })}
                      className="w-5 h-5 text-[#4a7c59] rounded focus:ring-2 focus:ring-[#4a7c59]"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Send confirmation to client</p>
                      <p className="text-sm text-gray-600">Client will receive an email with job details</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-8 border-t-2 border-gray-100 mt-8">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    ← Previous
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-3 bg-[#4a7c59] text-white rounded-xl hover:bg-[#4a8c37] transition-colors font-medium shadow-lg"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#4a8c37] text-white rounded-xl hover:bg-[#4a7c59] transition-colors font-semibold shadow-lg flex items-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Create Job</span>
                  </button>
                )}
              </div>
            </div>

            {selectedTeamMembers.length > 0 && (
              <div className="mt-4 p-4 bg-[#f7faf7] rounded-xl border-2 border-[#4a7c59]/20">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {selectedTeamMembers.length} team member(s) assigned:
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTeamMembers.map(memberId => {
                    const member = teamMembers.find(m => m.id === memberId);
                    return member && (
                      <span key={memberId} className="px-3 py-1 bg-[#4a7c59] text-white rounded-full text-xs font-medium">
                        {member.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
