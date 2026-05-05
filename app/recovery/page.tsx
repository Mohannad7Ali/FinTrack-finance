'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// لا يوجد اتصال حقيقي بالـ API، فقط عرض رسالة "قريباً"
		setSubmitted(true);
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center">
						<Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
					</div>
					<CardTitle className="text-2xl">نسيت كلمة المرور؟</CardTitle>
					<CardDescription>
						سنضيف هذه الميزة قريباً جداً. يمكنك ترك بريدك وسنخبرك عند إطلاقها.
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{submitted ? (
							<Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
								<Mail className="h-4 w-4 text-green-600" />
								<AlertDescription className="text-green-700 dark:text-green-300">
									شكراً لك! سنرسل لك إشعاراً فور تفعيل خاصية استعادة كلمة المرور.
								</AlertDescription>
							</Alert>
						) : (
							<>
								<div className="relative">
									<Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										type="email"
										placeholder="بريدك الإلكتروني"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="pr-10"
										required
									/>
								</div>
								<Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
									<Clock className="h-4 w-4 text-blue-600" />
									<AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
										هذه الخاصية قيد التطوير وستتوفر قريباً. يمكنك تسجيل بريدك لتصلك التحديثات.
									</AlertDescription>
								</Alert>
							</>
						)}
					</CardContent>
					<CardFooter className="flex flex-col gap-2">
						{!submitted && (
							<Button type="submit" className="w-full" variant="default">
								إشعار عند التفعيل
							</Button>
						)}
						<Button asChild variant="outline" className="w-full">
							<Link href="/login">
								<ArrowLeft className="ml-2 h-4 w-4" />
								العودة إلى تسجيل الدخول
							</Link>
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
