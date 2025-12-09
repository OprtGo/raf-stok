import { redirect } from 'next/navigation';

export default function ShortUrl({ params }: { params: { shortCode: string } }) {
  const { shortCode } = params;
  redirect(`/product/${shortCode}`);
}