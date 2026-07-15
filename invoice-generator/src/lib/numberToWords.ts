const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertIntegerWestern(n: number): string {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + convertIntegerWestern(n % 100) : '');
    if (n < 1000000) return convertIntegerWestern(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? convertIntegerWestern(n % 1000) : '');
    if (n < 1000000000) return convertIntegerWestern(Math.floor(n / 1000000)) + 'Million ' + (n % 1000000 !== 0 ? convertIntegerWestern(n % 1000000) : '');
    return convertIntegerWestern(Math.floor(n / 1000000000)) + 'Billion ' + (n % 1000000000 !== 0 ? convertIntegerWestern(n % 1000000000) : '');
}

export function numberToWords(num: number, currency: string = 'USD'): string {
    if (isNaN(num)) return '';
    if (num === 0) return `${currency} Zero Only`;
    
    const integerPart = Math.floor(num);
    const decimalPart = Math.round((num - integerPart) * 100);

    let str = convertIntegerWestern(integerPart);
    
    if (decimalPart > 0) {
        str += 'and ' + convertIntegerWestern(decimalPart) + 'Cents';
    }

    return `${currency} ${str.trim()} Only`.replace(/\s+/g, ' ');
}
