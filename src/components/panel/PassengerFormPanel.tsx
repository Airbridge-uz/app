'use client';

import { useState } from 'react';
import { usePanelStore, PassengerDetails } from '@/stores/panelStore';
import { PriceBar } from './shared/PriceBar';
import { cn } from '@/utils/cn';
import { Check, ChevronDown } from 'lucide-react';

export function PassengerFormPanel() {
    const {
        selectedFlight,
        selectedFare,
        paymentTiming,
        setPaymentTiming,
        contactDetails,
        updateContactDetails,
        passengers,
        updatePassenger,
        submitBooking,
        isSubmitting,
        error,
        goBack,
    } = usePanelStore();
    
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    const price = selectedFare?.price.total 
        ?? selectedFlight?.price?.total 
        ?? selectedFlight?.price?.amount 
        ?? 0;
    const currency = selectedFare?.price.currency 
        ?? selectedFlight?.price?.currency 
        ?? 'GBP';
    
    // Validate form
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        
        // Contact validation
        if (!contactDetails.email) {
            errors['contact.email'] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactDetails.email)) {
            errors['contact.email'] = 'Please enter a valid email';
        }
        
        if (!contactDetails.phone) {
            errors['contact.phone'] = 'Phone number is required';
        }
        
        // Passenger validation
        passengers.forEach((pax, idx) => {
            if (!pax.given_name) {
                errors[`pax.${idx}.given_name`] = 'Given name is required';
            }
            if (!pax.family_name) {
                errors[`pax.${idx}.family_name`] = 'Family name is required';
            }
            if (!pax.date_of_birth) {
                errors[`pax.${idx}.date_of_birth`] = 'Date of birth is required';
            }
        });
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSubmit = async () => {
        if (validateForm()) {
            await submitBooking();
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Error Banner */}
                {error && (
                    <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
                
                {/* Payment Timing Section */}
                <div className="px-6 py-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        Paying now, or later?
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Choose when you&apos;d like to pay for your booking
                    </p>
                    
                    <div className="flex gap-4">
                        <PaymentOptionCard
                            title="Pay now"
                            description="Pay now and confirm seat and baggage selection"
                            selected={paymentTiming === 'pay_now'}
                            onClick={() => setPaymentTiming('pay_now')}
                        />
                        <PaymentOptionCard
                            title="Hold order"
                            description="Hold space on this trip and pay in 1 week"
                            selected={paymentTiming === 'hold'}
                            onClick={() => setPaymentTiming('hold')}
                        />
                    </div>
                </div>
                
                {/* Contact Details Section */}
                <div className="px-6 py-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Contact details
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="Email"
                            required
                            error={validationErrors['contact.email']}
                        >
                            <input
                                type="email"
                                value={contactDetails.email}
                                onChange={(e) => updateContactDetails({ email: e.target.value })}
                                placeholder="your@email.com"
                                className={cn(
                                    'w-full px-4 py-2.5 border rounded-lg text-sm',
                                    'focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900',
                                    validationErrors['contact.email'] 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-200'
                                )}
                            />
                        </FormField>
                        
                        <FormField
                            label="Phone number"
                            required
                            error={validationErrors['contact.phone']}
                        >
                            <input
                                type="tel"
                                value={contactDetails.phone}
                                onChange={(e) => updateContactDetails({ phone: e.target.value })}
                                placeholder="+1 617 756 2626"
                                className={cn(
                                    'w-full px-4 py-2.5 border rounded-lg text-sm',
                                    'focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900',
                                    validationErrors['contact.phone'] 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-200'
                                )}
                            />
                        </FormField>
                    </div>
                </div>
                
                {/* Passengers Section */}
                <div className="px-6 py-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Passengers
                    </h2>
                    
                    {passengers.map((passenger, index) => (
                        <PassengerForm
                            key={passenger.id}
                            passenger={passenger}
                            index={index}
                            onUpdate={(details) => updatePassenger(index, details)}
                            errors={validationErrors}
                        />
                    ))}
                </div>
                
                {/* Spacer for fixed bottom bar */}
                <div className="h-24" />
            </div>
            
            {/* Fixed Price Bar */}
            <PriceBar
                price={price}
                currency={currency}
                buttonText={paymentTiming === 'pay_now' ? 'Complete Booking' : 'Hold Order'}
                onButtonClick={handleSubmit}
                isLoading={isSubmitting}
                helperText="By completing this booking you agree to our terms and conditions"
            />
        </div>
    );
}

// Payment Option Card
interface PaymentOptionCardProps {
    title: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}

function PaymentOptionCard({ title, description, selected, onClick }: PaymentOptionCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex-1 p-4 rounded-lg border-2 text-left transition-all duration-200',
                selected 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 hover:border-gray-300'
            )}
        >
            <div className="flex items-start gap-3">
                <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                    selected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                )}>
                    {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                    <h3 className="font-medium text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
        </button>
    );
}

