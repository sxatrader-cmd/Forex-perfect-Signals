import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col gap-3 px-4 py-20">
      <h1 className="text-3xl font-semibold">964FX</h1>
      <p lang="ar" dir="rtl">الصفحة غير موجودة.</p>
      <p lang="en" dir="ltr">Page not found.</p>
      <Link href="/ar" className="text-primary">الرئيسية</Link>
      <Link href="/en" className="text-primary">Home</Link>
    </div>
  );
}
