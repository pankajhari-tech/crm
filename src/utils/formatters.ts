/**
 * Formats amount into Nepalese Rupees (NPR / Rs.)
 * Supports South Asian / standard lakh numbering or clean comma notation.
 */
export function formatCurrency(amount: number, prefix: string = 'Rs. '): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with standard commas
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Generates WhatsApp click-to-chat link for Nepal phone numbers (+977)
 */
export function getWhatsAppLink(phone: string, customerName: string): string {
  // Extract numbers
  const cleaned = phone.replace(/\D/g, '');
  const nepaliNumber = cleaned.startsWith('977') ? cleaned : `977${cleaned.replace(/^0+/, '')}`;
  const message = encodeURIComponent(`Namaste ${customerName}, greeting from ClientPulse CRM regarding your order/payment.`);
  return `https://wa.me/${nepaliNumber}?text=${message}`;
}

/**
 * Calculates profit:
 * Total Revenue (Total Cost charged to customer) minus
 * Wholesale Base Cost of goods
 */
export function calculateOrderProfit(
  totalCost: number,
  totalBaseCost: number,
  deliveryActualCost: number = 0
): number {
  return Number((totalCost - (totalBaseCost + deliveryActualCost)).toFixed(2));
}
