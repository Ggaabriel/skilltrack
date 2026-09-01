import { NotificationSettings } from "@/features/notifications/ui/notification-settings";

export function SettingsPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your SkillTrack preferences.
        </p>
      </div>

      <NotificationSettings />
    </div>
  );
}
