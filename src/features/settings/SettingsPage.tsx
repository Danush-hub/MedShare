import { useEffect, useMemo, useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { PageContainer } from '@/components/common/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/ToastProvider';
import { LoadingState, ErrorState } from '@/components/common';
import { cn } from '@/lib/cn';
import {
  usePermissions,
  useWorkspace,
  type InstitutionType,
  type WorkspaceSettings,
} from '@/features/workspace';
import { useServices } from '@/services/ServiceProvider';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { toServiceError } from '@/services/errors';

const INSTITUTION_TYPES: InstitutionType[] = [
  'Hospital',
  'Clinic',
  'Medical Center',
  'Community Health Center',
];

type TabValue = 'institution' | 'user' | 'preferences';

const PREFERENCE_LABELS: Record<keyof WorkspaceSettings['preferences'], string> = {
  emailOnNewRequest: 'Email me when a new request is received',
  emailOnRequestDecision: 'Email me when my request is approved or rejected',
  emailOnTransferUpdate: 'Email me when a transfer status changes',
  weeklyDigest: 'Send me a weekly sharing summary',
};

export function SettingsPage() {
  const toast = useToast();
  // `resetWorkspace` is a prototype-only demo utility, not a business API, so
  // it stays on the store; settings reads and persistence flow through the service.
  const { resetWorkspace } = useWorkspace();
  const services = useServices();
  const settingsQuery = useServiceQuery(() => services.settings.getSettings(), [services]);
  const savedSettings = settingsQuery.data;
  const { can } = usePermissions();
  const canManageSettings = can('settings:manage');
  const canReset = can('workspace:reset');

  const [tab, setTab] = useState<TabValue>('institution');
  const [form, setForm] = useState<WorkspaceSettings | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Populate the editable form once the service resolves the saved settings
  // (first load, after save, and after the demo reset rebuilds the services).
  useEffect(() => {
    if (settingsQuery.data) setForm(structuredClone(settingsQuery.data));
  }, [settingsQuery.data]);

  const dirty = useMemo(
    () => (savedSettings && form ? JSON.stringify(form) !== JSON.stringify(savedSettings) : false),
    [form, savedSettings],
  );

  const setInstitution = (patch: Partial<WorkspaceSettings['institution']>) =>
    setForm((f) => (f ? { ...f, institution: { ...f.institution, ...patch } } : f));
  const setUser = (patch: Partial<WorkspaceSettings['user']>) =>
    setForm((f) => (f ? { ...f, user: { ...f.user, ...patch } } : f));
  const setPreference = (key: keyof WorkspaceSettings['preferences'], value: boolean) =>
    setForm((f) => (f ? { ...f, preferences: { ...f.preferences, [key]: value } } : f));

  const handleSave = async () => {
    if (!form) return;
    if (!canManageSettings) {
      toast.error('Not permitted', 'Your current demo role cannot change workspace settings.');
      return;
    }
    try {
      await services.settings.updateSettings(form);
      toast.success('Settings saved', 'Your workspace settings were updated for this session.');
    } catch (error) {
      toast.error('Settings not saved', toServiceError(error).message);
    }
  };

  const handleReset = () => {
    if (!canReset) {
      toast.error('Not permitted', 'Your current demo role cannot reset the demo data.');
      setConfirmReset(false);
      return;
    }
    resetWorkspace();
    setConfirmReset(false);
    toast.info('Demo data reset', 'Sample workspace data has been restored to its original state.');
  };

  const discardChanges = () => {
    if (savedSettings) setForm(structuredClone(savedSettings));
  };

  return (
    <PageContainer
      eyebrow="Account"
      title="Settings"
      description="Manage your institution profile, personal details and sharing preferences."
    >
      <div className="space-y-4">
        <Tabs
          value={tab}
          onChange={(value) => setTab(value as TabValue)}
          ariaLabel="Settings sections"
          items={[
            { value: 'institution', label: 'Institution Profile' },
            { value: 'user', label: 'User Profile' },
            { value: 'preferences', label: 'Preferences' },
          ]}
        />

        {settingsQuery.loading ? (
          <LoadingState label="Loading settings…" />
        ) : settingsQuery.error ? (
          <ErrorState message={settingsQuery.error.message} onRetry={settingsQuery.refetch} />
        ) : form ? (
          <Card className="p-5 sm:p-6">
          {tab === 'institution' && (
            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="inst-name" required>
                  Institution name
                </Label>
                <Input
                  id="inst-name"
                  value={form.institution.name}
                  onChange={(e) => setInstitution({ name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inst-type">Institution type</Label>
                <Select
                  id="inst-type"
                  value={form.institution.type}
                  options={INSTITUTION_TYPES.map((t) => ({ value: t, label: t }))}
                  onChange={(e) => setInstitution({ type: e.target.value as InstitutionType })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inst-city">City</Label>
                <Input
                  id="inst-city"
                  value={form.institution.city}
                  onChange={(e) => setInstitution({ city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inst-contact">Primary contact person</Label>
                <Input
                  id="inst-contact"
                  value={form.institution.contactPerson}
                  onChange={(e) => setInstitution({ contactPerson: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inst-email">Work email</Label>
                <Input
                  id="inst-email"
                  type="email"
                  value={form.institution.workEmail}
                  onChange={(e) => setInstitution({ workEmail: e.target.value })}
                />
              </div>
            </div>
          )}

          {tab === 'user' && (
            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="user-name" required>
                  Display name
                </Label>
                <Input
                  id="user-name"
                  value={form.user.displayName}
                  onChange={(e) => setUser({ displayName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="user-username">Username</Label>
                <Input
                  id="user-username"
                  value={form.user.username}
                  onChange={(e) => setUser({ username: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="user-role">Role</Label>
                <Input id="user-role" value={form.user.role} readOnly disabled />
                <p className="text-xs text-ink-subtle">
                  Your role is assigned by your institution administrator and cannot be changed here.
                </p>
              </div>
            </div>
          )}

          {tab === 'preferences' && (
            <fieldset className="max-w-2xl space-y-3">
              <legend className="sr-only">Notification preferences</legend>
              <p className="rounded-field bg-info-soft px-4 py-3 text-sm text-info-foreground">
                These preferences are saved with your profile for demonstration only — this
                prototype does not send email or push notifications.
              </p>
              {(Object.keys(PREFERENCE_LABELS) as (keyof WorkspaceSettings['preferences'])[]).map((key) => (
                <label
                  key={key}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-field border border-line p-4 transition',
                    'hover:border-line-strong hover:bg-surface-muted/40',
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-line-strong accent-primary"
                    checked={form.preferences[key]}
                    onChange={(e) => setPreference(key, e.target.checked)}
                  />
                  <span className="text-sm text-ink">{PREFERENCE_LABELS[key]}</span>
                </label>
              ))}
            </fieldset>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <Button onClick={handleSave} disabled={!dirty || !canManageSettings}>
              <Save className="h-4 w-4" aria-hidden="true" />
              Save changes
            </Button>
            {!canManageSettings && (
              <span className="text-sm text-ink-muted">
                Your current demo role has read-only access to settings.
              </span>
            )}
            {dirty && canManageSettings && (
              <Button variant="ghost" onClick={discardChanges}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Discard
              </Button>
            )}
            {!dirty && canManageSettings && (
              <span className="text-sm text-ink-muted">No unsaved changes</span>
            )}
          </div>
        </Card>
        ) : null}

        {canReset && (
          <Card className="border-error/30 p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-ink">Reset prototype data</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Restore all sample equipment, requests, transfers and settings to their original demo state. This
              clears any changes made during your session.
            </p>
            <Button variant="danger" className="mt-4" onClick={() => setConfirmReset(true)}>
              Reset demo data
            </Button>
          </Card>
        )}

        <p className="text-xs text-ink-subtle">
          Settings are stored only in your browser (localStorage) and are never sent to a server. This
          prototype makes no clinical, regulatory or data-privacy claims.
        </p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset prototype data"
        tone="danger"
        confirmLabel="Reset everything"
        message="This will discard all local changes and restore the original sample dataset. This cannot be undone."
        onConfirm={handleReset}
        onClose={() => setConfirmReset(false)}
      />
    </PageContainer>
  );
}