// Form Field Wrapper
interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}

function FormField({ label, required, error, children }: FormFieldProps) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}

// Passenger Form
interface PassengerFormProps {
    passenger: PassengerDetails;
    index: number;
    onUpdate: (details: Partial<PassengerDetails>) => void;
    errors: Record<string, string>;
}

function PassengerForm({ passenger, index, onUpdate, errors }: PassengerFormProps) {
    const getError = (field: string) => errors[`pax.${index}.${field}`];
    
    return (
        <div className="mb-6 last:mb-0">
            <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-4">
                Adult {index + 1}
            </div>
            
            <h3 className="text-sm font-medium text-gray-600 mb-3">Personal details</h3>
            
            <div className="space-y-4">
                {/* Row 1: Title, Given Name, Family Name */}
                <div className="grid grid-cols-3 gap-4">
                    <FormField label="Title" required>
                        <div className="relative">
                            <select
                                value={passenger.title}
                                onChange={(e) => onUpdate({ title: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900"
                            >
                                <option value="Mr">Mr.</option>
                                <option value="Ms">Ms.</option>
                                <option value="Mrs">Mrs.</option>
                                <option value="Miss">Miss</option>
                                <option value="Dr">Dr.</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </FormField>
                    
                    <FormField
                        label="Given name"
                        required
                        error={getError('given_name')}
                    >
                        <input
                            type="text"
                            value={passenger.given_name}
                            onChange={(e) => onUpdate({ given_name: e.target.value })}
                            className={cn(
                                'w-full px-4 py-2.5 border rounded-lg text-sm',
                                'focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900',
                                getError('given_name') 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-200'
                            )}
                        />
                    </FormField>
                    
                    <FormField
                        label="Family name"
                        required
                        error={getError('family_name')}
                    >
                        <input
                            type="text"
                            value={passenger.family_name}
                            onChange={(e) => onUpdate({ family_name: e.target.value })}
                            className={cn(
                                'w-full px-4 py-2.5 border rounded-lg text-sm',
                                'focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900',
                                getError('family_name') 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-200'
                            )}
                        />
                    </FormField>
                </div>
                
                {/* Row 2: Date of Birth, Gender */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        label="Date of birth"
                        required
                        error={getError('date_of_birth')}
                    >
                        <input
                            type="date"
                            value={passenger.date_of_birth}
                            onChange={(e) => onUpdate({ date_of_birth: e.target.value })}
                            className={cn(
                                'w-full px-4 py-2.5 border rounded-lg text-sm',
                                'focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900',
                                getError('date_of_birth') 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-200'
                            )}
                        />
                    </FormField>
                    
                    <FormField label="Gender" required>
                        <div className="relative">
                            <select
                                value={passenger.gender}
                                onChange={(e) => onUpdate({ gender: e.target.value as 'male' | 'female' })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900"
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </FormField>
                </div>
                
                {/* Passport Details (for international flights) */}
                <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Passport details</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Country of issue">
                            <div className="relative">
                                <select
                                    value={passenger.nationality || ''}
                                    onChange={(e) => onUpdate({ nationality: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900"
                                >
                                    <option value="">--</option>
                                    <option value="US">United States</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="UZ">Uzbekistan</option>
                                    <option value="DE">Germany</option>
                                    <option value="FR">France</option>
                                    {/* Add more countries as needed */}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </FormField>
                        
                        <FormField label="Passport number">
                            <input
                                type="text"
                                value={passenger.passport_number || ''}
                                onChange={(e) => onUpdate({ passport_number: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900"
                            />
                        </FormField>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <FormField label="Passport expiry date">
                            <input
                                type="date"
                                value={passenger.passport_expiry || ''}
                                onChange={(e) => onUpdate({ passport_expiry: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-900"
                            />
                        </FormField>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PassengerFormPanel;

