/**
 * Merchant (restaurant) signup — web version of Blanc app/(auth)/signup.tsx (restaurant flow only).
 * Flow: email/password → email confirmation → Step 1 (name, location, category) → Step 2 (contact, description, optional) → app_users + restaurant_profiles → /pending.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  BrandAuthLayout,
  FieldLabel,
  brandInputClass,
  brandPrimaryButtonClass,
  brandSecondaryButtonClass,
  brandTextareaClass,
} from '../../components/BrandChrome';
import { passwordPolicyError, passwordPolicyText, validatePasswordStrength } from '../../lib/passwordPolicy';
import {
  SignupProfileError,
  completeMerchantSignupProfile,
  type MerchantSignupProfile,
} from '../../lib/merchant/signupProfile';
import { LEGAL_VERSION } from '../../lib/legal';

type Step = 0 | 1 | 2;

export const MerchantSignup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCompletingSignup = searchParams.get('complete') === '1';
  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedLegal, setAcceptedLegal] = useState(false);
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

  useEffect(() => {
    if (!isCompletingSignup) return;
    let cancelled = false;
    const loadVerifiedAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        navigate('/merchant/login', { replace: true });
        return;
      }
      setEmail(user.email ?? '');
      setStep(1);
    };
    loadVerifiedAccount();
    return () => { cancelled = true; };
  }, [isCompletingSignup, navigate]);

  const copy = {
    title: 'Merchant Sign Up',
    subtitle: 'Create your merchant account',
    hasAccount: 'Already have an account?',
    login: 'Login',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordPlaceholder: 'Create a secure password',
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
    errorPasswordLength: 'Password must be at least 8 characters',
    errorPasswordMatch: 'Passwords do not match',
    errorContactRequired: 'Please enter WeChat ID or phone number',
    errorSignupFailed: 'Signup failed',
    errorAccountExists: 'This email is already registered. Please login or use another email.',
    errorAccountStarted: 'This email has already started signup. Please check your confirmation email, login, or contact hOpOn to reset the account.',
    errorCreateProfile: 'Failed to create profile',
    errorVerifyFirst: 'Please verify your email before completing your merchant profile.',
    errorLegalRequired: 'Please agree to the Terms of Use and acknowledge the Privacy Policy.',
  };

  const validateStep0 = (): boolean => {
    if (!email.trim()) {
      setError(copy.errorFillAll);
      return false;
    }
    const passwordIssue = validatePasswordStrength(password, email.trim());
    if (passwordIssue) {
      setError(passwordPolicyError(passwordIssue));
      return false;
    }
    if (password !== confirmPassword) {
      setError(copy.errorPasswordMatch);
      return false;
    }
    if (!acceptedLegal) {
      setError(copy.errorLegalRequired);
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

  const handleNext = async () => {
    if (step === 0 && validateStep0()) {
      setLoading(true);
      setError('');
      try {
        const redirectUrl = `${window.location.origin}/auth/callback`;
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              hopon_signup_role: 'restaurant',
              role: 'restaurant',
              hopon_terms_version: LEGAL_VERSION,
              hopon_privacy_version: LEGAL_VERSION,
              hopon_legal_accepted_at: new Date().toISOString(),
            },
          },
        });
        if (authError) throw authError;
        if (!data.user) throw new Error(copy.errorSignupFailed);
        if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setError(copy.errorAccountStarted);
          return;
        }
        if (!data.session) {
          navigate('/pending?verify=email', { replace: true });
          return;
        }
        setStep(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : copy.errorSignupFailed);
      } finally {
        setLoading(false);
      }
    }
    else if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 2) return;
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError(copy.errorVerifyFirst);
        setLoading(false);
        return;
      }
      const contactVal = contactValue.trim();
      const profileData: MerchantSignupProfile = {
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

      await completeMerchantSignupProfile({
        userId: user.id,
        email: user.email ?? email.trim(),
        profile: profileData,
      });

      navigate('/pending', { replace: true });
    } catch (err) {
      if (err instanceof SignupProfileError) {
        console.error(`[MerchantSignup] ${err.stage}`, err.source ?? err);
        const errorText = `${err.source?.message ?? ''} ${err.source?.details ?? ''}`.toLowerCase();
        if (err.stage === 'account') {
          setStep(0);
        } else if (/\b(name|location|category|cuisine_tags)\b/.test(errorText)) {
          setStep(1);
        } else {
          setStep(2);
        }
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : copy.errorSignupFailed);
      }
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

        {step === 0 && !isCompletingSignup && (
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
                minLength={8}
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
                minLength={8}
                required
              />
              <p className="mt-2 text-xs leading-5 text-black/45">{passwordPolicyText()}</p>
            </div>
            <label className="flex items-start gap-3 text-sm leading-6 text-black/60">
              <input
                type="checkbox"
                checked={acceptedLegal}
                onChange={(event) => setAcceptedLegal(event.target.checked)}
                className="mt-1 h-4 w-4 accent-hopon-red"
                required
              />
              <span>
                I agree to the{' '}
                <Link to="/terms" target="_blank" rel="noreferrer" className="font-semibold text-hopon-black underline underline-offset-4">
                  Terms of Use
                </Link>{' '}
                and acknowledge the{' '}
                <Link to="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-hopon-black underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
            <button
              type="submit"
              className={`${brandPrimaryButtonClass} w-full`}
            >
              {loading ? '…' : copy.next}
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
