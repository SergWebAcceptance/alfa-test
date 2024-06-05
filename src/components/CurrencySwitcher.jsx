import React from 'react';
import { useCurrency } from '@/src/contexts/CurrencyContext';

const CurrencySwitcher = () => {
    const { currencies, selectedCurrency, setSelectedCurrency } = useCurrency();

    const handleChange = (event) => {
        setSelectedCurrency(event.target.value);
    };

    return (
        <div>
            <select id="currency" value={selectedCurrency} onChange={handleChange} className='mb-6 py-3 px-3 border mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'>
                {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                        {currency}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CurrencySwitcher;
