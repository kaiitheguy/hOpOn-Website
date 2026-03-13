/**
 * Merchant (restaurant) signup — web version of Blanc app/(auth)/signup.tsx (restaurant flow only).
 * Flow: email/password → Step 1 (name, location, category) → Step 2 (contact, description, optional) → signUp + app_users + restaurant_profiles → /pending.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useMerchantLocale } from '../../context/MerchantLocaleContext';

type Step = 0 | 1 | 2;

export const MerchantSignup: React.FC = () => {
  const navigate = useNavigate();
  const { isZh } = useMerchantLocale();
  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [contactType, setContactType] = useState<'wechat' | 'phone'>('wechat');
  const [contactValue, setContactValue] = useState('');
  const [description, setDescription] = useState('');
  const [cuisineTags, setCuisineTags] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const copy = {
    title: isZh ? '商家注册' : 'Merchant Sign Up',
    subtitle: isZh ? 'Merchant registration' : 'Create your merchant account',
    hasAccount: isZh ? '已有账户？' : 'Already have an account?',
    login: isZh ? '登录' : 'Login',
    email: isZh ? '邮箱' : 'Email',
    emailPlaceholder: 'you@example.com',
    password: isZh ? '密码' : 'Password',
    passwordPlaceholder: isZh ? '至少 6 位' : 'Min 6 characters',
    confirmPassword: isZh ? '确认密码' : 'Confirm Password',
    next: isZh ? '下一步' : 'Next',
    back: isZh ? '上一步' : 'Back',
    signup: isZh ? '注册' : 'Sign Up',
    step1Title: isZh ? '基本信息' : 'Basic info',
    step2Title: isZh ? '选填资料与联系' : 'Contact & optional',
    merchantName: isZh ? '商家名称' : 'Merchant Name',
    merchantNamePlaceholder: isZh ? '店铺名称' : 'Store name',
    locationLabel: isZh ? '位置' : 'Location',
    locationPlaceholder: isZh ? '例如：SoHo、Flushing、Midtown' : 'e.g. SoHo, Flushing, Midtown',
    categoryLabel: isZh ? '类型' : 'Category',
    categoryPlaceholder: isZh ? '商家类型/风格' : 'Merchant type/style',
    contact: isZh ? '联系方式' : 'Contact',
    wechat: isZh ? '微信' : 'WeChat',
    phone: isZh ? '电话' : 'Phone',
    contactPlaceholder: isZh ? 'WeChat ID 或手机号' : 'WeChat ID or phone number',
    descriptionLabel: isZh ? '简介' : 'Description',
    descriptionPlaceholder: isZh ? '店铺简介（选填）' : 'Brief description (optional)',
    cuisineTagsLabel: isZh ? '菜系标签' : 'Cuisine tags',
    cuisineTagsPlaceholder: isZh ? '例如：川菜、点心、辣（逗号分隔）' : 'e.g. Sichuan, Dim Sum (comma separated)',
    notesLabel: isZh ? '备注' : 'Notes',
    notesPlaceholder: isZh ? '选填' : 'Optional',
    errorFillAll: isZh ? '请填写所有必填项' : 'Please fill in all required fields',
    errorPasswordLength: isZh ? '密码至少 6 位' : 'Password must be at least 6 characters',
    errorPasswordMatch: isZh ? '两次密码不一致' : 'Passwords do not match',
    errorContactRequired: isZh ? '请填写微信或手机号' : 'Please enter WeChat ID or phone number',
    errorSignupFailed: isZh ? '注册失败' : 'Signup failed',
    errorAccountExists: isZh ? '此邮箱已被注册，请登录或使用其他邮箱' : 'This email is already registered. Please login or use another email.',
    errorCreateProfile: isZh ? '创建资料失败' : 'Failed to create profile',
  };

  const validateStep0 = (): boolean => {
    if (!email.trim()) {
      setError(copy.errorFillAll);
      return false;
    }
    if (password.length < 6) {
      setError(copy.errorPasswordLength);
      return false;
    }
    if (password !== confirmPassword) {
      setError(copy.errorPasswordMatch);
      return false;
    }
    setError('');
    return true;
  };

  const validateStep1 = (): boolean => {
    if (!name.trim() || !location.trim() || !category.trim()) {
      setError(copy.errorFillAll);
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!contactValue.trim()) {
      setError(copy.errorContactRequired);
      return false;
    }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 0 && validateStep0()) setStep(1);
    else if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2) return;
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('id, email')
        .eq('email', email.trim())
        .maybeSingle();

      if (existingUser) {
        setError(copy.errorAccountExists);
        setLoading(false);
        return;
      }

      const redirectUrl = typeof window !== 'undefined' && window.location?.origin
        ? `${window.location.origin}/auth/callback`
        : undefined;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        ...(redirectUrl && { options: { emailRedirectTo: redirectUrl } }),
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError(copy.errorSignupFailed);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      const { error: appUserError } = await supabase
        .from('app_users')
        .upsert({
          id: userId,
          role: 'restaurant',
          status: 'pending',
          email: email.trim(),
        }, { onConflict: 'id' });

      if (appUserError) {
        if (appUserError.code === '23505') {
          setError(copy.errorAccountExists);
        } else {
          console.error('[MerchantSignup] app_users', appUserError);
          setError(copy.errorCreateProfile);
        }
        setLoading(false);
        return;
      }

      const contactVal = contactValue.trim();
      const profileData = {
        id: userId,
        name: name.trim(),
        location: location.trim(),
        category: category.trim(),
        cuisine_tags: cuisineTags.trim() ? cuisineTags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        description: description.trim() || null,
        contact_type: contactType,
        contact_value: contactVal || null,
        contact_wechat: contactType === 'wechat' && contactVal ? contactVal : null,
        notes: notes.trim() || null,
      };

      const { error: profileError } = await supabase
        .from('restaurant_profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (profileError) {
        console.error('[MerchantSignup] restaurant_profiles', profileError);
        setError(profileError.message || copy.errorCreateProfile);
        setLoading(false);
        return;
      }

      navigate('/pending', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorSignupFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hopon-grey flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-2 border-black p-8">
        <h1 className="font-display font-bold text-2xl uppercase tracking-tight text-hopon-black mb-2">
          {copy.title}
        </h1>
        <p className="text-sm text-black/60 mb-6">{copy.subtitle}</p>

        {step === 0 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.email} *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={copy.emailPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.password} *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={copy.passwordPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.confirmPassword} *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={copy.passwordPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
                minLength={6}
                required
              />
            </div>
            {error && <p className="text-sm text-hopon-red">{error}</p>}
            <button
              type="submit"
              className="w-full h-12 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red transition-colors"
            >
              {copy.next}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            <p className="font-mono text-xs uppercase text-black/50 mb-2">{isZh ? '第 1 步 / 共 2 步' : 'Step 1 of 2'}</p>
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/80">{copy.step1Title}</h2>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.merchantName} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={copy.merchantNamePlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.locationLabel} *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={copy.locationPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.categoryLabel} *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={copy.categoryPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
                required
              />
            </div>
            {error && <p className="text-sm text-hopon-red">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex-1 h-12 border-2 border-black bg-white text-hopon-black font-mono text-sm uppercase"
              >
                {copy.back}
              </button>
              <button
                type="submit"
                className="flex-1 h-12 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red"
              >
                {copy.next}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="font-mono text-xs uppercase text-black/50 mb-2">{isZh ? '第 2 步 / 共 2 步' : 'Step 2 of 2'}</p>
            <h2 className="font-display font-bold text-sm uppercase tracking-wider text-black/80">{copy.step2Title}</h2>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-2">{copy.contact} *</label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setContactType('wechat')}
                  className={`flex-1 py-2 border-2 font-mono text-xs uppercase ${contactType === 'wechat' ? 'bg-hopon-black text-white border-black' : 'border-black/30 text-black/70'}`}
                >
                  {copy.wechat}
                </button>
                <button
                  type="button"
                  onClick={() => setContactType('phone')}
                  className={`flex-1 py-2 border-2 font-mono text-xs uppercase ${contactType === 'phone' ? 'bg-hopon-black text-white border-black' : 'border-black/30 text-black/70'}`}
                >
                  {copy.phone}
                </button>
              </div>
              <input
                type="text"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={copy.contactPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.descriptionLabel}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={copy.descriptionPlaceholder}
                rows={3}
                className="w-full border-2 border-black px-4 py-3 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red resize-y"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.cuisineTagsLabel}</label>
              <input
                type="text"
                value={cuisineTags}
                onChange={(e) => setCuisineTags(e.target.value)}
                placeholder={copy.cuisineTagsPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </div>
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-black/70 mb-1">{copy.notesLabel}</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={copy.notesPlaceholder}
                className="w-full h-12 border-2 border-black px-4 font-mono text-sm bg-white focus:outline-none focus:ring-2 focus:ring-hopon-red"
              />
            </div>
            {error && <p className="text-sm text-hopon-red">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className="flex-1 h-12 border-2 border-black bg-white text-hopon-black font-mono text-sm uppercase disabled:opacity-50"
              >
                {copy.back}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 border-2 border-black bg-hopon-black text-white font-display font-bold text-sm uppercase tracking-wider hover:bg-hopon-red disabled:opacity-50"
              >
                {loading ? '…' : copy.signup}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-sm text-black/60 text-center">
          {copy.hasAccount}{' '}
          <Link to="/merchant/login" className="text-hopon-red hover:underline font-mono uppercase">
            {copy.login}
          </Link>
        </p>
        <p className="mt-2 text-sm text-black/50 text-center">
          <Link to="/" className="hover:underline">{isZh ? '返回主站' : 'Back to home'}</Link>
        </p>
      </div>
    </div>
  );
};
