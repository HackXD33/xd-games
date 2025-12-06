# ألعاب XD (XD Games)

موقع ويب يحتوي على لعبتين تفاعليتين: لعبة الفقاعات ولعبة الثعبان، مع نظام تسجيل دخول بحساب جوجل.

## الميزات

### لعبة الفقاعات
- ثلاثة أوضاع لعب: التحدي، النجاة، والزن
- نظام نقاط ومستويات
- نظام الإنجازات
- إعدادات قابلة للتخصيص (الصعوبة، سرعة الفقاعات، حجم الفقاعات، نمط الألوان)
- مؤثرات صوتية

### لعبة الثعبان
- نظام نقاط ومستويات
- إعدادات قابلة للتخصيص
- مؤثرات صوتية
- إمكانية إيقاف اللعبة واستئنافها

### نظام تسجيل الدخول
- تسجيل الدخول بحساب جوجل باستخدام Google Identity Platform
- حفظ حالة المستخدم بين اللعبتين
- عرض صورة واسم المستخدم

## التقنيات المستخدمة
- HTML5
- CSS3
- JavaScript
- Google Identity Platform
- Font Awesome للأيقونات
- Google Fonts للخطوط

## التثبيت والتشغيل

1. استنساخ المستودع:
```bash
git clone https://github.com/USERNAME/REPOSITORY.git
```

2. الانتقال إلى مجلد المشروع:
```bash
cd fogaat
```

3. فتح ملف index.html في متصفح الويب:
```
الانتقال إلى اللعبة الأولى: http://localhost/fogaat/index.html
الانتقال إلى لعبة الثعبان: http://localhost/fogaat/snake.html
```

## إعداد تسجيل الدخول بحساب جوجل

1. إنشاء مشروع في [Google Cloud Console](https://console.cloud.google.com/)
2. تفعيل Google Identity Toolkit API
3. إنشاء بيانات اعتماد OAuth 2.0
4. استبدال `YOUR_CLIENT_ID.apps.googleusercontent.com` بمعرّف العميل الفعلي في الملفات:
   - index.html
   - snake.html

## المساهمون

- اسمك - [رابط حسابك على GitHub](https://github.com/USERNAME)

## الترخيص

هذا المشروع مرخص تحت ترخيص MIT.
