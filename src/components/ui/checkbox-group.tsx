'use client';

import { useState } from 'react';

interface CheckboxOption {
  readonly value: string;
  readonly label: string;
}

interface CheckboxGroupProps {
  options: readonly CheckboxOption[];
  value: string[];
  onChange: (values: string[]) => void;
  name: string;
  className?: string;
  showOther?: boolean;
  otherLabel?: string;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
}

export function CheckboxGroup({
  options,
  value,
  onChange,
  name,
  className = '',
  showOther = false,
  otherLabel = 'その他',
  otherValue = '',
  onOtherChange
}: CheckboxGroupProps) {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  const handleOtherCheckboxChange = (checked: boolean) => {
    const otherKey = 'その他';
    if (checked) {
      onChange([...value.filter(v => !v.startsWith(otherKey)), `${otherKey}：${otherValue}`]);
    } else {
      onChange(value.filter(v => !v.startsWith(otherKey)));
      onOtherChange?.('');
    }
  };

  const isOtherChecked = value.some(v => v.startsWith('その他'));

  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            name={name}
            value={option.value}
            checked={value.includes(option.value)}
            onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
      
      {showOther && (
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isOtherChecked}
              onChange={(e) => handleOtherCheckboxChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700">{otherLabel}：</span>
          </label>
          {isOtherChecked && (
            <input
              type="text"
              value={otherValue}
              onChange={(e) => {
                onOtherChange?.(e.target.value);
                const otherKey = 'その他';
                const newValue = value.filter(v => !v.startsWith(otherKey));
                if (e.target.value.trim()) {
                  newValue.push(`${otherKey}：${e.target.value}`);
                }
                onChange(newValue);
              }}
              placeholder="詳細を入力してください"
              className="ml-6 w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          )}
        </div>
      )}
    </div>
  );
} 