'use client';

import { useParams } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function UserRedirect() {
  const params = useParams();
  const username = params.username;
  redirect(`/profile/${username}`);
}
