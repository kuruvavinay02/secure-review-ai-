import { Settings as SettingsIcon, User, Bell, Shield, Database } from 'lucide-react';

export default function Settings() {
  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ fontWeight: 900 }} data-testid="settings-title">
            Settings
          </h1>
          <p className="text-slate-300">Configure your SecureReview AI+++ experience</p>
        </div>
        
        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="glass-card p-6" data-testid="profile-settings">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Profile Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue="Security Admin"
                  data-testid="display-name-input"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="admin@securereview.ai"
                  data-testid="email-input"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Notification Settings */}
          <div className="glass-card p-6" data-testid="notification-settings">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Notifications</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Critical vulnerability alerts', id: 'critical-alerts' },
                { label: 'Scan completion notifications', id: 'scan-complete' },
                { label: 'Weekly security reports', id: 'weekly-reports' },
                { label: 'New lesson availability', id: 'new-lessons' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-slate-300">{item.label}</span>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" defaultChecked className="sr-only peer" data-testid={item.id} />
                    <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:bg-blue-600 transition-all cursor-pointer"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Security Settings */}
          <div className="glass-card p-6" data-testid="security-settings">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Security</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left" data-testid="change-password-btn">
                Change Password
              </button>
              <button className="w-full btn-secondary text-left" data-testid="enable-2fa-btn">
                Enable Two-Factor Authentication
              </button>
              <button className="w-full btn-secondary text-left" data-testid="api-keys-btn">
                Manage API Keys
              </button>
            </div>
          </div>
          
          {/* Data & Privacy */}
          <div className="glass-card p-6" data-testid="data-privacy-settings">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-bold" style={{ fontWeight: 900 }}>Data & Privacy</h2>
            </div>
            <div className="space-y-3">
              <button className="w-full btn-secondary text-left" data-testid="export-data-btn">
                Export Scan History
              </button>
              <button className="w-full btn-secondary text-left" data-testid="delete-scans-btn">
                Delete Old Scans
              </button>
              <button className="w-full btn-secondary text-left text-red-400 hover:text-red-300" data-testid="delete-account-btn">
                Delete Account
              </button>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button className="btn-secondary" data-testid="cancel-btn">Cancel</button>
            <button className="btn-primary" data-testid="save-settings-btn">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}