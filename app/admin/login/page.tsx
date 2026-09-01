import { Suspense } from "react";
import { AdminLoginForm } from "@/app/admin/login/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      {/* useSearchParams() inside AdminLoginForm requires a Suspense
          boundary for Next.js to statically prerender this route. */}
      <Suspense fallback={null}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
