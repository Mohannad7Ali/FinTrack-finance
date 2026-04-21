'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

export default function AvatarUpload({
	currentImage,
	userId,
}: {
	currentImage?: string | null;
	userId: number;
}) {
	const [image, setImage] = useState<string | null>(currentImage || null);
	const [uploading, setUploading] = useState(false);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const formData = new FormData();
		formData.append('file', file);

		setUploading(true);
		try {
			const res = await fetch('/api/user/upload-image', {
				method: 'POST',
				body: formData,
			});
			const json = await res.json();
			if (res.ok && json.ok) {
				setImage(json.imageUrl);
				// تحديث واجهة المستخدم - يمكن إعادة تحميل بيانات المستخدم
				window.location.reload(); // بسيط، لكن يمكن تحسينه
			} else {
				alert('فشل رفع الصورة');
			}
		} catch (err) {
			console.error(err);
			alert('حدث خطأ');
		} finally {
			setUploading(false);
		}
	};

	const handleRemove = async () => {
		setUploading(true);
		try {
			const res = await fetch('/api/user/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ image: null }),
			});
			if (res.ok) {
				setImage(null);
				window.location.reload();
			}
		} catch (err) {
			console.error(err);
		} finally {
			setUploading(false);
		}
	};

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-700">
				{image ? (
					<Image src={image} alt="Profile" fill className="object-cover" />
				) : (
					<div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
						?
					</div>
				)}
			</div>
			<div className="flex gap-2">
				<label className="cursor-pointer">
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className="hidden"
						disabled={uploading}
					/>
					<Button variant="outline" size="sm" asChild>
						<span>
							<Camera className="w-4 h-4 ml-1" />
							{uploading ? 'جاري الرفع...' : 'تغيير الصورة'}
						</span>
					</Button>
				</label>
				{image && (
					<Button variant="outline" size="sm" onClick={handleRemove} disabled={uploading}>
						<X className="w-4 h-4 ml-1" />
						إزالة
					</Button>
				)}
			</div>
		</div>
	);
}
