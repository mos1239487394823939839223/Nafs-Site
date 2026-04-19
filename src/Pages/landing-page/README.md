# Landing Page - نَفَس

صفحة رئيسية لتطبيق نَفَس للصحة النفسية - مصممة بـ React، TypeScript و Tailwind CSS.

## 📁 هيكل المشروع

```
landing-page/
├── components/           # جميع المكونات
│   ├── ui/              # مكونات UI الأساسية
│   │   └── button.tsx
│   ├── Navbar.tsx       # شريط التنقل
│   ├── Hero.tsx         # القسم الرئيسي
│   ├── Features.tsx     # قسم المميزات
│   ├── HowItWorks.tsx   # قسم كيف يعمل
│   ├── CTA.tsx          # دعوة للعمل
│   ├── Footer.tsx       # التذييل
│   └── Logo.tsx         # الشعار
├── lib/                 # المكتبات المساعدة
│   └── utils.ts         # دوال مساعدة
├── styles/              # ملفات الأنماط
│   └── index.css        # الأنماط الرئيسية مع RTL
├── Index.tsx            # الصفحة الرئيسية
└── tailwind.config.ts   # إعدادات Tailwind

```

## 🎨 المميزات

- ✅ **دعم كامل للغة العربية RTL**
- ✅ **تصميم متجاوب** - يعمل على جميع الأجهزة
- ✅ **أنماط مخصصة** - ألوان وخطوط مصممة خصيصاً
- ✅ **مكونات قابلة لإعادة الاستخدام**
- ✅ **TypeScript** - للكتابة الآمنة
- ✅ **Tailwind CSS** - للتصميم السريع

## 📦 المتطلبات

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "lucide-react": "للأيقونات",
  "@radix-ui/react-slot": "للمكونات",
  "class-variance-authority": "لإدارة الأنماط",
  "clsx": "لدمج الكلاسات",
  "tailwind-merge": "لدمج Tailwind classes",
  "tailwindcss": "^3.x",
  "tailwindcss-animate": "للحركات"
}
```

## 🚀 كيفية الاستخدام

### 1. تثبيت المتطلبات

```bash
npm install react react-dom lucide-react @radix-ui/react-slot class-variance-authority clsx tailwind-merge tailwindcss tailwindcss-animate
```

أو باستخدام bun:

```bash
bun add react react-dom lucide-react @radix-ui/react-slot class-variance-authority clsx tailwind-merge tailwindcss tailwindcss-animate
```

### 2. إعداد Tailwind CSS

تأكد من إضافة ملف `postcss.config.js`:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 3. استيراد الأنماط

في ملف `main.tsx` أو نقطة الدخول الرئيسية:

```typescript
import './landing-page/styles/index.css'
```

### 4. استخدام الصفحة

```typescript
import Index from './landing-page/Index'

function App() {
  return <Index />
}
```

## 🎯 المكونات الرئيسية

### Navbar
شريط التنقل مع:
- شعار التطبيق
- روابط التنقل
- أزرار تبديل اللغة والوضع الليلي
- زر الحجز الرئيسي

### Hero
القسم الرئيسي مع:
- عنوان رئيسي بارز
- وصف التطبيق
- أزرار Call-to-Action
- شارات الثقة
- معاينة التطبيق

### Features
عرض مميزات التطبيق الست:
- جلسات فيديو وصوت وشات
- حجز مرن
- دفع آمن
- مساعد ذكي
- مكتبة محتوى
- خصوصية كاملة

### HowItWorks
شرح طريقة الاستخدام في 3 خطوات

### CTA
دعوة نهائية للحجز

### Footer
روابط مهمة وحقوق النشر

## 🔧 التخصيص

### تغيير الألوان

في ملف `styles/index.css`، يمكنك تعديل المتغيرات:

```css
:root {
  --primary: 152 35% 45%;        /* اللون الأساسي */
  --primary-foreground: 80 30% 98%;
  /* ... */
}
```

### تغيير الخطوط

في `tailwind.config.ts`:

```typescript
fontFamily: {
  display: ['اسم-الخط', 'system-ui', 'sans-serif'],
  body: ['اسم-الخط', 'system-ui', 'sans-serif'],
}
```

## 📝 ملاحظات مهمة

1. **دعم RTL**: جميع العناصر مُهيأة للعمل من اليمين لليسار
2. **الخطوط**: يستخدم خطوط Cairo و Tajawal من Google Fonts
3. **الأيقونات**: تستخدم مكتبة lucide-react
4. **المكونات**: مبنية على Radix UI للوصولية الكاملة

## 🌐 نقل لمشروع آخر

1. انسخ مجلد `landing-page` كاملاً
2. ثبت المتطلبات
3. استورد الأنماط
4. استخدم المكونات

---

تم التطوير بـ ❤️ لتطبيق نَفَس
