import { useTranslation } from 'react-i18next';
import { getLanguageDirection } from '@/lib/i18n';

export const useRTL = () => {
  const { i18n } = useTranslation();
  
  const isRTL = i18n.language === 'he';
  const direction = getLanguageDirection();
  
  // RTL-aware CSS classes
  const rtlClasses = {
    // Layout
    container: isRTL ? 'rtl' : 'ltr',
    flex: isRTL ? 'flex-row-reverse' : 'flex-row',
    flexReverse: isRTL ? 'flex-row' : 'flex-row-reverse',
    
    // Spacing
    marginStart: isRTL ? 'mr-auto' : 'ml-auto',
    marginEnd: isRTL ? 'ml-auto' : 'mr-auto',
    paddingStart: isRTL ? 'pr-4' : 'pl-4',
    paddingEnd: isRTL ? 'pl-4' : 'pr-4',
    
    // Text alignment
    textAlign: isRTL ? 'text-right' : 'text-left',
    textAlignReverse: isRTL ? 'text-left' : 'text-right',
    
    // Border radius
    borderRadius: isRTL ? 'rounded-l-md' : 'rounded-r-md',
    borderRadiusReverse: isRTL ? 'rounded-r-md' : 'rounded-l-md',
    
    // Icons and buttons
    iconMargin: isRTL ? 'mr-2' : 'ml-2',
    iconMarginReverse: isRTL ? 'ml-2' : 'mr-2',
    
    // Input fields
    inputPadding: isRTL ? 'pr-3' : 'pl-3',
    inputPaddingReverse: isRTL ? 'pl-3' : 'pr-3',
  };
  
  // RTL-aware positioning
  const rtlPosition = {
    left: isRTL ? 'right' : 'left',
    right: isRTL ? 'left' : 'right',
    start: isRTL ? 'end' : 'start',
    end: isRTL ? 'start' : 'end',
  };
  
  // RTL-aware transform
  const rtlTransform = {
    scaleX: isRTL ? 'scaleX(-1)' : 'scaleX(1)',
    rotate: isRTL ? 'rotate(180deg)' : 'rotate(0deg)',
  };
  
  return {
    isRTL,
    direction,
    rtlClasses,
    rtlPosition,
    rtlTransform,
  };
}; 