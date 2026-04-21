'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileForm from './ProfileForm';
import PasswordForm from './PasswordForm';
import { User } from '@/types/user';

export default function SettingsTabs({ user }: { user: User }) {
	return (
		<Tabs defaultValue="profile" dir="rtl" className="w-full">
			<TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
				<TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
				<TabsTrigger value="security">الأمان وكلمة المرور</TabsTrigger>
			</TabsList>
			<TabsContent value="profile">
				<ProfileForm user={user} />
			</TabsContent>
			<TabsContent value="security">
				<PasswordForm provider={user.provider} />
			</TabsContent>
		</Tabs>
	);
}
