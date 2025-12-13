'use client';

import { cn } from '@/utils/cn';
import { FareOption } from '@/stores/panelStore';
import { Check, X, Clock, Briefcase, Luggage, AlertCircle } from 'lucide-react';

interface FareCardProps {
    fare: FareOption;
    isSelected: boolean;
    onSelect: () => void;
    className?: string;
}

export function FareCard({ fare, isSelected, onSelect, className }: FareCardProps) {
    // Format price
    const formatPrice = (amount: number, currency: string) => {
        const formatter = new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        });
        return formatter.format(amount);
    };
    
    // Format change/refund fee
    const formatFee = (fee: number | undefined, currency: string) => {
        if (fee === undefined || fee === 0) return 'Free';
        return formatPrice(fee, currency);
    };
    
    return (
        <button
            onClick={onSelect}
            className={cn(
                'flex flex-col text-left w-full p-4 rounded-xl border-2 transition-all duration-200',
                'hover:border-gray-300 hover:shadow-sm',
                isSelected 
                    ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500' 
                    : 'border-gray-200 bg-white',
                className
            )}
        >
            {/* Cabin Class Label */}
            <div className="mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {fare.cabin_class}
                </span>
            </div>
            
            {/* Fare Brand Name */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {fare.fare_brand_name}
            </h3>
            
            {/* Features List */}
            <div className="space-y-3 mb-6 flex-1">
                {/* Changeable */}
                <FeatureRow
                    icon={
                        fare.conditions.changeable 
                            ? <Check className="w-4 h-4 text-teal-600" />
                            : <X className="w-4 h-4 text-gray-400" />
                    }
                    label={
                        fare.conditions.changeable 
                            ? `Changeable (${formatFee(fare.conditions.change_fee, fare.price.currency)})`
                            : 'Not changeable'
                    }
                    included={fare.conditions.changeable}
                />
                
                {/* Refundable */}
                <FeatureRow
                    icon={
                        fare.conditions.refundable 
                            ? <Check className="w-4 h-4 text-teal-600" />
                            : <X className="w-4 h-4 text-gray-400" />
                    }
                    label={
                        fare.conditions.refundable 
                            ? `Refundable (${formatFee(fare.conditions.refund_fee, fare.price.currency)})`
                            : 'Non-refundable'
                    }
                    included={fare.conditions.refundable}
                />
                
                {/* Hold Option */}
                <FeatureRow
                    icon={<Clock className="w-4 h-4 text-teal-600" />}
                    label="Hold space"
                    included={true}
                    isLink
                />
                
                {/* Carry-on Baggage */}
                <FeatureRow
                    icon={
                        fare.baggage.cabin.included 
                            ? <Briefcase className="w-4 h-4 text-teal-600" />
                            : <AlertCircle className="w-4 h-4 text-amber-500" />
                    }
                    label={
                        fare.baggage.cabin.included 
                            ? `Includes carry-on bag${fare.baggage.cabin.quantity && fare.baggage.cabin.quantity > 1 ? 's' : ''}`
                            : 'No carry-on included'
                    }
                    included={fare.baggage.cabin.included}
                />
                
                {/* Checked Baggage */}
                <FeatureRow
                    icon={
                        fare.baggage.checked.included 
                            ? <Luggage className="w-4 h-4 text-teal-600" />
                            : <AlertCircle className="w-4 h-4 text-amber-500" />
                    }
                    label={
                        fare.baggage.checked.included 
                            ? fare.baggage.checked.weight_kg 
                                ? `${fare.baggage.checked.quantity || 1} checked bag (${fare.baggage.checked.weight_kg}kg)`
                                : `${fare.baggage.checked.quantity || 1} checked bag included`
                            : 'No checked bag data'
                    }
                    included={fare.baggage.checked.included}
                />
                
                {/* Seat Selection */}
                {fare.seat_selection !== undefined && (
                    <FeatureRow
                        icon={
                            fare.seat_selection 
                                ? <Check className="w-4 h-4 text-teal-600" />
                                : <X className="w-4 h-4 text-gray-400" />
                        }
                        label={fare.seat_selection ? 'Seat selection included' : 'No seat selection'}
                        included={fare.seat_selection}
                    />
                )}
            </div>
            
            {/* Price Section */}
            <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Total amount from</p>
                <p className="text-xl font-bold text-gray-900">
                    {formatPrice(fare.price.total, fare.price.currency)}
                </p>
            </div>
            
            {/* Selection Indicator */}
            {isSelected && (
                <div className="mt-3 flex items-center gap-2 text-teal-700">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected</span>
                </div>
            )}
        </button>
    );
}

// Feature Row Component
interface FeatureRowProps {
    icon: React.ReactNode;
    label: string;
    included: boolean;
    isLink?: boolean;
}

function FeatureRow({ icon, label, included, isLink }: FeatureRowProps) {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex-shrink-0">
                {icon}
            </div>
            <span className={cn(
                'text-sm',
                included ? 'text-gray-700' : 'text-gray-400',
                isLink && 'text-teal-600 underline'
            )}>
                {label}
            </span>
        </div>
    );
}

export default FareCard;

