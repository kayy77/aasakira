import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { countries, getBrokerUrl, detectCountryFromIP, Country } from '@/services/countriesService';
import BrokerModal from './BrokerModal';
import CommunityInviteModal from './CommunityInviteModal';
import { Loader2, CalendarIcon, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { format, parse } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';

interface MultiStepSignupDialogProps {
  children: React.ReactNode;
}

const step1Schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters').optional(),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  phoneNumber: z.string().min(6, 'Please enter a valid phone number').optional(),
  country: z.string({ required_error: 'Please select your country' }),
});

const step2Schema = z.object({
  hasTraded: z.enum(['yes', 'no'], { required_error: 'Please select an option' }),
  hasAccount: z.enum(['yes', 'no'], { required_error: 'Please select an option' }),
  referralSource: z.string({ required_error: 'Please select how you found us' }),
  referralOther: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const MultiStepSignupDialog: React.FC<MultiStepSignupDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showBrokerModal, setShowBrokerModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [brokerUrl, setBrokerUrl] = useState('');
  const [selectedCountryName, setSelectedCountryName] = useState('');
  const [dobInput, setDobInput] = useState('');
  
  // Step 1 form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  
  // Step 2 form data
  const [hasTraded, setHasTraded] = useState<'yes' | 'no' | ''>('');
  const [hasAccount, setHasAccount] = useState<'yes' | 'no' | ''>('');
  const [referralSource, setReferralSource] = useState('');
  const [referralOther, setReferralOther] = useState('');
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signUp } = useAuth();
  const { toast } = useToast();

  // Auto-detect country on component mount
  useEffect(() => {
    const detectCountry = async () => {
      const detectedCountry = await detectCountryFromIP();
      if (detectedCountry && !country) {
        setCountry(detectedCountry);
      }
    };
    
    if (isOpen) {
      detectCountry();
    }
  }, [isOpen, country]);

  const validateStep1 = (): boolean => {
    try {
      step1Schema.parse({
        email,
        password,
        username: username || undefined,
        dateOfBirth,
        phoneNumber: phoneNumber || undefined,
        country,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateStep2 = (): boolean => {
    try {
      step2Schema.parse({
        hasTraded,
        hasAccount,
        referralSource,
        referralOther: referralOther || undefined,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleStep2Submit = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);

    try {
      // Create auth account
      await signUp(email, password);
      
      // Get the current user after signup
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get country data for broker group
        const countryData = countries.find(c => c.code === country);
        const brokerGroup = countryData?.brokerGroup || 'A';
        
        // Create user profile
        await supabase.from('user_profiles').insert({
          user_id: user.id,
          username: username || email.split('@')[0],
          date_of_birth: dateOfBirth?.toISOString().split('T')[0],
          phone_number: phoneNumber || null,
          country,
          has_traded_forex: hasTraded === 'yes',
          has_trading_account: hasAccount === 'yes',
          referral_source: referralSource === 'other' ? referralOther : referralSource,
          broker_group: brokerGroup,
        });

        toast({
          title: "Account created successfully!",
          description: "Welcome to AASAKIRA! 🎉",
        });

        // CRITICAL: First set up the modal states BEFORE closing the dialog
        // This ensures the state is captured before any unmounting happens
        const shouldShowBroker = hasTraded === 'no' || hasAccount === 'no';
        const url = getBrokerUrl(country);
        const countryName = countryData?.name || 'your country';
        
        // Close the signup dialog
        setIsOpen(false);

        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
          setTimeout(() => {
            if (shouldShowBroker) {
              setBrokerUrl(url);
              setSelectedCountryName(countryName);
              setShowBrokerModal(true);
            } else {
              setShowCommunityModal(true);
            }
          }, 500); // Increased delay to ensure dialog is fully closed
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setEmail('');
    setPassword('');
    setUsername('');
    setDateOfBirth(undefined);
    setDobInput('');
    setPhoneNumber('');
    setCountry('');
    setHasTraded('');
    setHasAccount('');
    setReferralSource('');
    setReferralOther('');
    setErrors({});
  };

  const handleDobInputChange = (value: string) => {
    setDobInput(value);
    
    // Try to parse DD/MM/YYYY format
    if (value.length === 10 && value.includes('/')) {
      try {
        const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
        if (parsedDate instanceof Date && !isNaN(parsedDate.getTime())) {
          setDateOfBirth(parsedDate);
        }
      } catch (error) {
        // Invalid date format, keep input but don't set date
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const getFilteredCountries = () => {
    return countries.filter(country => 
      country.name.toLowerCase().includes('')
    ).sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-center font-zen-maru">
              {currentStep === 1 ? 'Create Your Account' : 'Tell Us About You'}
            </DialogTitle>
            <div className="flex justify-center mt-2">
              <div className="flex space-x-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  currentStep >= 1 ? "bg-purple-500" : "bg-gray-600"
                )} />
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  currentStep >= 2 ? "bg-purple-500" : "bg-gray-600"
                )} />
              </div>
            </div>
          </DialogHeader>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Step 1: Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Create password"
                    />
                    {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Choose a username (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Date of Birth *</Label>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={dobInput}
                        onChange={(e) => handleDobInputChange(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                              !dateOfBirth && "text-gray-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateOfBirth ? format(dateOfBirth, "PPP") : "Or pick from calendar"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateOfBirth}
                            onSelect={(date) => {
                              setDateOfBirth(date);
                              if (date) setDobInput(format(date, 'dd/MM/yyyy'));
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {errors.dateOfBirth && <p className="text-red-400 text-sm">{errors.dateOfBirth}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Country *</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {getFilteredCountries().map((country) => (
                        <SelectItem key={country.code} value={country.code} className="text-white hover:bg-gray-600">
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-red-400 text-sm">{errors.country}</p>}
                </div>

                <Button
                  onClick={handleStep1Next}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                >
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Screening Questions */}
          {currentStep === 2 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Step 2: Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-gray-300">Have you traded forex before? *</Label>
                  <RadioGroup
                    value={hasTraded}
                    onValueChange={(value: 'yes' | 'no') => setHasTraded(value)}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="traded-yes" />
                      <Label htmlFor="traded-yes" className="text-white">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="traded-no" />
                      <Label htmlFor="traded-no" className="text-white">No</Label>
                    </div>
                  </RadioGroup>
                  {errors.hasTraded && <p className="text-red-400 text-sm">{errors.hasTraded}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300">Do you have a trading account? *</Label>
                  <RadioGroup
                    value={hasAccount}
                    onValueChange={(value: 'yes' | 'no') => setHasAccount(value)}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="account-yes" />
                      <Label htmlFor="account-yes" className="text-white">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="account-no" />
                      <Label htmlFor="account-no" className="text-white">No</Label>
                    </div>
                  </RadioGroup>
                  {errors.hasAccount && <p className="text-red-400 text-sm">{errors.hasAccount}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Where did you find us? *</Label>
                  <Select value={referralSource} onValueChange={setReferralSource}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="telegram" className="text-white">Telegram</SelectItem>
                      <SelectItem value="google" className="text-white">Google</SelectItem>
                      <SelectItem value="friend" className="text-white">From a Friend</SelectItem>
                      <SelectItem value="other" className="text-white">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.referralSource && <p className="text-red-400 text-sm">{errors.referralSource}</p>}
                </div>

                {referralSource === 'other' && (
                  <div className="space-y-2">
                    <Label htmlFor="referral-other" className="text-gray-300">Please specify</Label>
                    <Input
                      id="referral-other"
                      value={referralOther}
                      onChange={(e) => setReferralOther(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="How did you find us?"
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleStep2Submit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      <BrokerModal
        isOpen={showBrokerModal}
        onClose={() => {
          setShowBrokerModal(false);
          setTimeout(() => setShowCommunityModal(true), 100);
        }}
        brokerUrl={brokerUrl}
        countryName={selectedCountryName}
      />

      <CommunityInviteModal
        isOpen={showCommunityModal}
        onClose={() => {
          setShowCommunityModal(false);
          resetForm(); // Reset form only after all modals are closed
        }}
      />
    </>
  );
};

export default MultiStepSignupDialog;