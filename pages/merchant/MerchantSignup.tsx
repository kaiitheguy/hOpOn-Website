/**
 * Merchant (restaurant) signup — web version of Blanc app/(auth)/signup.tsx (restaurant flow only).
 * Flow: email/password → Step 1 (name, location, category) → Step 2 (contact, description, optional) → signUp + app_users + restaurant_profiles → /pending.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  BrandAuthLayout,
  FieldLabel,
  brandInputClass,
  brandPrimaryButtonClass,
  brandSecondaryButtonClass,
  brandTextareaClass,
} from '../../components/BrandChrome';

type Step = 0 | 1 | 2;

export const MerchantSignup: React.FC = () => {
  const navigate = useNavigate();
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
    title: 'Merchant Sign Up',
    subtitle: 'Create your merchant account',
    hasAccount: 'Already have an account?',
    login: 'Login',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Min 6 characters',
    confirmPassword: 'Confirm Password',
    next: 'Next',
    back: 'Back',
    signup: 'Sign Up',
    step1Title: 'Basic info',
    step2Title: 'Contact & optional',
    merchantName: 'Merchant Name',
    merchantNamePlaceholder: 'Store name',
    locationLabel: 'Location',
    locationPlaceholder: 'e.g. SoHo, Flushing, Midtown',
    categoryLabel: 'Category',
    categoryPlaceholder: 'Merchant type/style',
    contact: 'Contact',
    wechat: 'WeChat',
    phone: 'Phone',
    contactPlaceholder: 'WeChat ID or phone number',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Brief description (optional)',
    cuisineTagsLabel: 'Cuisine tags',
    cuisineTagsPlaceholder: 'e.g. Sichuan, Dim Sum (comma separated)',
    notesLabel: 'Notes',
    notesPlaceholder: 'Optional',
    errorFillAll: 'Please fill in all required fields',
    errorPasswordLength: 'Password must be at least 6 characters',
    errorPasswordMatch: 'Passwords do not match',
    errorContactRequired: 'Please enter WeChat ID or phone number',
    errorSignupFailed: 'Signup failed',
    errorAccountExists: 'This email is already registered. Please login or use another email.',
    errorCreateProfile: 'Failed to create profile',
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

  const steps = [copy.email, copy.step1Title, copy.step2Title];

  return (
    <BrandAuthLayout
      eyebrow="Join hOpOn merchant"
      title={copy.title}
      description="Create your merchant account. After approval, you can use Growth, Campaigns, Review, Hunt, and attribution workflows."
      badges={['Start small', 'AI growth agent', 'Trackable campaigns']}
    >
      <div>
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-black/45">{copy.subtitle}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {steps.map((label, index) => (
              <div
                key={label}
                className={`rounded-full px-2 py-2 text-center font-mono text-[10px] uppercase tracking-wider ${
                  index <= step ? 'bg-hopon-black text-white' : 'border border-black/10 bg-[#FAFAF7] text-black/40'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {step === 0 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            <div>
              <FieldLabel>{copy.email} *</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={copy.emailPlaceholder}
                className={brandInputClass}
                required
              />
            </div>
            <div>
              <FieldLabel>{copy.password} *</FieldLabel>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={copy.passwordPlaceholder}
                className={brandInputClass}
                minLength={6}
                required
              />
            </div>
            <div>
              <FieldLabel>{copy.confirmPassword} *</FieldLabel>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={copy.passwordPlaceholder}
                className={brandInputClass}
                minLength={6}
                required
              />
            </div>
            {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            <button
              type="submit"
              className={`${brandPrimaryButtonClass} w-full`}
            >
              {copy.next}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-wider text-black/45 mb-2">Step 1 of 2</p>
            <h2 className="font-display text-xl font-bold tracking-tight text-hopon-black">{copy.step1Title}</h2>
            <div>
              <FieldLabel>{copy.merchantName} *</FieldLabel>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={copy.merchantNamePlaceholder}
                className={brandInputClass}
                required
              />
            </div>
            <div>
              <FieldLabel>{copy.locationLabel} *</FieldLabel>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={copy.locationPlaceholder}
                className={brandInputClass}
                required
              />
            </div>
            <div>
              <FieldLabel>{copy.categoryLabel} *</FieldLabel>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={copy.categoryPlaceholder}
                className={brandInputClass}
                required
              />
            </div>
            {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className={`${brandSecondaryButtonClass} flex-1`}
              >
                {copy.back}
              </button>
              <button
                type="submit"
                className={`${brandPrimaryButtonClass} flex-1`}
              >
                {copy.next}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-wider text-black/45 mb-2">Step 2 of 2</p>
            <h2 className="font-display text-xl font-bold tracking-tight text-hopon-black">{copy.step2Title}</h2>
            <div>
              <FieldLabel>{copy.contact} *</FieldLabel>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setContactType('wechat')}
                  className={`flex-1 rounded-2xl py-2 font-mono text-xs uppercase tracking-wider ${contactType === 'wechat' ? 'bg-hopon-black text-white' : 'border border-black/15 bg-white text-black/60'}`}
                >
                  {copy.wechat}
                </button>
                <button
                  type="button"
                  onClick={() => setContactType('phone')}
                  className={`flex-1 rounded-2xl py-2 font-mono text-xs uppercase tracking-wider ${contactType === 'phone' ? 'bg-hopon-black text-white' : 'border border-black/15 bg-white text-black/60'}`}
                >
                  {copy.phone}
                </button>
              </div>
              <input
                type="text"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={copy.contactPlaceholder}
                className={brandInputClass}
                required
              />
            </div>
            <div>
              <FieldLabel>{copy.descriptionLabel}</FieldLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={copy.descriptionPlaceholder}
                rows={3}
                className={`${brandTextareaClass} resize-y`}
              />
            </div>
            <div>
              <FieldLabel>{copy.cuisineTagsLabel}</FieldLabel>
              <input
                type="text"
                value={cuisineTags}
                onChange={(e) => setCuisineTags(e.target.value)}
                placeholder={copy.cuisineTagsPlaceholder}
                className={brandInputClass}
              />
            </div>
            <div>
              <FieldLabel>{copy.notesLabel}</FieldLabel>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={copy.notesPlaceholder}
                className={brandInputClass}
              />
            </div>
            {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={loading}
                className={`${brandSecondaryButtonClass} flex-1`}
              >
                {copy.back}
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`${brandPrimaryButtonClass} flex-1`}
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
          <Link to="/" className="hover:underline">Back to home</Link>
        </p>
      </div>
    </BrandAuthLayout>
  );
};
