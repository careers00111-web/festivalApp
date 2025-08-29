# Railway Deployment Setup

## المشكلة الحالية

التطبيق يفشل في الاتصال بقاعدة البيانات MongoDB Atlas

## الحل

### 1. إعداد متغيرات البيئة في Railway

اذهب إلى Railway Dashboard > مشروعك > Variables tab وأضف:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/festival_db?retryWrites=true&w=majority
NODE_ENV=production
JWT_SECRET=your_secret_key_here
```

### 2. تأكد من صحة رابط MongoDB Atlas

- استبدل `username` و `password` ببياناتك الحقيقية
- تأكد من أن المستخدم لديه صلاحيات القراءة والكتابة
- تأكد من أن IP address مسموح به (أو استخدم 0.0.0.0/0 للسماح للجميع)

### 3. اختبار الاتصال

بعد إضافة المتغيرات، سيتم إعادة النشر تلقائياً.

### 4. للتحقق من الأخطاء

اذهب إلى Railway Dashboard > مشروعك > Deployments > Latest > View Logs

## ملاحظات مهمة

- تأكد من أن قاعدة البيانات `festival_db` موجودة في MongoDB Atlas
- تأكد من أن المستخدم لديه صلاحيات كافية
- تحقق من إعدادات Network Access في MongoDB Atlas
