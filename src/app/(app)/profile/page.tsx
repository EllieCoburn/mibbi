import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormField, FormShell } from "@/components/auth/form-shell";
import { getCurrentUser } from "@/lib/data/profile";
import { signOut, updateProfile } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <Container width="narrow" className="py-6 sm:py-10">
      <h1 className="text-3xl">Your profile</h1>
      <p className="text-ink-soft mt-1">Only you can see this.</p>

      <Card className="mt-6">
        <CardBody>
          <FormShell action={updateProfile} submitLabel="Save">
            <FormField
              label="Display name"
              name="displayName"
              maxLength={20}
              required
              defaultValue={user.profile.display_name}
              hint="Letters and numbers, 2–20 characters."
            />
          </FormShell>
        </CardBody>
      </Card>

      <Card className="mt-4">
        <CardBody className="flex flex-col gap-3">
          <div>
            <p className="font-display text-ink-mute text-xs font-semibold tracking-wide uppercase">Account email</p>
            <p className="text-chocolate">{user.email}</p>
          </div>
          <div>
            <p className="font-display text-ink-mute text-xs font-semibold tracking-wide uppercase">Member since</p>
            <p className="text-chocolate">{new Date(user.profile.created_at).toLocaleDateString()}</p>
          </div>
          {user.isAdmin ? (
            <div>
              <p className="font-display text-ink-mute text-xs font-semibold tracking-wide uppercase">Role</p>
              <p className="text-chocolate">Admin ({user.adminRole})</p>
            </div>
          ) : null}
        </CardBody>
      </Card>

      <form action={signOut} className="mt-6">
        <Button type="submit" variant="danger" className="w-full">
          Sign out
        </Button>
      </form>
    </Container>
  );
}
