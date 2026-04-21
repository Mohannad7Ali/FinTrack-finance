// app/api/user/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getUserId } from '@/lib/utils/getUserId';

export async function POST(req: NextRequest) {
	try {
		const userId = await getUserId(req);
		if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

		const formData = await req.formData();
		const file = formData.get('file') as File;
		if (!file) return NextResponse.json({ ok: false, error: 'No file uploaded' }, { status: 400 });

		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// إنشاء اسم فريد
		const ext = path.extname(file.name);
		const filename = `${userId}-${Date.now()}${ext}`;
		const uploadDir = path.join(process.cwd(), 'public/uploads');
		await mkdir(uploadDir, { recursive: true });
		const filepath = path.join(uploadDir, filename);
		await writeFile(filepath, buffer);

		const imageUrl = `/uploads/${filename}`;
		// تحديث قاعدة البيانات
		const { prisma } = await import('@/lib/prisma');
		await prisma.user.update({
			where: { id: userId },
			data: { image: imageUrl },
		});

		return NextResponse.json({ ok: true, imageUrl });
	} catch (error) {
		console.error('Upload error:', error);
		return NextResponse.json({ ok: false, error: 'فشل رفع الصورة' }, { status: 500 });
	}
}
