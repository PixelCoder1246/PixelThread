'use client';

import styles from './page.module.css';
import {
  Card,
  Input,
  Textarea,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';

export default function ProfileSettingsPage() {
  return (
    <div className={styles.profileSettingsPage}>
      <h1>Settings</h1>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className={styles.tabsContent}>
          <Card>
            <div className={styles.settingsCard}>
              <h2>Profile Information</h2>
              <Input
                label="Username"
                placeholder="johndoe"
                defaultValue="johndoe"
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                defaultValue="john@example.com"
              />
              <Textarea
                label="Bio"
                placeholder="Tell us about yourself"
                defaultValue="Software developer and technical writer."
              />
              <Input label="Location" placeholder="San Francisco, CA" />
              <Input label="Website" placeholder="https://example.com" />
              <Button>Save Changes</Button>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="account" className={styles.tabsContent}>
          <Card>
            <div className={styles.settingsCard}>
              <h2>Account Settings</h2>
              <p className="text-muted-foreground">
                Account settings will be implemented in Phase 4.
              </p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="privacy" className={styles.tabsContent}>
          <Card>
            <div className={styles.settingsCard}>
              <h2>Privacy Settings</h2>
              <p className="text-muted-foreground">
                Privacy settings will be implemented in Phase 4.
              </p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className={styles.tabsContent}>
          <Card>
            <div className={styles.settingsCard}>
              <h2>Notification Preferences</h2>
              <p className="text-muted-foreground">
                Notification preferences will be implemented in Phase 4.
              </p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="preferences" className={styles.tabsContent}>
          <Card>
            <div className={styles.settingsCard}>
              <h2>Preferences</h2>
              <p className="text-muted-foreground">
                Preferences will be implemented in Phase 4.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
