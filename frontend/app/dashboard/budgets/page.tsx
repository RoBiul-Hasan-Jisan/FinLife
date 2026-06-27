'use client';
import CrudPage from '@/components/CrudPage';
import { Wallet } from 'lucide-react';
const CATS = ['Food','Transport','Housing','Healthcare','Entertainment','Shopping','Education','Utilities','Personal','Other'];
export default function BudgetsPage() {
  return <CrudPage title="Budgets" endpoint="budgets" color="amber" icon={<Wallet className="w-5 h-5"/>}
    defaultValues={{category:'Food',limit:0,period:'monthly'}}
    fields={[
      {key:'category',label:'Category',type:'select',options:CATS},
      {key:'limit',label:'Budget Limit',type:'number',required:true,placeholder:'500.00'},
      {key:'period',label:'Period',type:'select',options:['monthly','weekly','yearly']},
    ]}
    columns={[{key:'category',label:'Category'},{key:'limit',label:'Limit'},{key:'period',label:'Period'}]}
    currencyFields={['limit']}/>;
}
