'use client';
import CrudPage from '@/components/CrudPage';
import { TrendingUp } from 'lucide-react';
const CATS = ['Salary','Freelance','Investment','Business','Gift','Rental','Other'];
export default function IncomePage() {
  return <CrudPage title="Income" endpoint="income" color="green" icon={<TrendingUp className="w-5 h-5"/>}
    defaultValues={{title:'',amount:0,category:'Salary',date:new Date().toISOString().split('T')[0],notes:''}}
    fields={[
      {key:'title',label:'Title',type:'text',required:true,placeholder:'Salary, Freelance...'},
      {key:'amount',label:'Amount',type:'number',required:true,placeholder:'0.00'},
      {key:'category',label:'Category',type:'select',options:CATS},
      {key:'date',label:'Date',type:'date'},
      {key:'notes',label:'Notes',type:'textarea',placeholder:'Optional...'},
    ]}
    columns={[{key:'title',label:'Title'},{key:'amount',label:'Amount'},{key:'category',label:'Category'},{key:'date',label:'Date'}]}
    currencyFields={['amount']}/>;
}
