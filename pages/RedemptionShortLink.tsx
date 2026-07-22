import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { resolveHoponRedemptionLink } from '../lib/supabaseClient';

export const RedemptionShortLink: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function resolveLink() {
      const target = await resolveHoponRedemptionLink(slug);
      if (!mounted) return;
      if (!target) {
        setNotFound(true);
        return;
      }

      const params = new URLSearchParams({
        campaign: target.campaignId,
        creator: target.creatorId,
      });
      navigate(`/verify?${params.toString()}`, { replace: true });
    }

    void resolveLink();
    return () => {
      mounted = false;
    };
  }, [navigate, slug]);

  return (
    <div className="min-h-screen bg-hopon-grey">
      <BrandHeader />
      <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-5 pt-24 text-center">
        {notFound ? (
          <div>
            <p className="font-mono text-xs uppercase text-black/50">Redemption link unavailable</p>
            <h1 className="mt-3 font-display text-3xl font-bold text-hopon-black">This link is no longer active.</h1>
            <p className="mt-3 text-sm leading-6 text-black/60">Ask the creator for their latest hOpOn offer link.</p>
            <Link to="/" className="mt-6 inline-flex border-2 border-black bg-white px-5 py-3 font-mono text-xs uppercase">
              Visit hOpOn
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-black/60">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="font-mono text-xs uppercase">Opening creator offer</span>
          </div>
        )}
      </main>
    </div>
  );
};
