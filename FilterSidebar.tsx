
import React, { useState, useEffect } from 'react';
import { FilterCriteria } from '../types';
import { RELIGIONS, EDUCATION_LEVELS, OCCUPATIONS, LIFESTYLE_CHOICES } from '../constants';

interface FilterSidebarProps {
  onFilterChange: (filters: FilterCriteria) => void;
  initialFilters: FilterCriteria;
  onClose: () => void;
}

interface AccordionSectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  selectedCount?: number;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ title, children, isOpen, onToggle, selectedCount }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 py-4">
    <button onClick={onToggle} className="w-full flex justify-between items-center text-left focus:outline-none">
      <h4 className="font-semibold text-gray-800 dark:text-gray-200">
        {title}
        {selectedCount && selectedCount > 0 && <span className="ml-2 text-xs font-bold bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300 px-2 py-0.5 rounded-full">{selectedCount}</span>}
      </h4>
      <svg className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </button>
    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
      {children}
    </div>
  </div>
);

interface CheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, name, checked, onChange, label }) => (
  <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
    <input
      id={id}
      name={name}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500 bg-gray-100 dark:bg-gray-900"
    />
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
  </label>
);


const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange, initialFilters, onClose }) => {
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);
  const [openSections, setOpenSections] = useState<string[]>(['location', 'age', 'gender', 'religion']);

  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
        prev.includes(section)
            ? prev.filter(s => s !== section)
            : [...prev, section]
    );
  };
  
  const handleMultiSelectChange = (field: keyof FilterCriteria, value: string) => {
    setFilters(prev => {
        const currentValues = prev[field] as string[];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        return {...prev, [field]: newValues};
    });
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-violet-800 dark:text-violet-400">Filter Profiles</h3>
        <button onClick={onClose} className="text-gray-500 dark:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <AccordionSection title="Location" isOpen={openSections.includes('location')} onToggle={() => toggleSection('location')}>
          <div className="flex items-center space-x-3">
              <label className="flex items-center cursor-pointer relative">
                  <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={!!filters.nearbyOnly}
                      onChange={() => setFilters(prev => ({...prev, nearbyOnly: !prev.nearbyOnly}))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 dark:peer-focus:ring-violet-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Profiles Near Me</span>
              </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Shows profiles within 100km of your current location.</p>
      </AccordionSection>
      
      <AccordionSection title="Age Range" isOpen={openSections.includes('age')} onToggle={() => toggleSection('age')}>
          <div className="flex items-center space-x-2">
            <input 
              type="number" 
              value={filters.minAge}
              onChange={(e) => setFilters({...filters, minAge: parseInt(e.target.value) || 18})}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 focus:ring-violet-500 focus:border-violet-500"
              min="18" max="70"
            />
            <span className="text-gray-500 dark:text-gray-400">-</span>
            <input 
              type="number" 
              value={filters.maxAge}
              onChange={(e) => setFilters({...filters, maxAge: parseInt(e.target.value) || 70})}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 focus:ring-violet-500 focus:border-violet-500"
              min="18" max="70"
            />
          </div>
      </AccordionSection>

      <AccordionSection title="Gender" isOpen={openSections.includes('gender')} onToggle={() => toggleSection('gender')}>
          <div className="flex space-x-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
              {(['Any', 'Male', 'Female'] as const).map(gender => (
                  <button
                      key={gender}
                      onClick={() => setFilters({ ...filters, gender })}
                      className={`w-full text-center py-1.5 text-sm font-semibold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50 ${filters.gender === gender ? 'bg-violet-700 text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-black/20'}`}
                  >
                      {gender}
                  </button>
              ))}
          </div>
      </AccordionSection>
        
      <AccordionSection title="Religion" isOpen={openSections.includes('religion')} onToggle={() => toggleSection('religion')} selectedCount={filters.religion.length}>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {RELIGIONS.map((option) => (
                <Checkbox key={option} id={`religion-${option}`} name={option} checked={filters.religion.includes(option)} onChange={() => handleMultiSelectChange('religion', option)} label={option} />
            ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Education" isOpen={openSections.includes('education')} onToggle={() => toggleSection('education')} selectedCount={filters.education.length}>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {EDUCATION_LEVELS.map((option) => (
                 <Checkbox key={option} id={`education-${option}`} name={option} checked={filters.education.includes(option)} onChange={() => handleMultiSelectChange('education', option)} label={option} />
            ))}
        </div>
      </AccordionSection>

       <AccordionSection title="Occupation" isOpen={openSections.includes('occupation')} onToggle={() => toggleSection('occupation')} selectedCount={filters.occupation.length}>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {OCCUPATIONS.map((option) => (
                <Checkbox key={option} id={`occupation-${option}`} name={option} checked={filters.occupation.includes(option)} onChange={() => handleMultiSelectChange('occupation', option)} label={option} />
            ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Lifestyle" isOpen={openSections.includes('lifestyle')} onToggle={() => toggleSection('lifestyle')} selectedCount={filters.lifestyle.length}>
        <div className="space-y-1">
            {LIFESTYLE_CHOICES.map((option) => (
                 <Checkbox key={option} id={`lifestyle-${option}`} name={option} checked={filters.lifestyle.includes(option)} onChange={() => handleMultiSelectChange('lifestyle', option)} label={option} />
            ))}
        </div>
      </AccordionSection>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={handleClearFilters} className="w-full text-center py-2 text-sm font-medium text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                Clear All Filters
            </button>
        </div>
    </div>
  );
};

export default FilterSidebar;
