'use client';
import CrudPage from '@/components/CrudPage';
import { DollarSign } from 'lucide-react';

const CATEGORIES = ['Food','Transport','Housing','Healthcare','Entertainment','Shopping','Education','Utilities','Personal','Other'];

export default function ExpensesPage() {
  return (
    <CrudPage
      title="Expenses"
      endpoint="expenses"
      color="rose"
      icon={<DollarSign className="w-5 h-5" />}
      defaultValues={{ title:'', amount:0, category:'Other', date: new Date().toISOString().split('T')[0], notes:'' }}
      fields={[
        { key:'title', label:'Title', type:'text', required:true, placeholder:'Coffee, Rent...' },
        { key:'amount', label:'Amount', type:'number', required:true, placeholder:'0.00' },
        { key:'category', label:'Category', type:'select', options:CATEGORIES },
        { key:'date', label:'Date', type:'date' },
        { key:'notes', label:'Notes', type:'textarea', placeholder:'Optional notes...' },
      ]}
      columns={[
        { key:'title', label:'Title' },
        { key:'amount', label:'Amount' },
        { key:'category', label:'Category' },
        { key:'date', label:'Date' },
      ]}
      currencyFields={['amount']}
    />
  );
}
