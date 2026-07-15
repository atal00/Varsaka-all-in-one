import { SettingsClientView } from './settings-client-view';

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Platform Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your autonomous agents, API keys, and workspace preferences.</p>
      </div>
      
      <SettingsClientView />
    </div>
  );
}
