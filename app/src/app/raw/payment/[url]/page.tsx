"use client"
import { useParams } from 'next/navigation'

import PaymentPage from "@/components/payment/page"

export default function Page() {
  const params = useParams();
  console.log(params.url);
  
  return <PaymentPage />;
}