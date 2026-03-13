import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getCurrentUserId } from '../../lib/merchant/api';
import { getRestaurantProfile, getCampaignsForRestaurant } from '../../lib/merchant/api';
import { COPY_ZH, COPY_EN, filterOfficialCampaigns } from '../../lib/merchant/constants';
import type { Restaurant, Campaign } from '../../lib/merchant/types';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

export const MerchantHome: React.FC = () => {
  const { t, isZh } = useMerchantLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Restaurant | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const isOfficial = profile?.is_official === true;
  const copy = (isZh ? COPY_ZH : COPY_EN)[isOfficial ? 'official' : 'normal'];
  const list = isOfficial ? filterOfficialCampaigns(campaigns) : campaigns;

  useEffect(() => {
    getCurrentUserId().then((id) => {
      setUserId(id);
      if (!id) {
        setLoading(false);
        return;
      }
      // Assume restaurant_id = user_id for 1:1; or fetch via user_restaurants table
      getRestaurantProfile(id).then((p) => {
        setProfile(p);
        if (p) getCampaignsForRestaurant(p.id).then(setCampaigns);
      }).finally(() => setLoading(false));
    });
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="font-display font-bold text-hopon-black">{t.loading}</p>
      </div>
    );
  }

  if (!userId || !profile) {
    return (
      <div className="py-12 text-center">
        <p className="text-black/80">{isZh ? '未找到商家信息，请先完善资料。' : 'Restaurant profile not found. Please complete your profile.'}</p>
        <Link to="/merchant/profile" className="mt-4 inline-block font-mono text-sm uppercase text-hopon-red hover:underline">
          {isZh ? '去完善' : 'Go to profile'}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display font-bold text-2xl md:text-3xl uppercase tracking-tight text-hopon-black">
          {copy.homeSectionTitle}
        </h1>
        <Link
          to="/merchant/campaign/new"
          className="flex items-center gap-2 h-12 px-6 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors"
        >
          <Plus className="w-4 h-4" />
          {copy.createButton}
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="border-2 border-black border-dashed p-12 text-center">
          <p className="text-black/70 mb-4">{copy.homeEmpty}</p>
          <Link
            to="/merchant/campaign/new"
            className="inline-flex items-center gap-2 h-12 px-6 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors"
          >
            <Plus className="w-4 h-4" />
            {copy.createButton}
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {list.map((c) => (
            <li key={c.id}>
              <Link
                to={`/merchant/campaign/${c.id}`}
                className="block border-2 border-black p-6 hover:bg-hopon-grey transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-lg text-hopon-black">{c.title}</span>
                      {(c.merchant?.is_official ?? profile?.is_official) && (
                        <span className="px-2 py-0.5 bg-hopon-red text-white font-mono text-xs uppercase">
                          官方
                        </span>
                      )}
                      <span className={`px-2 py-0.5 border border-black font-mono text-xs uppercase ${
                        c.status === 'OPEN' ? 'bg-green-100' : 'bg-black/10'
                      }`}>
                        {c.status === 'OPEN' ? '开放' : '已关闭'}
                      </span>
                    </div>
                    {c.description && (
                      <p className="mt-2 text-sm text-black/70 line-clamp-2">{c.description}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs uppercase text-hopon-red shrink-0">{copy.cardCta} →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
