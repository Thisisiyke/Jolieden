import { Suspense } from "react";
import CheckoutFlow from "@/components/book/CheckoutFlow";

// useSearchParams in CheckoutFlow requires a Suspense boundary in App Router.
export default function BookCheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFlow />
    </Suspense>
  );
}
